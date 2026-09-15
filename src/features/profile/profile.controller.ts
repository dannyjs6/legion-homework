import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { User } from 'src/common/decorators/user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  getMyProfile(@User() user: JwtPayload) {
    return this.profileService.getMyProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/update')
  @ApiOperation({ summary: 'Update an active user' })
  update(@User() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.profileService.update(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/delete')
  @ApiOperation({ summary: 'Soft-delete a user' })
  softDelete(@User() user: JwtPayload) {
    return this.profileService.softDelete(user.sub);
  }
}
