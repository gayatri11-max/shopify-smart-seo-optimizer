import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestTitleTag, suggestMetaDescription } from '../src/seo/suggestions.js';
import { buildProductJsonLd } from '../src/seo/structuredData.js';
import { buildFixPlan, applyFixes } from '../src/seo/apply.js';

test('title and description suggestions respect length limits', () => {
  const product = { title: 'Hat', vendor: 'Acme Goods Co', body_html: '<p>' + 'A lovely hat for sunny days. '.repeat(20) + '</p>' };
  assert.ok(suggestTitleTag(product).length <= 60);
  assert.ok(suggestMetaDescription(product).length <= 160);
});

test('builds valid Product JSON-LD with offers', () => {
  const product = {
    title: 'Mug', handle: 'mug', vendor: 'Acme', body_html: '<p>Ceramic mug</p>',
    images: [{ src: 'https://cdn/mug.jpg' }],
    variants: [{ price: '12.00', sku: 'MUG-1', inventory_quantity: 5 }],
  };
  const ld = buildProductJsonLd(product, { store: 'shop.myshopify.com' });
  assert.equal(ld['@type'], 'Product');
  assert.equal(ld.offers.price, '12.00');
  assert.equal(ld.offers.availability, 'https://schema.org/InStock');
  assert.equal(ld.url, 'https://shop.myshopify.com/products/mug');
});

test('buildFixPlan only fixes flagged meta issues; dryRun writes nothing', async () => {
  const product = { id: 9, title: 'Test Product Name Here', vendor: 'Acme', body_html: '<p>desc</p>' };
  const plan = buildFixPlan(product, [{ id: 'meta-title-missing' }, { id: 'image-alt-missing' }]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].key, 'title_tag');
  const res = await applyFixes({ setProductMetafield: () => { throw new Error('should not write'); } }, plan, { dryRun: true });
  assert.equal(res.applied, 0);
  assert.equal(res.dryRun, true);
});
