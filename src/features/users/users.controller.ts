import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindMostActiveUsersDto } from './dto/find-most-active-users';
import { TransferBalanceDto } from './dto/transfer-balance-payload.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get active users' })
  findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('active')
  @ApiOperation({
    summary:
      'Get most active users who have at least 2 avatar, about field and between age range',
  })
  findMostActiveUsers(@Query() dto: FindMostActiveUsersDto) {
    return this.usersService.findMostActiveUsers(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an active user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Get an active user by ID' })
  transferBalance(@Body() dto: TransferBalanceDto) {
    return this.usersService.transferBalance(dto);
  }
}
