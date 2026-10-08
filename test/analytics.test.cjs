const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.join(__dirname, '../frontend');
const source = fs.readFileSync(path.join(root, 'js/site/analytics.js'), 'utf8');

function setup(consent, hostname = 'www.stada.am') {
  const scripts = [];
  const listeners = {};
  const window = { STADA_COOKIE_CONSENT: consent };
  const document = {
    addEventListener(name, handler) { listeners[name] = handler; },
    createElement() { return { remove() { scripts.splice(scripts.indexOf(this), 1); } }; },
    head: { appendChild(script) { scripts.push(script); } },
  };
  vm.runInNewContext(source, { window, document, location: { hostname, protocol: 'https:' } });
  return { scripts, window, consent(value) { listeners['stada:cookie-consent']({ detail: value }); } };
}

test('analytics waits for consent, loads once, and blocks events after withdrawal', () => {
  const site = setup();
  assert.equal(site.scripts.length, 0);
  site.consent({ performance: false });
  assert.equal(site.scripts.length, 0);
  site.consent({ performance: true });
  assert.equal(site.scripts.length, 1);
  assert.equal(site.scripts[0].src, '/_vercel/insights/script.js');
  const [command, beforeSend] = site.window.vaq[0];
  assert.equal(command, 'beforeSend');
  const event = { type: 'pageview', url: 'https://www.stada.am/about.html' };
  assert.equal(beforeSend(event), event);
  site.consent({ performance: true });
  assert.equal(site.scripts.length, 1);
  site.consent({ performance: false });
  assert.equal(beforeSend(event), null);
  site.consent({ performance: true });
  assert.equal(beforeSend(event), event);
  assert.equal(site.scripts.length, 1);
});

test('saved consent loads analytics and local development skips Vercel routes', () => {
  assert.equal(setup({ performance: true }).scripts.length, 1);
  for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
    assert.equal(setup({ performance: true }, hostname).scripts.length, 0);
  }
});

test('failed loads can retry after another consent update', () => {
  const site = setup({ performance: true });
  site.scripts[0].onerror();
  assert.equal(site.scripts.length, 0);
  site.consent({ performance: true });
  assert.equal(site.scripts.length, 1);
});

test('every public HTML page references the loader through a valid relative path', () => {
  let count = 0;
  for (const file of fs.readdirSync(root, { recursive: true })) {
    if (['dist', 'export', 'node_modules'].includes(file.split(path.sep)[0])) continue;
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!html.includes('</head>')) continue;
    const matches = [...html.matchAll(/<script defer src="([^"]*analytics\.js)\?v=1"><\/script>/g)];
    assert.equal(matches.length, 1, file);
    assert.equal(path.resolve(root, path.dirname(file), matches[0][1]), path.join(root, 'js/site/analytics.js'));
    count++;
  }
  assert.equal(count, 9);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const policy = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(policy, /script-src 'self'/);
  assert.match(policy, /connect-src 'self'/);
});
