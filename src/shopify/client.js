import { config } from '../config.js';

/**
 * Minimal Shopify Admin REST API client.
 * Uses the global fetch available in Node 18+.
 */
export class ShopifyClient {
  constructor({ store = config.store, token = config.token, apiVersion = config.apiVersion } = {}) {
    this.base = `https://${store}/admin/api/${apiVersion}`;
    this.headers = {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    };
  }

  async request(path, options = {}) {
    const res = await fetch(`${this.base}${path}`, { ...options, headers: this.headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Shopify API ${res.status} ${res.statusText} for ${path}: ${body}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  /** Fetch a page of products. */
  async getProducts({ limit = 50 } = {}) {
    const data = await this.request(`/products.json?limit=${limit}`);
    return data.products || [];
  }

  /** Fetch SEO metafields (title_tag / description_tag) for a product. */
  async getProductMetafields(productId) {
    const data = await this.request(`/products/${productId}/metafields.json`);
    return data.metafields || [];
  }

  /** Upsert a metafield on a product (used when applying fixes). */
  async setProductMetafield(productId, { key, value, namespace = 'global', type = 'single_line_text_field' }) {
    return this.request(`/products/${productId}/metafields.json`, {
      method: 'POST',
      body: JSON.stringify({ metafield: { namespace, key, value, type } }),
    });
  }
}
