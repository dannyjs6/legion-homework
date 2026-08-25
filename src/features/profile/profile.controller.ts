import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { RequestWithUser } from '../auth/types/request-with-user.type';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user profile' })
  getMyProfile(@Req() request: RequestWithUser) {
    return this.profileService.getMyProfile(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/update')
  @ApiOperation({ summary: 'Update an active user' })
  update(@Req() request: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.profileService.update(request.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/delete')
  @ApiOperation({ summary: 'Soft-delete a user' })
  softDelete(@Req() request: RequestWithUser) {
    return this.profileService.softDelete(request.user.sub);
  }
}
