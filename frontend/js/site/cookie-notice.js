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
  const descriptionMore = {
    ru: [
      'Сейчас на сайте не подключены рекламные и аналитические инструменты. Включение категории сохраняет предпочтение, но само по себе не запускает сбор данных. Вы можете отклонить все необязательные категории, и сайт останется доступен.',
      'Например, такая запись помогает не показывать уведомление при каждом посещении и помнить, какие категории вы разрешили. Она не предназначена для рекламы. Отключить её в этом окне нельзя; удалить её можно через настройки браузера.',
      'Если STADA подключит рекламные инструменты, эта категория может использоваться для оценки рекламы и показа более подходящих объявлений, в том числе на других сайтах. Сейчас такие инструменты на сайте не подключены, поэтому включение категории не запускает рекламное отслеживание.',
      'Такие cookie могут запоминать выбранные настройки или поддерживать дополнительные элементы, например встроенное видео либо чат. Сейчас эти дополнительные функции на сайте не подключены. Отключение категории не мешает пользоваться основными страницами.',
      'Такие cookie могут помогать считать посещения и понимать, какие страницы удобны посетителям, чтобы улучшать сайт. Сейчас аналитика на сайте не подключена, поэтому включение категории не начинает измерять ваше посещение.',
    ],
    kz: [
      'Қазір сайтта жарнамалық және талдау құралдары қосылмаған. Санатты қосу таңдауыңызды сақтайды, бірақ өздігінен дерек жинауды бастамайды. Міндетті емес санаттардың бәрінен бас тартсаңыз да, сайт қолжетімді болады.',
      'Мұндай жазба хабарламаны әр кіргенде көрсетпеуге және қай санаттарға рұқсат бергеніңізді есте сақтауға көмектеседі. Ол жарнама үшін арналмаған. Бұл терезеде оны өшіру мүмкін емес; браузер параметрлері арқылы жоюға болады.',
      'STADA жарнама құралдарын қосса, бұл санат жарнаманың тиімділігін бағалауға және басқа сайттарда да сәйкес хабарландыру көрсетуге қолданылуы мүмкін. Қазір ондай құралдар қосылмаған, сондықтан санатты қосу жарнамалық бақылауды бастамайды.',
      'Мұндай cookie таңдалған параметрлерді сақтауға немесе кірістірілген бейне мен чат сияқты қосымша мүмкіндіктерге көмектесе алады. Қазір бұл қосымша қызметтер қосылмаған. Санатты өшіру негізгі беттерді пайдалануға кедергі келтірмейді.',
      'Мұндай cookie келушілер санын және қай беттер пайдалы екенін түсінуге көмектесе алады. Қазір сайтта аналитика қосылмаған, сондықтан санатты қосу сіздің кіруіңізді өлшеуді бастамайды.',
    ],
    kg: [
      'Азыр сайтта жарнама жана талдоо куралдары кошулган эмес. Категорияны иштетүү тандооңузду сактайт, бирок өзү маалымат чогултууну баштабайт. Милдеттүү эмес категориялардан баш тартсаңыз да сайт жеткиликтүү болот.',
      'Мындай жазуу билдирүүнү ар бир киргенде көрсөтпөөгө жана тандооңузду эстеп калууга жардам берет. Ал жарнама үчүн колдонулбайт. Бул терезеден өчүрө албайсыз; браузердин жөндөөлөрүнөн өчүрсөңүз болот.',
      'Жарнама куралдары келечекте кошулса, бул категория жарнаманы баалоо жана ылайыктуу жарнамаларды көрсөтүү үчүн колдонулушу мүмкүн. Азыр мындай куралдар кошулган эмес жана тандооңуз жарнамалык көзөмөлдү баштабайт.',
      'Мындай cookie жөндөөлөрдү сактап же видео жана чат сыяктуу кошумча функцияларды иштете алат. Азыр ал функциялар кошулган эмес. Бул категорияны өчүрүү негизги барактарга тоскоол болбойт.',
      'Мындай cookie кирүүлөрдүн санын жана кайсы барактар пайдалуу экенин түшүнүүгө жардам берет. Азыр сайтта аналитика кошулган эмес; категорияны иштетүү кирүүңүздү өлчөй баштабайт.',
    ],
    ge: [
      'ამჟამად საიტზე სარეკლამო და ანალიტიკური ხელსაწყოები არ არის ჩართული. კატეგორიის ჩართვა ინახავს თქვენს არჩევანს, მაგრამ თავისთავად არ იწყებს მონაცემების შეგროვებას. არასავალდებულო კატეგორიების უარყოფის შემთხვევაშიც საიტი ხელმისაწვდომია.',
      'ასეთი ჩანაწერი გვეხმარება, შეტყობინება ყოველი ვიზიტისას არ გაჩვენოთ და თქვენი არჩევანი დავიმახსოვროთ. ის რეკლამისთვის არ გამოიყენება. მისი წაშლა შეგიძლიათ ბრაუზერის პარამეტრებიდან.',
      'თუ მომავალში სარეკლამო ხელსაწყოები დაემატება, ეს კატეგორია შეიძლება გამოყენებულ იქნას რეკლამის შეფასებისა და შესაბამისი რეკლამის საჩვენებლად. ამჟამად ასეთი ხელსაწყოები ჩართული არ არის.',
      'ასეთ cookie-ფაილებს შეუძლიათ პარამეტრების დამახსოვრება ან დამატებითი ფუნქციების, მაგალითად ვიდეოს ან ჩატის, მხარდაჭერა. ამჟამად ეს ფუნქციები ჩართული არ არის. ძირითადი გვერდები მათ გარეშეც მუშაობს.',
      'ასეთ cookie-ფაილებს შეუძლიათ ვიზიტების დათვლა და პოპულარული გვერდების გამოვლენა საიტის გასაუმჯობესებლად. ამჟამად ანალიტიკა ჩართული არ არის და ამ კატეგორიის არჩევა გაზომვას არ იწყებს.',
    ],
    az: [
      'Hazırda saytda reklam və analitika alətləri qoşulmayıb. Kateqoriyanı aktivləşdirmək seçiminizi saxlayır, lakin özlüyündə məlumat toplanmasını başlatmır. İstəyə bağlı kateqoriyaları rədd etsəniz də sayt işləyir.',
      'Bu qeyd bildirişin hər səfərdə görünməməsinə və seçiminizin yadda saxlanmasına kömək edir. Reklam üçün nəzərdə tutulmayıb. Onu brauzer parametrlərindən silə bilərsiniz.',
      'Gələcəkdə reklam alətləri qoşularsa, bu kateqoriya reklamların qiymətləndirilməsi və uyğun elanların göstərilməsi üçün istifadə oluna bilər. Hazırda belə alətlər qoşulmayıb və seçiminiz reklam izləməsini başlatmır.',
      'Bu cookie faylları parametrləri yadda saxlaya və video və ya çat kimi əlavə funksiyaları dəstəkləyə bilər. Hazırda bu funksiyalar qoşulmayıb. Əsas səhifələr bu kateqoriya olmadan da işləyir.',
      'Bu cookie faylları ziyarət sayını və hansı səhifələrin faydalı olduğunu anlamağa kömək edə bilər. Hazırda analitika qoşulmayıb; kateqoriyanı seçmək ziyarətinizi ölçməyə başlamır.',
    ],
    hy: [
      'Այս պահին կայքում գովազդային և վերլուծական գործիքներ միացված չեն։ Կատեգորիայի ընտրությունը պահպանում է ձեր նախապատվությունը, բայց ինքնուրույն տվյալների հավաքագրում չի սկսում։ Կայքը հասանելի է նաև ոչ պարտադիր կատեգորիաները մերժելու դեպքում։',
      'Այս գրառումը թույլ է տալիս ամեն այցի ժամանակ կրկին չցուցադրել ծանուցումը և հիշել ձեր ընտրությունը։ Այն գովազդի համար նախատեսված չէ։ Կարող եք այն ջնջել դիտարկչի կարգավորումներում։',
      'Եթե հետագայում գովազդային գործիքներ ավելացվեն, այս կատեգորիան կարող է օգտագործվել գովազդի արդյունավետությունը գնահատելու և համապատասխան հայտարարություններ ցուցադրելու համար։ Այժմ այդպիսի գործիքներ միացված չեն։',
      'Այս cookie ֆայլերը կարող են հիշել կարգավորումները կամ աջակցել լրացուցիչ հնարավորություններին, օրինակ՝ տեսանյութին կամ զրույցին։ Այժմ այդ հնարավորությունները միացված չեն։ Հիմնական էջերը աշխատում են նաև առանց դրանց։',
      'Այս cookie ֆայլերը կարող են օգնել հաշվել այցելությունները և հասկանալ, թե որ էջերն են օգտակար։ Այժմ վերլուծական գործիքներ միացված չեն, ուստի ընտրությունը չի սկսում չափել ձեր այցը։',
    ],
    ro: [
      'În prezent, site-ul nu folosește instrumente de publicitate sau analiză. Activarea unei categorii salvează preferința, dar nu pornește singură colectarea datelor. Site-ul rămâne accesibil dacă respingeți categoriile opționale.',
      'Această înregistrare împiedică afișarea notificării la fiecare vizită și păstrează alegerea dvs. Nu este destinată publicității. O puteți șterge din setările browserului.',
      'Dacă vor fi adăugate instrumente de publicitate, categoria poate fi folosită pentru evaluarea reclamelor și afișarea unor anunțuri relevante. În prezent, aceste instrumente nu sunt active, iar alegerea categoriei nu pornește urmărirea publicitară.',
      'Aceste cookie-uri pot reține setări sau susține funcții suplimentare, precum video sau chat. În prezent, aceste funcții nu sunt active. Paginile principale funcționează și fără această categorie.',
      'Aceste cookie-uri pot ajuta la numărarea vizitelor și la înțelegerea paginilor utile. În prezent, analiza nu este activă, iar alegerea categoriei nu începe măsurarea vizitei dvs.',
    ],
    uz: [
      'Hozir saytda reklama va tahlil vositalari ulanmagan. Toifani yoqish tanlovingizni saqlaydi, ammo o‘z-o‘zidan maʼlumot yig‘ishni boshlamaydi. Ixtiyoriy toifalarni rad etsangiz ham sayt ishlaydi.',
      'Bu yozuv bildirishnomani har safar ko‘rsatmaslik va tanlovingizni eslab qolish uchun kerak. U reklama uchun mo‘ljallanmagan. Uni brauzer sozlamalaridan o‘chirishingiz mumkin.',
      'Kelajakda reklama vositalari qo‘shilsa, bu toifa reklama samaradorligini baholash va mos eʼlonlarni ko‘rsatish uchun ishlatilishi mumkin. Hozir bunday vositalar ulanmagan va tanlov reklamaviy kuzatuvni boshlamaydi.',
      'Bunday cookie fayllari sozlamalarni eslab qolishi yoki video va chat kabi qo‘shimcha funksiyalarni qo‘llab-quvvatlashi mumkin. Hozir bu funksiyalar ulanmagan. Asosiy sahifalar ularsiz ham ishlaydi.',
      'Bunday cookie fayllari tashriflar sonini va foydali sahifalarni tushunishga yordam berishi mumkin. Hozir tahlil ulanmagan; toifani tanlash tashrifingizni o‘lchashni boshlamaydi.',
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
