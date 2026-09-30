const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function runtime() {
  const document = { readyState: 'loading', documentElement: {}, body: { classList: { add() {}, remove() {} } }, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; }, dispatchEvent() {} };
  const context = vm.createContext({ document, window: { addEventListener() {} }, CustomEvent: function () {}, console });
  for (const file of ['bootstrap', 'locale-state', 'content-api', 'locale-controls', 'dynamic-product']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../frontend/js/site', `${file}.js`), 'utf8'), context);
  }
  vm.runInContext(`
    currentCountry = 'kz'; currentLang = 'ru';
    const auditCalls = [];
    const auditResponses = {};
    function resolveLanguageForCountry(lang) { return lang; }
    function getCountryConfig() { return { backendCountry: 'kazakhstan' }; }
    function persistLocaleState() {}
    function setLanguageToggleState() {}
    function applyFrontendStaticText() {}
    function applyLocalizedInterface() {}
    function clearBackendRequiredMessage() {}
    function applyTextFromBackendPayload(payload) { auditCalls.push(payload.language); }
    function applyImagesFromBackendPayload() {}
    function renderManagedNewsCards() {}
    function initHistoryTimelineMedia() {}
    function applyProductCatalogCards() {}
    function renderHomeProductPreview() {}
    function renderFooterProductLinks() {}
    function applyProductMetrics() {}
    function updateDocumentTitle() {}
    function waitForCriticalImages() { return Promise.resolve(); }
    function getCurrentBackendPagePath() { return 'index.html'; }
    function getDynamicProductSlug() { return 'sample'; }
    function fetchBackendPage(lang) { return new Promise((resolve, reject) => { auditResponses[lang] = { resolve, reject }; }); }
    function fetchBackendProduct(lang) { return fetchBackendPage(lang); }
    function renderDynamicProductPage(payload) { auditCalls.push(payload.language); }
    this.calls = auditCalls; this.responses = auditResponses;
  `, context);
  return context;
}

for (const method of ['updateBackendDrivenPage', 'updateDynamicProductPage']) {
  test(`${method}: a slow old response cannot overwrite the latest selection`, async () => {
    const context = runtime();
    const old = vm.runInContext(`${method}('ru')`, context);
    const latest = vm.runInContext(`${method}('kz')`, context);
    context.responses.kz.resolve({ language: 'kz', country: { id: 'kazakhstan' } });
    await latest;
    context.responses.ru.resolve({ language: 'ru', country: { id: 'kazakhstan' } });
    await old;
    assert.deepEqual([...context.calls], ['kz']);
    assert.equal(context.document.documentElement.lang, 'kk');
  });
  test(`${method}: a failed old request cannot replace the current page with an error`, async () => {
    const context = runtime();
    const old = vm.runInContext(`${method}('ru')`, context);
    const latest = vm.runInContext(`${method}('kz')`, context);
    context.responses.kz.resolve({ language: 'kz', country: { id: 'kazakhstan' } });
    await latest;
    context.responses.ru.reject(new Error('Old request failed'));
    await old;
    assert.deepEqual([...context.calls], ['kz']);
  });
}

test('backend text from another language cannot be reused by the carousel', () => {
  const context = runtime();
  vm.runInContext(`backendPagePayload = { language: 'kz', country: { id: 'kazakhstan' }, content: { text: { cta_more: 'Kazakh payload' } } };`, context);
  assert.equal(vm.runInContext(`getTranslatedText('ru', 'cta_more')`, context), 'Подробнее');
});

test('Eurasia facts are translated in every language and keep the full country list', () => {
  const context = runtime();
  for (const lang of ['ru', 'kz', 'kg', 'ge', 'en', 'az', 'hy', 'ro', 'uz']) {
    const values = vm.runInContext(`['about_list1', 'about_list2'].map(key => FRONTEND_STATIC_TEXT['${lang}'][key])`, context);
    assert.match(values[0], /2022/, lang);
    assert.match(values[1], /11/, lang);
  }
  for (const country of ['kz', 'kg', 'ge', 'az', 'hy', 'md', 'uz']) {
    vm.runInContext(`currentCountry = '${country}'`, context);
    const text = vm.runInContext(`getFrontendStaticText('en', 'about_list2')`, context);
    assert.equal(text, 'The region comprises 11 countries: Kazakhstan, Uzbekistan, Belarus, Azerbaijan, Georgia, Moldova, Kyrgyzstan, Armenia, Mongolia, Tajikistan, and Turkmenistan.');
  }
  const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
  for (const key of ['about_list1', 'about_list2']) {
    assert.ok(html.includes(`data-static-i18n-key="${key}"`));
    assert.ok(!html.includes(`data-i18n-key="${key}"`));
  }
});

test('all languages have complete safety and accessible interface copy', () => {
  const context = runtime();
  for (const lang of ['ru', 'kz', 'kg', 'ge', 'en', 'az', 'hy', 'ro', 'uz']) {
    const values = vm.runInContext(`['pharmacovigilance_kicker', 'pharmacovigilance_heading', 'pharmacovigilance_description', 'pharmacovigilance_report_label', 'product_information_label'].map(key => FRONTEND_STATIC_TEXT['${lang}'][key])`, context);
    assert.ok(values.every(value => typeof value === 'string' && value.length), lang);
    assert.ok(vm.runInContext(`STADA_INTERFACE_COPY['${lang}'].length === 12 && STADA_ACCESSIBLE_COPY['${lang}'].length === 13`, context), lang);
  }
});
