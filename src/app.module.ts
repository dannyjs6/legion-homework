import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { UsersModule } from './features/users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { AuthModule } from './features/auth/auth.module';
import { ProfileModule } from './features/profile/profile.module';
import { AvatarsModule } from './features/avatars/avatars.module';
import { ResetBalanceModule } from './features/reset-balance/reset-balance.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigsModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('REDIS_URL'),
        },
        prefix: 'jobs',
      }),
    }),
    ProvidersModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    AvatarsModule,
    ResetBalanceModule,
  ],
})
export class AppModule {}
