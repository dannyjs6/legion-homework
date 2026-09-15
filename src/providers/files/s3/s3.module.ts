import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new AWS.S3({
          endpoint: config.getOrThrow<string>('MINIO_ENDPOINT'),
          region: config.get<string>('MINIO_REGION', 'ru-central1'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
            secretAccessKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
          },
        });
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
