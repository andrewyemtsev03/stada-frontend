# Shared footer

All nine pages use `frontend/partials/footer.html`, with relative paths adjusted for the products directory. Run `node scripts/sync-footer.cjs` after editing the template; the committed pages include the footer directly, so visitors do not need an extra request to load it.

The footer contains the country identity and introduction, trust facts, one company links column, the information notice, copyright, and bottom links. Cookie settings are inserted by the existing cookie controls. Country identity and introduction come from the active country registry, and all other labels use the existing frontend locale system.

`test/footer.test.cjs` checks that every page matches the template, paths remain correct, country identity uses the active country, and all nine interface languages have footer translations.
