import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from '../../providers/database/postgresql/postgresql.constants';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsRepository {
  constructor(
    @Inject(POSTGRESQL_POOL)
    private readonly database: Pool,
  ) {}

  async create(userId: number, fileName: string): Promise<Avatar> {
    const client = await this.database.connect();

    try {
      await client.query('BEGIN');

      const user = await client.query(
        `
          SELECT id
          FROM users
          WHERE id = $1 AND deleted_at IS NULL
          FOR UPDATE
        `,
        [userId],
      );

      if (!user.rows[0]) {
        throw new UnauthorizedException('User not found');
      }

      const count = await client.query<{ count: string }>(
        `
          SELECT COUNT(*) AS count
          FROM avatars
          WHERE user_id = $1 AND deleted_at IS NULL
        `,
        [userId],
      );

      if (Number(count.rows[0].count) >= 5) {
        throw new ConflictException('Maximum number of avatars reached');
      }

      const result = await client.query<Avatar>(
        `
          INSERT INTO avatars (user_id, file_name)
          VALUES ($1, $2)
          RETURNING id, user_id, file_name, created_at,
          deleted_at
        `,
        [userId, fileName],
      );

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async softDeleteByUserId(userId: number, id: number): Promise<boolean> {
    const result = await this.database.query(
      'UPDATE avatars SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async countActiveByUserId(userId: number): Promise<number> {
    const result = await this.database.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM avatars
        WHERE user_id = $1
        AND deleted_at IS NULL
      `,
      [userId],
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async findActiveByUserId(userId: number): Promise<Avatar[] | null> {
    const result = await this.database.query<Avatar>(
      `
        SELECT id, user_id, file_name, created_at, deleted_at
        FROM avatars
        WHERE user_id = $1
        AND deleted_at IS NULL
      `,
      [userId],
    );

    return result.rows.length > 0 ? result.rows : null;
  }
}
