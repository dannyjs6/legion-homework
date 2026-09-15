import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FindMostActiveUsersDto {
  @Type(() => Number)
  @IsInt()
  @ApiProperty()
  minAge: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty()
  maxAge: number;
}
