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

test('Armenia has Coldrex MaxGrip and Coldrex Hotrem Lemon in Armenian and Russian, locked for approval', () => {
  const lockList = require('../frontend/content/locked.json');
  const sitemap = fs.readFileSync(path.join(output, 'sites/am/sitemap.xml'), 'utf8');
  for (const lang of ['hy', 'ru']) {
    const products = snapshot.locales[lang].products;
    assert.deepEqual(Object.keys(products), slugs);
    for (const [slug, { product }] of Object.entries(products)) {
      const href = `/${lang}/products/${slug}.html`;
      assert.equal(product.locked, true, `${lang}/${slug} awaits approval`);
      assert.equal(product.template, undefined, `${slug} uses the generic page`);
      assert.ok(lockList.pages.includes(`/sites/am${href}`), `${lang}/${slug} in locked.json`);
      assert.ok(!sitemap.includes(href), `${lang}/${slug} not in the sitemap`);
      const document = read(`sites/am${href}`).window.document;
      assert.equal(document.querySelector('h1').textContent, product.name);
      assert.equal(document.querySelector('meta[name="robots"]').getAttribute('content').includes('noindex'), true);
      assert.equal(document.querySelector('[data-product-image]').getAttribute('src'), product.image.src);
      assert.ok(fs.existsSync(path.join(output, product.image.src)));
      assert.equal(document.querySelector('#formula').querySelectorAll('.formula-point').length, 3);
      assert.equal(product.documents.length, 1);
      for (const file of product.documents) assert.ok(fs.existsSync(path.join(output, file.href)), file.href);
      if (lang === 'hy') assert.ok(!/[А-Яа-яЁё]/.test(document.querySelector('main [data-product-information]').textContent), `${slug}: no Russian in the Armenian text`);
    }
  }
  // Moldova's public Coldrex MaxGrip Lemon is not caught by the Armenian lock.
  assert.ok(!lockList.slugs.includes('coldrex-maxgrip-lemon'));
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
