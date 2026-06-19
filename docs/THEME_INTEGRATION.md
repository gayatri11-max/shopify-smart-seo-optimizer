# Injecting Product JSON-LD into your Shopify theme

The `schema` command (`node src/index.js schema`) prints schema.org Product JSON-LD generated from the Admin API. That's useful for auditing, but for live rich results you want the structured data rendered directly in your theme so Google sees it on every product page. This guide shows the theme-side approach.

## Why render it in the theme

Rendering JSON-LD in Liquid keeps the structured data **always in sync** with live product data (price, availability, images) without re-running this tool. The CLI generator is best for spot-checking and validation; the Liquid snippet below is what ships to production.

## 1. Add a snippet

Create `snippets/product-jsonld.liquid`:

```liquid
{%- comment -%} schema.org Product structured data {%- endcomment -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 5000 | json }},
  "image": [
    {%- for image in product.images -%}
      {{ image | image_url: width: 1200 | prepend: 'https:' | json }}{%- unless forloop.last -%},{%- endunless -%}
    {%- endfor -%}
  ],
  {%- if product.vendor != blank -%}
  "brand": { "@type": "Brand", "name": {{ product.vendor | json }} },
  {%- endif -%}
  "sku": {{ product.selected_or_first_available_variant.sku | json }},
  "url": {{ shop.url | append: product.url | json }},
  "offers": {
    "@type": "Offer",
    "price": {{ product.selected_or_first_available_variant.price | money_without_currency | strip_html | json }},
    "priceCurrency": {{ shop.currency | json }},
    "availability": "https://schema.org/{% if product.available %}InStock{% else %}OutOfStock{% endif %}",
    "url": {{ shop.url | append: product.url | json }}
  }
}
</script>
```

## 2. Render it on the product page

In `sections/main-product.liquid` (or `templates/product.liquid` on older themes), add near the top:

```liquid
{% render 'product-jsonld' %}
```

## 3. Validate

- Paste a rendered product URL into Google's [Rich Results Test](https://search.google.com/test/rich-results).
- Cross-check the field values against `node src/index.js schema`, which prints the same structure from the Admin API.
- Fix any warnings (missing `image`, `price`, or `availability` are the common ones).

## Notes

- Shopify's Dawn and other modern themes may already output some Product JSON-LD. Check `sections/main-product.liquid` for an existing `application/ld+json` block before adding a second one — duplicate Product nodes can confuse crawlers.
- For variant-level pricing, consider rendering `AggregateOffer` with `lowPrice`/`highPrice`, mirroring what `buildProductJsonLd` emits when a product has multiple price points.
