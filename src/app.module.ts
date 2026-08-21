import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { UsersModule } from './features/users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [ConfigsModule, ProvidersModule, UsersModule, AuthModule],
})
export class AppModule {}
