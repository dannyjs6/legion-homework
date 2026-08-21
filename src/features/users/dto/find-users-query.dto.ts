import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindUsersQueryDto {
  @ApiPropertyOptional({ default: 1, example: 1 })
  page?: string;

  @ApiPropertyOptional({ default: 10, example: 10 })
  limit?: string;

  @ApiPropertyOptional({ example: 'john' })
  login?: string;
}
