import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({}),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = Number(configService.getOrThrow<string>('CACHE_TTL'));
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(
                configService.getOrThrow<string>('REDIS_URL'),
              ),
              ttl,
            }),
          ],
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, JwtAuthGuard],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
