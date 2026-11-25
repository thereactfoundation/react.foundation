import { beforeEach, describe, expect, it, vi } from 'vitest';

const ACTIVE_INDEX = 'idx:chatbot:2026-09-26T15-27-25-7r3698';

class MockRedis {
  strings = new Map<string, string>();
  indexes = new Map<string, Record<string, string>>();

  async get(key: string): Promise<string | null> {
    return this.strings.get(key) ?? null;
  }

  async call(command: string, indexName: string): Promise<unknown[]> {
    const info = command === 'FT.INFO' ? this.indexes.get(indexName) : undefined;
    if (!info) {
      throw new Error(`Unknown index name: ${indexName}`);
    }
    // FT.INFO replies with a flat [key, value, key, value, ...] array
    return Object.entries(info).flat();
  }
}

const redis = new MockRedis();

vi.mock('@/lib/redis', () => ({
  getRedisClient: () => redis,
}));

describe('GET /api/ingest/full/stats', () => {
  beforeEach(() => {
    redis.strings.clear();
    redis.indexes.clear();
    // src/lib/env.ts logs missing auth variables when it loads
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('reports the index that the last full ingestion swapped to', async () => {
    // Full ingestion builds a new timestamped index on every run and points
    // vector-store:current-index at it (blue-green), so a fixed name goes stale.
    redis.strings.set('vector-store:current-index', ACTIVE_INDEX);
    redis.indexes.set(ACTIVE_INDEX, {
      index_name: ACTIVE_INDEX,
      num_docs: '166',
      num_records: '9120',
      indexing: '0',
    });
    const { GET } = await import('./route');

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      index_name: ACTIVE_INDEX,
      num_docs: 166,
      num_records: 9120,
      indexing: 0,
    });
  });

  it('reports zeros for the active index when RediSearch has no such index', async () => {
    redis.strings.set('vector-store:current-index', ACTIVE_INDEX);
    const { GET } = await import('./route');

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      index_name: ACTIVE_INDEX,
      num_docs: 0,
      num_records: 0,
      indexing: 0,
    });
  });

  it('reports zeros without an index name when no index is active', async () => {
    const { GET } = await import('./route');

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      index_name: null,
      num_docs: 0,
      num_records: 0,
      indexing: 0,
    });
  });
});
