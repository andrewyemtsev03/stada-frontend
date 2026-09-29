(() => {
  const storageKey = 'stada-cookie-consent-v1';
  const cookieName = 'stada_cookie_consent';
  const notice = document.querySelector('[data-cookie-notice]');
  if (!notice) return;

  let agreed = document.cookie.split(';').some(part => part.trim() === `${cookieName}=agreed`);
  try {
    agreed ||= localStorage.getItem(storageKey) === 'agreed';
  } catch {
    // The long-lived cookie remains available when local storage is blocked.
  }
  if (agreed) return;

  const acceptButton = notice.querySelector('[data-cookie-notice-accept]');
  const localize = event => {
    const lang = event?.detail?.lang || currentLang || document.documentElement.lang || 'ru';
    const link = notice.querySelector('[data-cookie-link]');
    if (link) link.href = `https://${lang === 'ru' ? 'ru' : 'en'}.aboutcookies.org/`;
    const label = typeof getFrontendStaticText === 'function'
      ? getFrontendStaticText(lang, 'cookie_accept')
      : '';
    if (acceptButton && label) acceptButton.textContent = label;
  };

  acceptButton?.addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, 'agreed');
    } catch {
      // The cookie below is also used to remember the choice.
    }
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${cookieName}=agreed; Max-Age=315360000; Path=/; SameSite=Lax${secure}`;
    notice.close();
  });

  // The visitor must make a choice before returning to the page.
  notice.addEventListener('cancel', event => event.preventDefault());
  document.addEventListener('stada:languagechange', localize);
  localize();
  notice.showModal();
})();
