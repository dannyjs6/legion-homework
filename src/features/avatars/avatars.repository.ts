import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from '../../providers/database/postgresql/postgresql.constants';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsRepository {
  constructor(
    @Inject(POSTGRESQL_POOL)
    private readonly database: Pool,
  ) {}

  async create(userId: number, fileName: string): Promise<Avatar | null> {
    const result = await this.database.query<Avatar>(
      'INSERT INTO avatars (user_id, file_name) VALUES ($1, $2) RETURNING id, user_id, file_name, created_at, deleted_at',
      [userId, fileName],
    );

    return result.rows[0] ?? null;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.database.query(
      'UPDATE avatars SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
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
