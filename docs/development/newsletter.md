# Homepage newsletter signup

The form appears between the community call to action and the footer. Visitors enter
an email and explicitly check the consent box. There is no double opt-in and the
endpoint sends no email. New and existing subscribed contacts join the configured
Resend segment. Existing global unsubscribes are not reversed; those visitors see a
message directing them to info@react.foundation.

## Vercel setup for the reviewer

1. Open the website project in Vercel → Settings → Environment Variables.
2. Add `RESEND_NEWSLETTER_API_KEY`: a Resend **Full access** key in the same Resend
   team as the segment. Keep it server-only (no `NEXT_PUBLIC_` prefix). This separate
   key avoids changing the permissions or value of the site's transactional key.
3. Add `RESEND_NEWSLETTER_SEGMENT_ID`:
   `32cae487-be81-493a-9f40-fa7a2d7fadbe` for **RF Newsletter** in Production.
4. Confirm `REDIS_URL` points to the site's persistent Redis instance. The signup
   requires Redis for rate limiting and consent records and fails closed if unavailable.
5. For Preview, use a **separate test segment** and test Redis instance. Add the
   corresponding segment ID to the Preview environment. Do not use the production
   segment for automated tests. Redeploy the preview after setting variables.
6. Test the preview before merging. Environment changes require a new deployment.

No credentials belong in Git, a pull request, or a chat message. Without these
variables the form returns a retry message and does not create contacts.

## Acceptance check on the preview

- Check desktop/mobile and light/dark layouts. The checkbox starts unchecked.
- Missing consent and malformed email are rejected.
- Submit an address you control; confirm the success message and find that exact
  contact in the **test segment** in Resend. No confirmation email should be sent.
- Submit the same subscribed address again; it remains in the segment without a duplicate.
- Try an existing contact outside the segment; it joins the segment.
- Try a globally unsubscribed test contact; it stays unsubscribed and gets the help message.
- Invalid configuration or a failed Resend request must show an error, not success.
- After five valid attempts from the same IP in ten minutes, subsequent attempts
  are blocked until the window expires. Automated tests mock Redis and Resend.

## Implementation notes

`POST /api/subscribe` validates the origin, JSON payload, email, and explicit consent.
It uses a honeypot plus a Redis-backed five-attempt / ten-minute IP limit. On Vercel,
the IP comes from Vercel's trusted `x-vercel-forwarded-for` header. Other hosts must
supply an equivalent trusted IP source; local requests deliberately share a bucket.
These controls reduce abuse but cannot verify email ownership without double opt-in.

The current Resend HTTP API is used directly because the existing pinned SDK
predates the current Contacts/Segments interfaces. A lookup followed by either a
create-with-segment or an add-to-segment call keeps each signup to two API requests.
Provider errors, including rate limits, return a retry message. A repeated submission
can finish segment assignment after a partial failure.

Consent is recorded **before** contact creation or segment assignment in the Redis
hash `newsletter:consent:<segment ID>`, with SHA-256 of the normalized email as the
field. The value contains the UTC timestamp, consent text and version, segment ID,
source, and `doubleOptIn: false`. A consent record documents permission, not successful
Resend delivery or membership. Repeat consent replaces the previous record.
Maintain this data with the organization's retention/deletion policy; deleting a
contact in Resend does not automatically remove its separate Redis consent record.
For an erasure request, delete the hash field computed from the trimmed, lowercase email.

No emails, IP addresses, or API keys are included in endpoint logs. Segment membership
is separate from global unsubscribe preferences. When sending a newsletter Broadcast,
choose RF Newsletter as the recipient segment and include the unsubscribe mechanism.

## Automated checks

```sh
npx vitest run --project unit src/app/api/subscribe/route.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

No issue is linked: this is a scoped feature requested by the website owner, with the
acceptance criteria above supplied directly during implementation.

### Local verification (2026-10-29)

- Newsletter endpoint tests: 15 passing (Resend/Redis mocked).
- TypeScript: passed, including Next.js's production compilation check.
- ESLint on all changed TypeScript files: passed.
- Full-repository ESLint: 62 errors / 93 warnings in existing unrelated files.
- Production build compiled successfully, then failed while collecting existing admin
  route data because this fresh checkout has no `GITHUB_CLIENT_ID` configuration.
  The build's static-route and bundle-budget follow-up scripts therefore did not run.
- Browser check using local placeholder auth settings: desktop/mobile, light/dark,
  unchecked required consent, mocked success/error responses, retry, and no mobile
  horizontal overflow passed. No live Resend signup was performed.
