import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { IUploadedMulterFile } from '../interfaces/upload-file.interface';

export class UploadFilePayloadDto {
  @ApiProperty()
  readonly file: IUploadedMulterFile;

  @ApiProperty({
    example: '/profiles/avatars',
  })
  @IsString()
  @IsOptional()
  readonly folder: string;

  @ApiProperty({
    example: 'file-name',
  })
  @IsString()
  @IsOptional()
  readonly name: string;
}
