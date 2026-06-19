import { stripHtml } from '../audit/rules.js';

const TITLE_MAX = 60;
const TITLE_MIN = 30;
const DESC_MAX = 160;

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

/** Suggest an SEO title tag (<= 60 chars), padding short names with the vendor. */
export function suggestTitleTag(product) {
  let title = (product.title || '').trim();
  if (title.length < TITLE_MIN && product.vendor) {
    const padded = `${title} | ${product.vendor}`;
    if (padded.length <= TITLE_MAX) title = padded;
  }
  return truncate(title, TITLE_MAX);
}

/** Suggest a meta description (<= 160 chars) from the product body or a fallback. */
export function suggestMetaDescription(product) {
  const body = stripHtml(product.body_html);
  const base = body && body.length >= 40
    ? body
    : `Shop ${product.title}${product.vendor ? ` by ${product.vendor}` : ''}. Quality you can trust, with fast shipping and easy returns.`;
  return truncate(base, DESC_MAX);
}

/** Suggest alt text for a product image lacking one. */
export function suggestAltText(product, index = 0) {
  const base = product.title || 'Product';
  return index === 0 ? base : `${base} — view ${index + 1}`;
}
