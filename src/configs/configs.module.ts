import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { postgresqlConfig } from './postgresql.config';
import { jwtConfig } from './jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresqlConfig, jwtConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class ConfigsModule {}
