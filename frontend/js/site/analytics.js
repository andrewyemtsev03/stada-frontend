(() => {
  let allowed = false;
  let loaded = false;

  function applyConsent(consent) {
    allowed = consent?.performance === true;
    if (!allowed || loaded) return;

    // Vercel provides these routes only on deployed sites with Analytics enabled.
    if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
      || !['http:', 'https:'].includes(location.protocol)) return;

    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };
    // Check the current choice for every event, including after consent is revoked.
    window.va('beforeSend', event => allowed ? event : null);

    const script = document.createElement('script');
    script.src = '/_vercel/insights/script.js';
    script.defer = true;
    script.onerror = () => {
      loaded = false;
      script.remove();
    };
    loaded = true;
    document.head.appendChild(script);
  }

  document.addEventListener('stada:cookie-consent', event => applyConsent(event.detail));
  applyConsent(window.STADA_COOKIE_CONSENT);
})();
