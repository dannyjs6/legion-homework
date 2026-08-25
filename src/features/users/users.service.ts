import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

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
}
