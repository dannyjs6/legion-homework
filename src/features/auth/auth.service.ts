import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../users/users.repository';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    const login = dto.login ? dto.login : dto.email.split('@')[0];

    const newUser = await this.usersRepository.create({
      login,
      email: dto.email,
      password: passwordHash,
      age: dto.age,
      about: dto.about,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new ConflictException(`User with email ${dto.email} not found`);
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new ConflictException(`Invalid email or password`);
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { accessToken, refreshToken };
  }

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

  async updatePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<boolean> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordHash = await this.hashPassword(dto.newPassword);
    const result = await this.usersRepository.updatePassword(
      userId,
      passwordHash,
    );

    if (!result) {
      throw new ConflictException('Failed to update password');
    }

    return result;
  }

  private async hashPassword(
    password: string,
    saltOrRounds: string | number = 10,
  ): Promise<string> {
    const passwordHash = await hash(password, saltOrRounds);

    return passwordHash;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),

      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
