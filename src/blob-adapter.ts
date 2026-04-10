/**
 * BlobAdapter — a StorageAdapter implementation that persists documents
 * via a pluggable BlobStore.
 *
 * Documents are grouped by block type, with one JSON blob per block type.
 * On connect(), all blobs in the store are loaded into memory. Mutations
 * write the affected block type's blob through to the store.
 *
 * Combined with FilesystemBlobStore, this gives you persistent content
 * storage with no database. Combined with a hypothetical GcsBlobStore or
 * S3BlobStore, this gives you cloud blob storage as a content backend —
 * useful for low-traffic content sites where you don't want a database.
 *
 * For high-write workloads, large datasets, or concurrent access, use
 * PostgresAdapter from @verevoir/storage instead.
 */

import { randomUUID } from "node:crypto";
import type {
  Document,
  ListOptions,
  StorageAdapter,
  WhereClause,
  OrderByClause,
  FilterValue,
  FilterOperator,
} from "@verevoir/storage";
import type { BlobStore } from "./blob-store";

// --- Query helpers (mirrors @verevoir/storage internal query.ts) -------------

const DOC_FIELDS: Record<string, keyof Document> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  blockType: "blockType",
  id: "id",
};

function resolveFieldValue(doc: Document, field: string): unknown {
  if (field in DOC_FIELDS) {
    return doc[DOC_FIELDS[field]];
  }
  return (doc.data as Record<string, unknown>)[field];
}

function isFilterOperator(value: FilterValue): value is FilterOperator {
  return (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    ("$gt" in value ||
      "$gte" in value ||
      "$lt" in value ||
      "$lte" in value ||
      "$ne" in value ||
      "$contains" in value)
  );
}

function compare(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string")
    return a.localeCompare(b);
  return 0;
}

function matchesOperator(docValue: unknown, op: FilterOperator): boolean {
  if (op.$gt !== undefined && compare(docValue, op.$gt) <= 0) return false;
  if (op.$gte !== undefined && compare(docValue, op.$gte) < 0) return false;
  if (op.$lt !== undefined && compare(docValue, op.$lt) >= 0) return false;
  if (op.$lte !== undefined && compare(docValue, op.$lte) > 0) return false;
  if (op.$ne !== undefined) {
    if (docValue instanceof Date && op.$ne instanceof Date) {
      if (docValue.getTime() === op.$ne.getTime()) return false;
    } else if (docValue === op.$ne) {
      return false;
    }
  }
  if (op.$contains !== undefined) {
    if (typeof docValue !== "string") return false;
    if (!docValue.toLowerCase().includes(op.$contains.toLowerCase()))
      return false;
  }
  return true;
}

function matchesWhere(doc: Document, where: WhereClause): boolean {
  for (const [field, filter] of Object.entries(where)) {
    const docValue = resolveFieldValue(doc, field);
    if (isFilterOperator(filter)) {
      if (!matchesOperator(docValue, filter)) return false;
    } else if (filter instanceof Date) {
      if (
        !(docValue instanceof Date) ||
        docValue.getTime() !== filter.getTime()
      )
        return false;
    } else if (docValue !== filter) {
      return false;
    }
  }
  return true;
}

