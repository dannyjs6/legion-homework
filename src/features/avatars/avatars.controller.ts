import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadFilePayloadDto } from 'src/providers/files/s3/dto/upload-file-payload.dto';
import type { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';
import { AvatarsService } from './avatars.service';
import { User } from 'src/common/decorators/user.decorator';
import type { JwtPayload } from 'src/features/auth/types/jwt-payload.type';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatarForUser(
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 20 * 1024 * 1024,
            errorMessage: () => `Файл не должен превышать 20MB`,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png)$/,
            errorMessage: (ctx) =>
              `Файл должен быть изображением в формате JPEG или PNG. Получен тип: ${ctx.file!.mimetype}`,
          }),
        ],
      }),
    )
    file: IUploadedMulterFile,
    @Body() dto: UploadFilePayloadDto,
  ) {
    const extension =
      file.mimetype?.split('/')[1] ??
      file.originalname.split('.').at(-1) ??
      'png';

    return this.avatarsService.uploadAvatar(user.sub, {
      file,
      folder: 'avatars',
      name: dto.name ? `${dto.name}.${extension}` : file.originalname,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/delete')
  @ApiOperation({ summary: 'Delete an avatar by ID' })
  deleteAvatar(@Param('id', ParseIntPipe) id: number) {
    return this.avatarsService.deleteAvatar(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get active avatars for the current user' })
  getUsersActiveAvatars(@User() user: JwtPayload) {
    return this.avatarsService.getUsersActiveAvatars(user.sub);
  }
}
