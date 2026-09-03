import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [DatabaseModule, FilesModule],
  exports: [DatabaseModule, FilesModule],
})
export class ProvidersModule {}
