const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const requireFrontend = createRequire(path.resolve(__dirname, '../package.json'));
const { JSDOM } = requireFrontend('jsdom');
const source = path.resolve(__dirname, '..');
const output = path.join(source, 'dist');
const countries = JSON.parse(fs.readFileSync(path.join(source, 'content/countries.json')));
const languageTag = lang => ({ kz: 'kk', kg: 'ky', ge: 'ka' }[lang] || lang);
const pageTemplates = ['index.html', 'about.html', 'culture.html', 'history.html', 'contacts.html', 'news.html', 'news-article.html', 'products/index.html'];
const scripts = ['bootstrap', 'news-labels', 'locale-state', 'content-api', 'dynamic-product', 'locale-controls', 'homepage', 'page-reveals', 'product-animations', 'news-data', 'company-news', 'shared'];
const scriptSources = scripts.map(name => {
  let code = fs.readFileSync(path.join(source, `js/site/${name}.js`), 'utf8');
  if (name === 'shared') code = code.slice(0, code.indexOf("document.addEventListener('DOMContentLoaded'"));
  return { name, code };
});

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function prepareRuntime(html, country, lang, template, payload, query = '') {
  const dom = new JSDOM(html, { url: `https://${country.domain}/${template}${query}`, runScripts: 'outside-only' });
  const window = dom.window;
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  window.requestAnimationFrame = () => 0;
  window.fetch = () => { throw new Error('The static build must never fetch runtime content.'); };
  for (const script of scriptSources) vm.runInContext(script.code, dom.getInternalVMContext(), { filename: script.name });
  window.__countries = countries;
  window.__country = country.code;
  window.__lang = lang;
  window.__payload = payload;
  window.__text = payload.content.text;
  vm.runInContext(`
    function getFrontendStaticText(lang, key) { return window.__text[key] ?? ''; }
    function getTranslatedText(lang, key) { return window.__text[key] ?? ''; }
    function getSuppliedText(lang, key) { return window.__text[key]; }
    setCountryOptions(window.__countries);
    currentCountry = window.__country; currentLang = window.__lang;
    exposeCurrentCountry(); backendPagePayload = window.__payload;
    applyTextFromBackendPayload(backendPagePayload);
    applyImagesFromBackendPayload(backendPagePayload);
    renderManagedNewsCards(backendPagePayload);
    applyProductCatalogCards(backendPagePayload);
    renderHomeProductPreview(backendPagePayload);
    renderFooterProductLinks(backendPagePayload);
    applyProductMetrics(backendPagePayload);
    applySuppliedDocumentContent(currentLang);
    initHistoryTimelineMedia();
    applyLocalizedInterface(currentLang);
    updateDocumentTitle(currentLang);
    renderCompanyNews();
  `, dom.getInternalVMContext());
  return dom;
}

