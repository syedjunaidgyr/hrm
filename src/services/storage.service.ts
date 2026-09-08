import fs from "fs";
import path from "path";
import { Readable } from "stream";

export interface StorageProvider {
  upload(fileBuffer: Buffer, storageKey: string): Promise<string>;
  getStream(storageKey: string): Promise<Readable>;
  delete(storageKey: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage");
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, storageKey: string): Promise<string> {
    const fullPath = path.join(this.basePath, storageKey);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, fileBuffer);
    return storageKey;
  }

  async getStream(storageKey: string): Promise<Readable> {
    const fullPath = path.join(this.basePath, storageKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at path: ${storageKey}`);
    }
    return fs.createReadStream(fullPath);
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = path.join(this.basePath, storageKey);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

export class S3StorageProvider implements StorageProvider {
  async upload(_fileBuffer: Buffer, storageKey: string): Promise<string> {
    // S3 implementation placeholder using AWS SDK if configured in production
    console.log(`[S3 Storage] Uploading key: ${storageKey}`);
    return storageKey;
  }

  async getStream(_storageKey: string): Promise<Readable> {
    throw new Error("S3 storage stream requires AWS S3 bucket configuration.");
  }

  async delete(_storageKey: string): Promise<void> {
    console.log(`[S3 Storage] Deleting key: ${_storageKey}`);
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";
  if (provider === "s3" || provider === "r2") {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}
