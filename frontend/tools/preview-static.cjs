const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const countries = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../content/countries.json')));
const option = (name, fallback) => { const index = process.argv.indexOf(name); return index < 0 ? fallback : process.argv[index + 1]; };
const defaultCountry = option('--country', 'kz');
const port = Number(option('--port', '4173'));
if (!countries.some(country => country.code === defaultCountry)) throw new Error('Unknown preview country');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.txt': 'text/plain' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  const host = String(request.headers.host).split(':')[0];
  const country = countries.find(item => [item.domain, `new.${item.domain}`, `www.${item.domain}`].includes(host)) || countries.find(item => item.code === defaultCountry);
  if (!/^\/(assets|css|js|sites)\//.test(pathname)) {
    if (pathname === '/') pathname = '/index.html';
    if (pathname === '/worldwide.html') {
      response.writeHead(301, { Location: '/contacts.html' }); response.end(); return;
    }
    pathname = `/sites/${country.code}${pathname}`;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Page not found'); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Preview ${defaultCountry}: http://127.0.0.1:${port}`));
module.exports = { server };
