import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'john' })
  login?: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({ example: 'strong-password', minLength: 6 })
  password!: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 25 })
  age!: number;

  @IsOptional()
  @MaxLength(1000)
  @ApiPropertyOptional({ example: 'Backend developer', maxLength: 1000 })
  about!: string;
}
