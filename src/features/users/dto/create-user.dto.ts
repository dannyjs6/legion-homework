import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'john' })
  login?: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'strong-password', minLength: 6 })
  password!: string;

  @ApiProperty({ example: 25 })
  age!: number;

  @ApiProperty({ example: 'Backend developer' })
  about!: string;
}
