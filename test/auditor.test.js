import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditProduct } from '../src/audit/auditor.js';

test('flags missing meta title and description', () => {
  const product = { id: 1, title: 'Test', handle: 'test', body_html: '<p>short</p>', images: [] };
  const { issues, score } = auditProduct(product, []);
  const ids = issues.map((i) => i.id);
  assert.ok(ids.includes('meta-title-missing'));
  assert.ok(ids.includes('meta-desc-missing'));
  assert.ok(score < 100);
});

test('clean product scores high', () => {
  const product = {
    id: 2,
    title: 'Premium Wireless Headphones',
    handle: 'premium-wireless-headphones',
    body_html: '<p>' + 'Great sound and comfort for all-day listening. '.repeat(6) + '</p>',
    images: [{ alt: 'Black wireless over-ear headphones' }],
  };
  const metafields = [
    { namespace: 'global', key: 'title_tag', value: 'Premium Wireless Headphones - All-Day Comfort' },
    { namespace: 'global', key: 'description_tag', value: 'Premium wireless headphones with rich sound, deep bass, and all-day comfort. Free shipping and a 2-year warranty included today.' },
  ];
  const { score } = auditProduct(product, metafields);
  assert.equal(score, 100);
});
