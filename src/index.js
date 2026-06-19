#!/usr/bin/env node
import { ShopifyClient } from './shopify/client.js';
import { auditStore, auditProduct } from './audit/auditor.js';
import { buildFixPlan, applyFixes } from './seo/apply.js';
import { buildProductJsonLd } from './seo/structuredData.js';
import { log, paint } from './utils/logger.js';

const args = process.argv.slice(2);
const command = args[0] || 'audit';
const flags = new Set(args.filter((a) => a.startsWith('--')));

function printReport(report) {
  log.info(`Audited ${report.count} products — average SEO score ${report.averageScore}/100\n`);
  for (const r of report.results) {
    const color = r.score >= 80 ? 'green' : r.score >= 50 ? 'yellow' : 'red';
    console.log(`${paint(color, String(r.score).padStart(3))}/100  ${r.title}`);
    for (const issue of r.issues) {
      console.log(`        ${paint('dim', `[${issue.severity}]`)} ${issue.message}`);
      console.log(`        ${paint('dim', '→ ' + issue.suggestion)}`);
    }
    if (r.issues.length) console.log('');
  }
}

async function runAudit() {
  const client = new ShopifyClient();
  log.info('Running SEO audit against your Shopify store…');
  printReport(await auditStore(client));
}

async function runFix() {
  const apply = flags.has('--apply');
  const client = new ShopifyClient();
  const products = await client.getProducts({ limit: 50 });
  const plan = [];
  for (const product of products) {
    let metafields = [];
    try { metafields = await client.getProductMetafields(product.id); } catch { /* ignore */ }
    const { issues } = auditProduct(product, metafields);
    plan.push(...buildFixPlan(product, issues));
  }
  if (plan.length === 0) { log.success('No meta-tag fixes needed.'); return; }
  log.info(`${plan.length} proposed meta-tag change(s):`);
  for (const c of plan) {
    console.log(`  ${paint('cyan', c.key)} on product ${c.productId} (${c.reason})`);
    console.log(`    ${paint('dim', c.value)}`);
  }
  const result = await applyFixes(client, plan, { dryRun: !apply });
  if (result.dryRun) log.warn('Dry run — nothing written. Re-run with --apply to write these changes.');
  else log.success(`Applied ${result.applied} change(s) to your store.`);
}

async function runSchema() {
  const client = new ShopifyClient();
  const store = process.env.SHOPIFY_STORE;
  const products = await client.getProducts({ limit: 50 });
  const blocks = products.map((p) => buildProductJsonLd(p, { store }));
  console.log(JSON.stringify(blocks, null, 2));
}

async function main() {
  switch (command) {
    case 'audit': return runAudit();
    case 'fix': return runFix();
    case 'schema': return runSchema();
    case 'help':
    default:
      console.log(`\nShopify Smart SEO Optimizer\n\nUsage:\n  seo-optimizer audit          Run an SEO audit on your store\n  seo-optimizer fix [--apply]  Preview meta-tag fixes (add --apply to write them)\n  seo-optimizer schema         Print Product JSON-LD for each product\n  seo-optimizer help           Show this help\n`);
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
