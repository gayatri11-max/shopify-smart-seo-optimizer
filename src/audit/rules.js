/**
 * Each rule inspects a product (+ its SEO metafields) and returns an issue
 * object when something is wrong, or null when the rule passes.
 *
 * Issue shape: { id, severity, message, suggestion }
 * severity: 'high' | 'medium' | 'low'
 */

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function metaValue(metafields, key) {
  const m = metafields.find((mf) => mf.namespace === 'global' && mf.key === key);
  return m ? m.value : null;
}

export const rules = [
  function metaTitlePresent(product, metafields) {
    const title = metaValue(metafields, 'title_tag');
    if (!title) {
      return { id: 'meta-title-missing', severity: 'high', message: 'Missing SEO title tag.', suggestion: `Add a title tag (~${TITLE_MIN}-${TITLE_MAX} chars) based on the product name and a key benefit.` };
    }
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      return { id: 'meta-title-length', severity: 'medium', message: `SEO title is ${title.length} chars (ideal ${TITLE_MIN}-${TITLE_MAX}).`, suggestion: 'Tighten or expand the title to fit the ideal range.' };
    }
    return null;
  },

  function metaDescriptionPresent(product, metafields) {
    const desc = metaValue(metafields, 'description_tag');
    if (!desc) {
      return { id: 'meta-desc-missing', severity: 'high', message: 'Missing meta description.', suggestion: `Write a ${DESC_MIN}-${DESC_MAX} char description with a clear value proposition and a call to action.` };
    }
    if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
      return { id: 'meta-desc-length', severity: 'medium', message: `Meta description is ${desc.length} chars (ideal ${DESC_MIN}-${DESC_MAX}).`, suggestion: 'Adjust the description length to the ideal range.' };
    }
    return null;
  },

  function imageAltText(product) {
    const images = product.images || [];
    if (images.length === 0) {
      return { id: 'no-images', severity: 'low', message: 'Product has no images.', suggestion: 'Add at least one product image with descriptive alt text.' };
    }
    const missing = images.filter((img) => !img.alt || !img.alt.trim()).length;
    if (missing > 0) {
      return { id: 'image-alt-missing', severity: 'medium', message: `${missing}/${images.length} images missing alt text.`, suggestion: 'Add descriptive alt text to every product image.' };
    }
    return null;
  },

  function thinContent(product) {
    const text = stripHtml(product.body_html);
    if (text.length < 150) {
      return { id: 'thin-content', severity: 'medium', message: `Description is thin (${text.length} chars).`, suggestion: 'Expand the description to at least 150-300 words covering features, materials, and use cases.' };
    }
    return null;
  },

  function handleReadable(product) {
    if (product.handle && product.handle.length > 75) {
      return { id: 'handle-too-long', severity: 'low', message: 'URL handle is very long.', suggestion: 'Shorten the URL handle to keep it readable and keyword-focused.' };
    }
    return null;
  },
];

export { stripHtml, metaValue };
