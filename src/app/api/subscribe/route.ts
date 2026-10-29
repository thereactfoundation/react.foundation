import { createHash } from 'node:crypto';
import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_VERSION } from '@/lib/newsletter/consent';

export const runtime = 'nodejs';

const unavailable = 'We couldn’t save your subscription. Please try again in a moment.';
const success = { message: 'You’re subscribed. Thanks for joining!' };
const rateLimitScript = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return count
`;

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function json(body: { message: string }, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  // Only accept requests from this site's form, including Vercel preview URLs.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return json({ message: 'Please subscribe using the form on our website.' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ message: 'Invalid request.' }, 415);
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ message: 'Invalid request.' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ message: 'Invalid request.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ message: 'Enter a valid email and agree to receive the newsletter.' }, 400);
  }
  const input = body as Record<string, unknown>;
  // Honeypot: silently discard automated submissions without saving personal data.
  // Log the discard (no personal data) so autofilled real visitors would show up in logs.
  if (input.website) {
    logger.warn('Newsletter signup discarded by honeypot.');
    return json(success);
  }
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.consent !== true) {
    return json({ message: 'Enter a valid email and agree to receive the newsletter.' }, 400);
  }

  const apiKey = process.env.RESEND_NEWSLETTER_API_KEY;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!apiKey || !segmentId) return json({ message: unavailable }, 503);

  try {
    const redis = getRedisClient();
    // Vercel overwrites this header. Do not trust arbitrary forwarded headers.
    // Other hosts must supply an equivalent trusted IP source; locally all share a bucket.
    const ip = process.env.VERCEL === '1'
      ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : 'local';
    const count = Number(await redis.eval(rateLimitScript, 1, `newsletter:rate:${hash(ip)}`, 600));
    if (count > 5) {
      return Response.json({ message: 'Too many attempts. Please try again in 10 minutes.' }, {
        status: 429, headers: { 'Retry-After': '600', 'Cache-Control': 'no-store' },
      });
    }

    // Use the HTTP API so this feature does not require upgrading the existing email SDK.
    const resend = (path: string, method = 'GET', payload?: object) => fetch(`https://api.resend.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const contactPath = `/contacts/${encodeURIComponent(email)}`;
    const existing = await resend(contactPath);
    if (existing.ok) {
      const contact = await existing.json();
      // Segment membership must not undo an earlier global unsubscribe.
      if (contact.unsubscribed !== false) {
        return json({ message: 'We couldn’t subscribe this address. Please contact info@react.foundation for help.' }, 409);
      }
    } else if (existing.status !== 404) {
      throw new Error('contact_lookup');
    }

    // Store consent separately from global email preferences; never log the email or API key.
    await redis.hset(`newsletter:consent:${segmentId}`, hash(email), JSON.stringify({
      consentedAt: new Date().toISOString(),
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      consentText: NEWSLETTER_CONSENT_TEXT,
      segmentId,
      source: 'homepage',
      doubleOptIn: false,
    }));
    // Include the segment in creation to keep new signups to two Resend calls.
    // For existing contacts, change only segment membership, never preferences.
    const assigned = existing.status === 404
      ? await resend('/contacts', 'POST', { email, unsubscribed: false, segments: [{ id: segmentId }] })
      : await resend(`${contactPath}/segments/${encodeURIComponent(segmentId)}`, 'POST');
    if (!assigned.ok) throw new Error('segment_assignment');
    return json(success);
  } catch {
    logger.error('Newsletter subscription failed. Check Resend and Redis availability/configuration.');
    return json({ message: unavailable }, 503);
  }
}
