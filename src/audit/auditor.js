import { rules } from './rules.js';

const SEVERITY_WEIGHT = { high: 25, medium: 12, low: 5 };

/** Run all rules against a single product and compute a 0-100 score. */
export function auditProduct(product, metafields = []) {
  const issues = [];
  for (const rule of rules) {
    const issue = rule(product, metafields);
    if (issue) issues.push(issue);
  }
  const penalty = issues.reduce((sum, i) => sum + (SEVERITY_WEIGHT[i.severity] || 0), 0);
  const score = Math.max(0, 100 - penalty);
  return { id: product.id, title: product.title, handle: product.handle, score, issues };
}

/**
 * Audit a list of products. Fetches SEO metafields per product via the client.
 */
export async function auditStore(client, { limit = 50 } = {}) {
  const products = await client.getProducts({ limit });
  const results = [];
  for (const product of products) {
    let metafields = [];
    try {
      metafields = await client.getProductMetafields(product.id);
    } catch {
      // Non-fatal: audit content rules even if metafields can't be read.
    }
    results.push(auditProduct(product, metafields));
  }
  results.sort((a, b) => a.score - b.score);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  return { count: results.length, averageScore: avg, results };
}
