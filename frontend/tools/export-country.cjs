const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'content/countries.json')));

// Locked products (awaiting approval) are moved behind the PHP gate in __lock/: the page's address
// keeps a redirect to the gate, and the page itself is stored as a PHP file that refuses to run.
async function lockPages(target, code) {
  const locked = JSON.parse(fs.readFileSync(path.join(root, 'content/locked.json')));
  const prefix = `/sites/${code}/`;
  const pages = locked.pages.filter(page => page.startsWith(prefix)).map(page => page.slice(prefix.length));
  fs.rmSync(path.join(target, '__lock'), { recursive: true, force: true });
  if (!pages.length) return 0;
  const { gatePage } = require('./lock/lock.cjs');
  const country = countries.find(item => item.code === code);
  const map = {};
  const stub = page => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0;url=/__lock/?p=${encodeURIComponent(page)}">
<title>STADA</title></head>
<body><a href="/__lock/?p=${encodeURIComponent(page)}">STADA</a></body></html>
`;
  for (const page of pages) {
    if (!/^[a-z]{2}\/products\/[a-z0-9-]+\.html$/.test(page)) throw new Error(`Unexpected locked page: ${page}`);
    const file = path.join(target, page);
    const stored = page.replace(/\.html$/, '.php');
    const html = fs.readFileSync(file, 'utf8');
    fs.mkdirSync(path.dirname(path.join(target, '__lock/pages', stored)), { recursive: true });
    fs.writeFileSync(path.join(target, '__lock/pages', stored), `<?php http_response_code(404); exit; ?>\n${html}`);
    fs.writeFileSync(file, stub(page));
    map[page] = stored;
    // Also answer the address without a language (/products/<slug>.html), as on the Vercel sites.
    const [lang, , name] = page.split('/');
    if (lang === country.defaultLanguage) fs.writeFileSync(path.join(target, 'products', name), stub(page));
  }
  const php = value => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const gate = fs.readFileSync(path.join(__dirname, 'lock/gate.php'), 'utf8')
    .replace('/*PAGES*/[]/*END*/', `[${Object.entries(map).map(([key, value]) => `${php(key)} => ${php(value)}`).join(', ')}]`)
    .replace("/*GATE*/''/*END*/", php(gatePage('', false, '__ACTION__')))
    .replace("/*GATE_WRONG*/''/*END*/", php(gatePage('', true, '__ACTION__')));
  fs.writeFileSync(path.join(target, '__lock/index.php'), gate);
  // Extra guard where Apache reads .htaccess; the stored pages refuse to run anyway.
  fs.writeFileSync(path.join(target, '__lock/pages/.htaccess'), 'Require all denied\n');
  return pages.length;
}

async function exportCountry(code) {
  if (!countries.some(country => country.code === code)) throw new Error('Choose a country: kz, kg, ge, am, az, md, uz');
  const source = path.join(root, 'dist/sites', code);
  if (!fs.existsSync(source)) throw new Error('Run npm run build first.');
  const target = path.join(root, 'export', code);
  if (path.dirname(target) !== path.join(root, 'export')) throw new Error('Unsafe export path');
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
  for (const directory of ['assets', 'css', 'js']) fs.cpSync(path.join(root, 'dist', directory), path.join(target, directory), { recursive: true });
  const count = await lockPages(target, code);
  return { target, count };
}

if (require.main === module) {
  const code = process.argv[2];
  exportCountry(code).then(({ count }) => {
    const domain = countries.find(country => country.code === code).domain;
    console.log(`Upload the contents of frontend/export/${code} to ${domain}'s document root.${count ? ` ${count} locked pages are behind __lock/ (needs PHP and __lock/config.php on the server).` : ''}`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { exportCountry };
