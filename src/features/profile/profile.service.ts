import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMyProfile(userId: number) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userWithoutPassword = {
      id: user.id,
      login: user.login,
      email: user.email,
      age: user.age,
      about: user.about,
    };

    return userWithoutPassword;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    return this.usersRepository.update(id, dto);
  }

  async softDelete(id: number): Promise<boolean> {
    return this.usersRepository.softDelete(id);
  }
}
