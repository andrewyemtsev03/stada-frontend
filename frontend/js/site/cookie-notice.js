(() => {
  const storageKey = 'stada-cookie-notice-dismissed-v1';
  const notice = document.querySelector('[data-cookie-notice]');
  if (!notice) return;

  try {
    if (localStorage.getItem(storageKey) === 'true') return;
  } catch {
    // Show the notice when browser storage is unavailable.
  }

  const dismissButton = notice.querySelector('[data-cookie-notice-dismiss]');
  const dismiss = () => {
    notice.classList.remove('is-visible');
    notice.setAttribute('aria-hidden', 'true');
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Dismiss for this visit even when storage is unavailable.
    }
  };

  dismissButton?.addEventListener('click', dismiss);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && notice.classList.contains('is-visible')) dismiss();
  });
  const updateLinkLanguage = event => {
    const lang = event.detail?.lang || document.documentElement.lang;
    const link = notice.querySelector('[data-cookie-link]');
    if (link) link.href = `https://${lang === 'ru' ? 'ru' : 'en'}.aboutcookies.org/`;
  };
  document.addEventListener('stada:languagechange', updateLinkLanguage);
  updateLinkLanguage({ detail: { lang: document.documentElement.lang } });

  window.setTimeout(() => {
    notice.classList.add('is-visible');
    notice.setAttribute('aria-hidden', 'false');
  }, 900);
})();
