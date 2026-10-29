import { beforeEach, describe, expect, it, vi } from 'vitest';

const redis = vi.hoisted(() => ({ eval: vi.fn(), hset: vi.fn() }));
vi.mock('@/lib/redis', () => ({ getRedisClient: () => redis }));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
import { POST } from './route';

const api = vi.fn();
const segmentId = '32cae487-be81-493a-9f40-fa7a2d7fadbe';
function request(body: unknown = { email: 'reader@example.com', consent: true }) {
  return new Request('https://react.foundation/api/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://react.foundation' },
    body: JSON.stringify(body),
  });
}
function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('RESEND_NEWSLETTER_API_KEY', 'test-key');
  vi.stubEnv('RESEND_NEWSLETTER_SEGMENT_ID', segmentId);
  vi.stubGlobal('fetch', api);
  redis.eval.mockResolvedValue(1);
  redis.hset.mockResolvedValue(1);
});

describe('newsletter subscription', () => {
  it.each([
    { email: 'reader@example.com', consent: false },
    { email: 'reader@example.com', consent: 'true' },
    { email: 'invalid', consent: true },
    null,
  ])('rejects invalid email or missing explicit consent: %j', async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(api).not.toHaveBeenCalled();
  });

  it('creates a contact, assigns the configured segment, and records consent', async () => {
    api.mockResolvedValueOnce(reply({}, 404))
      .mockResolvedValueOnce(reply({ id: 'new-contact' }));
    expect((await POST(request())).status).toBe(200);
    expect(api.mock.calls[1][0]).toBe('https://api.resend.com/contacts');
    expect(JSON.parse(api.mock.calls[1][1].body)).toEqual({ email: 'reader@example.com', unsubscribed: false, segments: [{ id: segmentId }] });
    expect(api).toHaveBeenCalledTimes(2);
    const record = JSON.parse(redis.hset.mock.calls[0][2]);
    expect(record).toMatchObject({ segmentId, consentVersion: '2026-10-29', source: 'homepage', doubleOptIn: false });
    expect(record.consentedAt).toBeTruthy();
  });

  it('adds an existing subscriber without updating their subscription preferences', async () => {
    api.mockResolvedValueOnce(reply({ id: 'existing', unsubscribed: false }))
      .mockResolvedValueOnce(reply({ id: segmentId }));
    expect((await POST(request())).status).toBe(200);
    expect(api).toHaveBeenCalledTimes(2);
    expect(api.mock.calls[1][1].method).toBe('POST');
    expect(api.mock.calls[1][0]).toBe(`https://api.resend.com/contacts/reader%40example.com/segments/${segmentId}`);
    expect(api.mock.calls.some(([, options]) => options.method === 'PATCH')).toBe(false);
  });

  it('does not silently resubscribe a globally unsubscribed contact', async () => {
    api.mockResolvedValueOnce(reply({ id: 'existing', unsubscribed: true }));
    expect((await POST(request())).status).toBe(409);
    expect(api).toHaveBeenCalledTimes(1);
    expect(redis.hset).not.toHaveBeenCalled();
  });

  it('does not report success when segment assignment fails', async () => {
    api.mockResolvedValueOnce(reply({ unsubscribed: false }))
      .mockResolvedValueOnce(reply({}, 500));
    expect((await POST(request())).status).toBe(503);
  });

  it('does not treat a Resend lookup failure as a missing contact', async () => {
    api.mockResolvedValueOnce(reply({}, 401));
    expect((await POST(request())).status).toBe(503);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it('records consent before activating a subscription', async () => {
    api.mockResolvedValueOnce(reply({}, 404));
    redis.hset.mockRejectedValue(new Error('offline'));
    expect((await POST(request())).status).toBe(503);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it('rate limits before calling Resend', async () => {
    redis.eval.mockResolvedValue(6);
    expect((await POST(request())).status).toBe(429);
    expect(api).not.toHaveBeenCalled();
  });

  it('fails closed if Redis is unavailable', async () => {
    redis.eval.mockRejectedValue(new Error('offline'));
    expect((await POST(request())).status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });

  it('rejects cross-origin submissions', async () => {
    const req = request();
    req.headers.set('Origin', 'https://other.example');
    expect((await POST(req)).status).toBe(403);
    expect(api).not.toHaveBeenCalled();
  });

  it('ignores honeypot submissions without creating contacts', async () => {
    expect((await POST(request({ email: 'bot@example.com', consent: true, website: 'spam' }))).status).toBe(200);
    expect(api).not.toHaveBeenCalled();
  });

  it('requires configuration before accepting signups', async () => {
    vi.stubEnv('RESEND_NEWSLETTER_SEGMENT_ID', '');
    expect((await POST(request())).status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });
});
