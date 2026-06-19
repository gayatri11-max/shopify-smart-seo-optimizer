import { suggestAltText } from './suggestions.js';

/**
 * Build alt-text writes for every product image missing alt text.
 * Pure + testable: returns [{ productId, imageId, alt, position }].
 */
export function buildAltFixPlan(product) {
  const images = product.images || [];
  const plan = [];
  images.forEach((img, i) => {
    if (!img.alt || !img.alt.trim()) {
      plan.push({ productId: product.id, imageId: img.id, alt: suggestAltText(product, i), position: i + 1 });
    }
  });
  return plan;
}

/**
 * Apply an alt-text fix plan. When dryRun is true, nothing is written.
 * Returns { applied, dryRun, changes }.
 */
export async function applyAltFixes(client, plan, { dryRun = true } = {}) {
  if (dryRun) return { applied: 0, dryRun: true, changes: plan };
  let applied = 0;
  for (const c of plan) {
    await client.updateProductImageAlt(c.productId, c.imageId, c.alt);
    applied += 1;
  }
  return { applied, dryRun: false, changes: plan };
}
