import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider SSR rendering', () => {
  it('renders children visibly without a visibility:hidden wrapper that blocks FCP/LCP', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <main>Hello React Foundation</main>
      </ThemeProvider>
    );

    expect(html).toContain('<main>Hello React Foundation</main>');
    expect(html).not.toContain('visibility:hidden');
  });
});
