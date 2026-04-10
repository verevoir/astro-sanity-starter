import { BlobAdapter } from "./blob-adapter";
import { FilesystemBlobStore } from "./blob-store";

/**
 * Content storage for the starter.
 *
 * Uses a BlobAdapter backed by the local filesystem. Documents are
 * persisted as JSON files in `./data/{blockType}.json`. Edits made
 * via the admin survive dev server restarts and can be git-tracked.
 *
 * To swap to a different backend:
 *   - Local FS (current):   `new FilesystemBlobStore({ dataDir: './data' })`
 *   - Postgres production:  `new PostgresAdapter({ connectionString })`
 *   - Sanity migration:     `new SanityAdapter({ projectId, dataset, token })`
 *
 * The `BlobAdapter` accepts any `BlobStore`. A future GcsBlobStore or
 * S3BlobStore would slot in here without changing anything else.
 */
export const storage = new BlobAdapter({
  store: new FilesystemBlobStore({ dataDir: "./data" }),
});
