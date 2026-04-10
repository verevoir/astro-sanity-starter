/**
 * BlobStore — pluggable interface for text/JSON object storage.
 *
 * Intentionally minimal: read, write, list, delete by key. The key is
 * an opaque string — typically a filename or object name. Implementations
 * can back this with a local filesystem, GCS, S3, R2, or any other blob
 * store.
 *
 * This is a sister interface to `BlobStore` in `@verevoir/assets`, which
 * handles binary data (Uint8Array). The two could be unified later.
 *
 * Designed to live inline in the starter for now. If it proves stable,
 * it can be promoted to `@verevoir/storage` alongside the BlobAdapter.
 */

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface BlobStore {
  /** Read text content for a key, returning null if not found. */
  read(key: string): Promise<string | null>;

  /** Write text content under a key, overwriting any existing value. */
  write(key: string, content: string): Promise<void>;

  /** List all keys, optionally filtered to those starting with a prefix. */
  list(prefix?: string): Promise<string[]>;

  /** Delete a key. No-op if the key does not exist. */
  delete(key: string): Promise<void>;
}

// --- FilesystemBlobStore -----------------------------------------------------

export interface FilesystemBlobStoreOptions {
  /** Directory where files are stored. Created if it doesn't exist. */
  dataDir: string;
}

/**
 * BlobStore backed by the local filesystem. Each key becomes a file in
 * the configured directory. Zero dependencies — uses only Node's built-in
 * `node:fs/promises`.
 */
export class FilesystemBlobStore implements BlobStore {
  private dataDir: string;

  constructor(options: FilesystemBlobStoreOptions) {
    this.dataDir = options.dataDir;
  }

  private async ensureDir(): Promise<void> {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  async read(key: string): Promise<string | null> {
    const path = join(this.dataDir, key);
    if (!existsSync(path)) return null;
    return readFile(path, "utf8");
  }

  async write(key: string, content: string): Promise<void> {
    await this.ensureDir();
    const path = join(this.dataDir, key);
    await writeFile(path, content, "utf8");
  }

  async list(prefix?: string): Promise<string[]> {
    if (!existsSync(this.dataDir)) return [];
    const entries = await readdir(this.dataDir);
    if (!prefix) return entries;
    return entries.filter((entry) => entry.startsWith(prefix));
  }

  async delete(key: string): Promise<void> {
    const path = join(this.dataDir, key);
    if (!existsSync(path)) return;
    await unlink(path);
  }
}
