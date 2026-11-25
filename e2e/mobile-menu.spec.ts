import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('should show Communities link in mobile sidebar navigation', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open menu' }).click();

  const communitiesLink = page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Communities' });
  await expect(communitiesLink).toBeVisible();
});
