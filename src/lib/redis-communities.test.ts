import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Community } from '@/types/community';

class MockRedis {
  private strings = new Map<string, string>();
  private sets = new Map<string, Set<string>>();

  async get(key: string): Promise<string | null> {
    return this.strings.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.strings.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.strings.delete(key)) deleted += 1;
      if (this.sets.delete(key)) deleted += 1;
    }
    return deleted;
  }

  async exists(key: string): Promise<number> {
    return this.strings.has(key) || this.sets.has(key) ? 1 : 0;
  }

  async smembers(key: string): Promise<string[]> {
    return [...(this.sets.get(key) ?? new Set<string>())];
  }

  async sadd(key: string, ...values: string[]): Promise<number> {
    const set = this.sets.get(key) ?? new Set<string>();
    this.sets.set(key, set);
    let added = 0;
    for (const value of values) {
      if (!set.has(value)) {
        set.add(value);
        added += 1;
      }
    }
    return added;
  }

  async srem(key: string, ...values: string[]): Promise<number> {
    const set = this.sets.get(key);
    if (!set) return 0;
    let removed = 0;
    for (const value of values) {
      if (set.delete(value)) {
        removed += 1;
      }
    }
    return removed;
  }

  pipeline() {
    const commands: Array<() => Promise<unknown>> = [];
    return {
      set: (key: string, value: string) => {
        commands.push(() => this.set(key, value));
        return this;
      },
      sadd: (key: string, ...values: string[]) => {
        commands.push(() => this.sadd(key, ...values));
        return this;
      },
      srem: (key: string, ...values: string[]) => {
        commands.push(() => this.srem(key, ...values));
        return this;
      },
      del: (key: string) => {
        commands.push(() => this.del(key));
        return this;
      },
      exec: async () => {
        const results: Array<[Error | null, unknown]> = [];
        for (const command of commands) {
          results.push([null, await command()]);
        }
        return results;
      },
    };
  }
}

const redis = new MockRedis();

vi.mock('./redis', () => ({
  getRedisClient: () => redis,
}));

