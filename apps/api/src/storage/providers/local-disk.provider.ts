import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { StorageProvider, StoredFile } from '../interfaces/storage-provider.interface';

const UPLOAD_DIR = join(__dirname, '..', '..', '..', 'uploads');

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  async save(file: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredFile> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const key = `${randomUUID()}${extname(file.originalName)}`;
    await writeFile(join(UPLOAD_DIR, key), file.buffer);
    return { key, url: `/uploads/${key}` };
  }
}
