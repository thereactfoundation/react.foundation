import assert from 'node:assert/strict';
import test from 'node:test';

import { budgetFor, checkBudgets, parseClientReferenceManifest } from './bundle-budget.mjs';

const budgets = {
  defaultKb: 175,
  routes: {
    '/communities*': 285,
    '/communities/start': 180,
    '/admin*': 290,
    '/admin/data*': 300,
  },
};

test('parses the route and entry chunks from a client reference manifest', () => {
  const source = [
    'globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};',
    'globalThis.__RSC_MANIFEST["/about/page"] = {"clientModules":{},"entryJSFiles":{"[project]/src/app/layout":["static/chunks/a.js","static/chunks/b.js"],"[project]/src/app/about/page":["static/chunks/c.js"]}};',
  ].join('\n');

  assert.deepEqual(parseClientReferenceManifest(source), {
    route: '/about',
    entryFiles: ['static/chunks/a.js', 'static/chunks/b.js', 'static/chunks/c.js'],
  });
});

test('maps the root page manifest to "/"', () => {
  const source = 'globalThis.__RSC_MANIFEST["/page"] = {"entryJSFiles":{}};';
  assert.equal(parseClientReferenceManifest(source)?.route, '/');
});

test('returns null for a file that is not a client reference manifest', () => {
  assert.equal(parseClientReferenceManifest('module.exports = {};'), null);
});

test('uses the default budget when no route key matches', () => {
  assert.equal(budgetFor('/about', budgets), 175);
});

test('prefers an exact key over a prefix key', () => {
  assert.equal(budgetFor('/communities/start', budgets), 180);
  assert.equal(budgetFor('/communities/add', budgets), 285);
});

test('uses the longest matching prefix key', () => {
  assert.equal(budgetFor('/admin/users', budgets), 290);
  assert.equal(budgetFor('/admin/data/libraries', budgets), 300);
});

test('flags only routes over budget and sorts by size', () => {
  const results = checkBudgets(
    [
      { route: '/about', bytes: 150 * 1024 },
      { route: '/', bytes: 176 * 1024 },
      { route: '/communities', bytes: 280 * 1024 },
    ],
    budgets
  );

  assert.deepEqual(
    results.map(({ route, over }) => [route, over]),
    [
      ['/communities', false],
      ['/', true],
      ['/about', false],
    ]
  );
});
