import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSessionMock = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('POST /api/chat feature gate', () => {
  beforeEach(() => {
    getServerSessionMock.mockReset();
    vi.unstubAllEnvs();
    vi.stubEnv('GITHUB_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns 503 without calling session or backend when NEXT_PUBLIC_ENABLE_CHATBOT is unset', async () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CHATBOT;
    const { POST } = await import('./route');
    const request = new NextRequest('https://react.foundation/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      error: 'Chat assistant is currently unavailable.',
    });
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it('returns 503 when NEXT_PUBLIC_ENABLE_CHATBOT is false', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_CHATBOT', 'false');
    const { POST } = await import('./route');
    const request = new NextRequest('https://react.foundation/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it('proceeds past the gate when NEXT_PUBLIC_ENABLE_CHATBOT is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_CHATBOT', 'true');
    getServerSessionMock.mockResolvedValue(null);
    const { POST } = await import('./route');
    const request = new NextRequest('https://react.foundation/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(getServerSessionMock).toHaveBeenCalledTimes(1);
  });
});