function addContactDetails(document, lang) {
  // Use the same locally bundled module as the interactive globe; no separate copy.
  const dataCode = fs.readFileSync(path.join(source, 'js/worldwide/countries-data.js'), 'utf8').replace(/export /g, '');
  const cardCode = fs.readFileSync(path.join(source, 'js/worldwide/country-info-card.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
  const context = vm.createContext({ document });
  vm.runInContext(`${dataCode}\n${cardCode}\n
    const selected = countriesData.find(item => item.id === document.documentElement.dataset.stadaCountryId);
    const card = new CountryInfoCard(document.getElementById('country-info-card'), ${JSON.stringify(lang)});
    card.setLanguage(${JSON.stringify(lang)}); card.render(selected);
  `, context);
}

function finalize(dom, country, lang, template, page, text, newsId) {
  const document = dom.window.document;
  document.documentElement.lang = languageTag(lang);
  document.documentElement.setAttribute('data-static-site', '');
  if (newsId) document.documentElement.dataset.staticNewsId = newsId;
  document.body.classList.add('stada-page-loaded');
  document.body.classList.remove('backend-content-pending');
  document.querySelector('[data-backend-error-screen]')?.remove();

  // Absolute asset URLs work on both a country domain and the multi-domain build.
  document.querySelectorAll('[src], link[href], a[href]').forEach(element => {
    const attribute = element.hasAttribute('src') ? 'src' : 'href';
    const value = element.getAttribute(attribute);
    if (!value || value.startsWith('#') || /^(https?:|mailto:|tel:|data:|blob:)/i.test(value)) return;
    const resolved = new URL(value, `https://${country.domain}/${template}`);
    if (element.tagName === 'A' && /\.html$/.test(resolved.pathname)) {
      let target = resolved.pathname.replace(/^\//, '');
      if (target === 'worldwide.html') target = 'contacts.html';
      if (target === 'news-article.html' && resolved.searchParams.has('id')) {
        target = `news/${encodeURIComponent(resolved.searchParams.get('id'))}.html`;
        resolved.search = '';
      }
      if (target === 'products/product.html' && resolved.searchParams.has('slug')) {
        target = `products/${encodeURIComponent(resolved.searchParams.get('slug'))}.html`;
        resolved.search = '';
      }
      element.setAttribute(attribute, `/${lang}/${target}${resolved.search}${resolved.hash}`);
    } else element.setAttribute(attribute, `${resolved.pathname}${resolved.search}${resolved.hash}`);
  });
  document.querySelectorAll('script[src*="product-live-editor"]').forEach(script => script.remove());
  // Public pages do not contain a live editing client; edits require a new build.
  const shared = document.querySelector('script[src*="/site/shared.js"]');
  const runtime = document.createElement('script');
  runtime.src = '/js/site/static-runtime.js';
  shared.before(runtime);
  const metadata = document.createElement('script');
  metadata.id = 'stada-static-page';
  metadata.type = 'application/json';
  metadata.textContent = JSON.stringify({ country: country.code, language: lang, template, page, text, countries })
    .replace(/</g, '\\u003c');
  document.head.append(metadata);

  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    toggle.replaceChildren();
    country.supportedLanguages.forEach(language => {
      const link = document.createElement('a');
      link.href = `/${language}/${page}`;
      link.dataset.staticLanguage = language;
      link.textContent = language.toUpperCase();
      link.hreflang = languageTag(language);
      if (language === lang) link.setAttribute('aria-current', 'true');
      toggle.append(link);
    });
    const activeIndex = country.supportedLanguages.indexOf(lang);
    toggle.style.setProperty('--lang-active-x', `${activeIndex * 100}%`);
    toggle.style.setProperty('--toggle-active-x', `${activeIndex * 100}%`);
  });

  // Every page gets its own canonical and language alternatives.
  document.querySelectorAll('link[rel="canonical"], link[hreflang], meta[name="description"]').forEach(node => node.remove());
  const canonical = document.createElement('link');
  canonical.rel = 'canonical'; canonical.href = `https://${country.domain}/${lang}/${page}`;
  document.head.append(canonical);
  country.supportedLanguages.forEach(language => {
    const alternate = document.createElement('link');
    alternate.rel = 'alternate'; alternate.hreflang = languageTag(language);
    alternate.href = `https://${country.domain}/${language}/${page}`;
    document.head.append(alternate);
  });
  const description = document.createElement('meta');
  description.name = 'description';
  description.content = (document.querySelector('main p:not(:empty)')?.textContent || text.about_par1 || country.siteName)
    .replace(/\s+/g, ' ').trim().slice(0, 180);
  document.head.append(description);
  if (page === 'news-article.html' || page === 'products/product.html') {
    const noindex = document.createElement('meta'); noindex.name = 'robots'; noindex.content = 'noindex';
    document.head.append(noindex);
  }
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = '/css/modules/static-site.css'; document.head.append(stylesheet);
  const noscript = document.createElement('noscript');
  noscript.innerHTML = '<link rel="stylesheet" href="/css/modules/static-nojs.css">';
  document.head.append(noscript);
  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage',
    name: document.title, url: canonical.href, inLanguage: languageTag(lang),
    publisher: { '@type': 'Organization', name: country.siteName, url: `https://${country.domain}/` },
  }).replace(/</g, '\\u003c');
  document.head.append(schema);
  return dom.serialize();
}

