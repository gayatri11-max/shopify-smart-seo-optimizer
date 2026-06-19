import { suggestTitleTag, suggestMetaDescription } from './suggestions.js';

const META_ISSUE_KEYS = {
  'meta-title-missing': 'title_tag',
  'meta-title-length': 'title_tag',
  'meta-desc-missing': 'description_tag',
  'meta-desc-length': 'description_tag',
};

/**
 * Build a list of metafield writes from a product's audit issues.
 * Pure + testable: returns [{ productId, key, value, reason }].
 */
export function buildFixPlan(product, issues = []) {
  const keysToFix = new Set();
  for (const issue of issues) {
    const key = META_ISSUE_KEYS[issue.id];
    if (key) keysToFix.add(key);
  }
  const plan = [];
  if (keysToFix.has('title_tag')) {
    plan.push({ productId: product.id, key: 'title_tag', value: suggestTitleTag(product), reason: 'SEO title' });
  }
  if (keysToFix.has('description_tag')) {
    plan.push({ productId: product.id, key: 'description_tag', value: suggestMetaDescription(product), reason: 'meta description' });
  }
  return plan;
}

/**
 * Apply a fix plan. When dryRun is true, nothing is written.
 * Returns { applied, dryRun, changes }.
 */
export async function applyFixes(client, plan, { dryRun = true } = {}) {
  if (dryRun) return { applied: 0, dryRun: true, changes: plan };
  let applied = 0;
  for (const change of plan) {
    await client.setProductMetafield(change.productId, { key: change.key, value: change.value });
    applied += 1;
  }
  return { applied, dryRun: false, changes: plan };
}
