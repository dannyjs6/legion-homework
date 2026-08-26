import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { POSTGRESQL_POOL } from './postgresql.constants';
import { postgresqlProviders } from './postgresql.providers';

@Global()
@Module({
  providers: postgresqlProviders,
  exports: postgresqlProviders,
})
export class PostgresqlModule implements OnApplicationShutdown {
  constructor(@Inject(POSTGRESQL_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
