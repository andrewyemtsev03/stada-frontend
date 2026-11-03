const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const snapshot = require('../frontend/content/countries/kz.json');
const { build, renderShowcase, reviewOutput, output: publicOutput } = require('../frontend/tools/build-static.cjs');
// Магне B6 Кидс is on review: it is built only into the password-protected review site.
const output = reviewOutput;
const read = file => new JSDOM(fs.readFileSync(path.join(output, file), 'utf8'));
const slug = 'magne-b6-kids';
const silently = run => { const log = console.log; console.log = () => {}; try { run(); } finally { console.log = log; } };
test.before(() => silently(() => build({ review: true })));

test('products on review stay out of every public build', () => {
  assert.equal(snapshot.locales.ru.products[slug].product.review, true);
  for (const lang of ['ru', 'kz']) {
    assert.ok(!fs.existsSync(path.join(publicOutput, `sites/kz/${lang}/products/${slug}.html`)), `${lang}: no public page`);
    const catalog = fs.readFileSync(path.join(publicOutput, `sites/kz/${lang}/products/index.html`), 'utf8');
    assert.ok(!catalog.includes(slug), `${lang}: no public catalogue card`);
    assert.ok(!fs.readFileSync(path.join(publicOutput, 'sites/kz/sitemap.xml'), 'utf8').includes(slug));
  }
});

test('the review site gate refuses everything without a valid session', async () => {
  const { default: middleware } = await import(path.join(__dirname, '../review/middleware.js'));
  Object.assign(process.env, { REVIEW_PASSWORD: 'test-password', REVIEW_SECRET: 'test-secret' });
  try {
    const page = await middleware(new Request('https://review.example/ru/products/magne-b6-kids.html'));
    assert.equal(page.status, 401);
    assert.ok(!(await page.text()).includes('Магне B6 Кидс</h1>'));
    const forged = await middleware(new Request('https://review.example/', { headers: { cookie: `stada_review=${Date.now() + 1e9}.deadbeef` } }));
    assert.equal(forged.status, 401);
    const login = body => middleware(new Request('https://review.example/__review/login', { method: 'POST', body: new URLSearchParams(body) }));
    assert.equal((await login({ password: 'wrong', next: '/' })).status, 401);
    const ok = await login({ password: 'test-password', next: '//evil.example/x' });
    assert.equal(ok.status, 303);
    assert.equal(ok.headers.get('location'), '/', 'no open redirect');
    const cookie = ok.headers.get('set-cookie').split(';')[0];
    assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
    const through = await middleware(new Request('https://review.example/ru/products/magne-b6-kids.html', { headers: { cookie } }));
    assert.equal(new URL(through.headers.get('x-middleware-rewrite')).pathname, '/sites/kz/ru/products/magne-b6-kids.html');
    const asset = await middleware(new Request('https://review.example/css/style.css', { headers: { cookie } }));
    assert.equal(asset.headers.get('x-middleware-next'), '1');
    const ge = await middleware(new Request('https://review.example/ge/en/about.html?x=1', { headers: { cookie } }));
    assert.equal(new URL(ge.headers.get('x-middleware-rewrite')).pathname + new URL(ge.headers.get('x-middleware-rewrite')).search, '/sites/ge/en/about.html?x=1');
    assert.match(ge.headers.get('set-cookie'), /^stada_review_country=ge; .*HttpOnly; Secure/);
    delete process.env.REVIEW_SECRET;
    assert.equal((await middleware(new Request('https://review.example/', { headers: { cookie } }))).status, 503, 'fails closed when unconfigured');
  } finally {
    delete process.env.REVIEW_PASSWORD; delete process.env.REVIEW_SECRET;
  }
});

test('the review site picks the country from the address and keeps it for the site\'s own links', async () => {
  const { routeFor, COUNTRIES } = await import(path.join(__dirname, '../review/middleware.js'));
  const listed = require('../frontend/content/countries.json');
  const list = Array.isArray(listed) ? listed : listed.countries;
  assert.deepEqual(Object.keys(COUNTRIES).sort(), list.map(country => country.code).sort(), 'middleware knows every country');
  for (const country of list) {
    assert.deepEqual(COUNTRIES[country.code], { languages: country.supportedLanguages, home: country.defaultLanguage }, country.code);
  }
  const to = (pathname, remembered) => routeFor(pathname, remembered)?.path ?? null;
  assert.equal(to('/'), null, 'start page');
  assert.equal(to('/css/style.css', 'ge'), null);
  assert.equal(to('/uz/'), '/sites/uz/index.html');
  assert.equal(routeFor('/uz/').country, 'uz');
  assert.equal(to('/uz/ru/products/x.html'), '/sites/uz/ru/products/x.html');
  assert.equal(to('/kz/kz/products/x.html'), '/sites/kz/kz/products/x.html');
  assert.equal(to('/ge/ge/'), '/sites/ge/ge/index.html');
  // The site's own links carry no country.
  assert.equal(to('/ru/about.html'), '/sites/kz/ru/about.html', 'Kazakhstan by default');
  assert.equal(to('/ru/about.html', 'uz'), '/sites/uz/ru/about.html');
  assert.equal(to('/en/news.html', 'ge'), '/sites/ge/en/news.html');
  assert.equal(to('/kz/about.html', 'kz'), '/sites/kz/kz/about.html', 'Kazakh, not the country');
  assert.equal(to('/kz/', 'kz'), '/sites/kz/kz/index.html');
  assert.equal(to('/kz/', 'ge'), '/sites/kz/index.html');
  assert.equal(to('/about.html', 'am'), '/sites/am/about.html');
  assert.equal(to('/products/x.html', 'md'), '/sites/md/ro/products/x.html');
  assert.equal(to('/ru/about.html', 'nope'), '/sites/kz/ru/about.html');
});

test('the review start page lists each product on review per country and language', () => {
  const index = new JSDOM(fs.readFileSync(path.join(output, 'index.html'), 'utf8')).window.document;
  const links = [...index.querySelectorAll('li a')].map(link => link.getAttribute('href'));
  assert.deepEqual(links, [`/kz/ru/products/${slug}.html`, `/kz/kz/products/${slug}.html`]);
  assert.ok(index.querySelector('a[href="/ge/ge/index.html"]'));
  assert.ok(!fs.existsSync(path.join(publicOutput, 'index.html')) || !fs.readFileSync(path.join(publicOutput, 'index.html'), 'utf8').includes('на согласовании'));
});

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
