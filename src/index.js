#!/usr/bin/env node
import { ShopifyClient } from './shopify/client.js';
import { auditStore } from './audit/auditor.js';
import { log, paint } from './utils/logger.js';

const command = process.argv[2] || 'audit';

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

async function main() {
  switch (command) {
    case 'audit': {
      const client = new ShopifyClient();
      log.info('Running SEO audit against your Shopify store…');
      const report = await auditStore(client);
      printReport(report);
      break;
    }
    case 'help':
    default:
      console.log(`\nShopify Smart SEO Optimizer\n\nUsage:\n  seo-optimizer audit    Run an SEO audit on your store\n  seo-optimizer help     Show this help\n`);
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
