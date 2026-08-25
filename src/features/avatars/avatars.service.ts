import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IFileService } from 'src/providers/files/files.adapter';
import { UploadFilePayloadDto } from 'src/providers/files/s3/dto/upload-file-payload.dto';
import { UsersRepository } from '../users/users.repository';
import { AvatarsRepository } from './avatars.repository';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsService {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly fileService: IFileService,
  ) {}

  async uploadAvatar(
    userId: number,
    dto: UploadFilePayloadDto,
  ): Promise<Avatar | null> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const activeAvatarsCount =
      await this.avatarsRepository.countActiveByUserId(userId);

    if (activeAvatarsCount >= 5) {
      throw new ConflictException('Maximum number of avatars reached');
    }

    const uploadedFile = await this.fileService.uploadFile(dto);

    return this.avatarsRepository.create(userId, uploadedFile.path);
  }

  async deleteAvatar(id: number): Promise<boolean> {
    return this.avatarsRepository.softDelete(id);
  }

  async getUsersActiveAvatars(userId: number): Promise<Avatar[] | null> {
    return this.avatarsRepository.findActiveByUserId(userId);
  }
}
