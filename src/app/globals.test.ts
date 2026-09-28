import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(path.join(dirname, 'globals.css'), 'utf8');

describe('global dark-mode variant configuration', () => {
  it('defines a class-based dark variant so dark:* utilities respond to the app theme toggle', () => {
    expect(globalsCss).toMatch(/@custom-variant\s+dark\s+\(&:\s*where\(\.dark,\s*\.dark\s*\*\)\);/);
  });
});

describe('React Foundation theme contract', () => {
  it('scopes Tailwind source detection to application code', () => {
    expect(globalsCss).toContain('@import "tailwindcss" source(none);');
    expect(globalsCss).toContain('@source "../**/*.{js,ts,jsx,tsx,mdx}";');
    expect(globalsCss).toContain('@source "../../content/**/*.{md,mdx}";');
  });

  it('defines the core visual-language tokens used by every public page', () => {
    expect(globalsCss).toContain('--foundation-content-standard: 64rem;');
    expect(globalsCss).toContain('--foundation-content-narrow: 40.5rem;');
    expect(globalsCss).toContain('--foundation-page-gutter: clamp(1.25rem, 4vw, 3rem);');
    expect(globalsCss).toContain('--foundation-space-intro: clamp(4rem, 8vw, 6rem);');
    expect(globalsCss).toContain('--foundation-space-section: clamp(4.5rem, 9vw, 8rem);');
    expect(globalsCss).toContain('--foundation-space-attached: clamp(2.5rem, 4vw, 3.5rem);');
    expect(globalsCss).toMatch(/--foundation-radius-field: 0\.625rem;/);
    expect(globalsCss).toMatch(/--foundation-radius-card: 1rem;/);
    expect(globalsCss).toMatch(/--foundation-radius-panel: 1\.5rem;/);
    expect(globalsCss).toMatch(/--foundation-radius-control: 999px;/);
    expect(globalsCss).toContain('--foundation-shadow-soft:');
  });

  it('offers exactly two content widths: the standard spine and a narrow prose measure', () => {
    expect(globalsCss).toContain('.foundation-measure-standard');
    expect(globalsCss).toContain('--container-narrow: var(--foundation-content-narrow);');
    expect(globalsCss).not.toMatch(/--foundation-content-(wide|reading)/);
    expect(globalsCss).not.toMatch(/\.foundation-measure-(wide|reading)/);
  });

  it('maps the Figma-derived surface and text roles into Tailwind theme tokens', () => {
    expect(globalsCss).toContain('--color-surface-subtle: hsl(var(--surface-subtle));');
    expect(globalsCss).toContain('--color-text-subtle: hsl(var(--text-subtle));');
    expect(globalsCss).toContain('--color-border-strong: hsl(var(--border-strong));');
    expect(globalsCss).toContain('--color-brand-soft: hsl(var(--brand-soft));');
    expect(globalsCss).toContain('--color-map-water: hsl(var(--map-water));');
  });

  it('uses a calm flat page canvas instead of the previous animated background gradient', () => {
    expect(globalsCss).toMatch(
      /body\s*\{[\s\S]*?background-color:\s*hsl\(var\(--background\)\);/,
    );
    expect(globalsCss).not.toMatch(
      /body\s*\{[\s\S]*?animation:\s*subtleGradientShift/,
    );
  });
});
