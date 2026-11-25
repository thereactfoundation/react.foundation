/**
 * Index Statistics API
 * Returns RediSearch statistics for the active chatbot index
 */

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getIndexInfo } from '@/lib/ingest/redis-index';
import { getCurrentIndexName } from '@/lib/chatbot/vector-store';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();
    // Each full ingestion builds a new timestamped index and swaps the
    // current-index pointer to it (blue-green), so read that pointer.
    const indexName = await getCurrentIndexName(redis);
    const info = indexName ? await getIndexInfo(redis, indexName) : null;

    if (!info) {
      return NextResponse.json({
        index_name: indexName,
        num_docs: 0,
        num_records: 0,
        indexing: 0,
      });
    }

    // Parse RediSearch info response
    const stats = {
      index_name: indexName,
      num_docs: parseInt(info.num_docs as string) || 0,
      num_records: parseInt(info.num_records as string) || 0,
      indexing: parseInt(info.indexing as string) || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('[IndexStats] Failed to get stats:', error);
    // Return zeros instead of error - stats are optional
    return NextResponse.json({
      index_name: null,
      num_docs: 0,
      num_records: 0,
      indexing: 0,
    });
  }
}
