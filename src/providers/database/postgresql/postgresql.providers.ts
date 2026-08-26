import { ConfigType } from '@nestjs/config';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from './postgresql.constants';
import { postgresqlConfig } from 'src/configs/postgresql.config';

export const postgresqlProviders = [
  {
    provide: POSTGRESQL_POOL,
    inject: [postgresqlConfig.KEY],
    useFactory: async (config: ConfigType<typeof postgresqlConfig>) => {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
      });

      await pool.query('SELECT 1');
      return pool;
    },
  },
];
