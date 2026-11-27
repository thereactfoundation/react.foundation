import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetServerSession = vi.fn();
const mockIsAdmin = vi.fn();
const mockForceSeed = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/admin/user-management-service', () => ({
  UserManagementService: {
    isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
  },
}));

vi.mock('@/lib/redis-communities', () => ({
  forceSeed: (...args: unknown[]) => mockForceSeed(...args),
}));

describe('admin community mutation routes auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const routes = [
    {
      name: 'POST /api/admin/reset-communities',
      load: () => import('./reset-communities/route'),
    },
    {
      name: 'POST /api/admin/import-communities',
      load: () => import('./import-communities/route'),
    },
    {
      name: 'POST /api/admin/merge-communities',
      load: () => import('./merge-communities/route'),
    },
  ];

  for (const route of routes) {
    it(`${route.name} rejects unauthenticated requests with 401`, async () => {
      mockGetServerSession.mockResolvedValueOnce(null);
      const { POST } = await route.load();

      const response = await POST();

      expect(response.status).toBe(401);
      expect(mockForceSeed).not.toHaveBeenCalled();
    });

    it(`${route.name} rejects non-admin requests with 403`, async () => {
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } });
      mockIsAdmin.mockResolvedValueOnce(false);
      const { POST } = await route.load();

      const response = await POST();

      expect(response.status).toBe(403);
      expect(mockForceSeed).not.toHaveBeenCalled();
    });
  }

  it('POST /api/admin/reset-communities allows authenticated admins', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@example.com' } });
    mockIsAdmin.mockResolvedValueOnce(true);
    mockForceSeed.mockResolvedValueOnce(undefined);
    const { POST } = await import('./reset-communities/route');

    const response = await POST();

    expect(response.status).toBe(200);
    expect(mockForceSeed).toHaveBeenCalledTimes(1);
  });
});
