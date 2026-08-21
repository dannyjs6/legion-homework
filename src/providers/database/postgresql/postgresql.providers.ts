import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from './postgresql.constants';

export const postgresqlProviders = [
  {
    provide: POSTGRESQL_POOL,
    inject: [ConfigService],
    useFactory: async (config: ConfigService): Promise<Pool> => {
      const pool = new Pool({
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_NAME', 'legion-homework'),
        user: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
      });

      await pool.query('SELECT 1');
      return pool;
    },
  },
];
