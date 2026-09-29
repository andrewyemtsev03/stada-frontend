(() => {
  const notice = document.querySelector('[data-cookie-notice]');
  if (!notice) return;

  const storageKey = 'stada-cookie-preferences-v2';
  const cookieName = 'stada_cookie_preferences';
  const categories = ['targeting', 'functional', 'performance'];
  const copy = {
    ru: ['Настройки конфиденциальности', 'Принять все', 'Отклонить все', 'Мой выбор', 'Сохранить выбор', 'Закрыть', 'Настройки cookie', 'Ваша конфиденциальность', 'Обязательные cookie', 'Рекламные cookie', 'Функциональные cookie', 'Аналитические cookie', 'Всегда активны', 'Активны', 'Неактивны'],
    kz: ['Құпиялылық параметрлері', 'Барлығын қабылдау', 'Барлығынан бас тарту', 'Менің таңдауым', 'Таңдауды сақтау', 'Жабу', 'Cookie параметрлері', 'Құпиялылығыңыз', 'Міндетті cookie файлдары', 'Жарнамалық cookie файлдары', 'Функционалдық cookie файлдары', 'Талдау cookie файлдары', 'Әрқашан белсенді', 'Белсенді', 'Белсенді емес'],
    kg: ['Купуялуулук жөндөөлөрү', 'Баарын кабыл алуу', 'Баарынан баш тартуу', 'Менин тандоом', 'Тандоону сактоо', 'Жабуу', 'Cookie жөндөөлөрү', 'Купуялуулугуңуз', 'Милдеттүү cookie файлдары', 'Жарнамалык cookie файлдары', 'Функционалдык cookie файлдары', 'Талдоо cookie файлдары', 'Дайыма активдүү', 'Активдүү', 'Активдүү эмес'],
    ge: ['კონფიდენციალურობის პარამეტრები', 'ყველას მიღება', 'ყველას უარყოფა', 'ჩემი არჩევანი', 'არჩევანის შენახვა', 'დახურვა', 'Cookie-ის პარამეტრები', 'თქვენი კონფიდენციალურობა', 'აუცილებელი cookie-ფაილები', 'სარეკლამო cookie-ფაილები', 'ფუნქციური cookie-ფაილები', 'ანალიტიკური cookie-ფაილები', 'ყოველთვის აქტიურია', 'აქტიურია', 'გამორთულია'],
    az: ['Məxfilik seçimləri', 'Hamısını qəbul et', 'Hamısını rədd et', 'Seçimlərim', 'Seçimləri saxla', 'Bağla', 'Cookie seçimləri', 'Məxfiliyiniz', 'Zəruri cookie faylları', 'Reklam cookie faylları', 'Funksional cookie faylları', 'Analitika cookie faylları', 'Həmişə aktivdir', 'Aktivdir', 'Deaktivdir'],
    hy: ['Գաղտնիության կարգավորումներ', 'Ընդունել բոլորը', 'Մերժել բոլորը', 'Իմ ընտրությունը', 'Պահպանել ընտրությունը', 'Փակել', 'Cookie կարգավորումներ', 'Ձեր գաղտնիությունը', 'Անհրաժեշտ cookie ֆայլեր', 'Գովազդային cookie ֆայլեր', 'Ֆունկցիոնալ cookie ֆայլեր', 'Վերլուծական cookie ֆայլեր', 'Միշտ ակտիվ', 'Ակտիվ', 'Անջատված'],
    ro: ['Preferințe de confidențialitate', 'Acceptă toate', 'Respinge toate', 'Alegerile mele', 'Salvează alegerile', 'Închide', 'Setări cookie', 'Confidențialitatea dvs.', 'Cookie-uri necesare', 'Cookie-uri publicitare', 'Cookie-uri funcționale', 'Cookie-uri analitice', 'Întotdeauna active', 'Active', 'Inactive'],
    uz: ['Maxfiylik sozlamalari', 'Barchasini qabul qilish', 'Barchasini rad etish', 'Mening tanlovim', 'Tanlovni saqlash', 'Yopish', 'Cookie sozlamalari', 'Maxfiyligingiz', 'Zarur cookie fayllari', 'Reklama cookie fayllari', 'Funksional cookie fayllari', 'Tahlil cookie fayllari', 'Doim faol', 'Faol', 'Faol emas'],
  };
  const keys = ['title', 'accept', 'reject', 'choices', 'save', 'close', 'settings', 'privacy', 'necessary', 'targeting', 'functional', 'performance', 'always', 'on', 'off'];
  const description = {
    ru: ['Вы можете выбрать категории cookie. Обязательные cookie сохраняют ваш выбор и помогают работе сайта. Настройки можно изменить внизу любой страницы.', 'Эти cookie необходимы для работы сайта и сохранения выбора.', 'Эта категория предназначена для рекламных инструментов, если они будут подключены.', 'Эта категория предназначена для дополнительных функций, если они будут подключены.', 'Эта категория предназначена для аналитики, если она будет подключена.'],
    kz: ['Cookie санаттарын өзіңіз таңдай аласыз. Міндетті cookie таңдауыңызды сақтайды және сайттың жұмысына көмектеседі. Параметрлерді кез келген беттің төменгі жағында өзгерте аласыз.', 'Бұл cookie сайт жұмысы мен таңдауыңызды сақтау үшін қажет.', 'Бұл санат жарнама құралдары қосылған жағдайда соларға арналған.', 'Бұл санат қосымша функциялар қосылған жағдайда соларға арналған.', 'Бұл санат аналитика қосылған жағдайда соларға арналған.'],
    kg: ['Cookie категорияларын тандай аласыз. Милдеттүү cookie тандооңузду сактап, сайттын иштешине жардам берет. Жөндөөлөрдү барактын астынан өзгөртө аласыз.', 'Бул cookie сайттын иштеши жана тандооңузду сактоо үчүн зарыл.', 'Бул категория жарнама куралдары кошулса колдонулат.', 'Бул категория кошумча функциялар кошулса колдонулат.', 'Бул категория аналитика кошулса колдонулат.'],
    ge: ['შეგიძლიათ აირჩიოთ cookie-ფაილების კატეგორიები. აუცილებელი cookie-ფაილები ინახავს თქვენს არჩევანს და ეხმარება საიტის მუშაობას. პარამეტრების შეცვლა შეგიძლიათ გვერდის ბოლოში.', 'ეს cookie-ფაილები საჭიროა საიტის მუშაობისა და თქვენი არჩევანის შესანახად.', 'ეს კატეგორია გამოიყენება სარეკლამო ხელსაწყოების დამატების შემთხვევაში.', 'ეს კატეგორია გამოიყენება დამატებითი ფუნქციების ჩართვის შემთხვევაში.', 'ეს კატეგორია გამოიყენება ანალიტიკის დამატების შემთხვევაში.'],
    az: ['Cookie kateqoriyalarını seçə bilərsiniz. Zəruri cookie faylları seçiminizi saxlayır və saytın işləməsinə kömək edir. Parametrləri səhifənin altından dəyişə bilərsiniz.', 'Bu cookie faylları saytın işləməsi və seçiminizin saxlanması üçün lazımdır.', 'Bu kateqoriya reklam alətləri əlavə edilərsə istifadə olunur.', 'Bu kateqoriya əlavə funksiyalar qoşularsa istifadə olunur.', 'Bu kateqoriya analitika qoşularsa istifadə olunur.'],
    hy: ['Դուք կարող եք ընտրել cookie ֆայլերի կատեգորիաները։ Անհրաժեշտ cookie ֆայլերը պահպանում են ձեր ընտրությունը և օգնում կայքի աշխատանքին։ Կարգավորումները կարող եք փոխել էջի ներքևում։', 'Այս cookie ֆայլերը անհրաժեշտ են կայքի աշխատանքի և ձեր ընտրությունը պահպանելու համար։', 'Այս կատեգորիան նախատեսված է գովազդային գործիքների համար, եթե դրանք ավելացվեն։', 'Այս կատեգորիան նախատեսված է լրացուցիչ գործառույթների համար, եթե դրանք ավելացվեն։', 'Այս կատեգորիան նախատեսված է վերլուծության համար, եթե այն ավելացվի։'],
    ro: ['Puteți alege categoriile de cookie-uri. Cele necesare salvează alegerea și ajută site-ul să funcționeze. Puteți modifica setările în subsolul paginii.', 'Aceste cookie-uri sunt necesare pentru funcționarea site-ului și salvarea preferințelor.', 'Această categorie este destinată instrumentelor de publicitate, dacă vor fi adăugate.', 'Această categorie este destinată funcțiilor suplimentare, dacă vor fi adăugate.', 'Această categorie este destinată analizei, dacă va fi adăugată.'],
    uz: ['Cookie toifalarini tanlashingiz mumkin. Zarur cookie fayllari tanlovingizni saqlaydi va sayt ishlashiga yordam beradi. Sozlamalarni sahifa pastidan o‘zgartirishingiz mumkin.', 'Bu cookie fayllari sayt ishlashi va tanlovingizni saqlash uchun zarur.', 'Bu toifa reklama vositalari qo‘shilsa ishlatiladi.', 'Bu toifa qo‘shimcha funksiyalar qo‘shilsa ishlatiladi.', 'Bu toifa tahlil vositalari qo‘shilsa ishlatiladi.'],
  };
  const categoryOrder = ['privacy', 'necessary', ...categories];
  const preferenceDialog = document.createElement('dialog');
  preferenceDialog.className = 'cookie-preferences';
  preferenceDialog.setAttribute('aria-labelledby', 'cookie-preferences-title');
  document.body.appendChild(preferenceDialog);
  const settingsLink = document.createElement('button');
  settingsLink.type = 'button';
  settingsLink.className = 'cookie-settings-link';
  document.querySelector('.footer-bottom__links')?.prepend(settingsLink);

  function labels() {
    const values = copy[currentLang] || copy.ru;
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  }
  function details() {
    return description[currentLang] || description.ru;
  }
  function readChoice() {
    let value = '';
    try { value = localStorage.getItem(storageKey) || ''; } catch { /* Use cookie fallback. */ }
    if (!value) {
      const cookie = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
      if (cookie) {
        try { value = decodeURIComponent(cookie.slice(cookieName.length + 1)); } catch { return null; }
      }
    }
    try {
      const saved = JSON.parse(value);
      return saved.version === 2 ? Object.fromEntries(categories.map(key => [key, saved[key] === true])) : null;
    } catch { return null; }
  }

  let choice = readChoice();
  let draft = { targeting: false, functional: false, performance: false, ...choice };
  let selected = 'privacy';
  let promptRequired = !choice;

  function publishChoice() {
    window.STADA_COOKIE_CONSENT = { necessary: true, ...choice };
    document.dispatchEvent(new CustomEvent('stada:cookie-consent', { detail: window.STADA_COOKIE_CONSENT }));
  }
  function saveChoice(next) {
    choice = Object.fromEntries(categories.map(key => [key, next[key] === true]));
    draft = { ...choice };
    const value = JSON.stringify({ version: 2, ...choice, savedAt: new Date().toISOString() });
    try { localStorage.setItem(storageKey, value); } catch { /* Use cookie fallback. */ }
    document.cookie = `${cookieName}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    promptRequired = false;
    notice.close();
    preferenceDialog.close();
    publishChoice();
  }
  function renderNotice() {
    const t = labels();
    notice.innerHTML = '<div class="cookie-notice__body"><h2 id="cookie-notice-title"></h2><p data-cookie-description></p><a data-cookie-link target="_blank" rel="noopener noreferrer"></a></div><div class="cookie-notice__actions"><button type="button" data-cookie-choices></button><button type="button" data-cookie-reject></button><button type="button" data-cookie-accept></button></div>';
    notice.querySelector('h2').textContent = t.title;
    notice.querySelector('[data-cookie-description]').textContent = getFrontendStaticText(currentLang, 'cookie_notice') || details()[0];
    const link = notice.querySelector('[data-cookie-link]');
    link.href = `https://${currentLang === 'ru' ? 'ru' : 'en'}.aboutcookies.org/`;
    link.textContent = getFrontendStaticText(currentLang, 'cookie_link_label') || 'aboutcookies.org';
    notice.querySelector('[data-cookie-choices]').textContent = t.choices;
    notice.querySelector('[data-cookie-reject]').textContent = t.reject;
    notice.querySelector('[data-cookie-accept]').textContent = t.accept;
  }
  function renderPreferences() {
    const t = labels();
    preferenceDialog.innerHTML = '<div class="cookie-preferences__header"><strong>STADA</strong><h2 id="cookie-preferences-title"></h2><button type="button" data-cookie-close></button></div><div class="cookie-preferences__main"><div class="cookie-preferences__tabs" role="tablist"></div><div class="cookie-preferences__panel" role="tabpanel"><h3></h3><p></p><label class="cookie-preferences__toggle"><input type="checkbox"><span></span></label><span class="cookie-preferences__state"></span></div></div><div class="cookie-preferences__actions"><button type="button" data-cookie-save></button><button type="button" data-cookie-reject></button><button type="button" data-cookie-accept></button></div>';
    preferenceDialog.querySelector('h2').textContent = t.title;
    const close = preferenceDialog.querySelector('[data-cookie-close]');
    close.textContent = '×';
    close.setAttribute('aria-label', t.close);
    const tabs = preferenceDialog.querySelector('.cookie-preferences__tabs');
    for (const category of categoryOrder) {
      const button = document.createElement('button');
      button.type = 'button';
      button.role = 'tab';
      button.dataset.cookieCategory = category;
      button.textContent = t[category];
      button.setAttribute('aria-selected', String(category === selected));
      tabs.appendChild(button);
    }
    const panel = preferenceDialog.querySelector('.cookie-preferences__panel');
    panel.querySelector('h3').textContent = t[selected];
    panel.querySelector('p').textContent = details()[categoryOrder.indexOf(selected)];
    const toggle = panel.querySelector('.cookie-preferences__toggle');
    toggle.hidden = selected === 'privacy' || selected === 'necessary';
    const input = toggle.querySelector('input');
    input.checked = draft[selected] === true;
    input.dataset.cookieToggle = selected;
    input.setAttribute('aria-label', t[selected]);
    panel.querySelector('.cookie-preferences__state').textContent = selected === 'privacy' ? '' : selected === 'necessary' ? t.always : input.checked ? t.on : t.off;
    preferenceDialog.querySelector('[data-cookie-save]').textContent = t.save;
    preferenceDialog.querySelector('[data-cookie-reject]').textContent = t.reject;
    preferenceDialog.querySelector('[data-cookie-accept]').textContent = t.accept;
  }
  function openPreferences() {
    if (!document.body.classList.contains('stada-page-loaded')) return;
    draft = { targeting: false, functional: false, performance: false, ...choice };
    selected = 'privacy';
    notice.close();
    renderPreferences();
    preferenceDialog.showModal();
  }
  function closePreferences() {
    preferenceDialog.close();
    if (promptRequired) notice.showModal();
  }
  notice.addEventListener('click', event => {
    if (event.target.closest('[data-cookie-accept]')) saveChoice({ targeting: true, functional: true, performance: true });
    else if (event.target.closest('[data-cookie-reject]')) saveChoice({ targeting: false, functional: false, performance: false });
    else if (event.target.closest('[data-cookie-choices]')) openPreferences();
  });
  notice.addEventListener('cancel', event => event.preventDefault());
  preferenceDialog.addEventListener('click', event => {
    const category = event.target.closest('[data-cookie-category]')?.dataset.cookieCategory;
    if (category) { selected = category; renderPreferences(); }
    else if (event.target.closest('[data-cookie-close]')) closePreferences();
    else if (event.target.closest('[data-cookie-save]')) saveChoice(draft);
    else if (event.target.closest('[data-cookie-reject]')) saveChoice({ targeting: false, functional: false, performance: false });
    else if (event.target.closest('[data-cookie-accept]')) saveChoice({ targeting: true, functional: true, performance: true });
  });
  preferenceDialog.addEventListener('change', event => {
    if (!event.target.matches('[data-cookie-toggle]')) return;
    draft[event.target.dataset.cookieToggle] = event.target.checked;
    renderPreferences();
  });
  preferenceDialog.addEventListener('cancel', event => { event.preventDefault(); closePreferences(); });
  settingsLink.addEventListener('click', openPreferences);

  function showWhenReady() {
    if (!promptRequired || notice.open || preferenceDialog.open || !currentLang
      || !document.body.classList.contains('stada-page-loaded')
      || document.body.classList.contains('backend-content-pending')) return;
    renderNotice();
    observer.disconnect();
    notice.showModal();
  }
  const observer = new MutationObserver(showWhenReady);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('stada:languagechange', () => {
    if (notice.open) renderNotice();
    if (preferenceDialog.open) renderPreferences();
    settingsLink.textContent = labels().settings;
    showWhenReady();
  });
  settingsLink.textContent = labels().settings;
  if (choice) publishChoice();
  showWhenReady();
})();
