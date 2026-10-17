import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('authOptions GitHub provider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('GITHUB_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('declares the issuer that GitHub sends as `iss` in OAuth callbacks', async () => {
    const { authOptions } = await import('./auth');
    const github = authOptions.providers.find((provider) => provider.id === 'github');

    // GitHub adds iss=https://github.com/login/oauth to the callback (RFC 9207).
    // openid-client rejects a callback with `iss` when the provider has no issuer
    // ("issuer must be configured on the issuer"), and NextAuth then redirects to
    // /auth/signin?error=OAuthCallback. NextAuth merges these options into the provider.
    expect(github?.options).toMatchObject({ issuer: 'https://github.com/login/oauth' });
  });
});
