import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAltFixPlan, applyAltFixes } from '../src/seo/altApply.js';

test('plans alt only for images missing it', () => {
  const product = { id: 7, title: 'Lamp', images: [{ id: 1, alt: '' }, { id: 2, alt: 'has alt' }, { id: 3 }] };
  const plan = buildAltFixPlan(product);
  assert.equal(plan.length, 2);
  assert.equal(plan[0].alt, 'Lamp');
  assert.equal(plan[1].alt, 'Lamp — view 3');
});

test('dryRun writes nothing', async () => {
  const plan = buildAltFixPlan({ id: 1, title: 'X', images: [{ id: 1 }] });
  const res = await applyAltFixes({ updateProductImageAlt: () => { throw new Error('no'); } }, plan, { dryRun: true });
  assert.equal(res.applied, 0);
  assert.equal(res.dryRun, true);
});
