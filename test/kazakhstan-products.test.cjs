const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const snapshot = require('../frontend/content/countries/kz.json');
const { renderShowcase, output, lockedList } = require('../frontend/tools/build-static.cjs');
const { exportCountry } = require('../frontend/tools/export-country.cjs');
const { execFileSync } = require('node:child_process');
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
const slug = 'magne-b6-kids';
const isLocked = Boolean(snapshot.locales.ru.products[slug].product.locked);
const lock = async () => require('../frontend/tools/lock/lock.cjs');
// Reads the build from `npm run build` (test files run in parallel, so none may rebuild dist).

test('the lock list is committed up to date with the content', () => {
  const entries = [];
  for (const country of require('../frontend/content/countries.json')) {
    const content = require(`../frontend/content/countries/${country.code}.json`);
    for (const lang of country.supportedLanguages) {
      for (const [name, payload] of Object.entries(content.locales[lang].products || {})) if (payload.product.locked) entries.push({ country: country.code, lang, slug: name });
    }
  }
  const committed = JSON.parse(fs.readFileSync(path.join(frontend, 'content/locked.json'), 'utf8'));
  assert.deepEqual(committed, lockedList(entries), 'run npm run build and commit content/locked.json');
});

test('locked products are built but kept out of catalogues, menus and sitemaps', { skip: !isLocked && 'Магне B6 Кидс is published' }, () => {
  for (const lang of ['ru', 'kz']) {
    const page = read(`sites/kz/${lang}/products/${slug}.html`);
    assert.equal(page.window.document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
    for (const file of [`sites/kz/${lang}/products/index.html`, `sites/kz/${lang}/index.html`, `sites/kz/${lang}/about.html`]) {
      assert.ok(!fs.readFileSync(path.join(output, file), 'utf8').includes(`products/${slug}.html`), `${file} links to the locked page`);
    }
  }
  assert.ok(!fs.readFileSync(path.join(output, 'sites/kz/sitemap.xml'), 'utf8').includes(slug));
});

test('the Vercel lock guards only locked pages and their own files', async () => {
  const { middleware, isLocked: locked, sitePath, COUNTRIES } = await lock();
  for (const country of require('../frontend/content/countries.json')) {
    assert.deepEqual(COUNTRIES[country.code], { languages: country.supportedLanguages, home: country.defaultLanguage }, country.code);
  }
  assert.equal(sitePath('stada.uz', '/ru/about.html'), '/sites/uz/ru/about.html');
  assert.equal(sitePath('new.stada.ge', '/products/x.html'), '/sites/ge/ge/products/x.html');
  assert.equal(sitePath('stada.kg', '/'), '/');
  if (isLocked) {
    for (const [host, pathname] of [['stada.kz', '/ru/products/magne-b6-kids.html'], ['stada.kz', '/products/magne-b6-kids.html'], ['www.stada.kz', '/kz/products/Magne-B6-Kids.html'],
      ['stada.uz', '/sites/kz/ru/products/magne-b6-kids.html'], ['x.vercel.app', '/sites//kz/ru/products/%6dagne-b6-kids.html'], ['stada.ge', '/assets/kazakhstan-products/magne-b6-kids/panda-lite.glb'],
      ['stada.ge', '/css/modules/products/showcase-magne-b6-kids.css'], ['stada.ge', '/js/showcase/magne-b6-kids.js'], ['stada.kz', '/ru/products/magne-b6-kids']]) {
      assert.ok(locked(host, pathname), `${host}${pathname}`);
    }
  }
  for (const [host, pathname] of [['stada.kz', '/ru/products/index.html'], ['stada.ge', '/ge/products/phosphalugel.html'], ['stada.uz', '/'], ['stada.kz', '/assets/logos/stada_logo.png'], ['stada.kz', '/ru/products/magne-b6-kids-forte.html']]) {
    assert.ok(!locked(host, pathname), `${host}${pathname}`);
  }
  if (!isLocked) return;
  const env = { ...process.env };
  const get = (pathname, init = {}) => middleware(new Request(`https://stada.kz${pathname}`, { ...init, headers: { host: 'stada.kz', ...(init.headers || {}) } }));
  try {
    delete process.env.LOCK_PASSWORD; delete process.env.LOCK_SECRET;
    assert.equal((await get('/ru/products/magne-b6-kids.html')).status, 503, 'fails closed when unconfigured');
    assert.equal((await get('/ru/about.html')).headers.get('x-middleware-next'), '1', 'the rest of the site still works');
    Object.assign(process.env, { LOCK_PASSWORD: 'test-password', LOCK_SECRET: 'test-secret' });
    const page = await get('/ru/products/magne-b6-kids.html');
    assert.equal(page.status, 401);
    assert.ok(!(await page.text()).includes('Магне B6 Кидс</h1>'));
    assert.equal((await get('/ru/about.html')).headers.get('x-middleware-next'), '1');
    assert.equal((await get('/ru/products/magne-b6-kids.html', { headers: { cookie: `stada_lock=${Date.now() + 1e9}.deadbeef` } })).status, 401, 'forged cookie');
    const login = body => get('/__lock/login', { method: 'POST', body: new URLSearchParams(body) });
    assert.equal((await login({ password: 'wrong', next: '/' })).status, 401);
    assert.equal((await login({ password: 'test-password', next: '//evil.example/x' })).headers.get('location'), '/', 'no open redirect');
    const ok = await login({ password: 'test-password', next: '/ru/products/magne-b6-kids.html' });
    assert.equal(ok.status, 303);
    assert.equal(ok.headers.get('location'), '/ru/products/magne-b6-kids.html');
    assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
    const through = await get('/ru/products/magne-b6-kids.html', { headers: { cookie: ok.headers.get('set-cookie').split(';')[0] } });
    assert.equal(through.headers.get('x-middleware-next'), '1');
    assert.equal(through.headers.get('cache-control'), 'private, no-store');
  } finally {
    process.env = env;
  }
});

test('the stada.kz export puts locked pages behind the PHP gate', { skip: !isLocked && 'Магне B6 Кидс is published' }, async () => {
  const { target } = await exportCountry('kz');
  for (const lang of ['ru', 'kz']) {
    const stub = fs.readFileSync(path.join(target, `${lang}/products/${slug}.html`), 'utf8');
    assert.ok(!stub.includes('Магне'), `${lang}: the public file is only a redirect`);
    assert.match(stub, new RegExp(`url=/__lock/index\\.php\\?p=${lang}%2Fproducts%2F${slug}\\.html`));
    const stored = fs.readFileSync(path.join(target, `__lock/pages/${lang}/products/${slug}.php`), 'utf8');
    assert.ok(stored.startsWith('<?php http_response_code(404); exit; ?>\n<!DOCTYPE html>'));
  }
  assert.match(fs.readFileSync(path.join(target, `products/${slug}.html`), 'utf8'), /url=\/__lock\/index\.php\?p=ru%2Fproducts/);
  assert.ok(!fs.existsSync(path.join(target, '__lock/config.php')), 'the password is never exported');
  const gate = fs.readFileSync(path.join(target, '__lock/index.php'), 'utf8');
  assert.ok(gate.includes(`'ru/products/${slug}.html' => 'ru/products/${slug}.php'`));
  try { execFileSync('php', ['-l', path.join(target, '__lock/index.php')], { stdio: 'pipe' }); } catch (error) { if (error.code !== 'ENOENT') throw error; }
});

test('Kazakhstan catalogs link Магне B6 Кидс to its showcase page in Russian and Kazakh', { skip: isLocked && 'locked until approved' }, () => {
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
    assert.equal(document.querySelectorAll('.mg-cap').length, 3);
    assert.ok(document.querySelector('.mg-hero__visual [data-hero-canvas]'), 'hero 3D canvas');
    assert.ok(document.querySelector('.mg-hero__jar'), 'hero poster photo for the first paint and no-WebGL fallback');
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
    'js/vendor/three/GLTFLoader.js', 'js/vendor/three/BufferGeometryUtils.js', 'assets/kazakhstan-products/magne-b6-kids/panda.glb', 'assets/kazakhstan-products/magne-b6-kids/panda-lite.glb',
    'assets/kazakhstan-products/magne-b6-kids/watermelon-slice.glb',
    'assets/kazakhstan-products/magne-b6-kids/jar.glb']) {
    assert.ok(fs.existsSync(path.join(output, file)), file);
  }
  const dom = new JSDOM('<h2 data-sc="title"></h2>');
  assert.throws(() => renderShowcase(dom.window.document, { product: { slug, showcase: { title: '<img src=x onerror=alert(1)>' } } }), /Unsupported markup/);
  assert.throws(() => renderShowcase(dom.window.document, { product: { slug, showcase: {} } }), /Missing showcase text/);
  const ok = new JSDOM('<h2 data-sc="title"></h2>');
  renderShowcase(ok.window.document, { product: { slug, name: 'X', showcase: { title: 'A<br><b>B</b>' } } });
  assert.equal(ok.window.document.querySelector('h2').innerHTML, 'A<br><b>B</b>');
});
