import { expect, test } from '@playwright/test';

test('events page lists upcoming and past events', async ({ page }) => {
  await page.goto('/events');

  await expect(page.getByRole('heading', { level: 1, name: 'Where the React community meets' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Upcoming' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Past' })).toBeVisible();

  // Section membership depends on today's date, so only assert presence.
  for (const name of [
    'RenderCon Kenya 2026',
    'React India 2026',
    'okthink in CDMX: AI, React, and the Future of Software Development',
    'React Conf Ghana 2026',
    'Contributors Summit 2026',
  ]) {
    await expect(page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  }
});

test('desktop navigation links to events', async ({ page }) => {
  await page.goto('/');

  const eventsLink = page.locator('header').getByRole('link', { name: 'Events', exact: true });
  await expect(eventsLink).toHaveAttribute('href', '/events');

  await eventsLink.click();
  await expect(page).toHaveURL('/events');
});
