import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/providers/files/files.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { AvatarsController } from './avatars.controller';
import { AvatarsRepository } from './avatars.repository';
import { AvatarsService } from './avatars.service';

@Module({
  imports: [UsersModule, JwtModule.register({}), FilesModule],
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarsRepository, JwtAuthGuard],
  exports: [AvatarsRepository],
})
export class AvatarsModule {}
