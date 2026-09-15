import { Injectable, NotFoundException } from '@nestjs/common';
import { IFileService } from 'src/providers/files/files.adapter';
import type { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';
import { AvatarsRepository } from './avatars.repository';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsService {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly fileService: IFileService,
  ) {}

  async uploadAvatar(
    userId: number,
    file: IUploadedMulterFile,
  ): Promise<Avatar> {
    const uploadedFile = await this.fileService.uploadFile({
      file,
      folder: 'avatars',
    });

    return this.avatarsRepository.create(userId, uploadedFile.path);
  }

  async deleteAvatar(userId: number, id: number): Promise<boolean> {
    const isDeleted = await this.avatarsRepository.softDeleteByUserId(
      userId,
      id,
    );
    if (!isDeleted) {
      throw new NotFoundException('Avatar not found');
    }
    return true;
  }

  async getUsersActiveAvatars(userId: number): Promise<Avatar[] | null> {
    return this.avatarsRepository.findActiveByUserId(userId);
  }
}
