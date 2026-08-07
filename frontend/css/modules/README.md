# Main site stylesheet structure

`../style.css` is the stable entry point used by every HTML page. It imports these files in the original cascade order:

- `base.css` — site-wide foundations, navigation, original homepage components, footer, and early responsive rules.
- `products/layout.css` — catalogue and product-detail foundations.
- `products/themes-1.css` through `themes-4.css` — product-specific visual themes in their original source order.
- `products/motion.css` — product interactions, motion, and responsive refinements.
- `home.css` — current homepage hero and section styling.
- `history.css` — company-history page.
- `worldwide.css` — worldwide map and country interface.
- `culture.css` — culture page and later culture refinements.
- `products/formula-showcase.css` — immersive product-formula component.
- `polish.css` — final shared layout, accessibility, and visual-rhythm overrides.

Import order is part of the visual contract because later rules intentionally refine earlier ones.
