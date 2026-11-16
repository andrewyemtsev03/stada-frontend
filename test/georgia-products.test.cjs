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
// Магне B6 Кидс (shared showcase with Kazakhstan) is checked in its own test below.
const SHARED = ['magne-b6-kids'];
const own = lang => Object.fromEntries(Object.entries(snapshot.locales[lang].products).filter(([slug]) => !SHARED.includes(slug)));
const geLocked = Object.values(own('ge')).some(({ product }) => product.locked);
// The catalogue page can be locked on its own (`"locked": true` on pages["products/index.html"]).
const catalogLocked = ['ge', 'en'].some(lang => snapshot.locales[lang].pages['products/index.html'].locked);

test('Georgian products awaiting approval are kept out of the catalogue and behind the lock', { skip: !geLocked && 'Georgia is published' }, () => {
  const lockList = require('../frontend/content/locked.json');
  for (const lang of ['ge', 'en']) {
    const products = own(lang);
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
    const products = own(lang);
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
    if (!catalogLocked) assert.ok(home.window.document.querySelector(`.menu a[href="/${lang}/products/index.html"]`));
    home.window.close(); catalog.window.close();
  }
});

test('a locked Georgian catalogue is behind the password while the products stay public', { skip: !catalogLocked && 'the catalogue is published' }, async () => {
  const lockList = require('../frontend/content/locked.json');
  const { isLocked } = require('../frontend/tools/lock/lock.cjs');
  for (const lang of ['ge', 'en']) {
    assert.ok(snapshot.locales[lang].pages['products/index.html'].locked, `${lang} catalogue locked in both languages`);
    assert.ok(lockList.pages.includes(`/sites/ge/${lang}/products/index.html`), `${lang} catalogue in locked.json`);
    const catalog = read(`sites/ge/${lang}/products/index.html`);
    assert.equal(catalog.window.document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
    catalog.window.close();
    for (const pathname of [`/${lang}/products`, `/${lang}/products/`, `/${lang}/products/index.html`, `/${lang}/products/index`]) {
      for (const host of ['stada.ge', 'www.stada.ge', 'new.stada.ge']) assert.ok(isLocked(host, pathname), `${host}${pathname}`);
    }
    // Public pages do not send visitors to the password page.
    for (const file of ['index.html', 'about.html', 'products/essentiale-forte.html', 'products/enterogermina-2-billion.html']) {
      const page = read(`sites/ge/${lang}/${file}`);
      assert.equal(page.window.document.querySelector('a[href*="products/index"]'), null, `${lang}/${file} links to the locked catalogue`);
      page.window.close();
    }
    const product = read(`sites/ge/${lang}/products/essentiale-forte.html`);
    assert.ok(product.window.document.querySelector(`a[href="/${lang}/index.html#products"]`), 'back link goes to the home page products');
    product.window.close();
    for (const slug of Object.keys(snapshot.locales[lang].products)) {
      if (snapshot.locales[lang].products[slug].product.locked) continue;
      assert.ok(!isLocked('stada.ge', `/${lang}/products/${slug}.html`), `${lang}/${slug} is public`);
    }
  }
  for (const pathname of ['/products', '/products/', '/products/index.html', '/sites/ge/products/index.html']) assert.ok(isLocked('stada.ge', pathname), pathname);
  assert.ok(!isLocked('stada.kz', '/ru/products/index.html'), 'other countries keep their catalogue');
  const sitemap = fs.readFileSync(path.join(output, 'sites/ge/sitemap.xml'), 'utf8');
  assert.ok(!sitemap.includes('/products/index.html'));
  assert.ok(sitemap.includes('/ge/products/phosphalugel.html'));
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
      // The hero is the typed name, the vial and the amount only.
      assert.equal(document.querySelector('.eg-hero__amount').textContent, product.showcase.fact_spores_value);
      assert.equal(document.querySelectorAll('#eg-hero a, #eg-hero button, #eg-hero dl').length, 0);
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
  // Georgia, Kazakhstan and Moldova have products; every other country stays empty.
  for (const country of require('../frontend/content/countries.json').filter(item => !['ge', 'kz', 'md'].includes(item.code))) {
    const page = read(`sites/${country.code}/${country.defaultLanguage}/index.html`);
    assert.equal(page.window.document.querySelector('#products').hidden, true);
    assert.equal(page.window.document.querySelector('.menu a[href*="/products/"]'), null);
    page.window.close();
  }
});

test('Магне B6 Кидс for Georgia: the Kazakh showcase in Georgian and English, behind the lock', () => {
  const lockList = require('../frontend/content/locked.json');
  const kz = require('../frontend/content/countries/kz.json');
  const keys = Object.keys(kz.locales.ru.products['magne-b6-kids'].product.showcase).sort();
  for (const [lang, name, letters] of [['ge', 'მაგნე B6 ქიდს', 'ქიდს'], ['en', 'Magne B6 Kids', 'Kids']]) {
    const { product } = snapshot.locales[lang].products['magne-b6-kids'];
    assert.deepEqual(Object.keys(product.showcase).sort(), keys, `${lang} has every showcase text`);
    const html = fs.readFileSync(path.join(output, `sites/ge/${lang}/products/magne-b6-kids.html`), 'utf8');
    const { document } = new JSDOM(html).window;
    if (product.locked) {
      assert.ok(lockList.pages.includes(`/sites/ge/${lang}/products/magne-b6-kids.html`));
      assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
    }
    assert.ok(!/data-sc(-list|-attr|-country|-hide-empty)?=/.test(html), `${lang}: no unfilled showcase slots`);
    assert.ok(!/[А-Яа-яЁё]/.test(document.querySelector('main').textContent), `${lang}: no Russian or Kazakh text left on the page`);
    assert.equal(document.querySelector('.mg-hero .mg-kids').textContent, letters);
    assert.equal(document.querySelectorAll('.mg-hero .mg-kids span').length, 4);
    assert.equal(document.querySelector('.mg-bar__name b').textContent, name);
    assert.equal(document.querySelector('.mg-partners'), null, `${lang}: no Kazakh pharmacy links`);
    const main = document.querySelector('main').innerHTML;
    assert.ok(!main.includes('kaspi.kz') && !main.includes('STADA Kazakhstan') && !main.includes('.kz/'), `${lang}: nothing Kazakh-specific in the page content`);
    assert.equal(document.querySelectorAll('.mg-passport dl > div').length, 2, `${lang}: only status and manufacturer in the passport`);
    assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
    assert.ok(document.querySelector('script[src*="/js/showcase/magne-b6-kids.js"]'));
  }
  // Kazakhstan keeps its pharmacies, passport and Cyrillic lockup.
  const kzPage = new JSDOM(fs.readFileSync(path.join(output, 'sites/kz/ru/products/magne-b6-kids.html'), 'utf8')).window.document;
  assert.equal(kzPage.querySelectorAll('.mg-partner').length, 4);
  assert.equal(kzPage.querySelectorAll('.mg-passport dl > div').length, 4);
  assert.equal(kzPage.querySelector('.mg-hero .mg-kids').textContent, 'Кидс');
});
