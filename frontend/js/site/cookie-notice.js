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

  let accepted = false;
  const acceptButton = notice.querySelector('[data-cookie-notice-accept]');
  const localize = event => {
    const lang = event?.detail?.lang || currentLang || document.documentElement.lang || 'ru';
    const link = notice.querySelector('[data-cookie-link]');
    if (link) link.href = `https://${lang === 'ru' ? 'ru' : 'en'}.aboutcookies.org/`;
    notice.querySelectorAll('[data-static-i18n-key]').forEach(element => {
      const label = getFrontendStaticText(lang, element.dataset.staticI18nKey);
      if (label) element.textContent = label;
    });
  };

  acceptButton?.addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, 'agreed');
    } catch {
      // The cookie below is also used to remember the choice.
    }
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${cookieName}=agreed; Max-Age=315360000; Path=/; SameSite=Lax${secure}`;
    accepted = true;
    notice.close();
  });

  // The visitor must make a choice before returning to the page.
  notice.addEventListener('cancel', event => event.preventDefault());
  const showWhenReady = () => {
    if (accepted || notice.open || !currentLang
      || !document.body.classList.contains('stada-page-loaded')
      || document.body.classList.contains('backend-content-pending')) return;

    localize();
    if (!notice.querySelector('[data-static-i18n-key="cookie_title"]')?.textContent.trim()
      || !notice.querySelector('[data-static-i18n-key="cookie_notice"]')?.textContent.trim()) return;

    loaderObserver.disconnect();
    notice.showModal();
  };

  const loaderObserver = new MutationObserver(showWhenReady);
  loaderObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('stada:languagechange', event => {
    localize(event);
    showWhenReady();
  });
  showWhenReady();
})();
