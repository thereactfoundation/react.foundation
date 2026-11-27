/**
 * Admin API: Reset Communities
 * POST /api/admin/reset-communities
 * Clears Redis and forces re-seed
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { forceSeed } from '@/lib/redis-communities';
import { REACT_COMMUNITIES } from '@/data/communities';

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

    console.log('🗑️ Resetting communities...');

    // Force re-seed (clears old data first)
    await forceSeed(REACT_COMMUNITIES);

    console.log(`✅ Reset complete - ${REACT_COMMUNITIES.length} communities seeded`);

    return NextResponse.json({
      success: true,
      message: `${REACT_COMMUNITIES.length} communities from source`,
    });

  } catch (error: unknown) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Reset failed',
    }, { status: 500 });
  }
}
