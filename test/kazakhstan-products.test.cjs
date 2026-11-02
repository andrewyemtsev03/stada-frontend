const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const output = path.join(frontend, 'dist');
const snapshot = require('../frontend/content/countries/kz.json');
const { renderShowcase } = require('../frontend/tools/build-static.cjs');
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
const slug = 'magne-b6-kids';

test('Kazakhstan catalogs link Магне B6 Кидс to its showcase page in Russian and Kazakh', () => {
  for (const lang of ['ru', 'kz']) {
    const { product } = snapshot.locales[lang].products[slug];
    const href = `/${lang}/products/${slug}.html`;
    const catalog = read(`sites/kz/${lang}/products/index.html`);
    const card = catalog.window.document.querySelector(`[data-product-card][href="${href}"]`);
    assert.ok(card, `${lang} catalog card`);
    assert.equal(card.dataset.category, 'kids');
    assert.equal(card.querySelector('img').getAttribute('src'), product.image.src);
    assert.ok(fs.existsSync(path.join(output, product.image.src)));
    const home = read(`sites/kz/${lang}/index.html`);
    assert.equal(home.window.document.querySelector('#products').hidden, false);
    assert.ok(home.window.document.querySelector(`.menu a[href="/${lang}/products/index.html"]`));
    catalog.window.close(); home.window.close();
  }
});

test('the showcase page is complete without JavaScript in both languages', () => {
  for (const [lang, notMedicine, tagline] of [['ru', 'Не является лекарством', 'Для спокойного детства без утомляемости'], ['kz', 'Дәрілік зат емес', 'Қажусыз тыныш балалық шақ үшін']]) {
    const page = read(`sites/kz/${lang}/products/${slug}.html`);
    const document = page.window.document;
    const text = document.querySelector('main').textContent.replace(/\s+/g, ' ');
    assert.equal(document.querySelector('h1').textContent.replace(/\s+/g, ''), 'МагнеB6Кидс');
    assert.equal(document.title, snapshot.locales[lang].products[slug].product.page.title);
    assert.equal(document.querySelectorAll('[data-sc], [data-sc-list], [data-sc-attr]').length, 0, 'every copy slot is filled');
    for (const fact of ['70 мг', '0,6 мг', '140 мг', '1,2 мг', '1700 мг', '46 г', 'AM.01.48.01.003.R.000147.05.25', 'BIOFARMA S.r.l.', notMedicine, tagline]) {
      assert.ok(text.includes(fact), `${lang}: ${fact}`);
    }
    assert.equal(document.querySelectorAll('.mg-cap').length, 5);
    assert.equal(document.querySelectorAll('[role="tab"]').length, 4);
    assert.equal(document.querySelectorAll('.lang-toggle a').length, 2);
    assert.equal(document.querySelector('link[rel="canonical"]').href, `https://stada.kz/${lang}/products/${slug}.html`);
    assert.ok(document.querySelector('script[type="module"][src^="/js/showcase/magne-b6-kids.js"]'));
    assert.ok(!document.querySelector('script[src*="product-live-editor"]'));
    for (const image of document.querySelectorAll('main img')) {
      assert.ok(fs.existsSync(path.join(output, image.getAttribute('src'))), image.getAttribute('src'));
    }
    page.window.close();
  }
});

test('Russian and Kazakh showcase copy cover the same slots', () => {
  const ru = snapshot.locales.ru.products[slug].product.showcase;
  const kz = snapshot.locales.kz.products[slug].product.showcase;
  assert.deepEqual(Object.keys(kz).sort(), Object.keys(ru).sort());
  const template = fs.readFileSync(path.join(frontend, 'products/magne-b6-kids.html'), 'utf8');
  const used = new Set([...template.matchAll(/data-sc(?:-list)?="([^"]+)"/g)].map(match => match[1]));
  for (const match of template.matchAll(/data-sc-attr="([^"]+)"/g)) match[1].split(';').forEach(pair => used.add(pair.split(':')[1]));
  assert.deepEqual([...used].filter(key => !(key in ru)), [], 'template slots missing from content');
  assert.deepEqual(Object.keys(ru).filter(key => !used.has(key)), [], 'content keys unused by the template');
});

test('the dosage calculator matches the label for both age groups', () => {
  const page = read(`sites/kz/ru/products/${slug}.html`);
  const [magnesium, b6] = page.window.document.querySelectorAll('[data-ring]');
  assert.deepEqual([magnesium.dataset.young, magnesium.dataset.youngPct, magnesium.dataset.older, magnesium.dataset.olderPct], ['70', '35', '140', '70']);
  assert.deepEqual([b6.dataset.young, b6.dataset.youngPct, b6.dataset.older, b6.dataset.olderPct], ['0.6', '50', '1.2', '100']);
  page.window.close();
});

test('3D assets ship with the site and showcase copy rejects unexpected markup', () => {
  for (const file of ['js/vendor/three/three.module.min.js', 'js/vendor/three/RoomEnvironment.js', 'js/vendor/three/LICENSE',
    'assets/kazakhstan-products/magne-b6-kids/label-4096.webp', 'assets/kazakhstan-products/magne-b6-kids/label-2048.webp']) {
    assert.ok(fs.existsSync(path.join(output, file)), file);
  }
  const dom = new JSDOM('<h2 data-sc="title"></h2>');
  assert.throws(() => renderShowcase(dom.window.document, { product: { slug, showcase: { title: '<img src=x onerror=alert(1)>' } } }), /Unsupported markup/);
  assert.throws(() => renderShowcase(dom.window.document, { product: { slug, showcase: {} } }), /Missing showcase text/);
  const ok = new JSDOM('<h2 data-sc="title"></h2>');
  renderShowcase(ok.window.document, { product: { slug, name: 'X', showcase: { title: 'A<br><b>B</b>' } } });
  assert.equal(ok.window.document.querySelector('h2').innerHTML, 'A<br><b>B</b>');
});