function sortDocuments(docs: Document[], orderBy: OrderByClause): Document[] {
  const entries = Object.entries(orderBy);
  if (entries.length === 0) return docs;
  return [...docs].sort((a, b) => {
    for (const [field, direction] of entries) {
      const aVal = resolveFieldValue(a, field);
      const bVal = resolveFieldValue(b, field);
      const cmp = compare(aVal, bVal);
      if (cmp !== 0) return direction === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

function applyListOptions(
  docs: Document[],
  options?: ListOptions,
): Document[] {
  if (!options) return docs;
  let result = docs;
  if (options.where) {
    result = result.filter((doc) => matchesWhere(doc, options.where!));
  }
  if (options.orderBy) {
    result = sortDocuments(result, options.orderBy);
  }
  if (options.offset !== undefined) {
    result = result.slice(options.offset);
  }
  if (options.limit !== undefined) {
    result = result.slice(0, options.limit);
  }
  return result;
}

// --- Serialization (Date → ISO string → Date round trip) ---------------------

interface SerializedDocument {
  id: string;
  blockType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function serialize(doc: Document): SerializedDocument {
  return {
    id: doc.id,
    blockType: doc.blockType,
    data: doc.data as Record<string, unknown>,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function deserialize(raw: SerializedDocument): Document {
  return {
    id: raw.id,
    blockType: raw.blockType,
    data: raw.data,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

// --- BlobAdapter -------------------------------------------------------------

export interface BlobAdapterOptions {
  store: BlobStore;
}

const FILE_SUFFIX = ".json";

function keyForBlockType(blockType: string): string {
  return `${blockType}${FILE_SUFFIX}`;
}

function blockTypeFromKey(key: string): string | null {
  if (!key.endsWith(FILE_SUFFIX)) return null;
  return key.slice(0, -FILE_SUFFIX.length);
}

export class BlobAdapter implements StorageAdapter {
  private store: BlobStore;
  private docs: Map<string, Document> = new Map();
  private loaded = false;

  constructor(options: BlobAdapterOptions) {
    this.store = options.store;
  }

  async connect(): Promise<void> {
    if (this.loaded) return;
    const keys = await this.store.list();
    for (const key of keys) {
      const blockType = blockTypeFromKey(key);
      if (!blockType) continue;
      const content = await this.store.read(key);
      if (!content) continue;
      const raw: SerializedDocument[] = JSON.parse(content);
      for (const item of raw) {
        const doc = deserialize(item);
        this.docs.set(doc.id, doc);
      }
    }
    this.loaded = true;
  }

  async disconnect(): Promise<void> {
    this.docs.clear();
    this.loaded = false;
  }

  async migrate(): Promise<void> {
    // No schema to migrate.
  }

  private async writeBlockType(blockType: string): Promise<void> {
    const docs: SerializedDocument[] = Array.from(this.docs.values())
      .filter((doc) => doc.blockType === blockType)
      .map(serialize);
    if (docs.length === 0) {
      await this.store.delete(keyForBlockType(blockType));
      return;
    }
    await this.store.write(
      keyForBlockType(blockType),
      JSON.stringify(docs, null, 2) + "\n",
    );
  }

  async create(
    blockType: string,
    data: Record<string, unknown>,
  ): Promise<Document> {
    const now = new Date();
    const doc: Document = {
      id: randomUUID(),
      blockType,
      data,
      createdAt: now,
      updatedAt: now,
    };
    this.docs.set(doc.id, doc);
    await this.writeBlockType(blockType);
    return doc;
  }

  async get(id: string): Promise<Document | null> {
    return this.docs.get(id) ?? null;
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Document> {
    const existing = this.docs.get(id);
    if (!existing) {
      throw new Error(`Document not found: ${id}`);
    }
    const updated: Document = {
      ...existing,
      data,
      updatedAt: new Date(),
    };
    this.docs.set(id, updated);
    await this.writeBlockType(updated.blockType);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = this.docs.get(id);
    if (!existing) {
      throw new Error(`Document not found: ${id}`);
    }
    this.docs.delete(id);
    await this.writeBlockType(existing.blockType);
  }

  async list(
    blockType: string,
    options?: ListOptions,
  ): Promise<Document[]> {
    const results = Array.from(this.docs.values()).filter(
      (doc) => doc.blockType === blockType,
    );
    return applyListOptions(results, options);
  }

  async getMany(ids: string[]): Promise<Map<string, Document>> {
    const result = new Map<string, Document>();
    for (const id of ids) {
      const doc = this.docs.get(id);
      if (doc) result.set(id, doc);
    }
    return result;
  }
}
