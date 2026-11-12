const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const output = path.join(frontend, 'dist');
const snapshot = require('../frontend/content/countries/md.json');
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
// Reads the build from `npm run build`.

test('Moldova publishes Snup 45 mcg/doză, Urinal Akut and Urinal Sirop on the generic product page, in Romanian and Russian', () => {
  for (const lang of ['ro', 'ru']) {
    const products = snapshot.locales[lang].products;
    assert.deepEqual(Object.keys(products), ['snup-45', 'urinal-akut', 'urinal-sirop']);
    const catalog = read(`sites/md/${lang}/products/index.html`);
    assert.equal(catalog.window.document.querySelectorAll('[data-product-card]').length, 3);
    for (const [slug, { product }] of Object.entries(products)) {
      assert.equal(product.template, undefined, `${slug} uses the generic page`);
      const href = `/${lang}/products/${slug}.html`;
      assert.ok(catalog.window.document.querySelector(`[data-product-card][href="${href}"]`));
      const page = read(`sites/md${href}`);
      const document = page.window.document;
      assert.equal(document.querySelector('h1').textContent, product.name);
      assert.equal(document.querySelector('[data-product-image]').getAttribute('src'), product.image.src);
      assert.ok(fs.existsSync(path.join(output, product.image.src)));
      assert.ok(document.querySelector('[data-product-information]').textContent.length > 600);
      const formula = document.querySelector('#formula');
      assert.equal(formula.hidden, false);
      assert.equal(formula.querySelectorAll('.formula-point').length, 3);
      assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
      for (const file of product.documents) assert.ok(fs.existsSync(path.join(output, file.href)), file.href);
      if (lang === 'ro') assert.ok(!/[А-Яа-яЁё]/.test(document.querySelector('main').textContent), `${slug}: no Russian on the Romanian page`);
      page.window.close();
    }
    // Only the medicine has a patient leaflet; the supplements' print proofs are not published.
    assert.equal(products['snup-45'].product.documents.length, 1);
    assert.equal(products['urinal-akut'].product.documents.length, 0);
    const home = read(`sites/md/${lang}/index.html`);
    assert.equal(home.window.document.querySelector('#products').hidden, false);
    assert.ok(home.window.document.querySelector(`.menu a[href="/${lang}/products/index.html"]`), 'Products is in the menu');
    home.window.close(); catalog.window.close();
  }
  const sitemap = fs.readFileSync(path.join(output, 'sites/md/sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes('/ro/products/snup-45.html') && sitemap.includes('/ru/products/urinal-sirop.html'));
});
