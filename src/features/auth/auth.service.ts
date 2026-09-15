import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../users/users.repository';
import { User } from '../../common/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { ConfigType } from '@nestjs/config';
import { jwtConfig } from 'src/configs/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfigService: ConfigType<typeof jwtConfig>,
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

    return newUser;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new ConflictException('Invalid email or password');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new ConflictException('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { accessToken, refreshToken };
  }

  async getMyProfile(userId: number) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
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
        secret: this.jwtConfigService.accessSecret,
        expiresIn: '1d',
      }),

      this.jwtService.signAsync(payload, {
        secret: this.jwtConfigService.refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
