import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const config = {
  get store() {
    return required('SHOPIFY_STORE');
  },
  get token() {
    return required('SHOPIFY_ADMIN_TOKEN');
  },
  apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
  openaiKey: process.env.OPENAI_API_KEY || null,
};
