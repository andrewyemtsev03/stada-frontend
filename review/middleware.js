// Review site gate (Vercel Routing Middleware, server-side).
//
// Every request to the review site passes through here before any file is served. Without a valid
// session cookie the visitor gets only the password page; the site's pages, scripts and images are
// never sent. The password lives in the project's REVIEW_PASSWORD environment variable (never in the
// repository); a correct entry sets an HttpOnly, Secure, signed cookie (HMAC-SHA-256 with
// REVIEW_SECRET) that expires after REVIEW_SESSION_DAYS (default 14).
//
// It also routes between the seven country sites. Review addresses carry the country first:
//   /<country>/<language>/...   e.g. /ge/ge/products/<slug>.html, /uz/ru/products/<slug>.html
//   /<country>/                 that country's home page
// Visiting one remembers the country in a cookie, so the site's own links (which have no country,
// e.g. /ru/about.html or /products/...) stay on that country's site. `/` lists everything on review.
//
// This file belongs to the review project only (root directory `review/`); the public sites do not
// run it.

export const config = { matcher: '/:path*' };

const COOKIE = 'stada_review';
const LOGIN = '/__review/login';
const LOGOUT = '/__review/logout';
// Served without a session so the password page can show the logo.
const PUBLIC = new Set(['/assets/logos/stada_logo.png', '/favicon.ico']);

// Country sites in the build (`frontend/content/countries.json`; a test keeps this in sync).
export const COUNTRIES = {
  kz: { languages: ['ru', 'kz'], home: 'ru' },
  kg: { languages: ['ru', 'kg'], home: 'ru' },
  ge: { languages: ['ge', 'en'], home: 'ge' },
  az: { languages: ['az', 'ru'], home: 'az' },
  am: { languages: ['hy', 'ru'], home: 'hy' },
  md: { languages: ['ro', 'ru'], home: 'ro' },
  uz: { languages: ['ru', 'uz'], home: 'ru' },
};
const COUNTRY_COOKIE = 'stada_review_country';
const ROOT_PAGES = new Set(['index.html', 'about.html', 'culture.html', 'history.html', 'contacts.html', 'news.html', 'news-article.html', 'sitemap.xml']);

// Where a request lives in the build, or null to serve the path as it is (assets, css, js, `/`).
export function routeFor(pathname, rememberedCountry) {
  const parts = pathname.split('/').filter(Boolean);
  const [first, second] = parts;
  const remembered = COUNTRIES[rememberedCountry] ? rememberedCountry : 'kz';
  // /<country>/ or /<country>: that country's home page (unless it is a language of the site being
  // browsed, e.g. /kz/ on the Kazakhstan site, which is the Kazakh home page).
  if (parts.length === 1 && COUNTRIES[first] && !COUNTRIES[remembered].languages.includes(first)) {
    return { country: first, path: `/sites/${first}/index.html` };
  }
  // /<country>/<language>/...: a site's own links never put a language right after a language.
  if (COUNTRIES[first] && COUNTRIES[first].languages.includes(second) && parts.length >= 2) {
    const rest = parts.slice(2).join('/') || 'index.html';
    return { country: first, path: `/sites/${first}/${second}/${rest}` };
  }
  // Links inside a site, without the country: use the remembered one.
  const country = remembered;
  const site = COUNTRIES[country];
  if (site.languages.includes(first)) return { path: `/sites/${country}/${parts.length > 1 ? parts.join('/') : `${first}/index.html`}` };
  if (parts.length === 1 && ROOT_PAGES.has(first)) return { path: `/sites/${country}/${first}` };
  if (first === 'products' && parts.length >= 2) return { path: `/sites/${country}/${site.home}/${parts.join('/')}` };
  return null;
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

const readCookie = (request, name = COOKIE) => {
  const header = request.headers.get('cookie') || '';
  const match = header.split(/;\s*/).find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
};

async function validSession(token, secret) {
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return same(signature, await hmac(secret, `review|${expires}`));
}

// Only same-site paths may be returned to after logging in.
const safeTarget = value => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/__review') ? value : '/');

const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function gatePage(target, wrong = false) {
  const html = `<!doctype html>
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
  input{width:100%;padding:14px 16px;border:1.5px solid rgba(38,44,142,.2);border-radius:14px;font:16px inherit;font-family:inherit;outline:none}
  input:focus{border-color:#262c8e}
  button{width:100%;margin-top:12px;padding:14px;border:0;border-radius:99px;background:#262c8e;color:#fff;font:700 15px inherit;font-family:inherit;cursor:pointer}
  button:hover{background:#e5007d}
  .error{min-height:18px;margin:12px 0 0;font-size:13px;color:#e5007d}
  .wrong{animation:shake .4s}
  @keyframes shake{25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
</style>
</head>
<body>
<form method="post" action="${LOGIN}"${wrong ? ' class="wrong"' : ''}>
  <img src="/assets/logos/stada_logo.png" alt="STADA" width="770" height="450">
  <h1>Материалы на согласовании</h1>
  <p>Введите пароль, чтобы открыть сайт.<br>Сайтты ашу үшін құпия сөзді енгізіңіз.</p>
  <input type="hidden" name="next" value="${escape(target)}">
  <input type="password" name="password" aria-label="Пароль / Құпия сөз" placeholder="Пароль" autocomplete="current-password" autofocus required>
  <button type="submit">Открыть / Ашу</button>
  <p class="error" role="alert">${wrong ? 'Неверный пароль / Құпия сөз қате' : ''}</p>
</form>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export default async function middleware(request) {
  const password = process.env.REVIEW_PASSWORD;
  const secret = process.env.REVIEW_SECRET;
  // Fail closed: an unconfigured review site shows nothing.
  if (!password || !secret) return new Response('Review site is not configured.', { status: 503, headers: { 'cache-control': 'no-store' } });

  const url = new URL(request.url);

  if (url.pathname === LOGIN && request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const target = safeTarget(form?.get('next'));
    const entered = String(form?.get('password') || '');
    if (!same(await sha256(entered), await sha256(password))) {
      // A short pause on every wrong entry slows down guessing.
      await new Promise(resolve => setTimeout(resolve, 700));
      return gatePage(target, true);
    }
    const days = Number(process.env.REVIEW_SESSION_DAYS) || 14;
    const expires = Date.now() + days * 864e5;
    const token = `${expires}.${await hmac(secret, `review|${expires}`)}`;
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

  if (PUBLIC.has(url.pathname)) return pass();
  if (!(await validSession(readCookie(request), secret))) return gatePage(url.pathname + url.search);

  const route = routeFor(url.pathname, readCookie(request, COUNTRY_COOKIE));
  if (!route) return pass();
  const headers = new Headers({ 'x-middleware-rewrite': new URL(route.path + url.search, url).toString() });
  if (route.country) headers.set('set-cookie', `${COUNTRY_COOKIE}=${route.country}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { headers });
}
