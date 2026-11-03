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
// Georgia's products are locked until legal and brand approve them (`"locked": true` in ge.json).
const geLocked = Object.values(snapshot.locales.ge.products).some(({ product }) => product.locked);

test('Georgian products awaiting approval are kept out of the catalogue and behind the lock', { skip: !geLocked && 'Georgia is published' }, () => {
  const lockList = require('../frontend/content/locked.json');
  for (const lang of ['ge', 'en']) {
    const products = snapshot.locales[lang].products;
    assert.equal(Object.keys(products).length, 11);
    const catalog = read(`sites/ge/${lang}/products/index.html`);
    for (const slug of Object.keys(products)) {
      assert.ok(products[slug].product.locked, `${lang}/${slug} must be locked`);
      assert.equal(catalog.window.document.querySelector(`[data-product-card][href="/${lang}/products/${slug}.html"]`), null, `${lang}/${slug} not in catalogue`);
      assert.ok(lockList.pages.includes(`/sites/ge/${lang}/products/${slug}.html`), `${lang}/${slug} in locked.json`);
      assert.ok(fs.existsSync(path.join(output, `sites/ge/${lang}/products/${slug}.html`)), `${lang}/${slug} still built`);
    }
    assert.ok(!fs.readFileSync(path.join(output, 'sites/ge/sitemap.xml'), 'utf8').includes('/products/phosphalugel'));
    catalog.window.close();
  }
});

test('Georgia exposes the eleven supplied product variants with local images and original leaflets', { skip: geLocked && 'locked until approved' }, () => {
  for (const lang of ['ge', 'en']) {
    const products = snapshot.locales[lang].products;
    assert.equal(Object.keys(products).length, 11);
    const catalog = read(`sites/ge/${lang}/products/index.html`);
    assert.equal(catalog.window.document.querySelectorAll('[data-product-card]').length, 11);
    assert.equal(catalog.window.document.querySelector('a[href="#pharmacy-partners"]'), null);
    for (const [slug, { product }] of Object.entries(products)) {
      const href = `/${lang}/products/${slug}.html`;
      assert.ok(catalog.window.document.querySelector(`[data-product-card][href="${href}"]`));
      const page = read(`sites/ge${href}`);
      const document = page.window.document;
      assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
      // Showcase pages (their own template) are checked in their own test below.
      if (product.template) { page.window.close(); continue; }
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

test('the Enterogermina showcase renders every text from the product copy, with the leaflet and dosage from the instructions', () => {
  const showcased = Object.entries(snapshot.locales.en.products).filter(([, { product }]) => product.template === 'products/enterogermina.html').map(([slug]) => slug);
  assert.ok(showcased.includes('enterogermina-2-billion'));
  for (const slug of showcased) {
    for (const lang of ['ge', 'en']) {
      const { product } = snapshot.locales[lang].products[slug];
      assert.equal(product.template, 'products/enterogermina.html', `${lang}/${slug} uses the showcase in both languages`);
      const page = read(`sites/ge/${lang}/products/${slug}.html`);
      const document = page.window.document;
      const html = document.documentElement.outerHTML;
      assert.ok(!/data-sc(-list|-attr)?=/.test(html), `${lang}/${slug} has no unfilled showcase slots`);
      assert.equal(document.querySelector('.eg-lockup__dose').textContent, product.showcase.hero_dose);
      assert.ok(document.querySelector('link[href*="showcase-enterogermina.css"]'));
      assert.ok(document.querySelector('script[type="module"][src*="/js/showcase/enterogermina.js"]'));
      // The leaflet download is the product's own document.
      const leaflet = document.querySelector('a[download]');
      assert.equal(leaflet.getAttribute('href'), product.documents[0].href);
      assert.ok(fs.existsSync(path.join(output, leaflet.getAttribute('href'))));
      // Dosage switch numbers match the instructions summary on the same page.
      const vials = document.querySelector('[data-vials]');
      const { dose_adult_min: aMin, dose_adult_max: aMax, dose_child_min: cMin, dose_child_max: cMax } = product.showcase;
      assert.deepEqual([vials.dataset.adultMin, vials.dataset.adultMax, vials.dataset.childMin, vials.dataset.childMax], [aMin, aMax, cMin, cMax]);
      assert.ok(product.showcase.how_text.includes(`${aMin}–${aMax}`) && product.showcase.how_text.includes(`${cMin}–${cMax}`));
      // Composition comes straight from the leaflet-based formula points.
      product.page.formulaPoints.forEach((point, index) => assert.equal(product.showcase[`formula_${index + 1}_text`], point.text));
      assert.equal(document.querySelectorAll('.eg-tabs [role="tab"]').length, 5);
      assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
      if (product.locked) assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
      page.window.close();
    }
  }
});

test('No-Spa variants preserve strength, pack size and strength-specific adult tablet counts', () => {
  const products = snapshot.locales.en.products;
  for (const [slug, mg, count, lactose] of [['no-spa-40mg-24', 40, 24, 52], ['no-spa-40mg-100', 40, 100, 52], ['no-spa-forte-80mg-24', 80, 24, 104]]) {
    const { product } = products[slug];
    assert.match(product.name, new RegExp(`${mg} mg — ${count} tablets`));
    assert.match(product.page.formulaPoints[0].text, new RegExp(`${mg} mg of drotaverine hydrochloride`));
    assert.match(product.page.formulaPoints[1].text, new RegExp(`${lactose} mg of lactose`));
    assert.match(product.page.informationText, /levodopa/);
    assert.match(product.page.informationText, mg === 80 ? /1½–3 tablets in total per day/ : /3–6 tablets in total per day/);
    assert.match(product.page.formulaPoints[2].text, count === 100 ? /100 tablets in a polypropylene bottle/ : /24 tablets in a PVC\/aluminium blister/);
    assert.equal(product.documents[0].href, `/assets/georgia-products/${slug}-instructions-ge.docx`);
  }
});

test('countries without products keep their catalogs hidden', () => {
  // Georgia and Kazakhstan publish product catalogs; every other country stays empty.
  for (const country of require('../frontend/content/countries.json').filter(item => !['ge', 'kz'].includes(item.code))) {
    const page = read(`sites/${country.code}/${country.defaultLanguage}/index.html`);
    assert.equal(page.window.document.querySelector('#products').hidden, true);
    assert.equal(page.window.document.querySelector('.menu a[href*="/products/"]'), null);
    page.window.close();
  }
});
