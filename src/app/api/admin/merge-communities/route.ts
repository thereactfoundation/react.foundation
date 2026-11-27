/**
 * Admin API: Merge All Community Data
 * POST /api/admin/merge-communities
 * Combines manual data + JSON, deduplicates, seeds Redis
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { REACT_COMMUNITIES } from '@/data/communities';
import type { Community } from '@/types/community';
import { forceSeed } from '@/lib/redis-communities';

interface RawMeetupItem {
  name: string;
  location: string;
  members: number;
  status: string;
  dateFounded?: string;
  description: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔄 Starting merge...');

    // Source 1: Manual data
    const manualCommunities = REACT_COMMUNITIES;

    // Source 2: JSON data
    const jsonPath = join(process.cwd(), 'data', 'normalized-meetups-data.json');
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8')) as RawMeetupItem[];

    // Deduplicate
    const communityMap = new Map<string, Community>();

    // Add manual first (better structure)
    manualCommunities.forEach(comm => {
      communityMap.set(normalizeName(comm.name), comm);
    });

    // Add JSON communities if not duplicate
    let added = 0;
    jsonData.forEach((item) => {
      const key = normalizeName(item.name);
      if (!communityMap.has(key)) {
        // Simple transform for new ones
        const comm: Community = {
          id: slugify(item.name),
          name: item.name,
          slug: slugify(item.name),
          city: item.location.split(',')[0].trim(),
          country: item.location.split(',').pop()?.trim() || 'Unknown',
          timezone: 'UTC',
          coordinates: { lat: 0, lng: 0 },
          organizers: [],
          founded_date: item.dateFounded ? `${item.dateFounded}-01-01` : '2015-01-01',
          event_types: ['meetup'],
          description: item.description,
          member_count: item.members,
          typical_attendance: Math.max(Math.floor(item.members * 0.03), 10),
          meeting_frequency: 'irregular',
          primary_language: 'English',
          status: item.status === 'active' ? 'active' : 'inactive',
          invite_only: false,
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        communityMap.set(key, comm);
        added++;
      }
    });

    const merged = Array.from(communityMap.values());
    merged.sort((a, b) => b.member_count - a.member_count);

    // Seed into Redis
    await forceSeed(merged);

    const stats = {
      total: merged.length,
      active: merged.filter(c => c.status === 'active').length,
      inactive: merged.filter(c => c.status === 'inactive').length,
      countries: new Set(merged.map(c => c.country)).size,
      totalMembers: merged.reduce((sum, c) => sum + c.member_count, 0),
      from_manual: manualCommunities.length,
      from_json: jsonData.length,
      new_from_json: added,
      duplicates_skipped: jsonData.length - added,
    };

    return NextResponse.json({
      success: true,
      message: `Merged and seeded ${merged.length} communities`,
      stats,
    });

  } catch (error: unknown) {
    console.error('❌ Merge failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Merge failed',
    }, { status: 500 });
  }
}
