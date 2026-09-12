import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pool } from "@/db";

export interface StorageProvider {
  upload(fileBuffer: Buffer, storageKey: string): Promise<string>;
  getStream(storageKey: string): Promise<Readable>;
  delete(storageKey: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage");
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, storageKey: string): Promise<string> {
    this.ensureDir(this.basePath);
    const fullPath = path.join(this.basePath, storageKey);
    this.ensureDir(path.dirname(fullPath));
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

/** Stores resume bytes in MySQL so uploads work on Vercel (read-only filesystem). */
export class DbStorageProvider implements StorageProvider {
  private ensured = false;

  private async ensureTable() {
    if (this.ensured) return;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_blobs (
        storage_key VARCHAR(500) NOT NULL,
        content MEDIUMBLOB NOT NULL,
        PRIMARY KEY (storage_key)
      )
    `);
    this.ensured = true;
  }

  async upload(fileBuffer: Buffer, storageKey: string): Promise<string> {
    await this.ensureTable();
    await pool.query(
      "INSERT INTO file_blobs (storage_key, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
      [storageKey, fileBuffer]
    );
    return storageKey;
  }

  async getStream(storageKey: string): Promise<Readable> {
    await this.ensureTable();
    const [rows] = await pool.query("SELECT content FROM file_blobs WHERE storage_key = ?", [storageKey]);
    const row = (rows as { content: Buffer }[])[0];
    if (!row?.content) {
      throw new Error(`File not found at path: ${storageKey}`);
    }
    return Readable.from(row.content);
  }

  async delete(storageKey: string): Promise<void> {
    await this.ensureTable();
    await pool.query("DELETE FROM file_blobs WHERE storage_key = ?", [storageKey]);
  }
}

export class S3StorageProvider implements StorageProvider {
  async upload(_fileBuffer: Buffer, storageKey: string): Promise<string> {
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

export function getStorageProviderName(): string {
  const explicit = (process.env.STORAGE_PROVIDER || "").toLowerCase();
  if (explicit === "s3" || explicit === "r2") return explicit;
  if (explicit === "db") return "db";
  // Vercel (and other serverless) filesystems are read-only except /tmp
  if (process.env.VERCEL) return "db";
  return explicit || "local";
}

export function getStorageProvider(): StorageProvider {
  const provider = getStorageProviderName();
  if (provider === "s3" || provider === "r2") {
    return new S3StorageProvider();
  }
  if (provider === "db") {
    return new DbStorageProvider();
  }
  return new LocalStorageProvider();
}
