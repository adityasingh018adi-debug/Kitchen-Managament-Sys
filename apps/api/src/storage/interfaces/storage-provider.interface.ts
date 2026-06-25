export interface StoredFile {
  url: string;
  key: string;
}

/**
 * Provider-agnostic contract for binary storage (recipe photos, task proof
 * photos, employee/face photos). Swap LocalDiskStorageProvider for an
 * R2/S3-backed implementation by binding a different class to this token in
 * StorageModule — nothing else in the codebase needs to change.
 */
export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface StorageProvider {
  save(file: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredFile>;
}
