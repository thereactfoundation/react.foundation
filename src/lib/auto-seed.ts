/**
 * Auto-Seed on Startup
 * Seeds Redis with community data from single source
 */

import { ensureCommunitiesSynced, isSeeded, seedCommunities } from './redis-communities';
import { REACT_COMMUNITIES } from '@/data/communities';

let seedingInProgress = false;
let seedingComplete = false;

/**
 * Auto-seed communities if not already seeded
 * Safe to call multiple times (idempotent)
 */
export async function autoSeedCommunities(): Promise<void> {
  if (seedingInProgress) {
    console.log('⏳ Seeding already in progress...');
    return;
  }

  if (seedingComplete) {
    return;
  }

  try {
    seedingInProgress = true;

    const alreadySeeded = await isSeeded();

    if (alreadySeeded) {
      await ensureCommunitiesSynced();
      console.log('✅ Communities already seeded in Redis');
      seedingComplete = true;
      return;
    }

    console.log(`🌱 Auto-seeding ${REACT_COMMUNITIES.length} communities...`);
    await seedCommunities(REACT_COMMUNITIES);
    console.log(`✅ Auto-seeded ${REACT_COMMUNITIES.length} communities`);

    seedingComplete = true;
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
    console.warn('⚠️ App will continue but communities may not load');
  } finally {
    seedingInProgress = false;
  }
}

/**
 * Initialize all data on app startup
 */
export async function initializeData(): Promise<void> {
  console.log('🚀 Initializing React Foundation data...');

  await autoSeedCommunities();

  // Future: Add other data initialization here
  // - Educators
  // - RIS library data
  // - etc.

  console.log('✅ Data initialization complete');
}
