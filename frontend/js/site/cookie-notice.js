(() => {
  const notice = document.querySelector('[data-cookie-notice]');
  if (!notice) return;

  const storageKey = 'stada-cookie-preferences-v2';
  const cookieName = 'stada_cookie_preferences';
  const categories = ['targeting', 'functional', 'performance'];
  const copy = {
    en: ['Privacy preferences', 'Accept all', 'Reject all', 'My choices', 'Save choices', 'Close', 'Cookie settings', 'Your privacy', 'Necessary cookies', 'Advertising cookies', 'Functional cookies', 'Analytics cookies', 'Always active', 'Active', 'Inactive'],
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
    en: ['You can choose which cookie categories to allow. Necessary cookies store your choices and help the site work. You can change your preferences in the footer.', 'These cookies are needed for the site to work and to store your choices.', 'This category applies if advertising tools are added.', 'This category applies if additional features are enabled.', 'Vercel Web Analytics measures page views only when you allow this category. It does not use analytics cookies. You can disable it here at any time.'],
    ru: ['Вы можете выбрать категории cookie. Обязательные cookie сохраняют ваш выбор и помогают работе сайта. Настройки можно изменить внизу любой страницы.', 'Эти cookie необходимы для работы сайта и сохранения выбора.', 'Эта категория предназначена для рекламных инструментов, если они будут подключены.', 'Эта категория предназначена для дополнительных функций, если они будут подключены.', 'Vercel Web Analytics измеряет просмотры страниц только при разрешении этой категории. Аналитические cookie не используются. Вы можете отключить аналитику здесь в любое время.'],
    kz: ['Cookie санаттарын өзіңіз таңдай аласыз. Міндетті cookie таңдауыңызды сақтайды және сайттың жұмысына көмектеседі. Параметрлерді кез келген беттің төменгі жағында өзгерте аласыз.', 'Бұл cookie сайт жұмысы мен таңдауыңызды сақтау үшін қажет.', 'Бұл санат жарнама құралдары қосылған жағдайда соларға арналған.', 'Бұл санат қосымша функциялар қосылған жағдайда соларға арналған.', 'Vercel Web Analytics осы санатқа рұқсат бергенде ғана бет қаралымдарын өлшейді. Аналитикалық cookie қолданылмайды. Оны осы жерден кез келген уақытта өшіре аласыз.'],
    kg: ['Cookie категорияларын тандай аласыз. Милдеттүү cookie тандооңузду сактап, сайттын иштешине жардам берет. Жөндөөлөрдү барактын астынан өзгөртө аласыз.', 'Бул cookie сайттын иштеши жана тандооңузду сактоо үчүн зарыл.', 'Бул категория жарнама куралдары кошулса колдонулат.', 'Бул категория кошумча функциялар кошулса колдонулат.', 'Vercel Web Analytics бул категорияга уруксат бергенде гана барактардын көрүлүшүн өлчөйт. Аналитикалык cookie колдонулбайт. Аны бул жерден каалаган убакта өчүрө аласыз.'],
    ge: ['შეგიძლიათ აირჩიოთ cookie-ფაილების კატეგორიები. აუცილებელი cookie-ფაილები ინახავს თქვენს არჩევანს და ეხმარება საიტის მუშაობას. პარამეტრების შეცვლა შეგიძლიათ გვერდის ბოლოში.', 'ეს cookie-ფაილები საჭიროა საიტის მუშაობისა და თქვენი არჩევანის შესანახად.', 'ეს კატეგორია გამოიყენება სარეკლამო ხელსაწყოების დამატების შემთხვევაში.', 'ეს კატეგორია გამოიყენება დამატებითი ფუნქციების ჩართვის შემთხვევაში.', 'Vercel Web Analytics გვერდების ნახვებს მხოლოდ ამ კატეგორიის ნებართვისას ზომავს. ანალიტიკური cookie-ფაილები არ გამოიყენება. მისი გამორთვა აქ ნებისმიერ დროს შეგიძლიათ.'],
    az: ['Cookie kateqoriyalarını seçə bilərsiniz. Zəruri cookie faylları seçiminizi saxlayır və saytın işləməsinə kömək edir. Parametrləri səhifənin altından dəyişə bilərsiniz.', 'Bu cookie faylları saytın işləməsi və seçiminizin saxlanması üçün lazımdır.', 'Bu kateqoriya reklam alətləri əlavə edilərsə istifadə olunur.', 'Bu kateqoriya əlavə funksiyalar qoşularsa istifadə olunur.', 'Vercel Web Analytics səhifə baxışlarını yalnız bu kateqoriyaya icazə verdikdə ölçür. Analitika cookie fayllarından istifadə etmir. Burada istənilən vaxt söndürə bilərsiniz.'],
    hy: ['Դուք կարող եք ընտրել cookie ֆայլերի կատեգորիաները։ Անհրաժեշտ cookie ֆայլերը պահպանում են ձեր ընտրությունը և օգնում կայքի աշխատանքին։ Կարգավորումները կարող եք փոխել էջի ներքևում։', 'Այս cookie ֆայլերը անհրաժեշտ են կայքի աշխատանքի և ձեր ընտրությունը պահպանելու համար։', 'Այս կատեգորիան նախատեսված է գովազդային գործիքների համար, եթե դրանք ավելացվեն։', 'Այս կատեգորիան նախատեսված է լրացուցիչ գործառույթների համար, եթե դրանք ավելացվեն։', 'Vercel Web Analytics-ը չափում է էջերի դիտումները միայն այս կատեգորիան թույլատրելու դեպքում։ Վերլուծական cookie ֆայլեր չեն օգտագործվում։ Այստեղ կարող եք ցանկացած պահի անջատել այն։'],
    ro: ['Puteți alege categoriile de cookie-uri. Cele necesare salvează alegerea și ajută site-ul să funcționeze. Puteți modifica setările în subsolul paginii.', 'Aceste cookie-uri sunt necesare pentru funcționarea site-ului și salvarea preferințelor.', 'Această categorie este destinată instrumentelor de publicitate, dacă vor fi adăugate.', 'Această categorie este destinată funcțiilor suplimentare, dacă vor fi adăugate.', 'Vercel Web Analytics măsoară vizualizările paginilor doar când permiteți această categorie. Nu folosește cookie-uri analitice. Îl puteți dezactiva aici oricând.'],
    uz: ['Cookie toifalarini tanlashingiz mumkin. Zarur cookie fayllari tanlovingizni saqlaydi va sayt ishlashiga yordam beradi. Sozlamalarni sahifa pastidan o‘zgartirishingiz mumkin.', 'Bu cookie fayllari sayt ishlashi va tanlovingizni saqlash uchun zarur.', 'Bu toifa reklama vositalari qo‘shilsa ishlatiladi.', 'Bu toifa qo‘shimcha funksiyalar qo‘shilsa ishlatiladi.', 'Vercel Web Analytics sahifa ko‘rishlarini faqat ushbu toifaga ruxsat berganingizda o‘lchaydi. Tahlil cookie fayllaridan foydalanmaydi. Uni bu yerda istalgan vaqtda o‘chirishingiz mumkin.'],
  };
  const descriptionMore = {
    en: [
      'Vercel Web Analytics measures page views only when you allow this category. It does not use analytics cookies. You can disable it here at any time.',
      'This record helps us remember your choices and avoid showing the notice on every visit. It is not used for advertising. You can remove it through your browser settings.',
      'If advertising tools are added, this category may help measure advertising effectiveness and show relevant ads. No such tools are currently enabled, so this choice does not start advertising tracking.',
      'These cookies can remember preferences or support additional features such as embedded video or chat. Those services are currently disabled. Rejecting this category does not prevent you from using the main pages.',
      '',
    ],
    ru: [
      'Vercel Web Analytics измеряет просмотры страниц только при разрешении этой категории. Аналитические cookie не используются. Вы можете отключить аналитику здесь в любое время.',
      'Например, такая запись помогает не показывать уведомление при каждом посещении и помнить, какие категории вы разрешили. Она не предназначена для рекламы. Отключить её в этом окне нельзя; удалить её можно через настройки браузера.',
      'Если STADA подключит рекламные инструменты, эта категория может использоваться для оценки рекламы и показа более подходящих объявлений, в том числе на других сайтах. Сейчас такие инструменты на сайте не подключены, поэтому включение категории не запускает рекламное отслеживание.',
      'Такие cookie могут запоминать выбранные настройки или поддерживать дополнительные элементы, например встроенное видео либо чат. Сейчас эти дополнительные функции на сайте не подключены. Отключение категории не мешает пользоваться основными страницами.',
      '',
    ],
    kz: [
      'Vercel Web Analytics осы санатқа рұқсат бергенде ғана бет қаралымдарын өлшейді. Аналитикалық cookie қолданылмайды. Оны осы жерден кез келген уақытта өшіре аласыз.',
      'Мұндай жазба хабарламаны әр кіргенде көрсетпеуге және қай санаттарға рұқсат бергеніңізді есте сақтауға көмектеседі. Ол жарнама үшін арналмаған. Бұл терезеде оны өшіру мүмкін емес; браузер параметрлері арқылы жоюға болады.',
      'STADA жарнама құралдарын қосса, бұл санат жарнаманың тиімділігін бағалауға және басқа сайттарда да сәйкес хабарландыру көрсетуге қолданылуы мүмкін. Қазір ондай құралдар қосылмаған, сондықтан санатты қосу жарнамалық бақылауды бастамайды.',
      'Мұндай cookie таңдалған параметрлерді сақтауға немесе кірістірілген бейне мен чат сияқты қосымша мүмкіндіктерге көмектесе алады. Қазір бұл қосымша қызметтер қосылмаған. Санатты өшіру негізгі беттерді пайдалануға кедергі келтірмейді.',
      '',
    ],
    kg: [
      'Vercel Web Analytics бул категорияга уруксат бергенде гана барактардын көрүлүшүн өлчөйт. Аналитикалык cookie колдонулбайт. Аны бул жерден каалаган убакта өчүрө аласыз.',
      'Мындай жазуу билдирүүнү ар бир киргенде көрсөтпөөгө жана тандооңузду эстеп калууга жардам берет. Ал жарнама үчүн колдонулбайт. Бул терезеден өчүрө албайсыз; браузердин жөндөөлөрүнөн өчүрсөңүз болот.',
      'Жарнама куралдары келечекте кошулса, бул категория жарнаманы баалоо жана ылайыктуу жарнамаларды көрсөтүү үчүн колдонулушу мүмкүн. Азыр мындай куралдар кошулган эмес жана тандооңуз жарнамалык көзөмөлдү баштабайт.',
      'Мындай cookie жөндөөлөрдү сактап же видео жана чат сыяктуу кошумча функцияларды иштете алат. Азыр ал функциялар кошулган эмес. Бул категорияны өчүрүү негизги барактарга тоскоол болбойт.',
      '',
    ],
    ge: [
      'Vercel Web Analytics გვერდების ნახვებს მხოლოდ ამ კატეგორიის ნებართვისას ზომავს. ანალიტიკური cookie-ფაილები არ გამოიყენება. მისი გამორთვა აქ ნებისმიერ დროს შეგიძლიათ.',
      'ასეთი ჩანაწერი გვეხმარება, შეტყობინება ყოველი ვიზიტისას არ გაჩვენოთ და თქვენი არჩევანი დავიმახსოვროთ. ის რეკლამისთვის არ გამოიყენება. მისი წაშლა შეგიძლიათ ბრაუზერის პარამეტრებიდან.',
      'თუ მომავალში სარეკლამო ხელსაწყოები დაემატება, ეს კატეგორია შეიძლება გამოყენებულ იქნას რეკლამის შეფასებისა და შესაბამისი რეკლამის საჩვენებლად. ამჟამად ასეთი ხელსაწყოები ჩართული არ არის.',
      'ასეთ cookie-ფაილებს შეუძლიათ პარამეტრების დამახსოვრება ან დამატებითი ფუნქციების, მაგალითად ვიდეოს ან ჩატის, მხარდაჭერა. ამჟამად ეს ფუნქციები ჩართული არ არის. ძირითადი გვერდები მათ გარეშეც მუშაობს.',
      '',
    ],
    az: [
      'Vercel Web Analytics səhifə baxışlarını yalnız bu kateqoriyaya icazə verdikdə ölçür. Analitika cookie fayllarından istifadə etmir. Burada istənilən vaxt söndürə bilərsiniz.',
      'Bu qeyd bildirişin hər səfərdə görünməməsinə və seçiminizin yadda saxlanmasına kömək edir. Reklam üçün nəzərdə tutulmayıb. Onu brauzer parametrlərindən silə bilərsiniz.',
      'Gələcəkdə reklam alətləri qoşularsa, bu kateqoriya reklamların qiymətləndirilməsi və uyğun elanların göstərilməsi üçün istifadə oluna bilər. Hazırda belə alətlər qoşulmayıb və seçiminiz reklam izləməsini başlatmır.',
      'Bu cookie faylları parametrləri yadda saxlaya və video və ya çat kimi əlavə funksiyaları dəstəkləyə bilər. Hazırda bu funksiyalar qoşulmayıb. Əsas səhifələr bu kateqoriya olmadan da işləyir.',
      '',
    ],
    hy: [
      'Vercel Web Analytics-ը չափում է էջերի դիտումները միայն այս կատեգորիան թույլատրելու դեպքում։ Վերլուծական cookie ֆայլեր չեն օգտագործվում։ Այստեղ կարող եք ցանկացած պահի անջատել այն։',
      'Այս գրառումը թույլ է տալիս ամեն այցի ժամանակ կրկին չցուցադրել ծանուցումը և հիշել ձեր ընտրությունը։ Այն գովազդի համար նախատեսված չէ։ Կարող եք այն ջնջել դիտարկչի կարգավորումներում։',
      'Եթե հետագայում գովազդային գործիքներ ավելացվեն, այս կատեգորիան կարող է օգտագործվել գովազդի արդյունավետությունը գնահատելու և համապատասխան հայտարարություններ ցուցադրելու համար։ Այժմ այդպիսի գործիքներ միացված չեն։',
      'Այս cookie ֆայլերը կարող են հիշել կարգավորումները կամ աջակցել լրացուցիչ հնարավորություններին, օրինակ՝ տեսանյութին կամ զրույցին։ Այժմ այդ հնարավորությունները միացված չեն։ Հիմնական էջերը աշխատում են նաև առանց դրանց։',
      '',
    ],
    ro: [
      'Vercel Web Analytics măsoară vizualizările paginilor doar când permiteți această categorie. Nu folosește cookie-uri analitice. Îl puteți dezactiva aici oricând.',
      'Această înregistrare împiedică afișarea notificării la fiecare vizită și păstrează alegerea dvs. Nu este destinată publicității. O puteți șterge din setările browserului.',
      'Dacă vor fi adăugate instrumente de publicitate, categoria poate fi folosită pentru evaluarea reclamelor și afișarea unor anunțuri relevante. În prezent, aceste instrumente nu sunt active, iar alegerea categoriei nu pornește urmărirea publicitară.',
      'Aceste cookie-uri pot reține setări sau susține funcții suplimentare, precum video sau chat. În prezent, aceste funcții nu sunt active. Paginile principale funcționează și fără această categorie.',
      '',
    ],
    uz: [
      'Vercel Web Analytics sahifa ko‘rishlarini faqat ushbu toifaga ruxsat berganingizda o‘lchaydi. Tahlil cookie fayllaridan foydalanmaydi. Uni bu yerda istalgan vaqtda o‘chirishingiz mumkin.',
      'Bu yozuv bildirishnomani har safar ko‘rsatmaslik va tanlovingizni eslab qolish uchun kerak. U reklama uchun mo‘ljallanmagan. Uni brauzer sozlamalaridan o‘chirishingiz mumkin.',
      'Kelajakda reklama vositalari qo‘shilsa, bu toifa reklama samaradorligini baholash va mos eʼlonlarni ko‘rsatish uchun ishlatilishi mumkin. Hozir bunday vositalar ulanmagan va tanlov reklamaviy kuzatuvni boshlamaydi.',
      'Bunday cookie fayllari sozlamalarni eslab qolishi yoki video va chat kabi qo‘shimcha funksiyalarni qo‘llab-quvvatlashi mumkin. Hozir bu funksiyalar ulanmagan. Asosiy sahifalar ularsiz ham ishlaydi.',
      '',
    ],
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
    const index = categoryOrder.indexOf(selected);
    panel.querySelector('p').textContent = `${details()[index]} ${(descriptionMore[currentLang] || descriptionMore.ru)[index]}`;
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
