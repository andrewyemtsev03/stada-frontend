const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.join(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(root, 'package.json'))('jsdom');

test('static locale initialization opens consent without a later page mutation and remembers the choice', () => {
  const dom = new JSDOM(`<html data-static-site><body class="stada-page-loaded">
    <div class="footer-bottom__links"></div><dialog data-cookie-notice></dialog>
    <script id="stada-static-page" type="application/json">{"country":"kz","language":"ru","page":"index.html","text":{},"countries":[]}</script>
    </body></html>`, { url: 'https://www.stada.kz/ru/index.html', runScripts: 'outside-only' });
  const context = dom.getInternalVMContext();
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  vm.runInContext(`let currentLang = '', currentCountry = '', STADA_DOMAIN_COUNTRY = '', STADA_DEFAULT_COUNTRY = '';
    function exposeCurrentCountry() {} function setCountryOptions() {}`, context);
  for (const name of ['static-runtime', 'cookie-notice']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js/site', `${name}.js`), 'utf8'), context);
  }
  const notice = dom.window.document.querySelector('[data-cookie-notice]');
  assert.equal(notice.open, false);
  vm.runInContext('initializeLocaleState()', context);
  assert.equal(notice.open, true);
  assert.equal(notice.querySelector('h2').textContent, 'Настройки конфиденциальности');
  notice.querySelector('[data-cookie-reject]').click();
  assert.equal(notice.open, false);
  assert.equal(JSON.parse(dom.window.localStorage.getItem('stada-cookie-preferences-v2')).performance, false);
  vm.runInContext('initializeLocaleState()', context);
  assert.equal(notice.open, false);
  dom.window.document.querySelector('.cookie-settings-link').click();
  assert.equal(dom.window.document.querySelector('.cookie-preferences').open, true);
  dom.window.close();
});
