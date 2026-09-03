import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { User } from '../../common/entities/user.entity';
import { UsersRepository } from './users.repository';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { FindMostActiveUsersDto } from './dto/find-most-active-users';
import { UserWithAvatar } from './dto/user-with-avatar.dto';
import { TransferBalanceDto } from './dto/transfer-balance-payload.dto';
import { AddBalanceToAllDto } from './dto/add-balance-to-all.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
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
    const result = await this.usersRepository.transferBalance(dto);
    await this.invalidateUsersCache();
    return result;
  }

  // Чисто для теста
  async addBalanceToAll(
    dto: AddBalanceToAllDto,
  ): Promise<{ updatedUsers: number }> {
    const updatedUsers = await this.usersRepository.addBalanceToAll(dto.amount);
    await this.invalidateUsersCache();

    return { updatedUsers };
  }

  async resetAllBalances(): Promise<void> {
    await this.usersRepository.resetAllBalances();
    await this.invalidateUsersCache();
  }

  private async invalidateUsersCache(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.debug('Users cache invalidated');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Users cache invalidation failed: ${message}`, stack);
    }
  }
}
