import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const routeSource = readFileSync(
  path.join(dirname, '..', '..', 'app', 'api', 'ingest', 'full', 'route.ts'),
  'utf8'
);

describe('full ingestion route', () => {
  it('keeps the function alive until the background run finishes', () => {
    // The POST handler responds before the run is done. Without after(), the
    // platform can stop the function and the content map is never stored.
    expect(routeSource).toMatch(/import \{[^}]*\bafter\b[^}]*\} from 'next\/server'/);
    expect(routeSource).toContain('after(ingestionPromise)');
  });
});
