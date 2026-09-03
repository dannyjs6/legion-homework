import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from '../../providers/database/postgresql/postgresql.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../common/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindMostActiveUsersDto } from './dto/find-most-active-users';
import { UserWithAvatar } from './dto/user-with-avatar.dto';
import { TransferBalanceDto } from './dto/transfer-balance-payload.dto';

type FindUsersOptions = {
  limit?: number;
  offset?: number;
  login?: string;
};

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    @Inject(POSTGRESQL_POOL)
    private readonly database: Pool,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const result = await this.database.query<User>(
      'INSERT INTO users (login, email, password, age, about) VALUES ($1, $2, $3, $4, $5) RETURNING id, login, email, age, about',
      [dto.login, dto.email, dto.password, dto.age, dto.about],
    );

    return result.rows[0];
  }

  // TODO: Поменял бы реализацию по мере добавления других фильтров или сортировок

  async findAll(options: FindUsersOptions): Promise<User[]> {
    if (options.login) {
      const result = await this.database.query<User>(
        `
          SELECT id, login, email, age, about, balance, deleted_at
          FROM users
          WHERE login ILIKE $1 AND deleted_at IS NULL
          ORDER BY id
          LIMIT $2 OFFSET $3
        `,
        [`%${options.login}%`, options.limit, options.offset],
      );

      return result.rows;
    }

    const result = await this.database.query<User>(
      'SELECT id, login, email, age, about, balance, deleted_at FROM users WHERE deleted_at IS NULL ORDER BY id LIMIT $1 OFFSET $2',
      [options.limit, options.offset],
    );

    return result.rows;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.database.query<User>(
      'SELECT id, login, email, age, about FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    return result.rows[0] ?? null;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.database.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1',
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    const result = await this.database.query<User>(
      `
        UPDATE users
        SET
          login = COALESCE($1, login),
          email = COALESCE($2, email),
          age = COALESCE($3, age),
          about = COALESCE($4, about)
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING id, login, email, age, about
      `,
      [dto.login, dto.email, dto.age, dto.about, id],
    );

    return result.rows[0] ?? null;
  }

  async updatePassword(id: number, password: string): Promise<boolean> {
    const result = await this.database.query<User>(
      'UPDATE users SET password = $1 WHERE id = $2',
      [password, id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.query<User>(
      'SELECT id, login, email, password, age, about FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );

    return result.rows[0] ?? null;
  }

  // TODO: Add pagination with separate paginate method which also send meta data
  async findMostActiveUsers(
    dto: FindMostActiveUsersDto,
  ): Promise<UserWithAvatar[] | []> {
    const result = await this.database.query<UserWithAvatar>(
      `SELECT
        u.id,
        u.login,
        u.email,
        u.age,
        u.about,
        a.id AS avatar_id,
        a.file_name,
        a.created_at
      FROM users u
      JOIN (
        SELECT DISTINCT ON (user_id)
          id,
          user_id,
          file_name,
          created_at
        FROM avatars
        WHERE deleted_at IS NULL
        ORDER BY user_id, created_at DESC
      ) a ON a.user_id = u.id
      WHERE (
        SELECT COUNT(*)
        FROM avatars a2
        WHERE a2.user_id = u.id
        AND a2.deleted_at IS NULL
      ) >= 2
      AND u.about IS NOT NULL
      AND u.age BETWEEN $1 AND $2
      ORDER BY u.id;`,
      [dto.minAge, dto.maxAge],
    );

    return result.rows;
  }

  async transferBalance(dto: TransferBalanceDto) {
    const client = await this.database.connect();
    const { senderId, recipientId } = dto;

    try {
      this.logger.debug(
        `Starting balance transfer: senderId=${senderId}, recipientId=${recipientId}, amount=${dto.amount}`,
      );
      await client.query('BEGIN');

      if (senderId === recipientId) {
        throw new BadRequestException(
          'Sender and recipient must be different users',
        );
      }

      const users = await client.query<{ id: number; balance: string }>(
        `
        SELECT id, balance
        FROM users
        WHERE id IN ($1, $2)
        ORDER BY id
        FOR UPDATE
      `,
        [senderId, recipientId],
      );

      const sender = users.rows.find((user) => user.id === senderId);
      const recipient = users.rows.find((user) => user.id === recipientId);

      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      if (Number(sender.balance) < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      await client.query(
        `
        UPDATE users
        SET balance = balance - $1
        WHERE id = $2
      `,
        [dto.amount, senderId],
      );

      await client.query(
        `
        UPDATE users
        SET balance = balance + $1
        WHERE id = $2
      `,
        [dto.amount, recipientId],
      );

      await client.query('COMMIT');

      this.logger.log(
        `Balance transfer committed: senderId=${senderId}, recipientId=${recipientId}, amount=${dto.amount}`,
      );

      return {
        success: true,
      };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        const rollbackMessage =
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError);
        const rollbackStack =
          rollbackError instanceof Error ? rollbackError.stack : undefined;

        this.logger.error(
          `Balance transfer rollback failed: senderId=${senderId}, recipientId=${recipientId}, reason=${rollbackMessage}`,
          rollbackStack,
        );
      }

      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      const isBusinessError =
        error instanceof NotFoundException ||
        error instanceof BadRequestException;

      if (isBusinessError) {
        this.logger.warn(
          `Balance transfer rolled back: senderId=${senderId}, recipientId=${recipientId}, amount=${dto.amount}, reason=${message}`,
        );
      } else {
        this.logger.error(
          `Balance transfer failed and was rolled back: senderId=${senderId}, recipientId=${recipientId}, amount=${dto.amount}, reason=${message}`,
          stack,
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async resetAllBalances(): Promise<void> {
    this.logger.debug('Starting balance reset for all users');

    try {
      const result = await this.database.query(
        'UPDATE users SET balance = 0 WHERE deleted_at IS NULL',
      );

      this.logger.log(
        `Balance reset committed: updatedUsers=${result.rowCount ?? 0}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Balance reset failed: ${message}`, stack);
      throw error;
    }
  }

  async addBalanceToAll(amount: number): Promise<number> {
    this.logger.debug(`Starting balance replenishment: amount=${amount}`);

    try {
      const result = await this.database.query(
        'UPDATE users SET balance = balance + $1 WHERE deleted_at IS NULL',
        [amount],
      );
      const updatedUsers = result.rowCount ?? 0;

      this.logger.log(
        `Balance replenishment committed: amount=${amount}, updatedUsers=${updatedUsers}`,
      );

      return updatedUsers;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Balance replenishment failed: amount=${amount}, reason=${message}`,
        stack,
      );
      throw error;
    }
  }
}
