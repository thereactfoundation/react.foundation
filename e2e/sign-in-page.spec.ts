import { expect, test } from '@playwright/test';

test.describe('Sign-in page', () => {
  test('keeps the back link on the page spine', async ({ page }) => {
    await page.goto('/auth/signin');

    const heading = page.getByRole('heading', { level: 1, name: 'Sign in to the React Foundation' });
    const backLink = page.getByRole('link', { name: 'Back to the foundation' });
    await expect(heading).toBeVisible();
    await expect(backLink).toBeVisible();

    const [headingBox, backLinkBox] = await Promise.all([
      heading.boundingBox(),
      backLink.boundingBox(),
    ]);
    expect(headingBox).not.toBeNull();
    expect(backLinkBox).not.toBeNull();

    // Public pages align content to the left edge of the standard spine
    // (docs/foundation/design-principles.md, principle 9). Only the home hero is centered.
    expect(Math.abs(backLinkBox!.x - headingBox!.x)).toBeLessThanOrEqual(1);
  });
});
