# Main site JavaScript structure

The public site remains dependency-free and uses ordered classic browser scripts. Every HTML page loads these files in the sequence below so existing shared bindings and behavior remain unchanged.

- `bootstrap.js` — page-loader setup, shared locale state, and static translation dictionaries.
- `locale-state.js` — backend country discovery, locale resolution, persistence, and language-option rendering.
- `content-api.js` — page-content requests, DOM hydration, catalogue/news rendering, and backend failure handling.
- `dynamic-product.js` — database-backed product-detail rendering and formula layout.
- `locale-controls.js` — language/country updates and document titles.
- `homepage.js` — navigation, hero, carousels, catalogue filters, metrics, and product tilt/progress behavior.
- `page-reveals.js` — product-page startup and homepage, catalogue, and history reveal effects.
- `product-animations.js` — product-specific hero levitation and motion effects.
- `shared.js` — scroll spy, shared counters, footer year, history media, and final page initialization.

Keep the script tags in their documented order. New behavior should live with its page or domain instead of growing `shared.js`.
