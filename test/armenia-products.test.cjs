const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const output = path.join(frontend, 'dist');
const snapshot = require('../frontend/content/countries/am.json');
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
// Reads the build from `npm run build`.

const slugs = ['coldrex-maxgrip', 'coldrex-hotrem-lemon'];

test('Armenia has Coldrex MaxGrip and Coldrex Hotrem Lemon in Armenian and Russian, public and indexed', () => {
  const lockList = require('../frontend/content/locked.json');
  const sitemap = fs.readFileSync(path.join(output, 'sites/am/sitemap.xml'), 'utf8');
  for (const lang of ['hy', 'ru']) {
    const products = Object.fromEntries(Object.entries(snapshot.locales[lang].products).filter(([slug]) => slugs.includes(slug)));
    assert.deepEqual(Object.keys(products), slugs);
    for (const [slug, { product }] of Object.entries(products)) {
      const href = `/${lang}/products/${slug}.html`;
      assert.ok(!product.locked, `${lang}/${slug} is published`);
      assert.equal(product.template, undefined, `${slug} uses the generic page`);
      assert.ok(!lockList.pages.includes(`/sites/am${href}`), `${lang}/${slug} not in locked.json`);
      assert.ok(sitemap.includes(href), `${lang}/${slug} in the sitemap`);
      const document = read(`sites/am${href}`).window.document;
      assert.equal(document.querySelector('h1').textContent, product.name);
      assert.equal(document.querySelector('meta[name="robots"]'), null, `${lang}/${slug} is indexable`);
      assert.equal(document.querySelector('[data-product-image]').getAttribute('src'), product.image.src);
      assert.ok(fs.existsSync(path.join(output, product.image.src)));
      assert.equal(document.querySelector('#formula').querySelectorAll('.formula-point').length, 3);
      assert.equal(product.documents.length, 1);
      for (const file of product.documents) assert.ok(fs.existsSync(path.join(output, file.href)), file.href);
      if (lang === 'hy') assert.ok(!/[А-Яа-яЁё]/.test(document.querySelector('main [data-product-information]').textContent), `${slug}: no Russian in the Armenian text`);
    }
    const catalog = read(`sites/am/${lang}/products/index.html`).window.document;
    assert.equal(catalog.querySelectorAll('[data-product-card]').length, 4);
    for (const slug of slugs) assert.ok(catalog.querySelector(`[data-product-card][href="/${lang}/products/${slug}.html"]`), `${lang}/${slug} in the catalogue`);
    const home = read(`sites/am/${lang}/index.html`).window.document;
    assert.equal(home.querySelector('#products').hidden, false);
    assert.ok(home.querySelector(`.menu a[href="/${lang}/products/index.html"]`), 'Products is in the menu');
  }
});

test('Coldrex doses and ages follow the supplied Armenian copy', () => {
  for (const lang of ['hy', 'ru']) {
    const text = slug => snapshot.locales[lang].products[slug].product.page.informationText;
    assert.match(text('coldrex-maxgrip'), /1000/);
    assert.match(text('coldrex-maxgrip'), /18/);
    assert.match(text('coldrex-hotrem-lemon'), /750/);
    assert.match(text('coldrex-hotrem-lemon'), /12/);
  }
});

test('Snup 45 and Snup 90 for Armenia (hy and ru) are public, with the supplied SmPC', () => {
  const lockList = require('../frontend/content/locked.json');
  const sitemap = fs.readFileSync(path.join(output, 'sites/am/sitemap.xml'), 'utf8');
  for (const lang of ['hy', 'ru']) {
    const catalog = read(`sites/am/${lang}/products/index.html`).window.document;
    assert.equal(catalog.querySelectorAll('[data-product-card]').length, 4);
    for (const [slug, dose, age] of [['snup-45', '45', '2'], ['snup-90', '90', '6']]) {
      const { product } = snapshot.locales[lang].products[slug];
      const href = `/${lang}/products/${slug}.html`;
      assert.ok(!product.locked, `${lang}/${slug} is published`);
      assert.ok(!lockList.pages.includes(`/sites/am${href}`), `${lang}/${slug} not in locked.json`);
      assert.ok(sitemap.includes(href), `${lang}/${slug} in the sitemap`);
      assert.ok(catalog.querySelector(`[data-product-card][href="${href}"]`), `${lang}/${slug} in the catalogue`);
      assert.ok(product.name.includes(dose));
      assert.ok(product.page.informationText.includes(age));
      assert.equal(product.image.src, `/assets/armenia-products/${slug}.png`);
      assert.deepEqual(product.documents.map(file => file.href), ['/assets/armenia-products/snup-smpc-ru.pdf']);
      const document = read(`sites/am${href}`).window.document;
      assert.equal(document.querySelector('h1').textContent, product.name);
      assert.equal(document.querySelector('meta[name="robots"]'), null, `${lang}/${slug} is indexable`);
      assert.ok(fs.existsSync(path.join(output, product.image.src)));
      assert.ok(fs.existsSync(path.join(output, product.documents[0].href)));
    }
  }
});
