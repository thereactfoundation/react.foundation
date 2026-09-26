#!/usr/bin/env node
/**
 * Bundle budget check.
 *
 * Reads the Turbopack build output in .next and measures the gzip size of the
 * JavaScript that each app route loads on first visit: the shared root chunks
 * plus the entry chunks of the route's layouts, error boundaries and page.
 * Fails when a route is over its budget in scripts/bundle-budgets.json.
 *
 * Usage: node scripts/bundle-budget.mjs [--report]
 *   --report  Print the table but do not fail on budget overruns.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const KB = 1024;
const MANIFEST_FILE = 'page_client-reference-manifest.js';

/**
 * Extracts the route and the entry chunk list from the source of a
 * page_client-reference-manifest.js file.
 */
export function parseClientReferenceManifest(source) {
  const match = source.match(/__RSC_MANIFEST\["([^"]+)"\]\s*=\s*(\{.*\})\s*;?\s*$/s);
  if (!match) return null;

  const manifest = JSON.parse(match[2]);
  const route = match[1].replace(/\/page$/, '') || '/';
  const entryFiles = Object.values(manifest.entryJSFiles ?? {}).flat();

  return { route, entryFiles };
}

/**
 * Returns the budget in KB for a route. Exact keys win over prefix keys that
 * end in "*". Among prefix keys, the longest prefix wins.
 */
export function budgetFor(route, budgets) {
  const routes = budgets.routes ?? {};
  if (route in routes) return routes[route];

  let best = null;
  for (const [pattern, limit] of Object.entries(routes)) {
    if (!pattern.endsWith('*')) continue;
    const prefix = pattern.slice(0, -1);
    if (route.startsWith(prefix) && (best === null || prefix.length > best.prefix.length)) {
      best = { prefix, limit };
    }
  }

  return best ? best.limit : budgets.defaultKb;
}

/** Compares measured sizes against budgets. Sizes are in bytes. */
export function checkBudgets(measurements, budgets) {
  return measurements
    .map(({ route, bytes }) => {
      const budgetKb = budgetFor(route, budgets);
      const sizeKb = bytes / KB;
      return { route, sizeKb, budgetKb, over: sizeKb > budgetKb };
    })
    .sort((a, b) => b.sizeKb - a.sizeKb);
}

function findManifests(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findManifests(entryPath);
    return entry.name === MANIFEST_FILE ? [entryPath] : [];
  });
}

/** Measures the gzip size of the first-load JavaScript for every app route. */
export function measureRoutes(nextDir) {
  const buildManifest = JSON.parse(readFileSync(path.join(nextDir, 'build-manifest.json'), 'utf8'));
  const rootFiles = buildManifest.rootMainFiles ?? [];
  const gzipCache = new Map();

  const gzipSize = (file) => {
    if (!gzipCache.has(file)) {
      gzipCache.set(file, gzipSync(readFileSync(path.join(nextDir, file))).length);
    }
    return gzipCache.get(file);
  };

  return findManifests(path.join(nextDir, 'server', 'app')).flatMap((manifestPath) => {
    const parsed = parseClientReferenceManifest(readFileSync(manifestPath, 'utf8'));
    if (!parsed) return [];

    const files = new Set([...rootFiles, ...parsed.entryFiles]);
    let bytes = 0;
    for (const file of files) bytes += gzipSize(file);

    return [{ route: parsed.route, bytes }];
  });
}

function main() {
  const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const nextDir = path.join(repoRoot, '.next');
  const reportOnly = process.argv.includes('--report');

  if (!existsSync(path.join(nextDir, 'build-manifest.json'))) {
    console.error('No build output in .next. Run `next build --turbopack` first.');
    process.exit(1);
  }

  const budgets = JSON.parse(readFileSync(path.join(repoRoot, 'scripts', 'bundle-budgets.json'), 'utf8'));
  const results = checkBudgets(measureRoutes(nextDir), budgets);

  console.log('First-load JS per route (gzip):');
  for (const { route, sizeKb, budgetKb, over } of results) {
    const mark = over ? 'OVER' : 'ok  ';
    console.log(`  ${mark} ${sizeKb.toFixed(1).padStart(7)} KB / ${String(budgetKb).padStart(4)} KB  ${route}`);
  }

  const overruns = results.filter((result) => result.over);
  if (overruns.length === 0) {
    console.log(`All ${results.length} routes are within budget.`);
    return;
  }

  console.error(`${overruns.length} route(s) over budget: ${overruns.map((r) => r.route).join(', ')}`);
  console.error('Reduce the JS for these routes, or raise the budget in scripts/bundle-budgets.json with a reason.');
  if (!reportOnly) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
