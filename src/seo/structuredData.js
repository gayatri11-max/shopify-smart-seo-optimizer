import { stripHtml } from '../audit/rules.js';

const AVAILABILITY = {
  inStock: 'https://schema.org/InStock',
  outOfStock: 'https://schema.org/OutOfStock',
};

/** Build schema.org Product JSON-LD for a Shopify product. */
export function buildProductJsonLd(product, { store } = {}) {
  const variants = product.variants || [];
  const prices = variants.map((v) => Number(v.price)).filter((n) => !Number.isNaN(n));
  const anyAvailable = variants.some((v) => (v.inventory_quantity ?? 1) > 0 || v.available);
  const url = store && product.handle ? `https://${store}/products/${product.handle}` : undefined;

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: stripHtml(product.body_html).slice(0, 5000) || undefined,
    image: (product.images || []).map((img) => img.src).filter(Boolean),
    sku: variants[0]?.sku || undefined,
    brand: product.vendor ? { '@type': 'Brand', name: product.vendor } : undefined,
    url,
  };

  if (prices.length) {
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    jsonLd.offers = low === high
      ? {
          '@type': 'Offer',
          price: low.toFixed(2),
          priceCurrency: 'USD',
          availability: anyAvailable ? AVAILABILITY.inStock : AVAILABILITY.outOfStock,
          url,
        }
      : {
          '@type': 'AggregateOffer',
          lowPrice: low.toFixed(2),
          highPrice: high.toFixed(2),
          priceCurrency: 'USD',
          offerCount: variants.length,
          availability: anyAvailable ? AVAILABILITY.inStock : AVAILABILITY.outOfStock,
          url,
        };
  }

  // Drop undefined keys for clean output.
  return JSON.parse(JSON.stringify(jsonLd));
}
