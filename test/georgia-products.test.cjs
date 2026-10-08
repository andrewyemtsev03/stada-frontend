const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const output = path.join(frontend, 'dist');
const snapshot = require('../frontend/content/countries/ge.json');
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));

test('Georgia exposes the eight supplied product variants with local images and original leaflets', () => {
  for (const lang of ['ge', 'en']) {
    const products = snapshot.locales[lang].products;
    assert.equal(Object.keys(products).length, 8);
    const catalog = read(`sites/ge/${lang}/products/index.html`);
    assert.equal(catalog.window.document.querySelectorAll('[data-product-card]').length, 8);
    assert.equal(catalog.window.document.querySelector('a[href="#pharmacy-partners"]'), null);
    for (const [slug, { product }] of Object.entries(products)) {
      const href = `/${lang}/products/${slug}.html`;
      assert.ok(catalog.window.document.querySelector(`[data-product-card][href="${href}"]`));
      const page = read(`sites/ge${href}`);
      const document = page.window.document;
      assert.equal(document.querySelector('h1').textContent, product.name);
      assert.ok(document.querySelector('[data-product-information]').textContent.length > 100);
      const formula = document.querySelector('#formula');
      assert.equal(formula.hidden, false, `${lang}/${slug} composition must be visible without JavaScript`);
      assert.equal(formula.querySelectorAll('.formula-point').length, 3);
      assert.equal(formula.querySelector('[data-product-formula-heading]').textContent, product.page.formulaHeading);
      assert.ok(document.querySelector('[data-product-information]').textContent.length > 1500);
      assert.equal(document.querySelector('[data-product-information]').querySelectorAll('h3').length, 7);
      assert.equal(document.querySelector('[data-product-image]').getAttribute('src'), product.image.src);
      assert.ok(fs.existsSync(path.join(output, product.image.src)));
      const leaflet = document.querySelector('a[download]');
      assert.equal(leaflet.getAttribute('href'), product.documents[0].href);
      assert.deepEqual(fs.readFileSync(path.join(output, leaflet.getAttribute('href'))), fs.readFileSync(path.join(frontend, leaflet.getAttribute('href'))));
      assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
      assert.ok(!document.querySelector('script[src*="product-live-editor"]'));
      page.window.close();
    }
    const home = read(`sites/ge/${lang}/index.html`);
    assert.equal(home.window.document.querySelector('#products').hidden, false);
    const previews = [...home.window.document.querySelectorAll('[data-home-products-grid] a')];
    assert.equal(previews.length, 4);
    assert.ok(previews.some(link => link.getAttribute('href').endsWith('/phosphalugel.html')));
    assert.ok(home.window.document.querySelector(`.menu a[href="/${lang}/products/index.html"]`));
    home.window.close(); catalog.window.close();
  }
});

test('Enterogermina pages preserve the different concentrations, dosage forms and adult-only powder', () => {
  const products = snapshot.locales.en.products;
  for (const n of [2, 4, 6]) {
    const { product } = products[`enterogermina-${n}-billion`];
    assert.match(product.page.formulaPoints[0].text, new RegExp(`${n} billion`));
    assert.match(product.page.informationText, /oral use only/i);
    assert.match(product.page.informationText, /bloodstream infection/i);
    assert.match(product.page.informationText, /antibiotic/);
    assert.equal(product.documents[0].href, `/assets/georgia-products/enterogermina-${n}-billion-instructions-ge.docx`);
    if (n === 6) {
      assert.match(product.page.informationText, /adults only/i);
      assert.match(product.page.informationText, /1 sachet daily/);
      assert.match(product.page.formulaPoints[0].text, /2 g sachet/);
      assert.doesNotMatch(product.page.informationText, /Shake the vial/);
    } else {
      assert.match(product.page.formulaPoints[0].text, /5 ml vial/);
      assert.match(product.page.informationText, /Shake the vial/);
      assert.match(product.page.informationText, /no more than 30°C/);
    }
  }
  assert.match(products['enterogermina-2-billion'].product.page.informationText, /2–3 vials daily/);
  assert.match(products['enterogermina-4-billion'].product.page.informationText, /lower-concentration product/);
});

test('enabling Georgia products leaves other country catalogs hidden and their snapshots empty', () => {
  for (const country of require('../frontend/content/countries.json').filter(item => item.code !== 'ge')) {
    const page = read(`sites/${country.code}/${country.defaultLanguage}/index.html`);
    assert.equal(page.window.document.querySelector('#products').hidden, true);
    assert.equal(page.window.document.querySelector('.menu a[href*="/products/"]'), null);
    page.window.close();
  }
});