const baseCommunity = (overrides: Partial<Community>): Community => ({
  id: 'community-base',
  name: 'Base Community',
  slug: 'base-community',
  city: 'Base City',
  country: 'Base Country',
  timezone: 'UTC',
  organizers: [],
  founded_date: '2025-01-01',
  event_types: ['meetup'],
  description: 'Base description',
  member_count: 100,
  typical_attendance: 10,
  meeting_frequency: 'monthly',
  primary_language: 'English',
  status: 'active',
  invite_only: false,
  verified: true,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('forceSeed', () => {
  beforeEach(async () => {
    const existingIds = await redis.smembers('communities:index');
    for (const id of existingIds) {
      await redis.del(`communities:${id}`);
    }
    await redis.del('communities:index', 'communities:seeded', 'communities:seed-hash', 'communities:all');
    vi.resetModules();
  });

  it('preserves runtime-added communities that are not present in the new seed set', async () => {
    const runtimeCommunity = baseCommunity({
      id: 'community-runtime',
      name: 'React Michigan',
      slug: 'react-michigan',
      city: 'Detroit',
      country: 'United States',
      description: 'Runtime-approved community',
      approved_by: 'admin@example.com',
      approved_at: '2026-05-08T10:00:00.000Z',
    });

    await redis.set(`communities:${runtimeCommunity.id}`, JSON.stringify(runtimeCommunity));
    await redis.sadd('communities:index', runtimeCommunity.id);
    await redis.set('communities:seeded', 'true');

    const seededCommunity = baseCommunity({
      id: 'community-seeded',
      name: 'Seeded Community',
      slug: 'seeded-community',
    });

    const { forceSeed, getCommunities } = await import('./redis-communities');

    await forceSeed([seededCommunity]);

    const communities = await getCommunities();
    expect(communities.map((community) => community.id).sort()).toEqual(
      ['community-runtime', 'community-seeded'].sort()
    );
    expect(communities).toContainEqual(expect.objectContaining({
      id: 'community-runtime',
      name: 'React Michigan',
      approved_by: 'admin@example.com',
    }));
  });

  it('removes seeded communities that are no longer present in the incoming source data', async () => {
    const staleSeeded = baseCommunity({
      id: 'community-stale-seeded',
      name: 'Stale Seed Name',
      slug: 'stale-seed-name',
      description: 'Should be removed on reset',
    });

    await redis.set(`communities:${staleSeeded.id}`, JSON.stringify(staleSeeded));
    await redis.sadd('communities:index', staleSeeded.id);
    await redis.set('communities:seeded', 'true');

    const incomingSeed = baseCommunity({
      id: 'community-fresh-seeded',
      name: 'Fresh Seed Name',
      slug: 'fresh-seed-name',
    });

    const { forceSeed, getCommunityById, getCommunities } = await import('./redis-communities');

    await forceSeed([incomingSeed]);

    await expect(getCommunityById('community-stale-seeded')).resolves.toBeNull();
    await expect(getCommunities()).resolves.toEqual([
      expect.objectContaining({ id: 'community-fresh-seeded' }),
    ]);
  });

  it('updates seeded communities when the incoming seed data has the same id', async () => {
    const existingSeeded = baseCommunity({
      id: 'community-seeded',
      name: 'Old Seed Name',
      slug: 'old-seed-name',
      description: 'Old description',
    });

    await redis.set(`communities:${existingSeeded.id}`, JSON.stringify(existingSeeded));
    await redis.sadd('communities:index', existingSeeded.id);
    await redis.set('communities:seeded', 'true');

    const updatedSeed = baseCommunity({
      id: 'community-seeded',
      name: 'New Seed Name',
      slug: 'new-seed-name',
      description: 'Updated description',
    });

    const { forceSeed, getCommunityById } = await import('./redis-communities');

    await forceSeed([updatedSeed]);

    await expect(getCommunityById('community-seeded')).resolves.toMatchObject({
      name: 'New Seed Name',
      slug: 'new-seed-name',
      description: 'Updated description',
    });
  });

  it('deduplicates a runtime-approved community once promoted to source under a new id with the same slug', async () => {
    const runtimeCommunity = baseCommunity({
      id: 'community-4e34826d-7d46-4fd5-b0d3-dd1bebd5a11a',
      name: 'React Michigan',
      slug: 'react-michigan',
      approved_by: 'admin@example.com',
      approved_at: '2026-06-02T15:17:45.621Z',
    });
    const otherRuntimeCommunity = baseCommunity({
      id: 'community-runtime-only',
      name: 'React Mars',
      slug: 'react-mars',
      approved_by: 'admin@example.com',
      approved_at: '2026-06-03T10:00:00.000Z',
    });

    for (const community of [runtimeCommunity, otherRuntimeCommunity]) {
      await redis.set(`communities:${community.id}`, JSON.stringify(community));
      await redis.sadd('communities:index', community.id);
    }
    await redis.set('communities:seeded', 'true');

    const canonicalCommunity = baseCommunity({
      id: 'react-michigan',
      name: 'React Michigan',
      slug: 'react-michigan',
      approved_by: 'admin@example.com',
      approved_at: '2026-06-02T15:17:45.621Z',
    });

    const { forceSeed, getCommunities, getCommunityById } = await import('./redis-communities');
    await forceSeed([canonicalCommunity]);

    await expect(getCommunityById('community-4e34826d-7d46-4fd5-b0d3-dd1bebd5a11a')).resolves.toBeNull();
    const communities = await getCommunities();
    expect(communities.map((c) => c.id).sort()).toEqual(['community-runtime-only', 'react-michigan']);
  });
});

describe('public community reads', () => {
  beforeEach(async () => {
    const existingIds = await redis.smembers('communities:index');
    for (const id of existingIds) {
      await redis.del(`communities:${id}`);
    }
    await redis.del('communities:index', 'communities:seeded', 'communities:seed-hash', 'communities:all');
    vi.resetModules();
  });

  it('falls back to the canonical community dataset when Redis is empty', async () => {
    const { getCommunityBySlug } = await import('./redis-communities');

    await expect(getCommunityBySlug('react-bangalore')).resolves.toMatchObject({
      name: 'React Bangalore',
      slug: 'react-bangalore',
      status: 'active',
    });
  });

  it('auto-syncs stale seeded Redis data when communities:seed-hash is missing or outdated while preserving runtime-approved communities', async () => {
    const stalePune = baseCommunity({
      id: 'reactjs-friends-pune',
      name: 'ReactJS & Friends',
      slug: 'reactjs-friends-pune',
    });
    const runtimeApproved = baseCommunity({
      id: 'community-runtime-new',
      name: 'React Moon',
      slug: 'react-moon',
      approved_by: 'admin@example.com',
      approved_at: '2026-11-27T00:00:00.000Z',
    });

    for (const community of [stalePune, runtimeApproved]) {
      await redis.set(`communities:${community.id}`, JSON.stringify(community));
      await redis.sadd('communities:index', community.id);
    }
    await redis.set('communities:seeded', 'true');
    await redis.set('communities:seed-hash', 'outdated-hash');

    const { getCommunityBySlug } = await import('./redis-communities');

    await expect(getCommunityBySlug('react-pune')).resolves.toMatchObject({
      id: 'react-pune',
      name: 'React Pune',
    });
    await expect(getCommunityBySlug('reactjs-friends-pune')).resolves.toBeNull();
    await expect(getCommunityBySlug('react-moon')).resolves.toMatchObject({
      id: 'community-runtime-new',
      name: 'React Moon',
    });
    expect(await redis.get('communities:seed-hash')).not.toBe('outdated-hash');
  });
});
