// Shared by middleware.js (Vercel) and tools/export-country.cjs (the PHP gate's page). See middleware.js.
// CommonJS, because Vercel loads middleware.js as CommonJS in this package.

const locked = require('../../content/locked.json');

const COOKIE = 'stada_lock';
const LOGIN = '/__lock/login';
const LOGOUT = '/__lock/logout';

// Hosts and languages, as in vercel.json's host rewrites.
const COUNTRIES = {
  kz: { languages: ['ru', 'kz'], home: 'ru' },
  kg: { languages: ['ru', 'kg'], home: 'ru' },
  ge: { languages: ['ge', 'en'], home: 'ge' },
  az: { languages: ['az', 'ru'], home: 'az' },
  am: { languages: ['hy', 'ru'], home: 'hy' },
  md: { languages: ['ro', 'ru'], home: 'ro' },
  uz: { languages: ['ru', 'uz'], home: 'ru' },
};

const lockedPages = new Set(locked.pages.map(page => page.replace(/\.html$/, '')));
const lockedSlugs = locked.slugs.map(slug => new RegExp(`(^|[/_.-])${slug.replace(/[-]/g, '\\-')}([/_.]|$)`));

// The file a request is served from, following the host rewrites in vercel.json.
function sitePath(host, pathname) {
  let path;
  try { path = decodeURIComponent(pathname); } catch { return pathname; }
  path = path.replace(/\/{2,}/g, '/').toLowerCase();
  if (path.startsWith('/sites/')) return path;
  const match = /^(?:www\.|new\.)?stada\.([a-z]{2})(?::\d+)?$/.exec(String(host || '').toLowerCase());
  const country = match && COUNTRIES[match[1]] ? match[1] : null;
  if (!country) return path;
  const [first, ...rest] = path.split('/').filter(Boolean);
  if (COUNTRIES[country].languages.includes(first) || ['ru', 'kz', 'kg', 'ge', 'en', 'az', 'hy', 'ro', 'uz'].includes(first)) {
    return `/sites/${country}/${[first, ...rest].join('/')}`;
  }
  if (first === 'products') return `/sites/${country}/${COUNTRIES[country].home}/products/${rest.join('/')}`;
  return path;
}

function isLocked(host, pathname) {
  const path = sitePath(host, pathname);
  if (lockedPages.has(path.replace(/\.html$/, '').replace(/\/$/, ''))) return true;
  return lockedSlugs.some(pattern => pattern.test(path));
}

const encoder = new TextEncoder();
const hex = buffer => [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const sha256 = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const hmac = async (secret, value) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
};
// Equal-length hex digests compared without an early exit.
const same = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

// Continue to the site (what @vercel/functions' next() returns).
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

const readCookie = request => {
  const header = request.headers.get('cookie') || '';
  const match = header.split(/;\s*/).find(part => part.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : '';
};

async function validSession(token, secret) {
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return same(signature, await hmac(secret, `lock|${expires}`));
}

// Only same-site paths may be returned to after logging in.
const safeTarget = value => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/__lock') && !value.includes('\\') ? value : '/');

const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function gatePage(target, wrong = false, action = LOGIN) {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>STADA — материалы на согласовании</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%}
  body{min-height:100vh;display:grid;place-items:center;padding:18px;font-family:"Noto Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#141a52;
    background:radial-gradient(110% 90% at 72% 44%,#b4f0ff 0%,#5fd6fa 38%,#2fbcef 78%,#1aa7e3 100%)}
  form{width:min(390px,100%);padding:32px 28px 28px;border-radius:28px;background:#fff;text-align:center;box-shadow:0 40px 80px -40px rgba(0,50,120,.6)}
  img{width:120px;height:auto;display:block;margin:0 auto 18px}
  h1{margin:0 0 6px;font-size:21px}
  p{margin:0 0 20px;font-size:14px;line-height:1.5;color:#46507a}
  input{width:100%;padding:14px 16px;border:1.5px solid rgba(38,44,142,.2);border-radius:14px;font-size:16px;font-family:inherit;outline:none}
  input:focus{border-color:#262c8e}
  button{width:100%;margin-top:12px;padding:14px;border:0;border-radius:99px;background:#262c8e;color:#fff;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer}
  button:hover{background:#e5007d}
  .error{min-height:18px;margin:12px 0 0;font-size:13px;color:#e5007d}
  .wrong{animation:shake .4s}
  @keyframes shake{25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
</style>
</head>
<body>
<form method="post" action="${action}"${wrong ? ' class="wrong"' : ''}>
  <img src="/assets/logos/stada_logo.png" alt="STADA" width="770" height="450">
  <h1>Материалы на согласовании</h1>
  <p>Страница ещё не опубликована. Введите пароль, чтобы открыть её.<br>Pending approval: enter the password to open this page.</p>
  <input type="hidden" name="next" value="${escape(target)}">
  <input type="password" name="password" aria-label="Пароль / Password" placeholder="Пароль / Password" autocomplete="current-password" autofocus required>
  <button type="submit">Открыть / Open</button>
  <p class="error" role="alert">${wrong ? 'Неверный пароль / Wrong password' : ''}</p>
</form>
</body>
</html>`;
}

const gate = (target, wrong) => new Response(gatePage(target, wrong), {
  status: 401,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
});

async function middleware(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const password = process.env.LOCK_PASSWORD;
  const secret = process.env.LOCK_SECRET;

  if (url.pathname === LOGIN && request.method === 'POST') {
    if (!password || !secret) return new Response('Not configured.', { status: 503, headers: { 'cache-control': 'no-store' } });
    const form = await request.formData().catch(() => null);
    const target = safeTarget(form?.get('next'));
    const entered = String(form?.get('password') || '');
    if (!same(await sha256(entered), await sha256(password))) {
      // A short pause on every wrong entry slows down guessing.
      await new Promise(resolve => setTimeout(resolve, 700));
      return gate(target, true);
    }
    const days = Number(process.env.LOCK_SESSION_DAYS) || 14;
    const expires = Date.now() + days * 864e5;
    const token = `${expires}.${await hmac(secret, `lock|${expires}`)}`;
    return new Response(null, {
      status: 303,
      headers: {
        location: target,
        'cache-control': 'no-store',
        'set-cookie': `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.round(days * 86400)}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }
  if (url.pathname === LOGOUT) {
    return new Response(null, {
      status: 303,
      headers: { location: '/', 'cache-control': 'no-store', 'set-cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` },
    });
  }

  if (!isLocked(host, url.pathname)) return pass();
  // Fail closed: a locked page is never sent without a configured password.
  if (!password || !secret) return new Response('Not configured.', { status: 503, headers: { 'cache-control': 'no-store' } });
  if (!(await validSession(readCookie(request), secret))) return gate(url.pathname + url.search);
  // Unlocked for this visitor: never cache the locked page in shared caches.
  return new Response(null, { headers: { 'x-middleware-next': '1', 'cache-control': 'private, no-store' } });
}

module.exports = { middleware, isLocked, sitePath, gatePage, COUNTRIES };
