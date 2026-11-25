import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('permanently redirects www.react.foundation to the apex domain', async () => {
    expect(typeof nextConfig.redirects).toBe('function');

    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({
      source: '/:path*',
      has: [{ type: 'host', value: 'www.react.foundation' }],
      destination: 'https://react.foundation/:path*',
      permanent: true,
    });
  });
});