function build() {
  // Only this fixed, verified generated directory may be cleared.
  if (path.dirname(output) !== source || path.basename(output) !== 'dist') throw new Error('Unsafe output directory');
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const directory of ['assets', 'css', 'js']) fs.cpSync(path.join(source, directory), path.join(output, directory), { recursive: true });
  let pageCount = 0;
  const routes = [];
  for (const country of countries) {
    const snapshot = JSON.parse(fs.readFileSync(path.join(source, `content/countries/${country.code}.json`)));
    const siteRoot = path.join(output, 'sites', country.code);
    const urls = [];
    for (const lang of country.supportedLanguages) {
      const locale = snapshot.locales[lang];
      if (!locale) throw new Error(`Missing content: ${country.code}/${lang}`);
      const render = (template, page, query = '', newsId, productPayload) => {
        const basePayload = locale.pages[template] || locale.pages['products/index.html'];
        const payload = { ...basePayload, country, content: { ...basePayload.content,
          text: { ...locale.text, ...basePayload.content.text },
        } };
        const dom = prepareRuntime(fs.readFileSync(path.join(source, template), 'utf8'), country, lang, template, payload, query);
        if (template === 'contacts.html') addContactDetails(dom.window.document, lang);
        if (productPayload) {
          dom.window.__product = productPayload;
          vm.runInContext('renderDynamicProductPage(window.__product)', dom.getInternalVMContext());
        }
        const html = finalize(dom, country, lang, template, page, payload.content.text, newsId);
        write(path.join(siteRoot, lang, page), html);
        if (page !== 'news-article.html' && page !== 'products/product.html') urls.push(`https://${country.domain}/${lang}/${page}`);
        if (lang === country.defaultLanguage && pageTemplates.includes(page)) write(path.join(siteRoot, page), html);
        pageCount++;
        dom.window.close();
      };
      for (const template of pageTemplates.filter(page => page !== 'news-article.html')) render(template, template);
      render('news-article.html', 'news-article.html');
      const newsContext = vm.createContext({});
      vm.runInContext(fs.readFileSync(path.join(source, 'js/site/news-data.js'), 'utf8'), newsContext);
      const news = vm.runInContext('STADA_COMPANY_NEWS', newsContext);
      for (const item of news.filter(item => item.country === country.code && item.translations[lang])) {
        render('news-article.html', `news/${item.id}.html`, `?id=${encodeURIComponent(item.id)}`, item.id);
      }
      for (const [slug, product] of Object.entries(locale.products || {})) {
        if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid product slug: ${slug}`);
        render('products/product.html', `products/${slug}.html`, `?slug=${slug}`, undefined, product);
      }
    }
    write(path.join(siteRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `<url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
    write(path.join(siteRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${country.domain}/sitemap.xml\n`);
    {
      const has = [{ type: 'host', value: `(?:www\\.|new\\.)?${country.domain.replace(/\./g, '\\.')}` }];
      routes.push({ source: '/:lang(ru|kz|kg|ge|en|az|hy|ro|uz)/:page*', has, destination: `/sites/${country.code}/:lang/:page*` });
      routes.push({ source: '/:page(index.html|about.html|culture.html|history.html|contacts.html|news.html|news-article.html|robots.txt|sitemap.xml)', has, destination: `/sites/${country.code}/:page` });
      routes.push({ source: '/products/:page*', has, destination: `/sites/${country.code}/${country.defaultLanguage}/products/:page*` });
      routes.push({ source: '/', has, destination: `/sites/${country.code}/index.html` });
    }
  }
  const deployment = JSON.parse(fs.readFileSync(path.join(source, 'vercel.json')));
  deployment.rewrites = [...routes, { source: '/', destination: '/sites/kz/index.html' }];
  // Generated metadata and static runtime need no content API access.
  deployment.headers = deployment.headers.map(entry => ({ ...entry, headers: entry.headers.map(header => {
    if (header.key !== 'Content-Security-Policy') return header;
    return { ...header, value: header.value.replace(' https://api.stada.kz https://stada-content-backend.onrender.com', '') };
  }) }));
  write(path.join(output, 'vercel.json'), `${JSON.stringify(deployment, null, 2)}\n`);
  write(path.join(output, 'build-manifest.json'), `${JSON.stringify({ countries: countries.map(country => country.code), pages: pageCount }, null, 2)}\n`);
  console.log(`Built ${pageCount} complete pages across ${countries.length} country sites. Output: frontend/dist`);
}
if (require.main === module) build();
module.exports = { build, output, source, countries };
