import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { UsersModule } from './features/users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { AuthModule } from './features/auth/auth.module';
import { ProfileModule } from './features/profile/profile.module';
import { AvatarsModule } from './features/avatars/avatars.module';

@Module({
  imports: [
    ConfigsModule,
    ProvidersModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    AvatarsModule,
  ],
})
export class AppModule {}
