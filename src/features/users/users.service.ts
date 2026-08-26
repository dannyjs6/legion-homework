import { Injectable } from '@nestjs/common';
import { User } from '../../common/entities/user.entity';
import { UsersRepository } from './users.repository';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { FindMostActiveUsersDto } from './dto/find-most-active-users';
import { UserWithAvatar } from './dto/user-with-avatar.dto';
import { TransferBalanceDto } from './dto/transfer-balance-payload.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async findAll(query: FindUsersQueryDto): Promise<User[]> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const offset = (page - 1) * limit;

    return this.usersRepository.findAll({
      limit,
      offset,
      login: query.login,
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findMostActiveUsers(
    dto: FindMostActiveUsersDto,
  ): Promise<UserWithAvatar[]> {
    return this.usersRepository.findMostActiveUsers(dto);
  }

  async transferBalance(dto: TransferBalanceDto) {
    return this.usersRepository.transferBalance(dto);
  }
}
