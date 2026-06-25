import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { LocalDiskStorageProvider } from './providers/local-disk.provider';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [{ provide: STORAGE_PROVIDER, useClass: LocalDiskStorageProvider }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
