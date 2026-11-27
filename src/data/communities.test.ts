import { describe, expect, it } from 'vitest';

import { REACT_COMMUNITIES } from './communities';

describe('REACT_COMMUNITIES', () => {
  it('includes the approved React Michigan community entry', () => {
    expect(REACT_COMMUNITIES).toContainEqual(
      expect.objectContaining({
        id: 'react-michigan',
        name: 'React Michigan',
        slug: 'react-michigan',
        city: 'Grand Rapids',
        region: 'Michigan',
        country: 'United States',
        timezone: 'America/Detroit',
        verified: true,
        verification_status: 'verified',
        approved_by: 'sethwebster@gmail.com',
        approved_at: '2026-06-02T15:17:45.621Z',
        description: expect.stringContaining('Hybrid format, formal meetups 1-2 times a year'),
      })
    );
  });

  it('includes the approved React Prague community entry', () => {
    expect(REACT_COMMUNITIES).toContainEqual(
      expect.objectContaining({
        id: "community-c6a17e06-3b4e-413c-896e-08abe8ddeec6",
        name: "React Prague",
        slug: "react-prague",
        city: "Prague",
        country: "Czech Republic",
        timezone: "Europe/Prague",
        coordinates: {
          lat: 50.0755,
          lng: 14.4378
        },
        verified: true,
        verification_status: 'verified',
      })
    );
  });

  it('lists the React Pune community with its Luma link and organizers', () => {
    const pune = REACT_COMMUNITIES.find((community) => community.slug === 'react-pune');

    expect(pune).toEqual(
      expect.objectContaining({
        id: 'react-pune',
        name: 'React Pune',
        city: 'Pune',
        website: 'https://luma.com/reactpune',
      })
    );
    expect(pune?.organizers.map((organizer) => organizer.id)).toEqual([
      'faizan-akhtar',
      'pratik-kale',
      'vipul-a-m',
    ]);
    expect(REACT_COMMUNITIES.some((community) => community.slug === 'reactjs-friends-pune')).toBe(false);
  });
});
