/*
 * Main interactivity script for the STADA “О компании” page.
 *
 * Handles language switching (Russian ↔ Kazakh), mobile menu
 * toggling, hero carousel initialisation and scroll animations.
 */

function hideStadaPageLoader() {
  document.body.classList.add('stada-page-loaded');
}

function showStadaPageLoader() {
  document.body.classList.remove('stada-page-loaded');
}

function shouldWaitForBackendContent() {
  return document.body?.classList.contains('backend-content-pending')
    || !!document.querySelector('[data-dynamic-product-page], [data-i18n-key], [data-backend-text-id], [data-backend-image-id]');
}

function hideStadaPageLoaderWhenReady() {
  if (shouldWaitForBackendContent()) return;
  hideStadaPageLoader();
}

if (document.readyState === 'complete') {
  hideStadaPageLoaderWhenReady();
} else {
  window.addEventListener('load', hideStadaPageLoaderWhenReady, { once: true });
}

let currentLang = '';
let currentCountry = '';

let STADA_COUNTRY_OPTIONS = [];
let STADA_COUNTRY_BY_CODE = Object.fromEntries(STADA_COUNTRY_OPTIONS.map(country => [country.code, country]));
const STADA_LANGUAGE_LABELS = {
  ru: 'RU',
  kz: 'KZ',
  kg: 'KG',
  ge: 'GE',
  en: 'EN',
  az: 'AZ',
  ro: 'RO',
  uz: 'UZ',
  hy: 'HY',
};

const FRONTEND_STATIC_TEXT = {
  "ru": {
    "skip_to_content": "Перейти к основному содержанию",
    "cookie_title": "Cookies",
    "cookie_notice": "На сайтах STADA могут использоваться некоторые файлы cookie, от которых не зависит работа сайта. Мы делаем это не для того, чтобы отслеживать действия отдельных пользователей или идентифицировать их, а с целью получения полезных сведений о том, как используют сайты. Это поможет нам совершенствовать их работу для пользователей. Знания, которые мы получаем от систем, использующих эти файлы cookie, позволяют нам оказывать соответствующие услуги. Полученная информация об использовании веб-сайта посетителем может быть передана другим компаниям Группы STADA Arzneimittel AG. Информация об удалении файлов cookie или управлении ими доступна на веб-сайте:",
    "cookie_link_label": "aboutcookies.org",
    "about_heading": "О компании STADA",
    "benefits_heading": "Преимущества",
    "button_products": "Продукты",
    "career_button": "Смотреть вакансии",
    "career_heading": "Карьера в STADA",
    "cta_more": "Подробнее",
    "footer_access_title": "Доступность",
    "footer_back_top": "Наверх",
    "footer_brand_text": "Мы объединяем международный опыт STADA и локальную близость к пациентам, специалистам и партнерам в Казахстане.",
    "footer_company_title": "Компания",
    "footer_global_link": "STADA Global",
    "footer_products_title": "Продукты",
    "footer_rights": "Все права защищены.",
    "footer_trust_countries": "120+ стран",
    "footer_trust_years": "130+ лет опыта",
    "footer_warning_text": "Информация на сайте не заменяет консультацию специалиста. Перед применением лекарственных средств ознакомьтесь с инструкцией.",
    "footer_warning_title": "Важно",
    "hero_kicker": "STADA Kazakhstan",
    "hero_products_label": "НАШИ ПРОДУКТЫ",
    "nav_about": "О компании",
    "nav_career": "Карьера",
    "nav_categories": "Категории",
    "nav_company": "Компания",
    "nav_culture": "Культура",
    "nav_history": "История компании",
    "nav_news": "Новости и Медиа",
    "nav_products": "Продукты",
    "nav_worldwide": "Наши филиалы",
    "news_section_label": "Новости",
    "news_section_lead": "Главные новости, медиа и продуктовые обновления STADA в одном динамичном блоке.",
    "product_aqualor_baby_name": "Аквалор Беби",
    "product_aqualor_forte_name": "Аквалор Актив Форте",
    "product_aqualor_gorlo_name": "Аквалор Горло",
    "product_aqualor_name": "Аквалор",
    "product_aqualor_soft_mini_name": "Аквалор Софт мини",
    "product_aqualor_soft_name": "Аквалор Софт",
    "product_back": "Назад к продуктам",
    "product_cardiomagnil_name": "Кардиомагнил",
    "product_coldrex_name": "Колдрекс",
    "product_enterogermina_name": "Энтерожермина",
    "product_magneb6kids_name": "Магне Б6 Кидс",
    "product_noshpa_name": "НО-ШПА",
    "product_related_heading": "Другие варианты Аквалор",
    "product_related_intro": "Подберите похожий формат линейки Аквалор по объему, способу распыления и зоне применения.",
    "product_related_label": "Похожие товары",
    "pharmacovigilance_description": "Здоровье и благополучие людей — наш главный приоритет. Если вы пациент, ухаживающее лицо или медицинский работник, пожалуйста, сообщайте о нежелательных явлениях, связанных с продуктами STADA. Эта информация помогает нам обеспечивать безопасность продукции и пациентов.",
    "pharmacovigilance_heading": "Фармаконадзор",
    "pharmacovigilance_kicker": "БЕЗОПАСНОСТЬ ПАЦИЕНТОВ",
    "pharmacovigilance_report_label": "СООБЩИТЬ О НЕЖЕЛАТЕЛЬНОМ ЯВЛЕНИИ",
    "product_sinulan_duo_name": "Синулан Дуо",
    "product_vitrum_immunaktiv_name": "Витрум Иммунактив",
    "product_zodak_name": "Зодак",
    "products_browse_catalog": "Смотреть каталог",
    "products_catalog_label": "Каталог STADA",
    "products_category_allergy": "Аллергия",
    "products_category_cardio": "Кардио",
    "products_category_cold": "Простуда и дыхание",
    "products_category_digestive": "Пищеварение",
    "products_category_immunity": "Иммунитет",
    "products_category_kids": "Для детей",
    "products_category_respiratory": "Дыхательные пути",
    "products_category_urology": "Урология",
    "products_filter_all": "Все продукты",
    "products_metric_areas": "терапевтических направлений",
    "products_metric_portfolio": "продуктов в каталоге",
    "products_partners_heading": "Доступны в аптеках и онлайн-сервисах",
    "site_name": "STADA Kazakhstan",
    "where_to_buy_heading": "Где купить"
  },
  "kz": {
    "skip_to_content": "Негізгі мазмұнға өту",
    "about_heading": "STADA компаниясы туралы",
    "benefits_heading": "Артықшылықтар",
    "button_products": "Өнімдер",
    "career_button": "Вакансияларды көру",
    "career_heading": "STADA компаниясындағы мансап",
    "cta_more": "Толығырақ",
    "footer_access_title": "Қолжетімділік",
    "footer_back_top": "Жоғары",
    "footer_brand_text": "Біз STADA-ның халықаралық тәжірибесін Қазақстандағы пациенттерге, мамандарға және серіктестерге жақындықпен біріктіреміз.",
    "footer_company_title": "Компания",
    "footer_global_link": "STADA Global",
    "footer_products_title": "Өнімдер",
    "footer_rights": "Барлық құқықтар қорғалған.",
    "footer_trust_countries": "100+ ел",
    "footer_trust_years": "130+ жыл тәжірибе",
    "footer_warning_text": "Сайттағы ақпарат маман кеңесін алмастырмайды. Дәрілік заттарды қолданар алдында нұсқаулықпен танысыңыз.",
    "footer_warning_title": "Маңызды",
    "hero_kicker": "STADA Kazakhstan",
    "hero_products_label": "БІЗДІҢ ӨНІМДЕР",
    "nav_about": "Компания туралы",
    "nav_career": "Мансап",
    "nav_categories": "Санаттар",
    "nav_company": "Компания",
    "nav_culture": "Мәдениет",
    "nav_history": "Компания тарихы",
    "nav_news": "Жаңалықтар мен медиа",
    "nav_products": "Өнімдер",
    "nav_worldwide": "Біздің филиалдарымыз",
    "news_section_label": "Жаңалықтар",
    "news_section_lead": "STADA жаңалықтары, медиа материалдары және өнім жаңартулары бір заманауи блокта.",
    "product_aqualor_baby_name": "Аквалор Беби",
    "product_aqualor_forte_name": "Аквалор Актив Форте",
    "product_aqualor_gorlo_name": "Аквалор Горло",
    "product_aqualor_name": "Аквалор",
    "product_aqualor_soft_mini_name": "Аквалор Софт мини",
    "product_aqualor_soft_name": "Аквалор Софт",
    "product_back": "Өнімдерге оралу",
    "product_cardiomagnil_name": "Кардиомагнил",
    "product_coldrex_name": "Колдрекс",
    "product_enterogermina_name": "Энтерожермина",
    "product_magneb6kids_name": "Магне Б6 Кидс",
    "product_noshpa_name": "НО-ШПА",
    "product_related_heading": "Аквалордың басқа нұсқалары",
    "product_related_intro": "Аквалор желісінен көлемі, бүрку форматы және қолдану аймағы бойынша ұқсас нұсқаны таңдаңыз.",
    "product_related_label": "Ұқсас тауарлар",
    "pharmacovigilance_description": "Адамдардың денсаулығы мен әл-ауқаты — біздің басты басымдығымыз. Егер сіз пациент, пациентке күтім жасайтын адам немесе медицина қызметкері болсаңыз, STADA өнімдеріне байланысты жағымсыз құбылыстар туралы хабарлауыңызды сұраймыз. Бұл ақпарат бізге өнімдер мен пациенттердің қауіпсіздігін қамтамасыз етуге көмектеседі.",
    "pharmacovigilance_heading": "Фармакологиялық қадағалау",
    "pharmacovigilance_kicker": "ПАЦИЕНТТЕРДІҢ ҚАУІПСІЗДІГІ",
    "pharmacovigilance_report_label": "ЖАҒЫМСЫЗ ҚҰБЫЛЫС ТУРАЛЫ ХАБАРЛАУ",
    "product_sinulan_duo_name": "Синулан Дуо",
    "product_vitrum_immunaktiv_name": "Витрум Иммунактив",
    "product_zodak_name": "Зодак",
    "products_browse_catalog": "Каталогты көру",
    "products_catalog_label": "STADA каталогы",
    "products_category_allergy": "Аллергия",
    "products_category_cardio": "Кардио",
    "products_category_cold": "Суық тию және тыныс алу",
    "products_category_digestive": "Ас қорыту",
    "products_category_immunity": "Иммунитет",
    "products_category_kids": "Балаларға арналған",
    "products_category_respiratory": "Тыныс алу жолдары",
    "products_category_urology": "Урология",
    "products_filter_all": "Барлық өнімдер",
    "products_metric_areas": "терапевтік бағыт",
    "products_metric_portfolio": "каталогтағы өнім",
    "products_partners_heading": "Дәріханалар мен онлайн-сервистерде қолжетімді",
    "site_name": "STADA Kazakhstan",
    "where_to_buy_heading": "Қайдан сатып алуға болады"
  },
  "kg": {
    "skip_to_content": "Негизги мазмунга өтүү",
    "about_heading": "STADA компаниясы жөнүндө",
    "benefits_heading": "Артыкчылыктар",
    "button_products": "Продуктылар",
    "career_button": "Вакансияларды көрүү",
    "career_heading": "STADAдагы карьера",
    "cta_more": "Кененирээк",
    "footer_access_title": "Жеткиликтүүлүк",
    "footer_back_top": "Жогору",
    "footer_brand_text": "Биз STADAнын эл аралык тажрыйбасын Кыргызстандагы бейтаптарга, адистерге жана өнөктөштөргө жакындык менен айкалыштырабыз.",
    "footer_company_title": "Компания",
    "footer_global_link": "STADA Global",
    "footer_products_title": "Продуктылар",
    "footer_rights": "Бардык укуктар корголгон.",
    "footer_trust_countries": "120дан ашуун өлкө",
    "footer_trust_years": "130+ жылдык тажрыйба",
    "footer_warning_text": "Сайттагы маалымат адистин кеңешин алмаштырбайт. Дары каражаттарын колдонор алдында нускама менен таанышыңыз.",
    "footer_warning_title": "Маанилүү",
    "hero_kicker": "STADA Kyrgyzstan",
    "hero_products_label": "БИЗДИН ПРОДУКТЫЛАР",
    "nav_about": "Компания жөнүндө",
    "nav_career": "Карьера",
    "nav_categories": "Категориялар",
    "nav_company": "Компания",
    "nav_culture": "Маданият",
    "nav_history": "Компаниянын тарыхы",
    "nav_news": "Жаңылыктар жана медиа",
    "nav_products": "Продуктылар",
    "nav_worldwide": "Биздин филиалдар",
    "news_section_label": "Жаңылыктар",
    "news_section_lead": "STADA жаңылыктары, медиа материалдары жана продукт жаңыртуулары бир заманбап блокто.",
    "product_aqualor_baby_name": "Аквалор Беби",
    "product_aqualor_forte_name": "Аквалор Актив Форте",
    "product_aqualor_gorlo_name": "Аквалор Горло",
    "product_aqualor_name": "Аквалор",
    "product_aqualor_soft_mini_name": "Аквалор Софт мини",
    "product_aqualor_soft_name": "Аквалор Софт",
    "product_back": "Продуктыларга кайтуу",
    "product_cardiomagnil_name": "Кардиомагнил",
    "product_coldrex_name": "Колдрекс",
    "product_enterogermina_name": "Энтерожермина",
    "product_magneb6kids_name": "Магне Б6 Кидс",
    "product_noshpa_name": "НО-ШПА",
    "product_related_heading": "Аквалордун башка варианттары",
    "product_related_intro": "Аквалор линиясынан көлөмү, чачыратуу форматы жана колдонуу аймагы боюнча окшош вариантты тандаңыз.",
    "product_related_label": "Окшош товарлар",
    "product_sinulan_duo_name": "Синулан Дуо",
    "product_vitrum_immunaktiv_name": "Витрум Иммунактив",
    "product_zodak_name": "Зодак",
    "products_browse_catalog": "Каталогду көрүү",
    "products_catalog_label": "STADA каталогу",
    "products_category_allergy": "Аллергия",
    "products_category_cardio": "Жүрөк-кан тамыр",
    "products_category_cold": "Суук тийүү жана дем алуу жолдору",
    "products_category_digestive": "Тамак сиңирүү",
    "products_category_immunity": "Иммунитет",
    "products_category_kids": "Балдар үчүн",
    "products_category_respiratory": "Дем алуу жолдору",
    "products_category_urology": "Урология",
    "products_filter_all": "Бардык өнүмдөр",
    "products_metric_areas": "терапиялык багыт",
    "products_metric_portfolio": "каталогдогу продукт",
    "products_partners_heading": "Дарыканаларда жана онлайн сервистерде жеткиликтүү",
    "site_name": "STADA Kyrgyzstan",
    "where_to_buy_heading": "Кайдан сатып алса болот"
  }
};

FRONTEND_STATIC_TEXT.en = {
  "cookie_title": "Cookies",
  "cookie_notice": "STADA websites may use certain cookies that are not essential to the operation of the site. We use them to understand how people use our websites, not to track or identify individual users. These insights help us improve our websites and provide relevant services. Information about a visitor's use of the website may be shared with other companies in the STADA Arzneimittel AG Group. Learn how to delete or manage cookies at:",
  "cookie_link_label": "aboutcookies.org",
  "skip_to_content": "Skip to main content",
  "about_heading": "About STADA",
  "benefits_heading": "Benefits",
  "button_products": "Products",
  "career_button": "View vacancies",
  "career_heading": "Careers at STADA",
  "cta_more": "Learn more",
  "footer_access_title": "Access",
  "footer_back_top": "Back to top",
  "footer_brand_text": "We combine STADA's international experience with local proximity to patients, specialists, and partners in Georgia.",
  "footer_company_title": "Company",
  "footer_global_link": "STADA Global",
  "footer_products_title": "Products",
  "footer_rights": "All rights reserved.",
  "footer_trust_countries": "120+ countries",
  "footer_trust_years": "130+ years of experience",
  "footer_warning_text": "The information on this website does not replace professional advice. Read the package leaflet before using medicines.",
  "footer_warning_title": "Important",
  "hero_kicker": "STADA Georgia",
  "hero_products_label": "OUR PRODUCTS",
  "nav_about": "About company",
  "nav_career": "Careers",
  "nav_categories": "Categories",
  "nav_company": "Company",
  "nav_culture": "Culture",
  "nav_history": "Company history",
  "nav_news": "News and Media",
  "nav_products": "Products",
  "nav_worldwide": "Our locations",
  "news_section_label": "News",
  "news_section_lead": "STADA news, media stories, and product updates in one dynamic section.",
  "product_aqualor_baby_name": "Aqualor Baby",
  "product_aqualor_forte_name": "Aqualor Active Forte",
  "product_aqualor_gorlo_name": "Aqualor Throat",
  "product_aqualor_name": "Aqualor",
  "product_aqualor_soft_mini_name": "Aqualor Soft mini",
  "product_aqualor_soft_name": "Aqualor Soft",
  "product_back": "Back to products",
  "product_cardiomagnil_name": "Cardiomagnyl",
  "product_coldrex_name": "Coldrex",
  "product_enterogermina_name": "Enterogermina",
  "product_magneb6kids_name": "Magne B6 Kids",
  "product_noshpa_name": "NO-SPA",
  "product_related_heading": "Other Aqualor options",
  "product_related_intro": "Choose a similar Aqualor format by volume, spray type, and area of use.",
  "product_related_label": "Related products",
  "product_sinulan_duo_name": "Sinulan Duo",
  "product_vitrum_immunaktiv_name": "Vitrum Immunaktiv",
  "product_zodak_name": "Zodak",
  "products_browse_catalog": "Browse catalog",
  "products_catalog_label": "STADA catalog",
  "products_category_allergy": "Allergy",
  "products_category_cardio": "Cardio",
  "products_category_cold": "Cold and breathing",
  "products_category_digestive": "Digestive health",
  "products_category_immunity": "Immunity",
  "products_category_kids": "For children",
  "products_category_respiratory": "Respiratory",
  "products_category_urology": "Urology",
  "products_filter_all": "All products",
  "products_metric_areas": "therapeutic areas",
  "products_metric_portfolio": "products in catalog",
  "products_partners_heading": "Available in pharmacies and online services",
  "site_name": "STADA Georgia",
  "where_to_buy_heading": "Where to buy",
};

// Shared UI labels for the expanded company copy and explicit cookie agreement.
const STADA_SHARED_UI_TEXT = {
  ru: { about_context_label: 'В регионе', about_context_heading: 'STADA Евразия', cookie_accept: 'Согласен' },
  kz: { about_context_label: 'Өңірдегі қызмет', about_context_heading: 'STADA Еуразия', cookie_accept: 'Келісемін' },
  kg: { about_context_label: 'Аймактагы ишмердик', about_context_heading: 'STADA Евразия', cookie_accept: 'Макулмун' },
  en: { about_context_label: 'Across the region', about_context_heading: 'STADA Eurasia', cookie_accept: 'I agree' },
  ge: { about_context_label: 'რეგიონში საქმიანობა', about_context_heading: 'STADA ევრაზია', cookie_accept: 'ვეთანხმები' },
  az: { about_context_label: 'Regiondakı fəaliyyət', about_context_heading: 'STADA Avrasiya', cookie_accept: 'Razıyam' },
  hy: {
    about_context_label: 'Տարածաշրջանային գործունեություն', about_context_heading: 'STADA Եվրասիա', cookie_accept: 'Համաձայն եմ',
    cookie_title: 'Cookie ֆայլեր',
    cookie_notice: 'STADA-ի կայքերում կարող են օգտագործվել կայքի աշխատանքի համար ոչ պարտադիր cookie ֆայլեր։ Դրանք օգնում են հասկանալ, թե ինչպես են օգտագործվում կայքերը, և բարելավել ծառայությունները՝ առանց առանձին այցելուներին նույնականացնելու։ Այցելության մասին տեղեկությունը կարող է փոխանցվել STADA Arzneimittel AG խմբի այլ ընկերություններին։ Cookie ֆայլերը ջնջելու կամ կառավարելու մասին տեղեկությունը հասանելի է այստեղ՝',
    cookie_link_label: 'aboutcookies.org',
  },
  ro: {
    about_context_label: 'Activitatea în regiune', about_context_heading: 'STADA Eurasia', cookie_accept: 'Sunt de acord',
    cookie_title: 'Cookie-uri',
    cookie_notice: 'Site-urile STADA pot folosi anumite cookie-uri care nu sunt necesare funcționării lor. Le folosim pentru a înțelege cum sunt utilizate site-urile și pentru a îmbunătăți serviciile, fără a urmări sau identifica utilizatori individuali. Informațiile despre utilizarea site-ului pot fi transmise altor companii din Grupul STADA Arzneimittel AG. Informații despre ștergerea sau gestionarea cookie-urilor sunt disponibile la:',
    cookie_link_label: 'aboutcookies.org',
  },
  uz: {
    about_context_label: 'Mintaqadagi faoliyat', about_context_heading: 'STADA Yevrosiyo', cookie_accept: 'Roziman',
    cookie_title: 'Cookie fayllari',
    cookie_notice: 'STADA saytlarida sayt ishlashi uchun zarur bo‘lmagan ayrim cookie fayllari ishlatilishi mumkin. Ular alohida foydalanuvchilarni kuzatish yoki aniqlash uchun emas, saytlar qanday ishlatilishini tushunish va xizmatlarni yaxshilash uchun xizmat qiladi. Saytdan foydalanish haqidagi maʼlumot STADA Arzneimittel AG guruhining boshqa kompaniyalariga uzatilishi mumkin. Cookie fayllarini o‘chirish yoki boshqarish haqida maʼlumot:',
    cookie_link_label: 'aboutcookies.org',
  },
};
Object.assign(FRONTEND_STATIC_TEXT.ru, {
  cookie_title: 'Cookies',
  cookie_notice: 'На сайтах STADA могут использоваться некоторые файлы cookie, от которых не зависит работа сайта. Мы делаем это не для того, чтобы отслеживать действия отдельных пользователей или идентифицировать их, а с целью получения полезных сведений о том, как используют сайты. Это поможет нам совершенствовать их работу для пользователей. Знания, которые мы получаем от систем, использующих эти файлы cookie, позволяют нам оказывать соответствующие услуги. Полученная информация об использовании веб-сайта посетителем может быть передана другим компаниям Группы STADA Arzneimittel AG. Информация об удалении файлов cookie или управлении ими доступна на веб-сайте:',
  cookie_link_label: 'aboutcookies.org',
});
Object.assign(FRONTEND_STATIC_TEXT.kz, {
  cookie_title: 'Cookie файлдары',
  cookie_notice: 'STADA сайттарында сайттың жұмысына әсер етпейтін кейбір cookie файлдары пайдаланылуы мүмкін. Біз оларды жеке пайдаланушылардың әрекеттерін бақылау немесе олардың кім екенін анықтау үшін емес, сайттардың қалай пайдаланылатыны туралы пайдалы мәлімет алу үшін қолданамыз. Бұл сайт жұмысын пайдаланушыларға ыңғайлы етуге көмектеседі. Cookie файлдарын пайдаланатын жүйелерден алынған білім бізге тиісті қызметтерді ұсынуға мүмкіндік береді. Келушінің веб-сайтты пайдалануы туралы ақпарат STADA Arzneimittel AG тобының басқа компанияларына берілуі мүмкін. Cookie файлдарын жою немесе басқару туралы ақпарат мына сайтта қолжетімді:',
  cookie_link_label: 'aboutcookies.org',
});
Object.assign(FRONTEND_STATIC_TEXT.kg, {
  cookie_title: 'Cookie файлдары',
  cookie_notice: 'STADA сайттарында сайттын иштешине таасир этпеген айрым cookie файлдары колдонулушу мүмкүн. Биз аларды айрым колдонуучулардын аракеттерин көзөмөлдөө же ким экенин аныктоо үчүн эмес, сайттар кандай колдонулары тууралуу пайдалуу маалымат алуу үчүн колдонобуз. Бул сайттарды колдонуучулар үчүн жакшыртууга жардам берет. Cookie файлдарын колдонгон системалардан алынган маалымат бизге тиешелүү кызматтарды көрсөтүүгө мүмкүндүк берет. Веб-сайтка кирүүчүнүн колдонушу тууралуу маалымат STADA Arzneimittel AG тобундагы башка компанияларга берилиши мүмкүн. Cookie файлдарын жок кылуу же башкаруу тууралуу маалымат бул сайтта жеткиликтүү:',
  cookie_link_label: 'aboutcookies.org',
});

FRONTEND_STATIC_TEXT.ge = {
  "skip_to_content": "მთავარ შინაარსზე გადასვლა",
  "about_heading": "STADA-ს შესახებ",
  "benefits_heading": "უპირატესობები",
  "button_products": "პროდუქტები",
  "career_button": "ვაკანსიების ნახვა",
  "career_heading": "კარიერა STADA-ში",
  "cta_more": "გაიგეთ მეტი",
  "footer_access_title": "წვდომა",
  "footer_back_top": "ზემოთ დაბრუნება",
  "footer_brand_text": "ჩვენ ვაერთიანებთ STADA-ს საერთაშორისო გამოცდილებას ადგილობრივ სიახლოვესთან პაციენტებთან, სპეციალისტებთან და პარტნიორებთან საქართველოში.",
  "footer_company_title": "კომპანია",
  "footer_global_link": "STADA Global",
  "footer_products_title": "პროდუქტები",
  "footer_rights": "ყველა უფლება დაცულია.",
  "footer_trust_countries": "120-ზე მეტი ქვეყანა",
  "footer_trust_years": "130+ წლიანი გამოცდილება",
  "footer_warning_text": "საიტზე მოცემული ინფორმაცია არ ცვლის სპეციალისტის კონსულტაციას. მედიკამენტის გამოყენებამდე გაეცანით ინსტრუქციას.",
  "footer_warning_title": "მნიშვნელოვანია",
  "hero_kicker": "STADA Georgia",
  "hero_products_label": "ჩვენი პროდუქტები",
  "nav_about": "კომპანიის შესახებ",
  "nav_career": "კარიერა",
  "nav_categories": "კატეგორიები",
  "nav_company": "კომპანია",
  "nav_culture": "კულტურა",
  "nav_history": "კომპანიის ისტორია",
  "nav_news": "სიახლეები და მედია",
  "nav_products": "პროდუქტები",
  "nav_worldwide": "ჩვენი ოფისები",
    "news_section_label": "სიახლეები",
    "news_section_lead": "STADA-ს სიახლეები, მედია მასალები და პროდუქტის განახლებები ერთ დინამიკურ ბლოკში.",
  "product_aqualor_baby_name": "აკვალორ ბეიბი",
  "product_aqualor_forte_name": "აკვალორ აქტივ ფორტე",
  "product_aqualor_gorlo_name": "აკვალორ ყელი",
  "product_aqualor_name": "აკვალორი",
  "product_aqualor_soft_mini_name": "აკვალორ სოფტი მინი",
  "product_aqualor_soft_name": "აკვალორ სოფტი",
  "product_back": "პროდუქტებზე დაბრუნება",
  "product_cardiomagnil_name": "კარდიომაგნილი",
  "product_coldrex_name": "კოლდრექსი",
  "product_enterogermina_name": "ენტეროჟერმინა",
  "product_magneb6kids_name": "მაგნე B6 Kids",
  "product_noshpa_name": "ნო-შპა",
  "product_related_heading": "აკვალორის სხვა ვარიანტები",
  "product_related_intro": "აირჩიეთ აკვალორის მსგავსი ფორმატი მოცულობის, შესხურების ტიპისა და გამოყენების არეალის მიხედვით.",
  "product_related_label": "მსგავსი პროდუქტები",
  "product_sinulan_duo_name": "სინულან დუო",
  "product_vitrum_immunaktiv_name": "ვიტრუმ იმუნაქტივი",
  "product_zodak_name": "ზოდაკი",
  "products_browse_catalog": "კატალოგის ნახვა",
  "products_catalog_label": "STADA კატალოგი",
  "products_category_allergy": "ალერგია",
  "products_category_cardio": "გულ-სისხლძარღვთა",
  "products_category_cold": "გაციება და სასუნთქი გზები",
  "products_category_digestive": "საჭმლის მონელება",
  "products_category_immunity": "იმუნიტეტი",
  "products_category_kids": "ბავშვებისთვის",
  "products_category_respiratory": "სასუნთქი გზები",
  "products_category_urology": "უროლოგია",
  "products_filter_all": "ყველა პროდუქტი",
  "products_metric_areas": "თერაპიული მიმართულება",
  "products_metric_portfolio": "პროდუქტი კატალოგში",
  "products_partners_heading": "ხელმისაწვდომია აფთიაქებსა და ონლაინ სერვისებში",
  "site_name": "STADA Georgia",
  "where_to_buy_heading": "სად შევიძინოთ",
};

FRONTEND_STATIC_TEXT.az = {
  "skip_to_content": "Əsas məzmuna keçin",
  "about_heading": "STADA haqqında",
  "benefits_heading": "Üstünlüklər",
  "button_products": "Məhsullar",
  "career_button": "Vakansiyalara baxın",
  "career_heading": "STADA-da karyera",
  "cta_more": "Daha ətraflı",
  "footer_access_title": "Əlçatanlıq",
  "footer_back_top": "Yuxarı",
  "footer_brand_text": "STADA-nın beynəlxalq təcrübəsini Azərbaycanda pasiyentlərə, mütəxəssislərə və tərəfdaşlara yaxınlıqla birləşdiririk.",
  "footer_company_title": "Şirkət",
  "footer_global_link": "STADA Global",
  "footer_products_title": "Məhsullar",
  "footer_nav_about": "Şirkət haqqında",
  "footer_nav_culture": "Mədəniyyət",
  "footer_nav_history": "Şirkətin tarixi",
  "footer_nav_worldwide": "Filiallarımız",
  "footer_nav_news": "Xəbərlər və media",
  "footer_nav_career": "Karyera",
  "footer_rights": "Bütün hüquqlar qorunur.",
  "footer_trust_countries": "120-dən çox ölkə",
  "footer_trust_years": "130+ il təcrübə",
  "footer_warning_text": "Saytdakı məlumat mütəxəssis məsləhətini əvəz etmir. Dərman vasitələrindən istifadə etməzdən əvvəl təlimatı oxuyun.",
  "footer_warning_title": "Vacibdir",
  "hero_kicker": "STADA Azerbaijan",
  "hero_title1": "Sağlamlığa qayğı",
  "hero_products_label": "MƏHSULLARIMIZ",
  "nav_about": "Şirkət haqqında",
  "nav_career": "Karyera",
  "nav_categories": "Kateqoriyalar",
  "nav_company": "Şirkət",
  "nav_culture": "Mədəniyyət",
  "nav_history": "Şirkətin tarixi",
  "nav_news": "Xəbərlər və media",
  "nav_products": "Məhsullar",
  "nav_worldwide": "Filiallarımız",
    "news_section_label": "Xəbərlər",
    "news_section_lead": "STADA xəbərləri, media materialları və məhsul yenilikləri bir bölmədə.",
  "product_aqualor_baby_name": "Aqualor Baby",
  "product_aqualor_forte_name": "Aqualor Active Forte",
  "product_aqualor_gorlo_name": "Aqualor Throat",
  "product_aqualor_name": "Aqualor",
  "product_aqualor_soft_mini_name": "Aqualor Soft mini",
  "product_aqualor_soft_name": "Aqualor Soft",
  "product_back": "Məhsullara qayıt",
  "product_cardiomagnil_name": "Cardiomagnil",
  "product_coldrex_name": "Coldrex",
  "product_enterogermina_name": "Enterogermina",
  "product_magneb6kids_name": "Magne B6 Kids",
  "product_noshpa_name": "NO-ŞPA",
  "product_related_heading": "Oxşar məhsullar",
  "product_related_intro": "Həcm, format və istifadə sahəsinə görə uyğun variantı seçin.",
  "product_related_label": "Oxşar məhsullar",
  "product_sinulan_duo_name": "Sinulan Duo",
  "product_vitrum_immunaktiv_name": "Vitrum Immunaktiv",
  "product_zodak_name": "Zodak",
  "products_browse_catalog": "Kataloqa baxın",
  "products_catalog_label": "STADA kataloqu",
  "products_category_allergy": "Allergiya",
  "products_category_cardio": "Kardio",
  "products_category_cold": "Soyuqdəymə və tənəffüs",
  "products_category_digestive": "Həzm",
  "products_category_immunity": "İmmunitet",
  "products_category_kids": "Uşaqlar üçün",
  "products_category_respiratory": "Tənəffüs yolları",
  "products_category_urology": "Urologiya",
  "products_filter_all": "Bütün məhsullar",
  "products_metric_areas": "terapevtik istiqamət",
  "products_metric_portfolio": "kataloqda məhsul",
  "products_partners_heading": "Apteklərdə və onlayn servislərdə mövcuddur",
  "site_name": "STADA Azerbaijan",
  "where_to_buy_heading": "Haradan almaq olar",
};

Object.assign(FRONTEND_STATIC_TEXT.ru, {
  history_source_note: 'Ключевые этапы основаны на корпоративной хронологии STADA.'
});

Object.assign(FRONTEND_STATIC_TEXT.kz, {
  history_source_note: 'Негізгі кезеңдер STADA корпоративтік хронологиясына негізделген.'
});

Object.assign(FRONTEND_STATIC_TEXT.kg, {
  history_source_note: 'Негизги этаптар STADAнын корпоративдик хронологиясына негизделген.'
});

Object.assign(FRONTEND_STATIC_TEXT.en, {
  history_source_note: 'Key milestones are based on STADA corporate chronology.'
});

Object.assign(FRONTEND_STATIC_TEXT.az, {
  cookie_title: 'Cookies',
  cookie_notice: 'STADA saytlarında saytın işləməsi üçün vacib olmayan bəzi cookie fayllarından istifadə oluna bilər. Onlardan ayrı-ayrı istifadəçiləri izləmək və ya müəyyən etmək üçün deyil, saytlarımızdan necə istifadə edildiyi barədə faydalı məlumat əldə etmək üçün istifadə edirik. Bu məlumat saytlarımızı təkmilləşdirməyə və uyğun xidmətlər göstərməyə kömək edir. Ziyarətçinin veb-saytdan istifadəsi haqqında məlumat STADA Arzneimittel AG Qrupunun digər şirkətləri ilə paylaşıla bilər. Cookie fayllarını silmək və ya idarə etmək haqqında məlumat burada mövcuddur:',
  cookie_link_label: 'aboutcookies.org',
});
Object.assign(FRONTEND_STATIC_TEXT.ge, {
  cookie_title: 'Cookies',
  cookie_notice: 'STADA-ს ვებსაიტებზე შეიძლება გამოიყენებოდეს ზოგიერთი cookie-ფაილი, რომელიც საიტის მუშაობისთვის აუცილებელი არ არის. მათ ვიყენებთ იმის გასაგებად, თუ როგორ იყენებენ ჩვენს საიტებს, და არა ცალკეული მომხმარებლების თვალყურის დევნებისთვის ან იდენტიფიცირებისთვის. ეს ინფორმაცია გვეხმარება საიტების გაუმჯობესებასა და შესაბამისი სერვისების მიწოდებაში. ვიზიტორის მიერ ვებსაიტის გამოყენების შესახებ ინფორმაცია შეიძლება გაეზიაროს STADA Arzneimittel AG ჯგუფის სხვა კომპანიებს. cookie-ფაილების წაშლის ან მართვის შესახებ ინფორმაცია იხილეთ:',
  cookie_link_label: 'aboutcookies.org',
});

Object.assign(FRONTEND_STATIC_TEXT.ge, {
  history_source_note: 'ძირითადი ეტაპები ეფუძნება STADA-ს კორპორატიულ ქრონოლოგიას.'
});

Object.assign(FRONTEND_STATIC_TEXT.az, {
  history_source_note: 'Əsas mərhələlər STADA-nın korporativ xronologiyasına əsaslanır.'
});

FRONTEND_STATIC_TEXT.hy = {
  "skip_to_content": "Անցնել հիմնական բովանդակությանը",
  "about_heading": "STADA-ի մասին",
  "benefits_heading": "Առավելությունները",
  "button_products": "Ապրանքներ",
  "career_button": "Դիտեք թափուր աշխատատեղերը",
  "career_heading": "Կարիերա STADA-ում",
  "cta_more": "Ավելի մանրամասն",
  "footer_access_title": "Հասանելիություն",
  "footer_back_top": "Վերև",
  "footer_brand_text": "Մենք համատեղում ենք STADA-ի միջազգային փորձը Հայաստանում պացիենտների, մասնագետների և գործընկերների հետ տեղական մտերմության հետ։",
  "footer_company_title": "Ընկերություն",
  "footer_global_link": "STADA Global",
  "footer_products_title": "Ապրանքներ",
  "footer_rights": "Բոլոր իրավունքները պաշտպանված են:",
  "footer_trust_countries": "Ավելի քան 120 երկիր",
  "footer_trust_years": "130+ տարվա փորձ",
  "footer_warning_text": "Կայքի տեղեկատվությունը չի փոխարինում մասնագետի հետ խորհրդակցությանը: Նախքան դեղամիջոցներ օգտագործելը, կարդացեք հրահանգները:",
  "footer_warning_title": "Կարևոր",
  "hero_kicker": "STADA Armenia",
  "hero_products_label": "ՄԵՐ ԱՊՐԱՆՔՆԵՐԸ",
  "nav_about": "Ընկերության մասին",
  "nav_career": "Կարիերա",
  "nav_categories": "Կատեգորիաներ",
  "nav_company": "Ընկերություն",
  "nav_culture": "Մշակույթ",
  "nav_history": "Ընկերության պատմություն",
  "nav_news": "Նորություններ և լրատվամիջոցներ",
  "nav_products": "Ապրանքներ",
  "nav_worldwide": "Մեր մասնաճյուղերը",
    "news_section_label": "Նորություններ",
    "news_section_lead": "STADA-ի հիմնական նորությունները, լրատվամիջոցները և արտադրանքի թարմացումները մեկ դինամիկ բլոկում:",
  "product_aqualor_baby_name": "Aqualor Baby",
  "product_aqualor_forte_name": "Aqualor Active Forte",
  "product_aqualor_gorlo_name": "Aqualor կոկորդ",
  "product_aqualor_name": "Aqualor",
  "product_aqualor_soft_mini_name": "Aqualor Soft mini",
  "product_aqualor_soft_name": "Aqualor Soft",
  "product_back": "Վերադարձ դեպի ապրանքներ",
  "product_cardiomagnil_name": "Կարդիոմագնիլ",
  "product_coldrex_name": "Coldrex",
  "product_enterogermina_name": "Էնտերոգերմինա",
  "product_magneb6kids_name": "Magne B6 Երեխաներ",
  "product_noshpa_name": "NO-SHPA",
  "product_related_heading": "Aqualor-ի այլ տարբերակներ",
  "product_related_intro": "Ընտրեք Aqualor գծի նմանատիպ ձևաչափը ծավալի, ցողման եղանակի և կիրառման տարածքի առումով:",
  "product_related_label": "Նմանատիպ ապրանքներ",
  "product_sinulan_duo_name": "Sinulan Duo",
  "product_vitrum_immunaktiv_name": "Vitrum Immunaktiv",
  "product_zodak_name": "Զոդակ",
  "products_browse_catalog": "Դիտել կատալոգը",
  "products_catalog_label": "STADA կատալոգ",
  "products_category_allergy": "Ալերգիա",
  "products_category_cardio": "Կարդիո",
  "products_category_cold": "Մրսածություն և շնչառություն",
  "products_category_digestive": "Մարսողություն",
  "products_category_immunity": "Իմունիտետ",
  "products_category_kids": "Երեխաների համար",
  "products_category_respiratory": "Շնչուղիներ",
  "products_category_urology": "Ուրոլոգիա",
  "products_filter_all": "Բոլոր ապրանքները",
  "products_metric_areas": "բուժական տարածքներ",
  "products_metric_portfolio": "ապրանքներ կատալոգում",
  "products_partners_heading": "Հասանելի է դեղատներում և առցանց ծառայություններում",
  "site_name": "STADA Armenia",
  "where_to_buy_heading": "Որտեղ գնել",
  "history_source_note": "Հիմնական փուլերը հիմնված են STADA-ի կորպորատիվ ժամանակագրության վրա։"
};

FRONTEND_STATIC_TEXT.ro = {
  skip_to_content: 'Sari la conținutul principal',
  about_heading: 'Despre STADA',
  benefits_heading: 'Beneficii',
  button_products: 'Produse',
  career_button: 'Vezi posturile vacante',
  career_heading: 'Cariere la STADA',
  cta_more: 'Află mai multe',
  footer_access_title: 'Acces',
  footer_back_top: 'Înapoi sus',
  footer_brand_text: 'Combinăm experiența internațională STADA cu apropierea locală de pacienți, specialiști și parteneri din Moldova.',
  footer_company_title: 'Companie',
  footer_global_link: 'STADA Global',
  footer_products_title: 'Produse',
  footer_rights: 'Toate drepturile rezervate.',
  footer_trust_countries: 'Peste 120 de țări',
  footer_trust_years: '130+ ani de experiență',
  footer_warning_text: 'Informațiile de pe acest site nu înlocuiesc sfatul unui specialist. Citiți prospectul înainte de a utiliza medicamente.',
  footer_warning_title: 'Important',
  hero_kicker: 'STADA Moldova',
  hero_products_label: 'PRODUSELE NOASTRE',
  nav_about: 'Despre companie',
  nav_career: 'Cariere',
  nav_categories: 'Categorii',
  nav_company: 'Companie',
  nav_culture: 'Cultură',
  nav_history: 'Istoria companiei',
  nav_news: 'Știri și media',
  nav_products: 'Produse',
  nav_worldwide: 'Rețeaua internațională',
  news_section_label: 'Știri',
  news_section_lead: 'Știri, articole media și noutăți despre produsele STADA într-o singură secțiune.',
  product_back: 'Înapoi la produse',
  products_browse_catalog: 'Vezi catalogul',
  products_catalog_label: 'Catalogul STADA',
  products_category_allergy: 'Alergie',
  products_category_cardio: 'Cardiologie',
  products_category_cold: 'Răceală și respirație',
  products_category_digestive: 'Sănătate digestivă',
  products_category_immunity: 'Imunitate',
  products_category_kids: 'Pentru copii',
  products_category_respiratory: 'Aparat respirator',
  products_category_urology: 'Urologie',
  products_filter_all: 'Toate produsele',
  products_metric_areas: 'arii terapeutice',
  products_metric_portfolio: 'produse în catalog',
  products_partners_heading: 'Disponibile în farmacii și servicii online',
  site_name: 'STADA Moldova',
  where_to_buy_heading: 'De unde cumpăr',
};

FRONTEND_STATIC_TEXT.uz = {
  skip_to_content: 'Asosiy tarkibga o‘tish',
  about_heading: 'STADA haqida',
  benefits_heading: 'Afzalliklari',
  button_products: 'Mahsulotlar',
  career_button: "Bo‘sh ish o‘rinlarini ko‘rish",
  career_heading: 'STADA kompaniyasidagi karyera',
  cta_more: "Batafsil ma’lumot",
  footer_access_title: 'Foydalanish imkoniyati',
  footer_back_top: 'Yuqoriga',
  footer_brand_text: "STADA kompaniyasining xalqaro tajribasini O‘zbekistondagi bemorlar, mutaxassislar va hamkorlarga yaqinlik bilan birlashtiramiz.",
  footer_company_title: 'Kompaniya',
  footer_global_link: 'STADA Global',
  footer_products_title: 'Mahsulotlar',
  footer_rights: 'Barcha huquqlar himoyalangan.',
  footer_trust_countries: '120 dan ortiq mamlakat',
  footer_trust_years: '130+ yillik tajriba',
  footer_warning_text: "Saytdagi ma’lumot mutaxassis maslahatining o‘rnini bosmaydi. Dori vositalarini qo‘llashdan oldin yo‘riqnomani o‘qing.",
  footer_warning_title: 'Muhim',
  hero_kicker: 'STADA Uzbekistan',
  hero_products_label: 'BIZNING MAHSULOTLARIMIZ',
  nav_about: 'Kompaniya haqida',
  nav_career: 'Karyera',
  nav_categories: 'Toifalar',
  nav_company: 'Kompaniya',
  nav_culture: 'Madaniyat',
  nav_history: 'Kompaniya tarixi',
  nav_news: 'Yangiliklar va media',
  nav_products: 'Mahsulotlar',
  nav_worldwide: 'Bizning vakolatxonalarimiz',
  news_section_label: 'Yangiliklar',
  news_section_lead: 'STADA yangiliklari, media materiallari va mahsulot yangilanishlari bitta zamonaviy bo‘limda.',
  product_back: 'Mahsulotlarga qaytish',
  products_browse_catalog: "Katalogni ko‘rish",
  products_catalog_label: 'STADA katalogi',
  products_category_allergy: 'Allergiya',
  products_category_cardio: 'Kardiologiya',
  products_category_cold: 'Shamollash va nafas olish',
  products_category_digestive: 'Ovqat hazm qilish',
  products_category_immunity: 'Immunitet',
  products_category_kids: 'Bolalar uchun',
  products_category_respiratory: 'Nafas olish yo‘llari',
  products_category_urology: 'Urologiya',
  products_filter_all: 'Barcha mahsulotlar',
  products_metric_areas: 'terapevtik yo‘nalish',
  products_metric_portfolio: 'katalogdagi mahsulot',
  products_partners_heading: 'Dorixonalar va onlayn xizmatlarda mavjud',
  site_name: 'STADA Uzbekistan',
  where_to_buy_heading: 'Qayerdan sotib olish mumkin',
};

const HOMEPAGE_CULTURE_STATIC_TEXT = {
  ru: {
    culture_values_eyebrow: 'Наши ценности', culture_values_heading: 'Принципы для ежедневных решений',
    culture_integrity_title: 'Добросовестность', culture_integrity_tagline: 'Поступать правильно.',
    culture_entrepreneurship_title: 'Предпринимательство', culture_entrepreneurship_tagline: 'Мыслить смело.',
    culture_agility_title: 'Гибкость', culture_agility_tagline: 'Расти через изменения.',
    culture_one_title: 'One STADA', culture_one_tagline: 'Сила одной команды.', culture_values_cta: 'Смотреть ценности',
  },
  kz: {
    culture_values_eyebrow: 'Біздің құндылықтарымыз', culture_values_heading: 'Күнделікті шешімдерге арналған қағидалар',
    culture_integrity_title: 'Адалдық', culture_integrity_tagline: 'Дұрыс әрекет ету.',
    culture_entrepreneurship_title: 'Кәсіпкерлік', culture_entrepreneurship_tagline: 'Батыл ойлау.',
    culture_agility_title: 'Икемділік', culture_agility_tagline: 'Өзгеріс арқылы өсу.',
    culture_one_title: 'One STADA', culture_one_tagline: 'Бір команданың күші.', culture_values_cta: 'Құндылықтарды қарау',
  },
  kg: {
    culture_values_eyebrow: 'Биздин баалуулуктар', culture_values_heading: 'Күнүмдүк чечимдер үчүн принциптер',
    culture_integrity_title: 'Ак ниеттүүлүк', culture_integrity_tagline: 'Туура иш кылуу.',
    culture_entrepreneurship_title: 'Ишкердик', culture_entrepreneurship_tagline: 'Кайраттуу ой жүгүртүү.',
    culture_agility_title: 'Ийкемдүүлүк', culture_agility_tagline: 'Өзгөрүү аркылуу өсүү.',
    culture_one_title: 'One STADA', culture_one_tagline: 'Бир команданын күчү.', culture_values_cta: 'Баалуулуктарды көрүү',
  },
  en: {
    culture_values_eyebrow: 'Our values', culture_values_heading: 'Principles for daily decisions',
    culture_integrity_title: 'Integrity', culture_integrity_tagline: 'Do the right thing.',
    culture_entrepreneurship_title: 'Entrepreneurship', culture_entrepreneurship_tagline: 'Think boldly.',
    culture_agility_title: 'Agility', culture_agility_tagline: 'Grow through change.',
    culture_one_title: 'One STADA', culture_one_tagline: 'The strength of one team.', culture_values_cta: 'View values',
  },
  ge: {
    culture_values_eyebrow: 'ჩვენი ღირებულებები', culture_values_heading: 'პრინციპები ყოველდღიური გადაწყვეტილებებისთვის',
    culture_integrity_title: 'კეთილსინდისიერება', culture_integrity_tagline: 'ვიქცევით სწორად.',
    culture_entrepreneurship_title: 'მეწარმეობა', culture_entrepreneurship_tagline: 'ვფიქრობთ თამამად.',
    culture_agility_title: 'მოქნილობა', culture_agility_tagline: 'ვიზრდებით ცვლილებებით.',
    culture_one_title: 'One STADA', culture_one_tagline: 'ერთი გუნდის ძალა.', culture_values_cta: 'ღირებულებების ნახვა',
  },
  az: {
    culture_values_eyebrow: 'Dəyərlərimiz', culture_values_heading: 'Gündəlik qərarlar üçün prinsiplər',
    culture_integrity_title: 'Dürüstlük', culture_integrity_tagline: 'Doğru olanı etmək.',
    culture_entrepreneurship_title: 'Sahibkarlıq ruhu', culture_entrepreneurship_tagline: 'Cəsarətlə düşünmək.',
    culture_agility_title: 'Çeviklik', culture_agility_tagline: 'Dəyişikliklə böyümək.',
    culture_one_title: 'One STADA', culture_one_tagline: 'Bir komandanın gücü.', culture_values_cta: 'Dəyərlərə baxın',
  },
  hy: {
    culture_values_eyebrow: 'Մեր արժեքները', culture_values_heading: 'Սկզբունքներ ամենօրյա որոշումների համար',
    culture_integrity_title: 'Անարատություն', culture_integrity_tagline: 'Արեք ճիշտը:',
    culture_entrepreneurship_title: 'Ձեռնարկատիրություն', culture_entrepreneurship_tagline: 'Համարձակ մտածեք.',
    culture_agility_title: 'Ճկունություն', culture_agility_tagline: 'Աճեք փոփոխության միջոցով:',
    culture_one_title: 'Մեկ STADA', culture_one_tagline: 'Մեկ թիմի ուժը.', culture_values_cta: 'Դիտել արժեքները',
  },
  ro: {
    culture_values_eyebrow: 'Valorile noastre', culture_values_heading: 'Principii pentru deciziile zilnice',
    culture_integrity_title: 'Integritate', culture_integrity_tagline: 'Fă ceea ce trebuie.',
    culture_entrepreneurship_title: 'Antreprenoriat', culture_entrepreneurship_tagline: 'Gândește cu îndrăzneală.',
    culture_agility_title: 'Agilitate', culture_agility_tagline: 'Creșteți prin schimbare.',
    culture_one_title: 'O STADA', culture_one_tagline: 'Puterea unei echipe.', culture_values_cta: 'Vedeți valorile',
  },
  uz: {
    culture_values_eyebrow: 'Bizning qadriyatlarimiz', culture_values_heading: 'Kundalik qarorlar qabul qilish tamoyillari',
    culture_integrity_title: 'Butunlik', culture_integrity_tagline: "To'g'ri ish qiling.",
    culture_entrepreneurship_title: 'Tadbirkorlik', culture_entrepreneurship_tagline: "Jasorat bilan o'ylang.",
    culture_agility_title: 'Chaqqonlik', culture_agility_tagline: "O'zgarish orqali o'sing.",
    culture_one_title: 'Bitta STADA', culture_one_tagline: 'Bir jamoaning kuchi.', culture_values_cta: "Qiymatlarni ko'rish",
  },
};

// Regional facts share the Russian source wording across every country site.
const STADA_EURASIA_TEXT = {
  ru: [
    'В 2022 г. регион стран СНГ стал самостоятельным бизнес-подразделением и был переименован в STADA Евразия с прямым подчинением в штаб-квартиру в Германии.',
    'В регионе представлены 11 стран: Казахстан, Узбекистан, Беларусь, Азербайджан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Таджикистан, Туркменистан.',
  ],
  kz: [
    '2022 жылы ТМД елдері өңірі дербес бизнес-бөлімшеге айналып, Германиядағы бас кеңсеге тікелей бағынатын STADA Еуразия болып қайта аталды.',
    'Өңірге 11 ел кіреді: Қазақстан, Өзбекстан, Беларусь, Әзербайжан, Грузия, Молдова, Қырғызстан, Армения, Моңғолия, Тәжікстан, Түрікменстан.',
  ],
  kg: [
    '2022-жылы КМШ өлкөлөрүнүн аймагы өз алдынча бизнес-бөлүмгө айланып, Германиядагы башкы кеңсеге түздөн-түз баш ийген STADA Евразия деп кайра аталды.',
    'Аймакка 11 өлкө кирет: Казакстан, Өзбекстан, Беларусь, Азербайжан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Тажикстан, Түркмөнстан.',
  ],
  en: [
    'In 2022, the CIS region became an independent business unit and was renamed STADA Eurasia, reporting directly to the headquarters in Germany.',
    'The region comprises 11 countries: Kazakhstan, Uzbekistan, Belarus, Azerbaijan, Georgia, Moldova, Kyrgyzstan, Armenia, Mongolia, Tajikistan, and Turkmenistan.',
  ],
  ge: [
    '2022 წელს დსთ-ის ქვეყნების რეგიონი დამოუკიდებელ ბიზნესერთეულად ჩამოყალიბდა და ეწოდა STADA ევრაზია, რომელიც პირდაპირ ექვემდებარება გერმანიაში მდებარე სათავო ოფისს.',
    'რეგიონი მოიცავს 11 ქვეყანას: ყაზახეთს, უზბეკეთს, ბელარუსს, აზერბაიჯანს, საქართველოს, მოლდოვას, ყირგიზეთს, სომხეთს, მონღოლეთს, ტაჯიკეთსა და თურქმენეთს.',
  ],
  az: [
    '2022-ci ildə MDB ölkələri regionu müstəqil biznes bölməsinə çevrildi və Almaniyadakı baş qərargaha birbaşa tabe olan STADA Avrasiya adlandırıldı.',
    'Regiona 11 ölkə daxildir: Qazaxıstan, Özbəkistan, Belarus, Azərbaycan, Gürcüstan, Moldova, Qırğızıstan, Ermənistan, Monqolustan, Tacikistan və Türkmənistan.',
  ],
  hy: [
    '2022 թվականին ԱՊՀ երկրների տարածաշրջանը դարձավ ինքնուրույն բիզնես ստորաբաժանում և վերանվանվեց STADA Եվրասիա՝ անմիջականորեն ենթարկվելով Գերմանիայում գտնվող գլխավոր գրասենյակին։',
    'Տարածաշրջանն ընդգրկում է 11 երկիր՝ Ղազախստան, Ուզբեկստան, Բելառուս, Ադրբեջան, Վրաստան, Մոլդովա, Ղրղզստան, Հայաստան, Մոնղոլիա, Տաջիկստան և Թուրքմենստան։',
  ],
  ro: [
    'În 2022, regiunea țărilor CSI a devenit o unitate de afaceri independentă și a fost redenumită STADA Eurasia, raportând direct sediului central din Germania.',
    'Regiunea cuprinde 11 țări: Kazahstan, Uzbekistan, Belarus, Azerbaidjan, Georgia, Moldova, Kârgâzstan, Armenia, Mongolia, Tadjikistan și Turkmenistan.',
  ],
  uz: [
    '2022-yilda MDH mamlakatlari mintaqasi mustaqil biznes bo‘linmasiga aylandi va Germaniyadagi bosh qarorgohga bevosita bo‘ysunuvchi STADA Yevrosiyo deb qayta nomlandi.',
    'Mintaqaga 11 mamlakat kiradi: Qozog‘iston, O‘zbekiston, Belarus, Ozarbayjon, Gruziya, Moldova, Qirg‘iziston, Armaniston, Mo‘g‘uliston, Tojikiston va Turkmaniston.',
  ],
};
for (const [lang, [about_list1, about_list2]] of Object.entries(STADA_EURASIA_TEXT)) {
  Object.assign(FRONTEND_STATIC_TEXT[lang], { about_list1, about_list2 });
}

for (const [lang, labels] of Object.entries(STADA_SHARED_UI_TEXT)) {
  Object.assign(FRONTEND_STATIC_TEXT[lang], labels);
}

Object.entries(HOMEPAGE_CULTURE_STATIC_TEXT).forEach(([lang, text]) => {
  Object.assign(FRONTEND_STATIC_TEXT[lang], text);
});

Object.assign(FRONTEND_STATIC_TEXT.ru, {
  history_timeline_eyebrow: 'Путь сквозь время',
});
Object.assign(FRONTEND_STATIC_TEXT.kz, {
  history_timeline_eyebrow: 'Уақыт арқылы саяхат',
});
Object.assign(FRONTEND_STATIC_TEXT.kg, {
  history_timeline_eyebrow: 'Убакыт аркылуу саякат',
});
Object.assign(FRONTEND_STATIC_TEXT.en, {
  history_timeline_eyebrow: 'Journey through time',
});
Object.assign(FRONTEND_STATIC_TEXT.ge, {
  history_timeline_eyebrow: 'მოგზაურობა დროში',
});
Object.assign(FRONTEND_STATIC_TEXT.az, {
  history_timeline_eyebrow: 'Zamana səyahət',
});
Object.assign(FRONTEND_STATIC_TEXT.hy, {
  history_timeline_eyebrow: 'Ճանապարհորդություն ժամանակի միջով',
});
Object.assign(FRONTEND_STATIC_TEXT.ro, {
  history_timeline_eyebrow: 'Călătorie în timp',
  history_source_note: 'Etapele-cheie se bazează pe cronologia corporativă STADA.',
});
Object.assign(FRONTEND_STATIC_TEXT.uz, {
  history_timeline_eyebrow: 'Vaqt bo‘ylab sayohat',
  history_source_note: 'Asosiy bosqichlar STADA korporativ xronologiyasiga asoslangan.',
});

// UI strings must exist in the selected language rather than falling back to Russian.
const PATIENT_SAFETY_COPY = {
  kg: ['БЕЙТАПТАРДЫН КООПСУЗДУГУ', 'Фармакокөзөмөл', 'Адамдардын ден соолугу жана бакубаттуулугу — биздин башкы артыкчылыгыбыз. Эгер сиз бейтап, бейтапка кам көргөн адам же медициналык кызматкер болсоңуз, STADA өнүмдөрүнө байланыштуу жагымсыз көрүнүштөр жөнүндө кабарлаңыз. Бул маалымат өнүмдөрдүн жана бейтаптардын коопсуздугун камсыздоого жардам берет.', 'ЖАГЫМСЫЗ КӨРҮНҮШ ЖӨНҮНДӨ КАБАРЛОО'],
  ge: ['პაციენტების უსაფრთხოება', 'ფარმაკოზედამხედველობა', 'ადამიანების ჯანმრთელობა და კეთილდღეობა ჩვენი მთავარი პრიორიტეტია. თუ პაციენტი, მომვლელი ან ჯანდაცვის სპეციალისტი ხართ, გთხოვთ, შეგვატყობინოთ STADA-ს პროდუქტებთან დაკავშირებული არასასურველი მოვლენების შესახებ. ეს ინფორმაცია გვეხმარება პროდუქტებისა და პაციენტების უსაფრთხოების უზრუნველყოფაში.', 'არასასურველი მოვლენის შეტყობინება'],
  en: ['PATIENT SAFETY', 'Pharmacovigilance', 'People’s health and wellbeing are our top priority. If you are a patient, caregiver or healthcare professional, please report adverse events related to STADA products. This information helps us ensure product and patient safety.', 'REPORT AN ADVERSE EVENT'],
  az: ['PASİYENT TƏHLÜKƏSİZLİYİ', 'Farmakonəzarət', 'İnsanların sağlamlığı və rifahı əsas prioritetimizdir. Pasiyent, ona qulluq edən şəxs və ya tibb işçisisinizsə, STADA məhsulları ilə bağlı arzuolunmaz hadisələr barədə məlumat verin. Bu məlumat məhsulların və pasiyentlərin təhlükəsizliyini təmin etməyə kömək edir.', 'ARZUOLUNMAZ HADİSƏ BARƏDƏ MƏLUMAT VERİN'],
  hy: ['ՊԱՑԻԵՆՏՆԵՐԻ ԱՆՎՏԱՆԳՈՒԹՅՈՒՆ', 'Դեղազգոնություն', 'Մարդկանց առողջությունն ու բարեկեցությունը մեր գլխավոր առաջնահերթությունն են։ Եթե պացիենտ, խնամող կամ բուժաշխատող եք, խնդրում ենք հաղորդել STADA-ի արտադրանքի հետ կապված անցանկալի երևույթների մասին։ Այս տեղեկատվությունն օգնում է ապահովել արտադրանքի և պացիենտների անվտանգությունը։', 'ՀԱՂՈՐԴԵԼ ԱՆՑԱՆԿԱԼԻ ԵՐԵՎՈՒՅԹԻ ՄԱՍԻՆ'],
  ro: ['SIGURANȚA PACIENȚILOR', 'Farmacovigilență', 'Sănătatea și bunăstarea oamenilor sunt prioritatea noastră principală. Dacă sunteți pacient, îngrijitor sau profesionist din domeniul sănătății, vă rugăm să raportați reacțiile adverse asociate produselor STADA. Aceste informații ne ajută să asigurăm siguranța produselor și a pacienților.', 'RAPORTEAZĂ O REACȚIE ADVERSĂ'],
  uz: ['BEMORLAR XAVFSIZLIGI', 'Farmakonazorat', 'Insonlarning salomatligi va farovonligi bizning ustuvor vazifamizdir. Agar siz bemor, bemorga g‘amxo‘rlik qiluvchi yoki tibbiyot xodimi bo‘lsangiz, STADA mahsulotlari bilan bog‘liq nojo‘ya hodisalar haqida xabar bering. Bu ma’lumot mahsulotlar va bemorlar xavfsizligini ta’minlashga yordam beradi.', 'NOJO‘YA HODISA HAQIDA XABAR BERISH'],
};
Object.entries(PATIENT_SAFETY_COPY).forEach(([lang, values]) => {
  ['pharmacovigilance_kicker', 'pharmacovigilance_heading', 'pharmacovigilance_description', 'pharmacovigilance_report_label'].forEach((key, index) => {
    FRONTEND_STATIC_TEXT[lang][key] = values[index];
  });
});
['ro', 'uz'].forEach(lang => {
  Object.entries(FRONTEND_STATIC_TEXT.en).forEach(([key, value]) => {
    if (/^product_.*_name$/.test(key) && !FRONTEND_STATIC_TEXT[lang][key]) FRONTEND_STATIC_TEXT[lang][key] = value;
  });
});
Object.entries({
  ru: 'Информация о продукте', kz: 'Өнім туралы ақпарат', kg: 'Өнүм тууралуу маалымат', ge: 'ინფორმაცია პროდუქტის შესახებ',
  en: 'Product information', az: 'Məhsul haqqında məlumat', hy: 'Տեղեկություն արտադրանքի մասին', ro: 'Informații despre produs', uz: 'Mahsulot haqida ma’lumot',
}).forEach(([lang, label]) => { FRONTEND_STATIC_TEXT[lang].product_information_label = label; });

const LOCALIZED_BACKEND_DOM_TEXT = {
  kz: {
    history_text_001: 'STADA - Компания тарихы',
    history_text_002: 'STADA 1895-2022',
    history_text_003: 'Компания тарихы',
    history_text_004: '130 жылдан астам сапа, қолжетімділік және адамдар денсаулығына қамқорлық.',
    history_text_005: 'Хронологияны көру',
    history_text_006: '1895',
    history_text_007: 'Дәріханалық бастаулар',
    history_text_008: 'Фармацевтер дәрілерді бірыңғай стандарттармен, бірдей қаптамада және бір бағада шығару үшін бірікті.',
    history_text_009: '1975',
    history_text_010: 'Дженериктерге бетбұрыс',
    history_text_011: 'STADA өнім желісін дженериктермен кеңейтіп, болашақ халықаралық өсудің негізін қалады.',
    history_text_012: '1997',
    history_text_013: 'Биржаға шығу',
    history_text_014: 'STADA акциялары алғаш рет Франкфурт және Дюссельдорф биржаларындағы ресми саудаға жіберілді.',
    history_text_015: '2022',
    history_text_016: 'Тұрақты өсу',
    history_text_017: 'Компания өндірісті, specialty бағытын және биосимилярларды кеңейтіп, тұрақты даму туралы алғашқы жаһандық есебін жариялады.',
    history_text_018: '1895-1933',
    history_text_019: '1933-1948',
    history_text_020: '1948-1961',
    history_text_021: '1961-1975',
    history_text_022: '1975-1993',
    history_text_023: '1993-2000',
    history_text_024: '2000-2005',
    history_text_025: '2005-2010',
    history_text_026: '2010-2015',
    history_text_027: '2016-2022',
    history_text_028: 'Уақыт арқылы саяхат',
    history_text_029: 'STADA-ның ұрпақтар арқылы жолы',
    history_text_030: '1895-1933',
    history_text_031: 'Бірыңғай стандарт идеясының тууы',
    history_text_032: 'Фармацевтер бірге көбірек нәтижеге жету үшін бірікті: препараттар бірдей ережелермен өндіріліп, біркелкі қапталып, бір бағада сатылды.',
    history_text_033: '1895',
    history_text_034: 'STADA тарихының басталуы',
    history_text_035: '1895 жылғы 14 наурыз STADA-ның бастауы саналады: Берлин, Дрезден, Вюрцбург, Дармштадт және басқа қалалардағы фармацевтер препараттарды бірге шығара бастады.',
    history_text_036: '1903',
    history_text_037: 'Дәріханалық препараттарды реттеу',
    history_text_038: 'Неміс фармацевтер қауымдастығы фармацевтикалық арнайы өнімдерді дербес өндіру ережелерін бекітті: шығарудан және таңбалаудан бастап қаптама мен бағаға дейін.',
    history_text_039: '1908',
    history_text_040: 'Қауымдастықтың мамандандырылған компаниясы',
    history_text_041: 'Неміс фармацевтер қауымдастығының мамандандырылған компаниясы құрылып, қатысушыларға препараттарды бірдей талаптармен шығаруға мүмкіндік берді.',
    history_text_042: '1933',
    history_text_043: 'Жаңа ұйымдастырушылық форма',
    history_text_044: 'Қауымдастық St.d.A кәсіби қоғамдастығына өткеннен кейін мамандандырылған компания Неміс фармацевтер қауымдастығының өз препараттары бөліміне айналды.',
    history_text_045: '1933-1948',
    history_text_046: 'STADA қауымдастық белгісі ретінде',
    history_text_047: 'Екінші дүниежүзілік соғыстан кейін STADA қауымдастық сауда маркасына айналып, бизнес Солтүстік және Оңтүстік атты екі кооперативтік құрылым арқылы қайта іске қосылды.',
    history_text_048: '1935',
    history_text_049: 'STADA брендінің пайда болуы',
    history_text_050: 'St.d.A қысқартуы тіркелген STADA белгісіне айналып, стандартты формулалар бойынша шығарылатын дәріханалық препараттардың ортақ атауы болды.',
    history_text_051: '1938',
    history_text_052: 'Мюнхендегі филиал',
    history_text_053: 'STADA Мюнхенде филиал ашты. 1944 жылғы бомбалаудан кейін кеңселер Галлеге көшірілді, бірақ соғыс соңында жұмыс тоқтады.',
    history_text_054: '1948',
    history_text_055: 'Соғыстан кейін қайта іске қосылу',
    history_text_056: 'STADA бұрынғы ГФР аумағында екі кооператив ретінде қайта құрылды: Эссендегі STADA North және Тюбингендегі STADA South, негізгі назар өзін-өзі емдеуге арналған өнімдерге аударылды.',
    history_text_057: '1948-1961',
    history_text_058: 'Өндірістік компанияға көшу',
    history_text_059: 'Соғыстан кейінгі екі кооператив бірігіп, Бад-Фильбель/Дортельвайльдегі алаң болашақ өнеркәсіптік өсудің негізіне айналды.',
    history_text_060: '1954',
    history_text_061: 'Бірыңғай компания',
    history_text_062: 'STADA North және STADA South Stada, Standardpräparate Deutscher Apotheken eGmbH болып бірікті, компания Франкфурт-на-Майнға көшті және STADA тауар белгісі тіркелді.',
    history_text_063: '1957',
    history_text_064: 'Бад-Фильбельдегі алаң',
    history_text_065: 'Компания Франкфурт маңындағы үй-жайларды сатып алып, онда заманауи фармацевтикалық өндірістік база біртіндеп қалыптасты.',
    history_text_066: '1961',
    history_text_067: 'Орталықтандырылған өндіріс',
    history_text_068: 'Өкілдер жиналысы STADA препараттарын тек дәріханаларда ғана емес, Дортельвайльде орталықтандырылған түрде де өндіруге болады деп шешті.',
    history_text_069: '1961-1975',
    history_text_070: 'Заманауи индустриялық компанияның негізі',
    history_text_071: 'STADA өз препараттарының көтерме саудасын бастады, құқықтық формасын өзгертті және фармацевтермен тығыз байланысын сақтады.',
    history_text_072: '1970',
    history_text_073: 'Акционерлік модельге көшу',
    history_text_074: 'Кооператив көбірек капитал тартып, тұрақты даму үшін корпорацияға айналды; бұл кезеңде акциялар тек фармацевтерге қолжетімді болды.',
    history_text_075: '1971',
    history_text_076: 'Топтың жаңа компаниялары',
    history_text_077: 'NIDDAPHARM GmbH және STADA-CHEMIE GmbH құрылды, сондай-ақ STADA UZARA-Werk GmbH компаниясын сатып алды.',
    history_text_078: '1975-1993',
    history_text_079: 'Дженериктер және алғашқы халықаралық қадамдар',
    history_text_080: 'Дженериктерді дамыту шешімі негізгі бетбұрыс болды: компания қайта құрылып, тез өсіп, шетелдік нарықтарға шықты.',
    history_text_081: '1975',
    history_text_082: 'STADAPHARM және дженериктер',
    history_text_083: 'STADA желісін дженериктермен кеңейтті, STADAPHARM GmbH құрды, алғашқы лицензияларды алды; табысты өнімдердің бірі Nifedipin STADA болды.',
    history_text_084: '1986',
    history_text_085: 'Алғашқы шетелдік инвестициялар',
    history_text_086: 'Швейцариялық Helvepharm AG сатып алынған соң STADA алғаш рет шетелге шықты. Кейін Австрияда STADA GmbH Austria, Бельгияда Eurogenerics SA және Нидерландта Centrafarm BV пайда болды.',
    history_text_087: '1992',
    history_text_088: 'Азиядағы бастау',
    history_text_089: 'STADA Азиядағы қызметін Гонконгтағы STADA Pharmaceuticals (Asia) Ltd. арқылы бастады.',
    history_text_090: '1993-2000',
    history_text_091: 'Жаһандық ойыншы және биржалық тарих',
    history_text_092: '100 жылдығына қарай бизнес қарқынды өсіп, STADA сатылым бойынша Германия саласының топ-10 қатарына кірді және халықаралық экспансиясын жалғастырды.',
    history_text_093: '1993',
    history_text_094: 'Фармацевт емес акционерлер',
    history_text_095: 'Алғаш рет STADA акционерлері фармацевтер мен компания қызметкерлері ғана емес, басқа инвесторлар да бола алды.',
    history_text_096: '1995',
    history_text_097: 'Холдингтік құрылым',
    history_text_098: 'STADA Бад-Фильбельдегі орташа холдингке қайта ұйымдасты; STADAPharm GmbH және STADA OTC Arzneimittel GmbH рецептуралық және OTC препараттардың негізгі маркетингін өз мойнына алды.',
    history_text_099: '1996',
    history_text_100: 'ALIUD және жаңа нарықтар',
    history_text_101: 'STADA ALIUD PHARMA GmbH компаниясын екінші неміс дженерик желісі ретінде сатып алып, Франция мен Чехияда кеңейді.',
    history_text_102: '1997',
    history_text_103: 'IPO',
    history_text_104: '29 қазанда STADA акциялары алғаш рет Франкфурт және Дюссельдорф қор биржаларындағы ресми саудаға жіберілді.',
    history_text_105: '1998',
    history_text_106: 'Портфельді кеңейту',
    history_text_107: 'Атаулы акциялармен IPO аяқталып, STADA Даниядағы активтерді, Onkologika компаниясын және Fresenius рецептуралық брендтер пакетін сатып алды.',
    history_text_108: '1999',
    history_text_109: 'Таиланд, Испания, Италия',
    history_text_110: 'Халықаралық даму жеделдеді: Бангкокта STADA Asiatic Co. Inc. іске қосылды, Испаниядағы Ciclum Farma және Италиядағы EG S.p.A компанияларына инвестиция салынды.',
    history_text_111: '2000',
    history_text_112: 'Ирландия және акцияларды бөлшектеу',
    history_text_113: 'STADA Ирландия дженериктер нарығының көшбасшысы Clonmel Healthcare Ltd. компаниясын сатып алып, жай және артықшылықты акцияларды 1:10 қатынасында бөлшектеді.',
    history_text_114: '2000-2005',
    history_text_115: 'Индекстер, биодженериктер және Ресей',
    history_text_116: 'STADA MDAX және Euro Stoxx 600 индекстеріне кіріп, биодженериктер әзірлеуді бастады және Ресейге стратегиялық кіруді қоса алғанда халықаралық қатысуын күшейтті.',
    history_text_117: '2001',
    history_text_118: 'Биодженериктер және MDAX',
    history_text_119: 'Биодженериктерді әзірлеу басталды, Азия бизнесі кеңейді, түсім 500 млн еуродан асты, артықшылықты акциялар жай акцияларға айырбасталды және STADA MDAX құрамына кірді.',
    history_text_120: '2002',
    history_text_121: 'АҚШ, Испания және EuroSTOXX 600',
    history_text_122: 'Компания STADA Inc. арқылы АҚШ нарығына шықты, Испания мен Италиядағы позициясын күшейтті, жергілікті брендтерді сатып алды және EuroSTOXX 600 индексіне кірді.',
    history_text_123: '2003',
    history_text_124: 'Жаңа активтер және білім беру бастамасы',
    history_text_125: 'STADA Италиядағы New Pharmajani компаниясына инвестиция салды, Europa Fachhochschule Fresenius-пен бірге health management профессорлық кафедрасын жариялады, Schein Pharmaceuticals UK және redinomedica брендтер пакетін сатып алды.',
    history_text_126: '2004',
    history_text_127: 'Nizhpharm',
    history_text_128: 'Акциялар іс жүзінде 1:1 бөлшектелді, Италиядағы брендтік портфель күшейді, ал Nizhpharm-ның шамамен 97,5%-ын сатып алу Ресейдегі маңызды қадам болды.',
    history_text_129: '2005',
    history_text_130: 'Португалия, Қытай және Mobilat',
    history_text_131: 'STADA Португалиядағы Ciclum Farma, Қытайдағы Beijing Center-Lab Pharmaceutical Company компаниясының 58%-ын және Mobilat кіретін 11 еуропалық бренд пакетін сатып алды.',
    history_text_132: '2005-2010',
    history_text_133: 'Hemofarm, биосимилярлар және тиімділік',
    history_text_134: 'Компания стратегиялық маңызды Hemofarm компаниясын сатып алып, топтың алғашқы биосимилярын іске қосты және алғашқы корпоративтік bond орналастырды.',
    history_text_135: '2006',
    history_text_136: 'Hemofarm',
    history_text_137: 'STADA АҚШ-тағы бизнестен шығып, Сербияның Вршац қаласындағы Hemofarm A.D. компаниясын сатып алды.',
    history_text_138: '2007',
    history_text_139: 'MAKIZ және Forum Bioscience',
    history_text_140: 'STADA MAKIZ Group арқылы Ресейдегі қатысуын күшейтіп, британдық Forum Bioscience Holdings Ltd. компаниясын сатып алды.',
    history_text_141: '2008',
    history_text_142: 'Топтың алғашқы биосимиляры',
    history_text_143: 'Неміс cell pharm компаниясы созылмалы бүйрек жеткіліксіздігі және химиотерапия кезіндегі анемияны емдеуге арналған алғашқы STADA биосимилярын ұсынды; Германияда препарат Silapo атауымен сатылды.',
    history_text_144: '2010',
    history_text_145: 'Алғашқы корпоративтік bond',
    history_text_146: 'STADA алғашқы корпоративтік bond-ты сәтті орналастырып, STADA - build the future тиімділік бағдарламасын іске қосты.',
    history_text_147: '2010-2015',
    history_text_148: 'Брендтік портфельдің өсуі',
    history_text_149: 'Компания брендтік өнімдерді белсенді сатып алып, тиімділік бағдарламасын мерзімінен бұрын аяқтады және британдық OTC өндірушісі Thornton & Ross компаниясын сатып алды.',
    history_text_150: '2011',
    history_text_151: 'Cetraben және Gedeon Richter-пен серіктестік',
    history_text_152: 'STADA Cetraben сатып алып, Gedeon Richter-пен екі биосимиляр әзірлеуді бастады және Шығыс Еуропа мен Таяу Шығысқа арналған Grünenthal портфелін сатып алды.',
    history_text_153: '2012',
    history_text_154: 'Spirig және Австралия',
    history_text_155: 'Орталық Еуропадағы ЕО нарықтарына арналған Grünenthal портфелі сатып алынды, швейцариялық Spirig Pharma AG алынды, Австралияда еншілес компания құрылды, ал тиімділік бағдарламасы аясында жеке өндірістік алаңдар сатылды.',
    history_text_156: '2013',
    history_text_157: 'STADA diagnostics және Thornton & Ross',
    history_text_158: 'STADA дербестендірілген терапияға кірді, Германияда алғашқылардың бірі болып 2D-штрихкод енгізді, Thornton & Ross сатып алды, Сербияда IT shared service center құрды, Grastofil лицензиялады, Мьянмада кеңейді және екінші corporate bond орналастырды.',
    history_text_159: '2014',
    history_text_160: '2 млрд еуро сатылым',
    history_text_161: 'Дубайда логистикалық орталық ашылды, STADA сатылымы алғаш рет 2 млрд еуродан асты, Ресейге арналған Aqualor және Ұлыбритания мен Ирландияға арналған Flexitol құқықтары сатып алынды.',
    history_text_162: '2015',
    history_text_163: '120 жылдық',
    history_text_164: 'STADA 120 жылдығын атап өтті, STADA Diagnostik-ті Ebola экспресс-тестімен кеңейтті, Еуропаға арналған Pegfilgrastim лицензиялады, SCIOTEC және аргентиналық Laboratorio Vannier сатып алды, ал CROMA-PHARMA-пен ынтымақтастық aesthetics бағытын күшейтті.',
    history_text_165: '2016-2022',
    history_text_166: 'Жаңа өсу мәдениеті және specialty фокусы',
    history_text_167: 'STADA халықаралық брендтік өнімдерді, биосимилярларды, specialty бағытын және тұрақты дамуды күшейтті.',
    history_text_168: '2016',
    history_text_169: 'Брендтік өнімдерге фокус',
    history_text_170: 'Табысты Branded Products өнімдерін мақсатты халықаралық дамыту басталды.',
    history_text_171: '2017',
    history_text_172: 'Bain Capital және Cinven',
    history_text_173: 'Bain Capital және Cinven тарапынан ерікті ашық сатып алу ұсынысы сәтті өтті; иелік үлесі шамамен 65%-ға жетті.',
    history_text_174: '2018',
    history_text_175: 'Ladival, Nizoral және жаңа CEO',
    history_text_176: 'STADA Ladival құқықтарын қайтарды, Nizoral бойынша EMEA құқықтарын сатып алды, BIOCEUTICALS мажоритарлық акционері болды, Peter Goldschmidt CEO болып, корпоративтік мәдениет процесін бастады; делистинг жарияланды.',
    history_text_177: '2019',
    history_text_178: 'Күшті портфель және One STADA құндылықтары',
    history_text_179: 'Компания GSK OTC портфелін сатып алды, Movymia және Bortezomib STADA іске қосты, Nizoral сатылымын EMEA-да бастады, Walmark сатып алды, Ресей/ТМД-дағы Takeda OTC портфеліне инвестиция салды, Alvotech-пен серіктестік жасады және Biopharma Ukraine бизнесін сатып алды.',
    history_text_180: '2020',
    history_text_181: 'Alvotech және Lobsor',
    history_text_182: 'STADA Еуропаға арналған жеті биосимиляр бойынша Alvotech-пен стратегиялық серіктестік жасады және Паркинсон ауруына арналған препарат құқықтарымен бірге Lobsor Pharmaceuticals компаниясын сатып алды.',
    history_text_183: '2021',
    history_text_184: 'Sanofi, Calliditas және биосимилярлар',
    history_text_185: 'Паркинсон ауруының кеш сатысына арналған заманауи помпалық технологиялы жаңа өнім, oncology-биосимиляр bevacizumab іске қосылды, Sanofi-дің 16 consumer healthcare бренді сатып алынды, ал Calliditas Therapeutics-пен Еуропадағы IgA-нефропатия бойынша серіктестік жасалды.',
    history_text_186: '2022',
    history_text_187: 'Өндіріс, specialty және тұрақтылық',
    history_text_188: 'STADA Румыниядағы құны 50 млн еуродан асатын нысанмен өндірістік желісін кеңейтті, Kinpeygo іске қосты, Еуропада жоғары концентрациялы adalimumab biosimilar шығарды, алғашқы жаһандық Sustainability Report жариялап, ең тұрақты фармкомпаниялардың топ-10% қатарына кірді.',
    history_text_189: 'stada.com'
  }
};

// Supplied corporate copy snapshot. Generated from backend/data/supplied-copy.json.
const STADA_SUPPLIED_COPY = {
  "version": 1,
  "sourceFolder": "Тексты для корп.сайтов",
  "languages": {
    "ru": {
      "source": "РУС/Stada.kz.docx",
      "text": {
        "about_par1": "STADA – международная фармацевтическая компания, которая уже более 130 лет следует своей миссии - \"Заботиться о здоровье людей, выстраивая доверительные отношения с партнерами и потребителями\". Ключевые направления STADA – это продукты сегмента Consumer Healthcare (CHC), дженерики и специализированные препараты (включая биосимиляры). Продукция STADA представлена более чем в 120 странах мира.",
        "about_par2": "В 2022 г. регион стран СНГ стал самостоятельным бизнес-подразделением и был переименован в STADA Евразия с прямым подчинением в штаб-квартиру в Германии. В регионе представлены 11 стран: Казахстан, Узбекистан, Беларусь, Азербайджан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Таджикистан, Туркменистан.",
        "about_list1": "Головной офис STADA Евразия находится в Алматы, Казахстан. Компания также зарегистрировала юридические лица STADA Arzneimittel AG в большинстве стран региона. С 01 апреля 2023 г. STADA представляет в регионе портфель безрецептурных препаратов компании Sanofi.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Заботиться о здоровье людей в качестве надежного партнера",
        "about_page_overview_1": "STADA – международная фармацевтическая компания, которая уже более 130 лет следует своей миссии - \"Заботиться о здоровье людей, выстраивая доверительные отношения с партнерами и потребителями\". Ключевые направления STADA – это продукты сегмента Consumer Healthcare (CHC), дженерики и специализированные препараты (включая биосимиляры). Продукция STADA представлена более чем в 120 странах мира.",
        "about_page_intro_2": "В 2022 г. регион стран СНГ стал самостоятельным бизнес-подразделением и был переименован в STADA Евразия с прямым подчинением в штаб-квартиру в Германии. В регионе представлены 11 стран: Казахстан, Узбекистан, Беларусь, Азербайджан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Таджикистан, Туркменистан.",
        "about_page_intro_3": "Головной офис STADA Евразия находится в Алматы, Казахстан. Компания также зарегистрировала юридические лица STADA Arzneimittel AG в большинстве стран региона. С 01 апреля 2023 г. STADA представляет в регионе портфель безрецептурных препаратов компании Sanofi.",
        "culture_purpose_heading": "МИССИЯ И ЦЕННОСТИ",
        "culture_purpose_statement": "Заботиться о здоровье людей в качестве надежного партнера",
        "culture_purpose_text_1": "STADA — международная фармацевтическая компания, которая уже более 130 лет следует своей миссии — заботиться о здоровье людей в качестве надежного партнера. STADA стремится к тому, чтобы препараты, произведенные компанией, были уверенным выбором профессионалов и потребителей во всех странах ее присутствия.",
        "culture_purpose_text_2": "Ключевые направления бизнеса STADA — сегмент Consumer Healthcare (безрецептурные препараты, пищевые добавки, косметика, медицинские изделия) и генерики, включая специализированные препараты. Компания уделяет приоритетное внимание качеству продукции: собственные и контрактные производственные площадки компании во всем мире работают в соответствии с едиными международными стандартами качества (GMP).",
        "culture_values_heading": "Наши ценности",
        "culture_values_eyebrow": "Наши ценности",
        "culture_values_intro": "Общие ценности позволяют нам достигать амбициозных целей, обеспечивая рост и успех STADA в долгосрочной перспективе.",
        "about_compliance_heading": "КОМПЛАЕНС",
        "about_compliance_intro_1": "Наша компания стремится быть лучшей во всем, включая соблюдение норм этического делового поведения и комплаенс. Следуя нашей миссии, мы осознаем свою ответственность перед потребителями и поэтому не идем на компромиссы в вопросах честной и добросовестной работы.",
        "about_compliance_intro_2": "Мы строго руководствуемся требованиями законодательства и нашими ценностями, которые закреплены в Кодексе поведения. Этичное и ответственное деловое поведение — это неотъемлемая составляющая часть корпоративной культуры, которая служит основой для укрепления доверия к нашей компании.",
        "about_compliance_speakup_heading": "Speak up Портал и общий почтовый ящик Группы Комплаенс и Этики Евразии",
        "about_compliance_speakup_text": "Мы считаем, что каждый человек, независимо от того, работает он в компании или нет, должен иметь возможность сообщать о случаях неэтичного и неправомерного поведения персонала компании, ее партнеров, поставщиков и подрядчиков.",
        "about_compliance_tools_text": "Для этого в группе компаний STADA внедрена система информирования — это Speak up Портал, а также общий почтовый ящик eurasia_compliance@stada.kz Группы Комплаенс и Этики Евразии, данные инструменты позволяют любому лицу направлять сообщения о случаях и фактах несоблюдения норм и требований комплаенс, а именно, но не ограничиваясь:",
        "about_compliance_item_fraud": "мошенничества,",
        "about_compliance_item_corruption": "коррупции,",
        "about_compliance_item_competition": "нарушений в сфере защиты конкуренции (антимонопольных требований),",
        "about_compliance_item_conflict": "конфликта интересов.",
        "about_compliance_report_text": "Если Вам стало известно о подобных случаях неправомерного поведения, напишите нам по адресу: eurasia_compliance@stada.kz или напрямую заполните обращение на Портале, пройдя по ссылке Www.compliance-reporting-portal.stada.com.",
        "about_compliance_confidentiality": "Группа компаний STADA гарантирует конфиденциальность поступившей информации.",
        "about_compliance_questions": "На почтовый ящик Группы Комплаенс и Этики: eurasia_compliance@stada.kz вы можете отправлять любые интересующие вас вопросы и предложения по улучшению совместной работы во благо пациентов и потребителей.",
        "about_pv_heading": "ФАРМАКОНАДЗОР",
        "about_pv_text": "Забота о здоровье и благополучии людей является ключевым приоритетом нашей компании.  Независимо от того, являетесь ли вы пациентом, лицом, осуществляющим уход, или медицинским работником, важно сообщать о нежелательных явлениях, связанных с продуктами STADA. Предоставляемая вами информация помогает обеспечить безопасность нашей продукции и наших пациентов.",
        "about_pv_contact_label": "Просим вас сообщать обо всех случаях нежелательных явлений на лекарственные препараты STADA по нижеследующим контактным данным:",
        "about_leadership_intro": "Куаныш Оспанов, Наталья Гарипова",
        "about_leader_ospanov_name": "Куаныш Оспанов",
        "about_leader_garipova_name": "Наталья Гарипова",
        "culture_integrity_title": "ПОРЯДОЧНОСТЬ",
        "culture_integrity_tagline": "Каждый из нас действует в соответствии с корпоративными и общепринятыми этическими стандартами. В основе нашей деятельности — свобода высказывания и уважение друг к другу.",
        "culture_entrepreneurship_title": "ПРЕДПРИНИМАТЕЛЬСТВО",
        "culture_entrepreneurship_tagline": "Каждый из нас привносит новые идеи и решения, вносит вклад в рост и развитие компании.",
        "culture_agility_title": "АДАПТИВНОСТЬ",
        "culture_agility_tagline": "Каждый их нас — лидер изменений. Гибкость и решительность — основа нашего развития и пути к успеху.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Мы действуем в интересах компании в целом, успех STADA более важен, чем интересы отдельных функций и подразделений.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "История STADA началась 14 марта 1895 года в немецком городе Дрездене. Местные фармацевты объединились в ассоциацию и создали стандартизированные препараты для обеспечения эффективного и недорогого общественного здравоохранения.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Немецкая фармацевтическая ассоциация создает единый подход в производстве. Лекарства изготавливаются в разных аптеках, но по единой рецептуре, в идентичной упаковке, продают по одной и той же цене. Так появляется аббревиатура St.d.A - Standard Arzneimittel die Deutscher Apotheke, что в переводе на русский язык означает «стандарт препаратов немецких аптек». Она зарегистрирована как торговая марка.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "Разделенная во время Второй мировой войны на две компании — Южную и Северную — STADA вновь объединяется в 1954-м и обосновывается в городе Бад-Фильбель, недалеко от Франкфурта-на-Майне.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA выходит на новый уровень: приступает к производству лекарственных препаратов в промышленных масштабах на производственной площадке в пригороде Франкфурта-на-Майне (а не в аптеках, как раньше).",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "Переломный год для STADA. Компания преобразована в акционерное общество, что дает новый толчок для ее развития.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Компания принимает решение сконцентрироваться на производстве и продаже генериковых препаратов (непатентованных лекарственных средств).",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA начинает расширять международное присутствие благодаря открытию представительств в Европе и Азии, а также активной стратегии по слияниям и поглощениям.",
        "supplied_history_date_7": "C 1993 по 2000",
        "supplied_history_text_7": "В свой 100-летний юбилей бизнес находится на подъеме. Компания входит в десятку лидеров немецкой промышленности по объему продаж. В 1997/1998 годах было проведено IPO. Основными направлениями деятельности компании являются производство дженериков и безрецептурных препаратов. STADA продолжает последовательно следовать своей стратегии интернационализации и превращается в динамичного глобального игрока.",
        "supplied_history_date_8": "С 2005 по 2010 год",
        "supplied_history_text_8": "STADA приобретает сербскую компанию Hemofarm AG, которая является стратегически важной для Группы. Немецкая дочерняя компания STADA представляет первый биосимиляр. STADA успешно размещает свои первые корпоративные облигации.",
        "supplied_history_date_9": "С 2010 по 2015",
        "supplied_history_text_9": "STADA совершает успешные приобретения в области производства фирменных продуктов, что становится все более важным для Группы. Программа повышения эффективности затрат в рамках всей Группы \"STADA - строим будущее\" успешно завершена с опережением графика. STADA приобретает британского производителя безрецептурных товаров Thornton & Ross.",
        "supplied_history_date_10": "С 2019 по 2020",
        "supplied_history_text_10": "STADA AG усиливает позиции на рынках Центральной и Восточной Европы, России и Евразии благодаря закрытию нескольких крупных сделок — Walmark, GSK и Takeda. STADA становится лидером сегмента Consumer Healthcare.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA продолжает укреплять бизнес по направлению Specialty. Компания представила первый глобальный отчет об устойчивом развитии и вошла в число 10% наиболее устойчивых фармацевтических компаний.",
        "supplied_history_heading": "ИСТОРИЯ:",
        "hero_text1": "STADA в Казахстане отмечена наградами «Прорыв года» и «Лидер года».",
        "news_1_text": "Консалтинговым агентством Vi-ORTIS, ведущим экспертную аналитику фармацевтического рынка отмечены заслуги STADA на рынке Казахстана.\n\nКомпания заняла уверенную позицию «Лидер года 2023» на розничном рынке. Помимо прочего STADA укрепила лидерские позиции, завоевав «Прорыв года» в сегменте ОТС с брендом “Энтерожермина” и сегменте RX с брендом “Ксефокам”.\n\nВ общей сложности STADA была отмечена по пяти категориям:\n\n\"Прорыв Года\" на розничном рынке в сегменте СНС\n\n\"Прорыв Года\" на розничном рынке в сегменте ОТС\n\n\"Лидер Года\" на розничном рынке\n\n3-е место на розничном рынке Изделий Медицинского Назначения\n\n3-е место на розничном рынке, в сегменте СНС",
        "hero_text2": "STADA Евразия получила награду на Eurasian Pharma Awards",
        "news_2_text": "Награда получена в номинации «Партнерство года» за успешное присоединение портфеля Sanofi.\n\nВ рамках Евразийского фармацевтического саммита была проведена церемония награждения, знаковая для игроков фармотрасли евразийского региона.\n\nEurasian Pharma Awards - это яркое событие, объединяющее передовые компании и профессионалов фармацевтической сферы стран Средней Азии, Кавказа и Восточной Европы. Конкурс ежегодно проводится в 16 уникальных номинациях, отражающих разнообразие и инновационность отрасли.\n\nАрминас Мацевичус, Вице-президент STADA Евразия принял награду из рук организаторов конкурса. «После присоединения продуктов Sanofi к портфелю STADA в Евразии, компании удалось значительно укрепить и без того сильные позиции в сегменте СНС (Consumer Healthcare) и в планах дальнейшее развитие данных направлений как через инвестиции, так, возможно, и путем привлечения партнеров, таких как Sanofi» - отметил спикер.\n\nВ 2022 году STADA и Sanofi заключили соглашение о дистрибуции портфеля CHC продуктов в ряде евразийских стран. В рамках соглашения STADA осуществляет дистрибуцию и маркетинговую поддержку портфеля препаратов компании Sanofi, состоящего из известных брендов в сфере потребительского здравоохранения в 10 странах региона Евразия с 01 апреля 2023 г.\n\nВ соглашение вошли 19 хорошо себя зарекомендовавших на рынках стран Евразии продуктов, которым доверяют потребители, которые имеют высокие показатели знания бренда, и, во многих случаях, занимают лидирующие позиции на рынке.",
        "hero_text3": "Глава государства провел встречу с вице-президентом компании STADA Group Кристосом Галлисом",
        "news_3_text": "В ходе встречи были обсуждены перспективы сотрудничества в сфере здравоохранения и фармацевтики.\n\nКасым-Жомарт Токаев отметил, что компания STADA входит в тройку лидеров на рынке Казахстана в сегменте потребительских товаров для здоровья. По его словам, ярким примером успешного и динамично развивающегося сотрудничества является открытие офиса компании в Алматы.\n\nПрезидент акцентировал внимание на том, что в Казахстане ведется активная работа по созданию биотехнологического кластера.\n\nПо мнению Главы государства, перед STADA открываются широкие возможности для объединения усилий с национальным холдингом QazBioPharm в области исследований и производства.\n\nКасым-Жомарт Токаев пригласил немецкую компанию к проведению совместных исследований и разработок, организации производства, обмену опытом и повышению квалификации специалистов.\n\nВ свою очередь Кристос Галлис выразил заинтересованность в углублении сотрудничества и подчеркнул готовность компании изучить возможности инвестирования в медицинские проекты и программы в Казахстане.\n\nSTADA является одним из ведущих производителей высококачественных лекарственных средств. Компания реализует свою продукцию в 120 странах мира.",
        "news_4_title": "Кристос Галлис: Создание биотехнологического кластера – очень амбициозная задача.",
        "news_4_text": "Вице-президент STADA Group рассказал о тенденциях на рынке и о том, опыт каких стран может перенять РК\n\nПо прогнозам IQVIA Institute for Human Data Science, мировой рынок лекарственных средств будет расти в среднем на 3-6% в течение трех лет. Аналитики предполагают, что к 2027 году он достигнет около 1,9 трлн долларов. Вице-президент STADA Group Кристос Галлис считает, что для развития фарминдустрии в Казахстане необходимо ускорить процедуру регистрации лекарственных средств. «По расчетам наших коллег, работающих на фармрынке и имеющих большое портфолио в госсегменте, от начала подготовки досье до момента выхода инновационного препарата на рынок требуется от 3,5 до 5 лет. Такие длительные сроки регистрации являются одной из главных причин, почему фармкомпании принимают решение не выводить свои лекарства на казахстанский рынок», - считает эксперт. В беседе с корреспондентом центра деловой информации Kapital.kz он также рассказал об итогах исследования Health Report 2023, почему многие фармацевтические компании вынуждены повышать цены на препараты и какая база необходима нашей стране для создания биотехнологического кластера.\n\nПодробнее: Кристос Галлис: Создание биотехнологического кластера – очень амбициозная задача - Капитал (kapital.kz)",
        "news_5_title": "STADA намерена усилить позиции в госпитальном сегменте в Евразии",
        "news_5_text": "С 26 по 28 сентября в Самарканде пройдет IV Евразийский фармацевтический саммит. Бизнес-издание «Курсив Узбекистан» выступит генеральным информационным партнером мероприятия.В рамках грядущего саммита «Курсив» начинает публикацию мнений глобальных и региональных игроков фармацевтического рынка.\n\nВице-президент в регионе Евразия компании Stada Арминас Мацевичус.Компания продолжит взаимодействие с регуляторными органами региона.\n\n– Арминас, какие приоритеты стоят перед вашей компанией в регионе Евразия? В каких странах и в сегментах вы видите наибольшие перспективы для STADA?\n\n– После присоединения продуктов Sanofi к портфелю STADA в Евразии мы значительно укрепили наши и без того сильные позиции в сегменте СНС (Consumer Healthcare). Безусловно, мы будем развивать это направление как через инвестиции, так, возможно, и путем привлечения партнеров, таких как Sanofi.\n\nПри этом в течение ближайших нескольких лет компания намерена усилить позиции в госпитальном сегменте и рецептурном бизнесе. В странах Евразии, где есть процедура признания и/или упрощенной регистрации (например, в Молдове, Узбекистане, Грузии) мы уже зарегистрировали ряд новых европейских рецептурных препаратов.\n\nБудем продолжать эту работу, а также взаимодействовать с регуляторными органами всех наших стран по дальнейшему упрощению процедуры доступа на рынок.\n\nВ среднесрочной и долгосрочной перспективе — развитие сегмента биосимиляров, которые наряду с дженериками являются одним из ключевых бизнесов для STADA. Полагаю, уже в течение одного-полутора лет мы сможем предложить подобного рода лекарства на те рынки Евразии, где есть ускоренная регистрация. Подробнее: В каком регионе компания STADA намерена усилить позиции (kursiv.media)",
        "news_6_title": "Исследование STADA Health Report 2023: главные тенденции в сфере здоровья казахстанцев",
        "news_6_text": "19 сентября 2023 года компания STADA представила результаты международного исследования STADA Health Report 2023. Примечательно то, что его участником, наряду с 15 европейскими государствами, уже второй год является и Казахстан. Кроме того, впервые исследованием был охвачен Узбекистан. Исследование проводилось с привлечением исследовательской компании Human8. В каждой стране было опрошено около 2000 человек, ну, а в целом, количество участников исследования составило 32 013 человек в возрасте от 18 до 99 лет.\n\nПредставляя отчет в столице Казахстана Арминас Мацевичус, Вице-президент STADA в регионе «Евразия», отметил: «В прошлом году отчёт Health Report вызвал большой интерес как со стороны работников общественного здравоохранения, так и со стороны журналистов. И это не случайно, так как в отчете дается самая актуальная информация о том, что казахстанцы думают о своём здоровье, какие вопросы здравоохранения их больше волнуют, что они ждут от Министерства здравоохранения, чего они больше опасаются, как лечатся и как отдыхают. По традиции исследование STADA Health Report 2023 содержит данные, которые помогают глубже понять поведение людей, уровень фармацевтической и медицинской грамотности, а также тенденции в здравоохранении. Самой компании STADA полученные данные помогают еще лучше отвечать ожиданиям пациентов и медицинских работников, а значит, в полной мере следовать своей миссии – заботиться о здоровье людей в качестве надежного партнера». Подробнее: Исследование STADA Health Report 2023: главные тенденции в сфере здоровья казахстанцев - Фармацевтическое обозрение Казахстана (pharm.reviews)"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "История STADA началась 14 марта 1895 года в немецком городе Дрездене. Местные фармацевты объединились в ассоциацию и создали стандартизированные препараты для обеспечения эффективного и недорогого общественного здравоохранения."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Немецкая фармацевтическая ассоциация создает единый подход в производстве. Лекарства изготавливаются в разных аптеках, но по единой рецептуре, в идентичной упаковке, продают по одной и той же цене. Так появляется аббревиатура St.d.A - Standard Arzneimittel die Deutscher Apotheke, что в переводе на русский язык означает «стандарт препаратов немецких аптек». Она зарегистрирована как торговая марка."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "Разделенная во время Второй мировой войны на две компании — Южную и Северную — STADA вновь объединяется в 1954-м и обосновывается в городе Бад-Фильбель, недалеко от Франкфурта-на-Майне."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA выходит на новый уровень: приступает к производству лекарственных препаратов в промышленных масштабах на производственной площадке в пригороде Франкфурта-на-Майне (а не в аптеках, как раньше)."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "Переломный год для STADA. Компания преобразована в акционерное общество, что дает новый толчок для ее развития."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Компания принимает решение сконцентрироваться на производстве и продаже генериковых препаратов (непатентованных лекарственных средств)."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA начинает расширять международное присутствие благодаря открытию представительств в Европе и Азии, а также активной стратегии по слияниям и поглощениям."
          ]
        },
        {
          "date": "C 1993 по 2000",
          "paragraphs": [
            "В свой 100-летний юбилей бизнес находится на подъеме. Компания входит в десятку лидеров немецкой промышленности по объему продаж. В 1997/1998 годах было проведено IPO. Основными направлениями деятельности компании являются производство дженериков и безрецептурных препаратов. STADA продолжает последовательно следовать своей стратегии интернационализации и превращается в динамичного глобального игрока."
          ]
        },
        {
          "date": "С 2005 по 2010 год",
          "paragraphs": [
            "STADA приобретает сербскую компанию Hemofarm AG, которая является стратегически важной для Группы. Немецкая дочерняя компания STADA представляет первый биосимиляр. STADA успешно размещает свои первые корпоративные облигации."
          ]
        },
        {
          "date": "С 2010 по 2015",
          "paragraphs": [
            "STADA совершает успешные приобретения в области производства фирменных продуктов, что становится все более важным для Группы. Программа повышения эффективности затрат в рамках всей Группы \"STADA - строим будущее\" успешно завершена с опережением графика. STADA приобретает британского производителя безрецептурных товаров Thornton & Ross."
          ]
        },
        {
          "date": "С 2019 по 2020",
          "paragraphs": [
            "STADA AG усиливает позиции на рынках Центральной и Восточной Европы, России и Евразии благодаря закрытию нескольких крупных сделок — Walmark, GSK и Takeda. STADA становится лидером сегмента Consumer Healthcare."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA продолжает укреплять бизнес по направлению Specialty. Компания представила первый глобальный отчет об устойчивом развитии и вошла в число 10% наиболее устойчивых фармацевтических компаний."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "STADA в Казахстане отмечена наградами «Прорыв года» и «Лидер года».",
          "date": "15.02.2024",
          "text": "Консалтинговым агентством Vi-ORTIS, ведущим экспертную аналитику фармацевтического рынка отмечены заслуги STADA на рынке Казахстана.\n\nКомпания заняла уверенную позицию «Лидер года 2023» на розничном рынке. Помимо прочего STADA укрепила лидерские позиции, завоевав «Прорыв года» в сегменте ОТС с брендом “Энтерожермина” и сегменте RX с брендом “Ксефокам”.\n\nВ общей сложности STADA была отмечена по пяти категориям:\n\n\"Прорыв Года\" на розничном рынке в сегменте СНС\n\n\"Прорыв Года\" на розничном рынке в сегменте ОТС\n\n\"Лидер Года\" на розничном рынке\n\n3-е место на розничном рынке Изделий Медицинского Назначения\n\n3-е место на розничном рынке, в сегменте СНС",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA Евразия получила награду на Eurasian Pharma Awards",
          "date": "04.10.2023",
          "text": "Награда получена в номинации «Партнерство года» за успешное присоединение портфеля Sanofi.\n\nВ рамках Евразийского фармацевтического саммита была проведена церемония награждения, знаковая для игроков фармотрасли евразийского региона.\n\nEurasian Pharma Awards - это яркое событие, объединяющее передовые компании и профессионалов фармацевтической сферы стран Средней Азии, Кавказа и Восточной Европы. Конкурс ежегодно проводится в 16 уникальных номинациях, отражающих разнообразие и инновационность отрасли.\n\nАрминас Мацевичус, Вице-президент STADA Евразия принял награду из рук организаторов конкурса. «После присоединения продуктов Sanofi к портфелю STADA в Евразии, компании удалось значительно укрепить и без того сильные позиции в сегменте СНС (Consumer Healthcare) и в планах дальнейшее развитие данных направлений как через инвестиции, так, возможно, и путем привлечения партнеров, таких как Sanofi» - отметил спикер.\n\nВ 2022 году STADA и Sanofi заключили соглашение о дистрибуции портфеля CHC продуктов в ряде евразийских стран. В рамках соглашения STADA осуществляет дистрибуцию и маркетинговую поддержку портфеля препаратов компании Sanofi, состоящего из известных брендов в сфере потребительского здравоохранения в 10 странах региона Евразия с 01 апреля 2023 г.\n\nВ соглашение вошли 19 хорошо себя зарекомендовавших на рынках стран Евразии продуктов, которым доверяют потребители, которые имеют высокие показатели знания бренда, и, во многих случаях, занимают лидирующие позиции на рынке.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Глава государства провел встречу с вице-президентом компании STADA Group Кристосом Галлисом",
          "date": "29.09.2023                                                                                                                           г. Берлин, Германия",
          "text": "В ходе встречи были обсуждены перспективы сотрудничества в сфере здравоохранения и фармацевтики.\n\nКасым-Жомарт Токаев отметил, что компания STADA входит в тройку лидеров на рынке Казахстана в сегменте потребительских товаров для здоровья. По его словам, ярким примером успешного и динамично развивающегося сотрудничества является открытие офиса компании в Алматы.\n\nПрезидент акцентировал внимание на том, что в Казахстане ведется активная работа по созданию биотехнологического кластера.\n\nПо мнению Главы государства, перед STADA открываются широкие возможности для объединения усилий с национальным холдингом QazBioPharm в области исследований и производства.\n\nКасым-Жомарт Токаев пригласил немецкую компанию к проведению совместных исследований и разработок, организации производства, обмену опытом и повышению квалификации специалистов.\n\nВ свою очередь Кристос Галлис выразил заинтересованность в углублении сотрудничества и подчеркнул готовность компании изучить возможности инвестирования в медицинские проекты и программы в Казахстане.\n\nSTADA является одним из ведущих производителей высококачественных лекарственных средств. Компания реализует свою продукцию в 120 странах мира.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Кристос Галлис: Создание биотехнологического кластера – очень амбициозная задача.",
          "date": "19.12.2023",
          "text": "Вице-президент STADA Group рассказал о тенденциях на рынке и о том, опыт каких стран может перенять РК\n\nПо прогнозам IQVIA Institute for Human Data Science, мировой рынок лекарственных средств будет расти в среднем на 3-6% в течение трех лет. Аналитики предполагают, что к 2027 году он достигнет около 1,9 трлн долларов. Вице-президент STADA Group Кристос Галлис считает, что для развития фарминдустрии в Казахстане необходимо ускорить процедуру регистрации лекарственных средств. «По расчетам наших коллег, работающих на фармрынке и имеющих большое портфолио в госсегменте, от начала подготовки досье до момента выхода инновационного препарата на рынок требуется от 3,5 до 5 лет. Такие длительные сроки регистрации являются одной из главных причин, почему фармкомпании принимают решение не выводить свои лекарства на казахстанский рынок», - считает эксперт. В беседе с корреспондентом центра деловой информации Kapital.kz он также рассказал об итогах исследования Health Report 2023, почему многие фармацевтические компании вынуждены повышать цены на препараты и какая база необходима нашей стране для создания биотехнологического кластера.\n\nПодробнее: Кристос Галлис: Создание биотехнологического кластера – очень амбициозная задача - Капитал (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "STADA намерена усилить позиции в госпитальном сегменте в Евразии",
          "date": "13.09.2023",
          "text": "С 26 по 28 сентября в Самарканде пройдет IV Евразийский фармацевтический саммит. Бизнес-издание «Курсив Узбекистан» выступит генеральным информационным партнером мероприятия.В рамках грядущего саммита «Курсив» начинает публикацию мнений глобальных и региональных игроков фармацевтического рынка.\n\nВице-президент в регионе Евразия компании Stada Арминас Мацевичус.Компания продолжит взаимодействие с регуляторными органами региона.\n\n– Арминас, какие приоритеты стоят перед вашей компанией в регионе Евразия? В каких странах и в сегментах вы видите наибольшие перспективы для STADA?\n\n– После присоединения продуктов Sanofi к портфелю STADA в Евразии мы значительно укрепили наши и без того сильные позиции в сегменте СНС (Consumer Healthcare). Безусловно, мы будем развивать это направление как через инвестиции, так, возможно, и путем привлечения партнеров, таких как Sanofi.\n\nПри этом в течение ближайших нескольких лет компания намерена усилить позиции в госпитальном сегменте и рецептурном бизнесе. В странах Евразии, где есть процедура признания и/или упрощенной регистрации (например, в Молдове, Узбекистане, Грузии) мы уже зарегистрировали ряд новых европейских рецептурных препаратов.\n\nБудем продолжать эту работу, а также взаимодействовать с регуляторными органами всех наших стран по дальнейшему упрощению процедуры доступа на рынок.\n\nВ среднесрочной и долгосрочной перспективе — развитие сегмента биосимиляров, которые наряду с дженериками являются одним из ключевых бизнесов для STADA. Полагаю, уже в течение одного-полутора лет мы сможем предложить подобного рода лекарства на те рынки Евразии, где есть ускоренная регистрация. Подробнее: В каком регионе компания STADA намерена усилить позиции (kursiv.media)",
          "image": {}
        },
        {
          "id": "supplied-6",
          "title": "Исследование STADA Health Report 2023: главные тенденции в сфере здоровья казахстанцев",
          "date": "19.09.2023",
          "text": "19 сентября 2023 года компания STADA представила результаты международного исследования STADA Health Report 2023. Примечательно то, что его участником, наряду с 15 европейскими государствами, уже второй год является и Казахстан. Кроме того, впервые исследованием был охвачен Узбекистан. Исследование проводилось с привлечением исследовательской компании Human8. В каждой стране было опрошено около 2000 человек, ну, а в целом, количество участников исследования составило 32 013 человек в возрасте от 18 до 99 лет.\n\nПредставляя отчет в столице Казахстана Арминас Мацевичус, Вице-президент STADA в регионе «Евразия», отметил: «В прошлом году отчёт Health Report вызвал большой интерес как со стороны работников общественного здравоохранения, так и со стороны журналистов. И это не случайно, так как в отчете дается самая актуальная информация о том, что казахстанцы думают о своём здоровье, какие вопросы здравоохранения их больше волнуют, что они ждут от Министерства здравоохранения, чего они больше опасаются, как лечатся и как отдыхают. По традиции исследование STADA Health Report 2023 содержит данные, которые помогают глубже понять поведение людей, уровень фармацевтической и медицинской грамотности, а также тенденции в здравоохранении. Самой компании STADA полученные данные помогают еще лучше отвечать ожиданиям пациентов и медицинских работников, а значит, в полной мере следовать своей миссии – заботиться о здоровье людей в качестве надежного партнера». Подробнее: Исследование STADA Health Report 2023: главные тенденции в сфере здоровья казахстанцев - Фармацевтическое обозрение Казахстана (pharm.reviews)",
          "image": {}
        }
      ]
    },
    "ge": {
      "source": "GE/Stada.kz_Грузинский.docx",
      "text": {
        "about_par1": "STADA – არის საერთაშორისო ფარმაცევტული კომპანია, რომელიც 130 წელზე მეტია ასრულებს თავის მისიას - „ზრუნვა ადამიანების ჯანმრთელობაზე პარტნიორებთან და მომხმარებლებთან სანდო ურთიერთობის დამყარებით“. STADA-ს ძირითადი მიმართულებებია  Consumer Healthcare-ს სეგმენტის პროდუქტები (CHC), ჯენერიკები და სპეციალიზებული მედიკამენტები (ბიოსიმილარების ჩათვლით). STADA-ს პროდუქტები წარმოდგენილია მსოფლიოს 100 ქვეყანაში.",
        "about_par2": "2022 წელს დსთ-ს რეგიონი გახდა დამოუკიდებელი ბიზნეს ერთეული და დაერქვა STADA ევრაზია, რომელიც უშუალოდ ექვემდებარება შტაბ-ბინას გერმანიაში. რეგიონში 11 ქვეყანაა წარმოდგენილი: ყაზახეთი, უზბეკეთი, ბელორუსია, აზერბაიჯანი, საქართველო, მოლდოვა, ყირგიზეთი, სომხეთი, მონღოლეთი, ტაჯიკეთი, თურქმენეთი.",
        "about_list1": "STADA Eurasia-ის სათაო ოფისი მდებარეობს ალმათიში, ყაზახეთში. კომპანიამ ასევე დაარეგისტრირა იურიდიული პირები STADA Arzneimittel AG რეგიონის უმეტეს ქვეყნებში. 2023 წლის 1 აპრილიდან STADA წარმოადგენს Sanofi-ის OTC პორტფელს რეგიონში.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "იზრუნეთ ადამიანების ჯანმრთელობაზე, როგორც საიმედო პარტნიორმა",
        "about_page_overview_1": "STADA – არის საერთაშორისო ფარმაცევტული კომპანია, რომელიც 130 წელზე მეტია ასრულებს თავის მისიას - „ზრუნვა ადამიანების ჯანმრთელობაზე პარტნიორებთან და მომხმარებლებთან სანდო ურთიერთობის დამყარებით“. STADA-ს ძირითადი მიმართულებებია  Consumer Healthcare-ს სეგმენტის პროდუქტები (CHC), ჯენერიკები და სპეციალიზებული მედიკამენტები (ბიოსიმილარების ჩათვლით). STADA-ს პროდუქტები წარმოდგენილია მსოფლიოს 100 ქვეყანაში.",
        "about_page_intro_2": "2022 წელს დსთ-ს რეგიონი გახდა დამოუკიდებელი ბიზნეს ერთეული და დაერქვა STADA ევრაზია, რომელიც უშუალოდ ექვემდებარება შტაბ-ბინას გერმანიაში. რეგიონში 11 ქვეყანაა წარმოდგენილი: ყაზახეთი, უზბეკეთი, ბელორუსია, აზერბაიჯანი, საქართველო, მოლდოვა, ყირგიზეთი, სომხეთი, მონღოლეთი, ტაჯიკეთი, თურქმენეთი.",
        "about_page_intro_3": "STADA Eurasia-ის სათაო ოფისი მდებარეობს ალმათიში, ყაზახეთში. კომპანიამ ასევე დაარეგისტრირა იურიდიული პირები STADA Arzneimittel AG რეგიონის უმეტეს ქვეყნებში. 2023 წლის 1 აპრილიდან STADA წარმოადგენს Sanofi-ის OTC პორტფელს რეგიონში.",
        "culture_purpose_heading": "მისია და ღირებულებები",
        "culture_purpose_statement": "იზრუნეთ ადამიანების ჯანმრთელობაზე, როგორც საიმედო პარტნიორმა",
        "culture_purpose_text_1": "STADA არის საერთაშორისო ფარმაცევტული კომპანია, რომელიც 125 წელზე მეტია ახორციელებს თავის მისიას - იზრუნოს ადამიანების ჯანმრთელობაზე, როგორც სანდო პარტნიორმა. STADA ცდილობს უზრუნველყოს, რომ კომპანიის მიერ წარმოებული მედიკამენტები იყოს პროფესიონალებისა და მომხმარებლების თავდაჯერებული არჩევანი ყველა ქვეყანაში მისი ყოფნის.",
        "culture_purpose_text_2": "STADA-ს ძირითადი ბიზნეს სფეროები — მომხმარებელთა ჯანდაცვის სეგმენტი (ურეცეპტოდ გაცემული წამლები, დიეტური დანამატები, კოსმეტიკა, სამედიცინო მოწყობილობები) და ჯენერიკები, მათ შორის სპეციალიზებული წამლები. კომპანია პრიორიტეტს ანიჭებს პროდუქციის ხარისხს: კომპანიის საკუთარი და საკონტრაქტო საწარმოო ადგილები მთელს მსოფლიოში ფუნქციონირებს ხარისხის საერთაშორისო სტანდარტების (GMP) შესაბამისად.",
        "culture_values_heading": "ჩვენი ფასეულობები",
        "culture_values_eyebrow": "ჩვენი ფასეულობები",
        "culture_values_intro": "საერთო ღირებულებები საშუალებას გვაძლევს მივაღწიოთ ამბიციურ მიზნებს, რაც უზრუნველყოფს STADA-ს ზრდას და წარმატებას გრძელვადიან პერსპექტივაში.",
        "about_compliance_heading": "შესაბამისობა",
        "about_compliance_intro_1": "ჩვენი კომპანია ცდილობს იყოს საუკეთესო ყველაფერში, მათ შორის ეთიკურ ბიზნესში და შესაბამისობაში. ჩვენი მისიის შემდეგ, ჩვენ ვაცნობიერებთ ჩვენს პასუხისმგებლობას მომხმარებლების წინაშე და ამიტომ არ მივდივართ კომპრომისზე პატიოსნებისა და კეთილსინდისიერების საკითხებში.",
        "about_compliance_intro_2": "ჩვენ მკაცრად ვხელმძღვანელობთ საკანონმდებლო მოთხოვნებით და ჩვენი ღირებულებებით, რომლებიც გათვალისწინებულია ქცევის კოდექსში. ეთიკური და პასუხისმგებელი ბიზნეს ქცევა ჩვენი კორპორატიული კულტურის განუყოფელი ნაწილია და ემსახურება ჩვენი კომპანიის მიმართ ნდობის ჩამოყალიბების საფუძველს.",
        "about_compliance_speakup_heading": "Speak up ევრაზიის შესაბამისობისა და ეთიკის ჯგუფის პორტალი და საერთო საფოსტო ყუთი",
        "about_compliance_speakup_text": "ჩვენ გვჯერა, რომ ყველას, მიუხედავად იმისა, დასაქმებულია კომპანიაში თუ არა, უნდა შეეძლოს შეატყობინოს კომპანიის პერსონალის, პარტნიორების, მომწოდებლებისა და კონტრაქტორების არაეთიკური ან უკანონო ქცევის შესახებ",
        "about_compliance_tools_text": "ამ მიზნით, კომპანია STADA-ს ჯგუფმა დანერგა საინფორმაციო სისტემა - ეს არის Speak up Portal-ი, ასევე ევრაზიის შესაბამისობისა და ეთიკის ჯგუფის საერთო საფოსტო ყუთი (ელფოსტა), ეს ინსტრუმენტები საშუალებას აძლევს ნებისმიერ ადამიანს გააგზავნოს შეტყობინება შესაბამისობის სტანდარტებთან და მოთხოვნებთან შეუსაბამობის ფაქტების შესახებ, კერძოდ, მაგრამ არ შემოიფარგლება მხოლოდ:",
        "about_compliance_item_fraud": "თაღლითობა,",
        "about_compliance_item_corruption": "კორუფცია,",
        "about_compliance_item_competition": "დარღვევები კონკურენციის დაცვის სფეროში (ანტიმონოპოლიური მოთხოვნები);",
        "about_compliance_item_conflict": "ინტერესთა კონფლიქტი.",
        "about_compliance_report_text": "თუ თქვენ გეცოდინებათ გადაცდომის მსგავსი შემთხვევები, მოგვწერეთ შემდეგ მისამართზე: eurasia_compliance@stada.kz ან პირდაპირ შეავსეთ განაცხადი პორტალზე ბმულით.",
        "about_compliance_confidentiality": "კომპანიების ჯგუფი STADA გარანტიას იძლევა მიღებული ინფორმაციის კონფიდენციალურობასთან დაკავშირებით.",
        "about_compliance_questions": "თქვენ შეგიძლიათ გამოაგზავნოთ ნებისმიერი შეკითხვა და წინადადება პაციენტებისა და მომხმარებლების სასარგებლოდ გუნდური მუშაობის გასაუმჯობესებლად, შესაბამისობისა და ეთიკის ჯგუფის ელფოსტის მისამართზე: eurasia_compliance@stada.kz.",
        "about_pv_heading": "ფარმაკოლოგიური ზედამხედველობა",
        "about_pv_text": "ადამიანების ჯანმრთელობასა და კეთილდღეობაზე ზრუნვა ჩვენი კომპანიის მთავარი პრიორიტეტია. ხართ თუ არა პაციენტი, მომვლელი ან ჯანდაცვის პროფესიონალი, მნიშვნელოვანია შეატყობინოთ Stada-ს პროდუქტებთან დაკავშირებული გვერდითი მოვლენების შესახებ. თქვენ მიერ მოწოდებული ინფორმაცია გვეხმარება ჩვენი პროდუქტებისა და ჩვენი პაციენტების უსაფრთხოებაში.",
        "about_pv_contact_label": "გთხოვთ, შეატყობინოთ გვერდითი მოვლენის ყველა შემთხვევის შესახებ Stada-ს სამკურნალო პროდუქტებს შემდეგ საკონტაქტო დეტალებზე:",
        "about_leadership_intro": "არმინას მაცევიჩუსი, ნატალია გარიპოვა",
        "about_leader_ospanov_name": "არმინას მაცევიჩუსი",
        "about_leader_garipova_name": "ნატალია გარიპოვა",
        "culture_integrity_title": "პატიოსნება",
        "culture_integrity_tagline": "თითოეული ჩვენგანი მოქმედებს კორპორატიული და ზოგადად მიღებული ეთიკური სტანდარტების შესაბამისად. გამოხატვის თავისუფლება და ერთმანეთის პატივისცემა არის ჩვენი საქმიანობის საფუძველი.",
        "culture_entrepreneurship_title": "მეწარმეობა",
        "culture_entrepreneurship_tagline": "თითოეულ ჩვენგანს მოაქვს ახალი იდეები და გადაწყვეტილებები, ხელს უწყობს კომპანიის ზრდას და განვითარებას.",
        "culture_agility_title": "ადაპტაციის უნარი",
        "culture_agility_tagline": "თითოეული ჩვენგანი არის ცვლილებების ლიდერი. მოქნილობა და მონდომება არის ჩვენი განვითარების საფუძველი და წარმატებისკენ მიმავალი გზა.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "ჩვენ ვმოქმედებთ მთლიანად კომპანიის ინტერესებიდან გამომდინარე, STADA-ს წარმატება უფრო მნიშვნელოვანია, ვიდრე ინდივიდუალური ფუნქციებისა და განყოფილებების ინტერესები.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "STADA-ს ისტორია დაიწყო 1895 წლის 14 მარტს გერმანიის ქალაქ დრეზდენში. ადგილობრივმა ფარმაცევტებმა შექმნეს ასოციაცია და შექმნეს სტანდარტიზებული მედიკამენტები ეფექტური და ხელმისაწვდომი საზოგადოებრივი ჯანდაცვის უზრუნველსაყოფად.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "გერმანიის ფარმაცევტული ასოციაციას აქვს ერთიანი მიდგომა წარმოებაში. მედიკამენტები მზადდება სხვადასხვა აფთიაქში, მაგრამ ერთი და იგივე რეცეპტის მიხედვით, იდენტური შეფუთვით და იყიდება იმავე ფასად. ასე ჩნდება აბრევიატურა St.A.D.A - Standard Arzneimittel die Deutscher Apotheke, რაც ნიშნავს \"გერმანიის აფთიაქების პრეპარატებს სტანდარტი\". ის რეგისტრირებულია როგორც სავაჭრო მარკა.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "მეორე მსოფლიო ომის დროს დაყოფილი ორ კომპანიად - სამხრეთისა და ჩრდილოეთის - STADA კვლავ გაერთიანდა 1954 წელს და დასახლდა ქალაქ ბად ვილბელში, ფრანკფურტის მახლობლად.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA აღწევს ახალ დონეს: ის იწყებს წამლების წარმოებას ინდუსტრიული მასშტაბით ფრანკფურტის გარეუბანში მდებარე საწარმოო ობიექტზე (და არა აფთიაქებში, როგორც ადრე).",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "გარდამტეხი წელი STADA-სთვის. კომპანია გადაკეთდა სააქციო საზოგადოებად, რაც ახალ ბიძგს აძლევს მის განვითარებას.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "კომპანია გადაწყვეტს კონცენტრირება მოახდინოს გენერიკ მედიკამენტების წარმოებასა და გაყიდვაზე.",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA იწყებს თავისი საერთაშორისო წარმომადგენლობის გაფართოებას ევროპასა და აზიაში წარმომადგენლობითი ოფისების გახსნით, ასევე აქტიური შერწყმისა და შესყიდვების სტრატეგიით.",
        "supplied_history_date_7": "1993-დან  2000-მდე",
        "supplied_history_text_7": "100 წლის იუბილეზე ბიზნესი ყვავის. კომპანია გაყიდვების მოცულობით გერმანიის ინდუსტრიის ლიდერთა ათეულში შედის. IPO გაიმართა 1997/1998 წლებში. კომპანიის ძირითადი საქმიანობაა გენერიკებისა და ურეცეპტოდ გაცემული მედიკამენტების წარმოება. STADA აგრძელებს თავისი ინტერნაციონალიზაციის სტრატეგიის თანმიმდევრულად განხორციელებას და ვითარდება დინამიურ გლობალურ მოთამაშედ.",
        "supplied_history_date_8": "2005-დან 2010 წლამდე",
        "supplied_history_text_8": "STADA იძენს სერბულ კომპანია Hemofarm AG-ს, რომელიც ჯგუფისთვის სტრატეგიულად მნიშვნელოვანია. STADA-ს გერმანული შვილობილი კომპანია წარადგენს პირველ ბიოსიმილარს. STADA წარმატებით გამოუშვებს თავის პირველ კორპორატიულ აქციებს.",
        "supplied_history_date_9": "2010-დან 2015-მდე",
        "supplied_history_text_9": "STADA ახორციელებს წარმატებულ შესყიდვებს ბრენდირებული პროდუქტების სფეროში, რაც ჯგუფისთვის სულ უფრო მნიშვნელოვანი ხდება. ჯგუფის მასშტაბით ხარჯების ეფექტურობის გაუმჯობესების პროგრამა \"STADA - Build the Future\" წარმატებით დასრულდა ვადაზე ადრე. STADA იძენს ბრიტანულ OTC პროდუქტების მწარმოებელ Thornton & Ross-ს.",
        "supplied_history_date_10": "2019-დან 2020-მდე",
        "supplied_history_text_10": "STADA AG აძლიერებს თავის პოზიციას ცენტრალური და აღმოსავლეთ ევროპის, რუსეთისა და ევრაზიის ბაზრებზე რამდენიმე ძირითადი ტრანზაქციის დახურვის წყალობით - Walmark, GSK და Takeda. STADA ხდება ლიდერი მომხმარებელთა ჯანდაცვის სეგმენტში.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA აგრძელებს სპეციალობის ბიზნესის გაძლიერებას. კომპანიამ წარმოადგინა პირველი გლობალური მდგრადობის ანგარიში და მოხვდა 10% ყველაზე მდგრადი ფარმაცევტულ კომპანიებს შორის.",
        "supplied_history_heading": "ისტორია:",
        "hero_text1": "STADA ყაზახეთში დაჯილდოვებულია ჯილდოებით \"წლის მიღწევა\" და \"წლის ლიდერი\".",
        "news_1_text": "საკონსულტაციო სააგენტო Vi-ORTIS-მა, ფარმაცევტული ბაზრის წამყვან ექსპერტთა ანალიტიკამ, აღნიშნა STADA-ს დამსახურება ყაზახეთის ბაზარზე.\n\nკომპანიამ დაიკავა მტკიცე პოზიცია, როგორც \"2023 წლის ლიდერი\" საცალო ბაზარზე. სხვა საკითხებთან ერთად, STADA-მ გააძლიერა ლიდერის პოზიცია \"წლის მიღწევით\" გაიმარჯვა OTC სეგმენტში Enterozermina ბრენდით და RX სეგმენტში Xefocam ბრენდით.\n\nსაერთო ჯამში, STADA დაჯილდოვდა ხუთ კატეგორიაში:\n\n\"წლის მიღწევა\" საცალო ბაზარზე სნს სეგმენტში\n\n\"წლის მიღწევა\" საცალო ბაზარზე ოტკ სეგმენტში\n\n„წლის ლიდერი“ საცალო ბაზარზე\n\nსამედიცინო პროდუქციის საცალო ბაზარზე მე-3 ადგილი\n\n• მე-3 ადგილი საცალო ბაზარზე, სნს სეგმენტში",
        "hero_text2": "STADA ევრაზიამ მიიღო ჯილდო Eurasian Pharma Awards-ზე",
        "news_2_text": "ჯილდო მიენიჭა \"წლის პარტნიორობა\" კატეგორიაში Sanofi-ს პორტფოლიოს წარმატებული ინტეგრაციისთვის.\n\nევრაზიის ფარმაცევტული სამიტის ფარგლებში გაიმართა დაჯილდოების ცერემონია, რაც მნიშვნელოვანი იყო ევრაზიის რეგიონის ფარმაცევტული ინდუსტრიის მოთამაშეებისთვის.\n\nEurasian Pharma Awards - ეს არის გამორჩეული ღონისძიება, რომელიც აერთიანებს წამყვან კომპანიებსა და ფარმაცევტული სექტორის პროფესიონალებს ცენტრალური აზიიდან, კავკასიიდან და აღმოსავლეთ ევროპიდან. კონკურსი ყოველწლიურად იმართება 16 უნიკალურ კატეგორიაში, რაც ასახავს ინდუსტრიის მრავალფეროვნებას და ინოვაციებს.\n\nSTADA ევრაზიის ვიცე-პრეზიდენტმა არმინას მაკევიჩიუსმა მიიღო ჯილდო კონკურსის ორგანიზატორების ხელიდან. „ევრაზიაში STADA-ს პორტფოლიოში Sanofi-ს პროდუქტების დამატების შემდეგ, კომპანიამ შეძლო მნიშვნელოვნად გაეძლიერებინა თავისი ისედაც ძლიერი პოზიციები CHC (Consumer Healthcare) სეგმენტში და გეგმავს ამ სფეროების შემდგომ განვითარებას, როგორც ინვესტიციების მეშვეობით, ასევე, შესაძლოა, ისეთი პარტნიორების მოზიდვით, როგორიცაა Sanofi“, – აღნიშნა მომხსენებელმა.\n\n2022 წელს STADA-მ და Sanofi-მ გააფორმეს შეთანხმება ევრაზიის რიგ ქვეყანაში CHC პროდუქციის პორტფელის განაწილების შესახებ. ხელშეკრულების ფარგლებში, STADA 2023 წლის 1 აპრილიდან უზრუნველყოფს სანოფის წამლების პორტფოლიოს დისტრიბუციასა და მარკეტინგულ მხარდაჭერას, რომელიც შედგება ცნობილი ბრენდებისგან მომხმარებელთა ჯანმრთელობის დაცვის სფეროში ევრაზიის რეგიონის 10 ქვეყანაში.\n\nშეთანხმება მოიცავდა 19 პროდუქტს, რომლებმაც თავი დაიმკვიდრეს ევრაზიის ქვეყნების ბაზრებზე, რომლებსაც ენდობიან მომხმარებლები, რომლებსაც აქვთ ბრენდის ცოდნის მაღალი დონე და, ხშირ შემთხვევაში, ბაზარზე წამყვან პოზიციებს იკავებენ.",
        "hero_text3": "სახელმწიფოს მეთაურმა ჩაატარა შეხვედრა STADA Group-ის ვიცე-პრეზიდენტთან, ქრისტოს გალისთან",
        "news_3_text": "შეხვედრაზე განხილულ იქნა ჯანდაცვისა და ფარმაცევტული სფეროში თანამშრომლობის პერსპექტივები.\n\nკასიმ-ჯომარტ ტოკაევმა აღნიშნა, რომ STADA არის ერთ-ერთი ლიდერი ყაზახეთის ბაზარზე სამომხმარებლო ჯანმრთელობის პროდუქტების სეგმენტში. მისი თქმით, კომპანიის ოფისის გახსნა ალმატაში წარმატებული და დინამიურად განვითარებადი თანამშრომლობის თვალსაჩინო მაგალითია.\n\nპრეზიდენტმა ყურადღება გაამახვილა იმაზე, რომ ყაზახეთში აქტიური მუშაობა მიმდინარეობს ბიოტექნოლოგიური კლასტერის შესაქმნელად.\n\nსახელმწიფოს მეთაურის თქმით, ფართო შესაძლებლობები იხსნება STADA-სთვის, იმისთვის რომ შეუერთდეს ეროვნულ ჰოლდინგ QazBioPharm-ის ძალებს,  კვლევისა და წარმოების სფეროში.\n\nკასიმ-ჯომარტ ტოკაევმა მიიწვია გერმანული კომპანია ერთობლივი კვლევებისა და განვითარების, წარმოების ორგანიზებისთვის, გამოცდილების გაცვლისა და სპეციალისტების კვალიფიკაციის ასამაღლებლად.\n\nთავის მხრივ, ქრისტოს გალისმა გამოხატა  თანამშრომლობის გაღრმავების ინტერესი და კომპანიის მზადყოფნას ხაზი გაუსვა გამოიკვლიოს შესაძლებლობები სამედიცინო პროექტებსა და პროგრამებში ინვესტიციებისთვის ყაზახეთში.\n\nSTADA არის მაღალი ხარისხის მედიკამენტების ერთ-ერთი წამყვანი მწარმოებელი. კომპანია თავის პროდუქციას 120 ქვეყანაში ყიდის.",
        "news_4_title": "კრისტოს გალლისი: ბიოტექნოლოგიური კლასტერის შექმნა ძალიან ამბიციური ამოცანაა.",
        "news_4_text": "STADA Group-ის ვიცე-პრეზიდენტმა ისაუბრა ბაზრის ტენდენციებზე და გამოცდილებაზე, თუ რომელი ქვეყნების მიღება შეუძლია ყაზახეთის რესპუბლიკას.\n\nIQVIA Institute for Human Data Science-ის პროგნოზების მიხედვით, მედიკამენტების გლობალური ბაზარი სამი წლის განმავლობაში საშუალოდ 3-6%-ით გაიზრდება. ანალიტიკოსები ვარაუდობენ, რომ ის 2027 წლისთვის დაახლოებით 1,9 ტრილიონ დოლარს მიაღწევს. STADA GROUP-ის ვიცე-პრეზიდენტი ქრისტეს გალისი მიიჩნევს, რომ ყაზახეთში ფარმაცევტული ინდუსტრიის განვითარებისთვის აუცილებელია მედიკამენტების რეგისტრაციის პროცედურის დაჩქარება. „ფარმაცევტულ ბაზარზე მომუშავე ჩვენი კოლეგების გათვლებით, რომლებსაც აქვთ დიდი პორტფელი სამთავრობო სეგმენტში, დოსიეს მომზადების დაწყებიდან ინოვაციური წამლის ბაზარზე შესვლამდე 3,5-დან 5 წლამდე სჭირდება. ასეთი ხანგრძლივი რეგისტრაციის ვადები არის ერთ-ერთი მთავარი მიზეზი, რის გამოც ფარმაცევტული კომპანიები იღებენ გადაწყვეტილებას არ გააცნონ თავიანთი მედიკამენტები ყაზახეთის ბაზარზე“, - მიიჩნევს ექსპერტი. ბიზნეს საინფორმაციო ცენტრის Kapital.kz-ის კორესპონდენტთან საუბარში მან ასევე ისაუბრა Health Report 2023 კვლევის შედეგებზე, თუ რატომ იძულებულია ბევრი ფარმაცევტული კომპანია გაზარდოს ფასები წამლებზე და რა ბაზა სჭირდება ჩვენს ქვეყანას შექმნას. ბიოტექნოლოგიური კლასტერი.\n\nწაიკითხეთ მეტი: ქრისტეს გალისი: ბიოტექნოლოგიური კლასტერის შექმნა ძალიან ამბიციური ამოცანაა - კაპიტალი (kapital.kz)",
        "news_5_title": "STADA აპირებს გააძლიეროს თავისი პოზიცია ევრაზიის ჰოსპიტალურ სეგმენტში",
        "news_5_text": "26-28 სექტემბერს სამარყანდში ევრაზიის ფარმაცევტული IV სამიტი გაიმართება. ღონისძიების გენერალური საინფორმაციო პარტნიორი იქნება ბიზნეს გამოცემა „კურსივი უზბეკეთი“.\n\nარმინას მაჩევიჩუსი, STADA-ს  ევრაზიის რეგიონის ვიცე-პრეზიდენტი კომპანია გააგრძელებს ურთიერთობას რეგიონის მარეგულირებელ ორგანოებთან.\n\n– არმინას, რა არის თქვენი კომპანიის პრიორიტეტები ევრაზიის რეგიონში? რომელ ქვეყნებსა და სეგმენტებში ხედავთ STADA-ს ყველაზე დიდ პერსპექტივას?\n\n– ევრაზიის STADA-ს პორტფოლიოში Sanofi-ს პროდუქტების დამატებით, ჩვენ მნიშვნელოვნად გავაძლიერეთ ჩვენი ისედაც ძლიერი პოზიცია მომხმარებელთა ჯანდაცვის სეგმენტში (Consumer Healthcare). რა თქმა უნდა, ჩვენ განვავითარებთ ამ სფეროს როგორც ინვესტიციებით, ასევე, შესაძლოა, ისეთი პარტნიორების მოზიდვით, როგორიცაა Sanofi.\n\nამავდროულად, მომდევნო რამდენიმე წლის განმავლობაში კომპანია აპირებს გააძლიეროს თავისი პოზიციები ჰოსპიტალურ სეგმენტში და რეცეპტების ბიზნესში. ევრაზიის ქვეყნებში, სადაც არის აღიარების ან/და გამარტივებული რეგისტრაციის პროცედურა (მაგალითად, მოლდოვაში, უზბეკეთში, საქართველოში), ჩვენ უკვე დავარეგისტრირეთ არაერთი ახალი ევროპული რეცეპტით გასაცემი წამალი.\n\nჩვენ გავაგრძელებთ ამ მუშაობას და ასევე ვითანამშრომლებთ ჩვენი ქვეყნის მარეგულირებელ ორგანოებთან, რათა კიდევ უფრო გავამარტივოთ ბაზარზე დაშვების პროცედურა.\n\nსაშუალო და გრძელვადიან პერსპექტივაში, ბიოსიმილარული სეგმენტის განვითარება, რომელიც გენერიკებთან ერთად, STADA-სთვის ერთ-ერთი მთავარი ბიზნესია. მე მჯერა, რომ წელიწადნახევარში ჩვენ შევძლებთ ამ ტიპის მედიკამენტების შეთავაზებას ევრაზიის იმ ბაზრებზე, სადაც არის დაჩქარებული რეგისტრაცია. დაწვრილებით: რომელ რეგიონში აპირებს STADA პოზიციის გაძლიერებას (kursiv.media)"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "STADA-ს ისტორია დაიწყო 1895 წლის 14 მარტს გერმანიის ქალაქ დრეზდენში. ადგილობრივმა ფარმაცევტებმა შექმნეს ასოციაცია და შექმნეს სტანდარტიზებული მედიკამენტები ეფექტური და ხელმისაწვდომი საზოგადოებრივი ჯანდაცვის უზრუნველსაყოფად."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "გერმანიის ფარმაცევტული ასოციაციას აქვს ერთიანი მიდგომა წარმოებაში. მედიკამენტები მზადდება სხვადასხვა აფთიაქში, მაგრამ ერთი და იგივე რეცეპტის მიხედვით, იდენტური შეფუთვით და იყიდება იმავე ფასად. ასე ჩნდება აბრევიატურა St.A.D.A - Standard Arzneimittel die Deutscher Apotheke, რაც ნიშნავს \"გერმანიის აფთიაქების პრეპარატებს სტანდარტი\". ის რეგისტრირებულია როგორც სავაჭრო მარკა."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "მეორე მსოფლიო ომის დროს დაყოფილი ორ კომპანიად - სამხრეთისა და ჩრდილოეთის - STADA კვლავ გაერთიანდა 1954 წელს და დასახლდა ქალაქ ბად ვილბელში, ფრანკფურტის მახლობლად."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA აღწევს ახალ დონეს: ის იწყებს წამლების წარმოებას ინდუსტრიული მასშტაბით ფრანკფურტის გარეუბანში მდებარე საწარმოო ობიექტზე (და არა აფთიაქებში, როგორც ადრე)."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "გარდამტეხი წელი STADA-სთვის. კომპანია გადაკეთდა სააქციო საზოგადოებად, რაც ახალ ბიძგს აძლევს მის განვითარებას."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "კომპანია გადაწყვეტს კონცენტრირება მოახდინოს გენერიკ მედიკამენტების წარმოებასა და გაყიდვაზე."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA იწყებს თავისი საერთაშორისო წარმომადგენლობის გაფართოებას ევროპასა და აზიაში წარმომადგენლობითი ოფისების გახსნით, ასევე აქტიური შერწყმისა და შესყიდვების სტრატეგიით."
          ]
        },
        {
          "date": "1993-დან  2000-მდე",
          "paragraphs": [
            "100 წლის იუბილეზე ბიზნესი ყვავის. კომპანია გაყიდვების მოცულობით გერმანიის ინდუსტრიის ლიდერთა ათეულში შედის. IPO გაიმართა 1997/1998 წლებში. კომპანიის ძირითადი საქმიანობაა გენერიკებისა და ურეცეპტოდ გაცემული მედიკამენტების წარმოება. STADA აგრძელებს თავისი ინტერნაციონალიზაციის სტრატეგიის თანმიმდევრულად განხორციელებას და ვითარდება დინამიურ გლობალურ მოთამაშედ."
          ]
        },
        {
          "date": "2005-დან 2010 წლამდე",
          "paragraphs": [
            "STADA იძენს სერბულ კომპანია Hemofarm AG-ს, რომელიც ჯგუფისთვის სტრატეგიულად მნიშვნელოვანია. STADA-ს გერმანული შვილობილი კომპანია წარადგენს პირველ ბიოსიმილარს. STADA წარმატებით გამოუშვებს თავის პირველ კორპორატიულ აქციებს."
          ]
        },
        {
          "date": "2010-დან 2015-მდე",
          "paragraphs": [
            "STADA ახორციელებს წარმატებულ შესყიდვებს ბრენდირებული პროდუქტების სფეროში, რაც ჯგუფისთვის სულ უფრო მნიშვნელოვანი ხდება. ჯგუფის მასშტაბით ხარჯების ეფექტურობის გაუმჯობესების პროგრამა \"STADA - Build the Future\" წარმატებით დასრულდა ვადაზე ადრე. STADA იძენს ბრიტანულ OTC პროდუქტების მწარმოებელ Thornton & Ross-ს."
          ]
        },
        {
          "date": "2019-დან 2020-მდე",
          "paragraphs": [
            "STADA AG აძლიერებს თავის პოზიციას ცენტრალური და აღმოსავლეთ ევროპის, რუსეთისა და ევრაზიის ბაზრებზე რამდენიმე ძირითადი ტრანზაქციის დახურვის წყალობით - Walmark, GSK და Takeda. STADA ხდება ლიდერი მომხმარებელთა ჯანდაცვის სეგმენტში."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA აგრძელებს სპეციალობის ბიზნესის გაძლიერებას. კომპანიამ წარმოადგინა პირველი გლობალური მდგრადობის ანგარიში და მოხვდა 10% ყველაზე მდგრადი ფარმაცევტულ კომპანიებს შორის."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "STADA ყაზახეთში დაჯილდოვებულია ჯილდოებით \"წლის მიღწევა\" და \"წლის ლიდერი\".",
          "date": "15.02.2024",
          "text": "საკონსულტაციო სააგენტო Vi-ORTIS-მა, ფარმაცევტული ბაზრის წამყვან ექსპერტთა ანალიტიკამ, აღნიშნა STADA-ს დამსახურება ყაზახეთის ბაზარზე.\n\nკომპანიამ დაიკავა მტკიცე პოზიცია, როგორც \"2023 წლის ლიდერი\" საცალო ბაზარზე. სხვა საკითხებთან ერთად, STADA-მ გააძლიერა ლიდერის პოზიცია \"წლის მიღწევით\" გაიმარჯვა OTC სეგმენტში Enterozermina ბრენდით და RX სეგმენტში Xefocam ბრენდით.\n\nსაერთო ჯამში, STADA დაჯილდოვდა ხუთ კატეგორიაში:\n\n\"წლის მიღწევა\" საცალო ბაზარზე სნს სეგმენტში\n\n\"წლის მიღწევა\" საცალო ბაზარზე ოტკ სეგმენტში\n\n„წლის ლიდერი“ საცალო ბაზარზე\n\nსამედიცინო პროდუქციის საცალო ბაზარზე მე-3 ადგილი\n\n• მე-3 ადგილი საცალო ბაზარზე, სნს სეგმენტში",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA ევრაზიამ მიიღო ჯილდო Eurasian Pharma Awards-ზე",
          "date": "04.10.2023",
          "text": "ჯილდო მიენიჭა \"წლის პარტნიორობა\" კატეგორიაში Sanofi-ს პორტფოლიოს წარმატებული ინტეგრაციისთვის.\n\nევრაზიის ფარმაცევტული სამიტის ფარგლებში გაიმართა დაჯილდოების ცერემონია, რაც მნიშვნელოვანი იყო ევრაზიის რეგიონის ფარმაცევტული ინდუსტრიის მოთამაშეებისთვის.\n\nEurasian Pharma Awards - ეს არის გამორჩეული ღონისძიება, რომელიც აერთიანებს წამყვან კომპანიებსა და ფარმაცევტული სექტორის პროფესიონალებს ცენტრალური აზიიდან, კავკასიიდან და აღმოსავლეთ ევროპიდან. კონკურსი ყოველწლიურად იმართება 16 უნიკალურ კატეგორიაში, რაც ასახავს ინდუსტრიის მრავალფეროვნებას და ინოვაციებს.\n\nSTADA ევრაზიის ვიცე-პრეზიდენტმა არმინას მაკევიჩიუსმა მიიღო ჯილდო კონკურსის ორგანიზატორების ხელიდან. „ევრაზიაში STADA-ს პორტფოლიოში Sanofi-ს პროდუქტების დამატების შემდეგ, კომპანიამ შეძლო მნიშვნელოვნად გაეძლიერებინა თავისი ისედაც ძლიერი პოზიციები CHC (Consumer Healthcare) სეგმენტში და გეგმავს ამ სფეროების შემდგომ განვითარებას, როგორც ინვესტიციების მეშვეობით, ასევე, შესაძლოა, ისეთი პარტნიორების მოზიდვით, როგორიცაა Sanofi“, – აღნიშნა მომხსენებელმა.\n\n2022 წელს STADA-მ და Sanofi-მ გააფორმეს შეთანხმება ევრაზიის რიგ ქვეყანაში CHC პროდუქციის პორტფელის განაწილების შესახებ. ხელშეკრულების ფარგლებში, STADA 2023 წლის 1 აპრილიდან უზრუნველყოფს სანოფის წამლების პორტფოლიოს დისტრიბუციასა და მარკეტინგულ მხარდაჭერას, რომელიც შედგება ცნობილი ბრენდებისგან მომხმარებელთა ჯანმრთელობის დაცვის სფეროში ევრაზიის რეგიონის 10 ქვეყანაში.\n\nშეთანხმება მოიცავდა 19 პროდუქტს, რომლებმაც თავი დაიმკვიდრეს ევრაზიის ქვეყნების ბაზრებზე, რომლებსაც ენდობიან მომხმარებლები, რომლებსაც აქვთ ბრენდის ცოდნის მაღალი დონე და, ხშირ შემთხვევაში, ბაზარზე წამყვან პოზიციებს იკავებენ.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "სახელმწიფოს მეთაურმა ჩაატარა შეხვედრა STADA Group-ის ვიცე-პრეზიდენტთან, ქრისტოს გალისთან",
          "date": "29.09.2023                                                                                              ქ. ბერლინი, გერმანია",
          "text": "შეხვედრაზე განხილულ იქნა ჯანდაცვისა და ფარმაცევტული სფეროში თანამშრომლობის პერსპექტივები.\n\nკასიმ-ჯომარტ ტოკაევმა აღნიშნა, რომ STADA არის ერთ-ერთი ლიდერი ყაზახეთის ბაზარზე სამომხმარებლო ჯანმრთელობის პროდუქტების სეგმენტში. მისი თქმით, კომპანიის ოფისის გახსნა ალმატაში წარმატებული და დინამიურად განვითარებადი თანამშრომლობის თვალსაჩინო მაგალითია.\n\nპრეზიდენტმა ყურადღება გაამახვილა იმაზე, რომ ყაზახეთში აქტიური მუშაობა მიმდინარეობს ბიოტექნოლოგიური კლასტერის შესაქმნელად.\n\nსახელმწიფოს მეთაურის თქმით, ფართო შესაძლებლობები იხსნება STADA-სთვის, იმისთვის რომ შეუერთდეს ეროვნულ ჰოლდინგ QazBioPharm-ის ძალებს,  კვლევისა და წარმოების სფეროში.\n\nკასიმ-ჯომარტ ტოკაევმა მიიწვია გერმანული კომპანია ერთობლივი კვლევებისა და განვითარების, წარმოების ორგანიზებისთვის, გამოცდილების გაცვლისა და სპეციალისტების კვალიფიკაციის ასამაღლებლად.\n\nთავის მხრივ, ქრისტოს გალისმა გამოხატა  თანამშრომლობის გაღრმავების ინტერესი და კომპანიის მზადყოფნას ხაზი გაუსვა გამოიკვლიოს შესაძლებლობები სამედიცინო პროექტებსა და პროგრამებში ინვესტიციებისთვის ყაზახეთში.\n\nSTADA არის მაღალი ხარისხის მედიკამენტების ერთ-ერთი წამყვანი მწარმოებელი. კომპანია თავის პროდუქციას 120 ქვეყანაში ყიდის.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "კრისტოს გალლისი: ბიოტექნოლოგიური კლასტერის შექმნა ძალიან ამბიციური ამოცანაა.",
          "date": "19.12.2023",
          "text": "STADA Group-ის ვიცე-პრეზიდენტმა ისაუბრა ბაზრის ტენდენციებზე და გამოცდილებაზე, თუ რომელი ქვეყნების მიღება შეუძლია ყაზახეთის რესპუბლიკას.\n\nIQVIA Institute for Human Data Science-ის პროგნოზების მიხედვით, მედიკამენტების გლობალური ბაზარი სამი წლის განმავლობაში საშუალოდ 3-6%-ით გაიზრდება. ანალიტიკოსები ვარაუდობენ, რომ ის 2027 წლისთვის დაახლოებით 1,9 ტრილიონ დოლარს მიაღწევს. STADA GROUP-ის ვიცე-პრეზიდენტი ქრისტეს გალისი მიიჩნევს, რომ ყაზახეთში ფარმაცევტული ინდუსტრიის განვითარებისთვის აუცილებელია მედიკამენტების რეგისტრაციის პროცედურის დაჩქარება. „ფარმაცევტულ ბაზარზე მომუშავე ჩვენი კოლეგების გათვლებით, რომლებსაც აქვთ დიდი პორტფელი სამთავრობო სეგმენტში, დოსიეს მომზადების დაწყებიდან ინოვაციური წამლის ბაზარზე შესვლამდე 3,5-დან 5 წლამდე სჭირდება. ასეთი ხანგრძლივი რეგისტრაციის ვადები არის ერთ-ერთი მთავარი მიზეზი, რის გამოც ფარმაცევტული კომპანიები იღებენ გადაწყვეტილებას არ გააცნონ თავიანთი მედიკამენტები ყაზახეთის ბაზარზე“, - მიიჩნევს ექსპერტი. ბიზნეს საინფორმაციო ცენტრის Kapital.kz-ის კორესპონდენტთან საუბარში მან ასევე ისაუბრა Health Report 2023 კვლევის შედეგებზე, თუ რატომ იძულებულია ბევრი ფარმაცევტული კომპანია გაზარდოს ფასები წამლებზე და რა ბაზა სჭირდება ჩვენს ქვეყანას შექმნას. ბიოტექნოლოგიური კლასტერი.\n\nწაიკითხეთ მეტი: ქრისტეს გალისი: ბიოტექნოლოგიური კლასტერის შექმნა ძალიან ამბიციური ამოცანაა - კაპიტალი (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "STADA აპირებს გააძლიეროს თავისი პოზიცია ევრაზიის ჰოსპიტალურ სეგმენტში",
          "date": "13.09.2023",
          "text": "26-28 სექტემბერს სამარყანდში ევრაზიის ფარმაცევტული IV სამიტი გაიმართება. ღონისძიების გენერალური საინფორმაციო პარტნიორი იქნება ბიზნეს გამოცემა „კურსივი უზბეკეთი“.\n\nარმინას მაჩევიჩუსი, STADA-ს  ევრაზიის რეგიონის ვიცე-პრეზიდენტი კომპანია გააგრძელებს ურთიერთობას რეგიონის მარეგულირებელ ორგანოებთან.\n\n– არმინას, რა არის თქვენი კომპანიის პრიორიტეტები ევრაზიის რეგიონში? რომელ ქვეყნებსა და სეგმენტებში ხედავთ STADA-ს ყველაზე დიდ პერსპექტივას?\n\n– ევრაზიის STADA-ს პორტფოლიოში Sanofi-ს პროდუქტების დამატებით, ჩვენ მნიშვნელოვნად გავაძლიერეთ ჩვენი ისედაც ძლიერი პოზიცია მომხმარებელთა ჯანდაცვის სეგმენტში (Consumer Healthcare). რა თქმა უნდა, ჩვენ განვავითარებთ ამ სფეროს როგორც ინვესტიციებით, ასევე, შესაძლოა, ისეთი პარტნიორების მოზიდვით, როგორიცაა Sanofi.\n\nამავდროულად, მომდევნო რამდენიმე წლის განმავლობაში კომპანია აპირებს გააძლიეროს თავისი პოზიციები ჰოსპიტალურ სეგმენტში და რეცეპტების ბიზნესში. ევრაზიის ქვეყნებში, სადაც არის აღიარების ან/და გამარტივებული რეგისტრაციის პროცედურა (მაგალითად, მოლდოვაში, უზბეკეთში, საქართველოში), ჩვენ უკვე დავარეგისტრირეთ არაერთი ახალი ევროპული რეცეპტით გასაცემი წამალი.\n\nჩვენ გავაგრძელებთ ამ მუშაობას და ასევე ვითანამშრომლებთ ჩვენი ქვეყნის მარეგულირებელ ორგანოებთან, რათა კიდევ უფრო გავამარტივოთ ბაზარზე დაშვების პროცედურა.\n\nსაშუალო და გრძელვადიან პერსპექტივაში, ბიოსიმილარული სეგმენტის განვითარება, რომელიც გენერიკებთან ერთად, STADA-სთვის ერთ-ერთი მთავარი ბიზნესია. მე მჯერა, რომ წელიწადნახევარში ჩვენ შევძლებთ ამ ტიპის მედიკამენტების შეთავაზებას ევრაზიის იმ ბაზრებზე, სადაც არის დაჩქარებული რეგისტრაცია. დაწვრილებით: რომელ რეგიონში აპირებს STADA პოზიციის გაძლიერებას (kursiv.media)",
          "image": {}
        }
      ]
    },
    "az": {
      "source": "АЗ/Stada.kz_Азербайджанский.docx",
      "text": {
        "about_par1": "STADA – 125 ildən çoxdur ki “Tərəfdaşlar və istehlakçılarla etibarlı münasibətlər qurmaqla insanların sağlamlığına qayğı göstərmək” missiyasına riayət edən beynəlxalq əczaçılıq şirkətidir. STADA şirkətinin əsas istiqamətləri – Consumer Healthcare (CHC) seqmentinin məhsulları, ceneriklər və xüsusi preparatlardır (biosimilyarlar da daxil olmaqla). STADA şirkətinin məhsulları dünyanın 120 ölkəsində təqdim olunur.",
        "about_par2": "2022-ci ildə MDB ölkələri regionu müstəqil işgüzar bölməsinə çevrilərək adı Stada Avrasiya olaraq dəyişdirilmiş və birbaşa olaraq Almaniyadakı qərargaha tabe olmuşdur. Bu region 11 ölkə ilə təmsil olunur: Qazaxıstan, Özbəkistan, Belarus, Azərbaycan, Gürcüstan, Moldova, Qırğızıstan, Ermənistan, Monqolustan, Tacikistan, Türkmənistan.",
        "about_list1": "Stada Avrasiyanın baş ofisi Qazaxıstanın Almatı şəhərində yerləşir. Şirkət həmçinin regionun əksər ölkələrində STADA Arzneimittel AG hüquqi şəxslərini qeydiyyatdan keçirmişdir. 01 aprel 2023-cü ildən etibarən STADA şirkəti regionda Sanofi şirkətinin reseptsiz satılan preparatlarının portfelini təqdim edir.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Etibarlı tərəfdaş kimi insanların sağlamlığına qayğı göstərmək",
        "about_page_overview_1": "STADA – 125 ildən çoxdur ki “Tərəfdaşlar və istehlakçılarla etibarlı münasibətlər qurmaqla insanların sağlamlığına qayğı göstərmək” missiyasına riayət edən beynəlxalq əczaçılıq şirkətidir. STADA şirkətinin əsas istiqamətləri – Consumer Healthcare (CHC) seqmentinin məhsulları, ceneriklər və xüsusi preparatlardır (biosimilyarlar da daxil olmaqla). STADA şirkətinin məhsulları dünyanın 120 ölkəsində təqdim olunur.",
        "about_page_intro_2": "2022-ci ildə MDB ölkələri regionu müstəqil işgüzar bölməsinə çevrilərək adı Stada Avrasiya olaraq dəyişdirilmiş və birbaşa olaraq Almaniyadakı qərargaha tabe olmuşdur. Bu region 11 ölkə ilə təmsil olunur: Qazaxıstan, Özbəkistan, Belarus, Azərbaycan, Gürcüstan, Moldova, Qırğızıstan, Ermənistan, Monqolustan, Tacikistan, Türkmənistan.",
        "about_page_intro_3": "Stada Avrasiyanın baş ofisi Qazaxıstanın Almatı şəhərində yerləşir. Şirkət həmçinin regionun əksər ölkələrində STADA Arzneimittel AG hüquqi şəxslərini qeydiyyatdan keçirmişdir. 01 aprel 2023-cü ildən etibarən STADA şirkəti regionda Sanofi şirkətinin reseptsiz satılan preparatlarının portfelini təqdim edir.",
        "culture_purpose_heading": "MİSSİYA VƏ DƏYƏRLƏRİ",
        "culture_purpose_statement": "Etibarlı tərəfdaş kimi insanların sağlamlığına qayğı göstərmək",
        "culture_purpose_text_1": "STADA – 125 ildən çoxdur ki “İnsanların sağlamlığına qayğı göstərmək” missiyasına riayət edən beynəlxalq əczaçılıq şirkətidir. STADA şirkəti istehsal etdiyi preparatların olduğu bütün ölkələrdə peşəkarlar və istehlakçılar üçün inamlı bir seçim olmasını təmin etməyə çalışır.",
        "culture_purpose_text_2": "Stada şirkətinin əsas biznes istiqamətləri — Consumer Healthcare seqmenti (reseptsiz olaraq satılan preparatlar, qida əlavələri, kosmetika, tibbi məhsullar) və, xüsusi dərmanlar da daxil olmaqla, ceneriklərdir. Şirkət məhsullarının keyfiyyətinə üstünlük verir: şirkətin bütün dünyada öz və müqavilə əsasında istehsal meydançaları vahid beynəlxalq keyfiyyət standartlarına (GMP) uyğun olaraq fəaliyyət göstərir.",
        "culture_values_heading": "Dəyərlərimiz",
        "culture_values_eyebrow": "Dəyərlərimiz",
        "culture_values_intro": "Ümumi dəyərlərimiz bizə STADA şirkətinin uzunmüddətli yüksəlişini və uğurunu təmin edən iddialı hədəflərə çatmağımıza imkan yaradır.",
        "about_compliance_heading": "KOMPLAENS",
        "about_compliance_intro_1": "Şirkətimiz etik işgüzar davranışa və komplaensə də riayət daxil olmaqla, hər istiqamətdə ən yaxşısını etməyə çalışır. Missiyamıza riayət etməklə istehlakçılar qarşısında məsuliyyətimizi dərk edirik və buna görə də dürüst və vicdanlı fəaliyyət məsələlərində güzəştə getmirik.",
        "about_compliance_intro_2": "Biz qanunvericiliyin tələblərini və Davranış məcəlləsi ilə müəyyən edilmiş dəyərlərimizi ciddi şəkildə rəhbər tuturuq. Etik və məsuliyyətli işgüzar davranış — şirkətimizə olan inamın möhkəmləndirilməsi üçün əsas təşkil edən korporativ mədəniyyətin ayrılmaz hissəsidir.",
        "about_compliance_speakup_heading": "Komplaens qrupunun və Avrasiya Etikasının Speak up Portalı və ümumi poçt qutusu",
        "about_compliance_speakup_text": "Hesab edirik ki, hər bir şəxs, şirkətdə işləyib-işləməməsindən asılı olmayaraq, şirkət işçi heyətinin, tərəfdaşlarının, tədarükçülərinin və podratçılarının qeyri-etik və qeyri-qanuni davranışları barədə məlumat verə bilməlidir.",
        "about_compliance_tools_text": "Bunun üçün STADA şirkətlər qrupunda məlumatlandırma sistemi tətbiq olunur — bu, Speak Up Portalı, eləcə də Komplaens Qrupunun və Avrasiya Etikasının ümumi poçt qutusudur (e-mail), bu alətlər istənilən şəxsə komplaensin norma və tələblərinə riayət edilməməsi halları və faktları barədə bildirişlər göndərməyə imkan yaradır, yəni, lakin bunlarla məhdudlaşmayaraq:",
        "about_compliance_item_fraud": "fırıldaqçılıq,",
        "about_compliance_item_corruption": "korrupsiya,",
        "about_compliance_item_competition": "rəqabətin (antiinhisar tələblərin) qorunması sahəsində pozuntular,",
        "about_compliance_item_conflict": "maraqların toqquşması haqqında.",
        "about_compliance_report_text": "Bu cür qanunsuz davranış hallarından xəbərdar olsanız, bizim eurasia_compliance@stada.kz ünvanımıza yazın və ya  linkinə keçid edərək birbaşa olaraq Portaldakı müraciəti formasını doldurun.",
        "about_compliance_confidentiality": "STADA Şirkətlər Qrupu daxil olan məlumatların məxfiliyinə zəmanət verir.",
        "about_compliance_questions": "Xəstələrin və İstehlakçıların xeyrinə əməkdaşlığın yaxşılaşdırılması məqsədilə Sizi maraqlandıran istənilən sual və təkliflərinizi Komplaens və Etika Qrupunun eurasia_compliance@stada.kz poçt qutusuna göndərə bilərsiniz.",
        "about_pv_heading": "FARMAKONƏZARƏT",
        "about_pv_text": "İnsanların sağlamlığına və rifahına qayğı Şirkətimizin əsas prioritetidir. Sizin pasiyent, qulluq edən şəxs və ya səhiyyə işçisi olmağınızdan asılı olmayaraq, Stada şirkətinin məhsulları ilə əlaqəli mənfi hadisələri bildirməyiniz vacibdir. Təqdim etdiyiniz məlumatlar məhsullarımızın və pasiyentlərimizin təhlükəsizliyini təmin etməyə kömək edir.",
        "about_pv_contact_label": "Stada şirkətinin dərman preparatları ilə bağlı bütün arzuolunmaz hadisələr barədə məlumatları aşağıdakı əlaqə vasitələri ilə bildirməyinizi xahiş edirik:",
        "culture_integrity_title": "DÜRÜSTLÜK",
        "culture_integrity_tagline": "Hər birimiz korporativ və ümumi qəbul edilmiş etik standartlara uyğun fəaliyyət göstəririk. Fəaliyyətimizin əsasını ifadə azadlığı və bir-birimizə hörmət təşkil edir.",
        "culture_entrepreneurship_title": "SAHİBKARLIQ",
        "culture_entrepreneurship_tagline": "Hər birimiz yeni ideya və həllər gətirir, şirkətin yüksəlişinə və inkişafına töhfə veririk.",
        "culture_agility_title": "ADAPTİVLİK",
        "culture_agility_tagline": "Hər birimiz — dəyişikliklər lideriyik. Çeviklik və qətiyyət — inkişafımızın və uğura aparan yolumuzun əsasıdır.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Biz ümumilikdə şirkətin maraqlarına uyğun hərəkət edirik, STADA şirkətinin uğuru ayrıca funksiyaların və bölmələrin maraqlarından daha vacibdir.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "STADA şirkətinin tarixçəsi 14 mart 1895-ci ildə Almaniyanın Drezden şəhərində başlamışdır. Yerli əczaçılar assosiasiya altında birləşərək effektiv və ucuz ictimai səhiyyəni təmin etmək məqsədi ilə standartlaşdırılmış preparatlar yaratmışlar.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Alman əczaçılıq assosiasiyası istehsalda vahid yanaşma yaratdı. Dərmanlar müxtəlif apteklərdə olmaqla eyni reseptlə, eyni qablaşmalarda hazırlanır və eyni qiymətə satılırdı. Və beləcə St.d.A abbreviaturası, yəni Standard Arzneimittel die Deutscher Apotheke yaradıldı ki, bu da rus dilinə tərcümədə “alman apteklərinin dərman standartı” deməkdir. O, ticarət markası kimi qeydiyyata alınmışdır.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "İkinci Dünya müharibəsi zamanı Cənub və Şimal olmaqla iki şirkətə bölünən STADA şirkəti 1954-cü ildə yenidən birləşmiş və Frankfurt Mayn yaxınlığındakı Bad-Vilbel şəhərində qərarlaşmışdır.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA yeni bir səviyyəyə çatır: Frankfurt Mayn ətrafında yerləşən istehsal meydançasında (əvvəllər olduğu kimi apteklərdə deyil) sənaye miqyasında preparatlarının istehsalına başlayır.",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "STADA şirkəti üçün çevrilmə ili oldu. Şirkət səhmdar cəmiyyətə çevrildi ki, bu da onun inkişafı üçün yeni təkan yaratdı.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Şirkət cenerik preparatların (patentləşdirilməmiş dərman vasitələrinin) istehsalı və satışına yönəlməyə qərar verir.",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA şirkəti Avropa və Asiyada nümayəndəliklərin açılması, eləcə də aktiv birləşmə və satınalınma strategiyası sayəsində beynəlxalq mövcudluğunu genişləndirməyə başlamışdır.",
        "supplied_history_date_7": "1993-cü ildən 2000-ci ilədək",
        "supplied_history_text_7": "100 illik yubileyində biznes öz yüksəlişini yaşamaqdadır. Şirkət satış həcminə görə alman sənayesi liderlərinin ilk onluğunda qərarlaşmışdır. 1997-1998-ci illərdə IPO keçirilmişdir. Şirkətin əsas fəaliyyət istiqamətləri ceneriklərin və reseptsiz satılan preparatların istehsalı olmuşdur. STADA şirkəti öz beynəlmiləlləşmə strategiyasına ardıcıllıqla riayət etməyə davam etməklə dinamik qlobal oyunçuya çevrilir.",
        "supplied_history_date_8": "2005-ci ildən 2010-cu ilədək",
        "supplied_history_text_8": "STADA şirkəti Qrup üçün strateji əhəmiyyət daşıyan Serbiyanın Hemofarm AG şirkətini satın alır. Alman törəmə şirkəti STADA ilk biosimilyarını təqdim edir. STADA şirkəti öz ilk korporativ istiqrazlarını uğurla yerləşdirir.",
        "supplied_history_date_9": "2010-cu ildən 2015-ci ilədək",
        "supplied_history_text_9": "STADA şirkəti firma məhsulların istehsalı sahəsində uğurlu satınalmalar həyata keçirir ki, bu da Qrup üçün getdikcə daha vacib hala gəlməkdədir. Bütün “STADA - gələcəyi qururuq” Qrupu çərçivəsində xərclərin səmərəliliyinin artırılması proqramı vaxtından əvvəl uğurla başa çatmışdır. STADA şirkəti reseptsiz olaraq satılan məhsulların istehsalçısı olan Thornton & Ross şirkətini satın alır.",
        "supplied_history_date_10": "2019-cu ildən 2020-ci ilədək",
        "supplied_history_text_10": "STADA AG şirkəti Walmark, GSK və Takeda kimi bir neçə iri əqdlərin bağlanması sayəsində Mərkəzi və Şərqi Avropa, Rusiya və Avrasiya bazarlarında mövqelərini gücləndirməkdədir. STADA şirkəti Consumer Healthcare seqmentinin liderinə çevrilir.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA şirkəti Specialty istiqamətində biznesini gücləndirməyə davam etməkdədir. Şirkət ilk qlobal inkişaf hesabatını təqdim etmiş və ən dayanıqlı əczaçılıq şirkətlərinin 10%-i arasında yer almışdır.",
        "supplied_history_heading": "TARİXÇƏ:",
        "hero_text1": "STADA şirkəti Qazaxıstanda “İlin sıçrayışı” və “İlin lideri” mükafatlarına layiq görülüb.",
        "news_1_text": "Əczaçılıq bazarının aparıcı ekspert analitikasını aparan Vi-ORTIS konsaltinq agentliyi Stada şirkətinin Qazaxıstan bazarındakı xidmətlərini qeyd edib.\n\nŞirkət pərakəndə bazarda “2023-cü ilin lideri” inamlı mövqeyini tutub. Bundan əlavə Stada şirkəti “Enterojermina” brendi ilə birgə OTC seqmentində və “Ksefokam” markası ilə birgə RX seqmentində “İlin sıçrayışı” adını qazanaraq liderlik mövqeyini gücləndirib.\n\nÜmumilikdə isə STADA şirkəti beş kateqoriya üzrə qeyd edilib:\n\nPərakəndə bazarda СНС seqmentində “İlin Sıçrayışı”\n\nPərakəndə bazarda ОТС seqmentində “İlin Sıçrayışı”\n\nPərakəndə bazarda “İlin Lideri”\n\nTibbi Təyinatlı Məmulatların pərakəndə bazarında 3-cü yer\n\nPərakəndə bazarda СНС seqmentində 3-cü yer",
        "hero_text2": "STADA Avrasiya şirkəti Eurasian Pharma Awards-da mükafat layiq görülüb",
        "news_2_text": "Mükafat Sanofi portfelinin uğurla birləşdirilməsinə görə “İlin tərəfdaşlığı” nominasiyasında qazanılıb.\n\nAvrasiya əczaçılıq sammiti çərçivəsində Avrasiya regionunun əczaçılıq sahəsi oyunçuları üçün əlamətdar olan mükafatlandırma mərasimi keçirilib.\n\nEurasian Pharma Awards — Orta Asiya, Qafqaz və Şərqi Avropa ölkələrinin əczaçılıq sahəsinin qabaqcıl şirkətlərini və peşəkarlarını birləşdirən parlaq hadisədir. Müsabiqə hər il bu sahənin müxtəlifliyini və yeniliyini əks etdirən 16 unikal nominasiyada keçirilir.\n\nSTADA Avrasiya şirkətinin vitse-prezidenti Arminas Matseviçus mükafatı müsabiqə təşkilatçılarından qəbul edib. “Sanofi məhsullarının Avrasiyada STADA şirkətinin portfelinə birləşdirilməsindən sonra şirkət СНС (Consumer Healthcare) seqmentində onsuz da güclü olan mövqelərini əhəmiyyətli dərəcədə möhkəmləndirməyi bacardı və planımızda bu istiqamətlərin həm investisiyalar, həm də Sanofi kimi tərəfdaşların cəlb edilməsi yolu ilə daha da inkişaf etdirilməsi var” - deyə spiker qeyd edib.\n\n2022-ci ildə STADA və Sanofi şirkətləri bir sıra Avrasiya ölkələrində CHC məhsul portfelinin distribyusiyasına dair razılaşma bağladılar. STADA şirkəti bu razılaşma çərçivəsində 01 aprel 2023-cü il tarixindən etibarən Avrasiya regionunun 10 ölkəsində istehlakçı sağlamlığı sahəsində tanınmış brendlərdən ibarət olan Sanofi şirkətinin preparat portfelinin distribyusiyasını və marketinq dəstəyini həyata keçirir.\n\nBu razılaşmaya Avrasiya ölkələri bazarlarında özünü yaxşı şəkildə sübut etmiş, istehlakçıların etibar etdiyi, brendin tanınmasının yüksək göstəricilərinə sahib olan və bir çox hallarda bazarda lider mövqe tutan 19 məhsul daxil edilmişdir.",
        "hero_text3": "Dövlət başçısı STADA Group şirkətinin vitse-prezidenti Kristos Qallislə görüşüb.",
        "news_3_text": "Görüşdə səhiyyə və əczaçılıq sahəsində əməkdaşlığın perspektivləri müzakirə olunub.\n\nKasım-Jomart Tokayev qeyd edib ki, STADA şirkəti Qazaxıstan bazarının sağlamlıq üçün istehlak malları seqmentinin ilk üçlüyünə daxildir. Onun sözlərinə görə, uğurlu və dinamik inkişaf edən əməkdaşlığın bariz nümunəsi kimi şirkətin Almatıdakı ofisinin açılışını qeyd etmək olar.\n\nPrezident qeyd edib ki, Qazaxıstanda biotexnoloji klasterin yaradılması üzrə fəal işlər aparılır.\n\nDövlət başçısının fikrincə STADA şirkətinin qarşısında QazBioPharm milli holdinqi ilə tədqiqat və istehsal sahəsində səylərin birləşdirilməsi üçün geniş imkanlar yaranmışdır.\n\nKasım-Jomart Tokayev birgə tədqiqatların və işlərin aparılması, istehsalın təşkili, təcrübə mübadiləsi və mütəxəssislərin ixtisasının artırılması məqsədilə alman şirkətini dəvət edib.\n\nÖz növbəsində Kristos Qallis əməkdaşlığın dərinləşdirilməsində maraqlı olduğunu bildirərək şirkətin Qazaxıstanda tibbi layihələrə və proqramlara investisiya qoymaq imkanlarını araşdırmağa hazır olduğunu vurğulayıb.\n\nSTADA şirkəti yüksək keyfiyyətli dərman vasitələrinin aparıcı istehsalçılarından biridir. Şirkət dünyanın 120 ölkəsində öz məhsullarının satışını həyata keçirir.",
        "news_4_title": "Kristos Qallis: biotexnoloji klasterin yaradılması – olduqca iddialı tapşırıqdır.",
        "news_4_text": "STADA Group şirkətinin vitse-prezidenti bazar tendensiyaları və Qazaxıstan Respublikasının hansı ölkələrin təcrübəsini mənimsəyə biləcəyi barədə danışdı\n\nIQVIA Institute for Human Data Science-in proqnozlarına görə dünya dərman vasitələri bazarı üç il ərzində orta hesabla 3-6% artacaqdır. Analitiklər bunun 2027-ci ilədək təxminən 1,9 trilyon dollara çatacağını təxmin edirlər. STADA Group şirkətinin vitse-prezidenti Kristos Qallis hesab edir ki, Qazaxıstanda əczaçılıq sənayesinin inkişafı üçün dərman vəsaitlərinin qeydiyyatı prosedurunu sürətləndirmək lazımdır. “Əczaçılıq bazarında çalışan və dövlət seqmentində böyük portfelə sahib olan həmkarlarımızın hesablamalarına görə, dosyenin hazırlanmasına başladıqdan innovativ preparatın bazara çıxdığı anadək 3,5 ildən 5 ilədək vaxt tələb olunur. Belə uzun qeydiyyat müddətləri əczaçılıq şirkətlərinin öz dərmanlarını Qazaxıstan bazarına çıxarmamaq qərarına gəlməsinin əsas səbəblərindən biridir”, - deyə ekspert hesab edir. Kapital.kz işgüzar informasiya mərkəzinin müxbiri ilə söhbətdə o, həmçinin Health Report 2023 tədqiqatının nəticələrindən, niyə bir çox əczaçılıq şirkətlərinin preparatların qiymətlərini qaldırmaq məcburiyyətində qaldığından və ölkəmizin biotexnoloji klaster yaratmaq üçün hansı bazaya ehtiyac duyduğundan danışıb.\n\nDaha ətrafıl: Kristos Qallis: biotexnoloji klasterin yaradılması – olduqca iddialı tapşırıqdır – Kapital (kapital.kz)",
        "news_5_title": "STADA şirkəti Avrasiyanın hospital seqmentində mövqeyini gücləndirmək niyyətindədir",
        "news_5_text": "Sentyabrın 26-dan 28-dək Səmərqənddə IV Avrasiya əczaçılıq sammiti keçiriləcək. “Kursiv Özbəkistan” biznes nəşri tədbirin baş informasiya tərəfdaşı kimi çıxış edəcək. Qarşıdan gələn sammit çərçivəsində “Kursiv” əczaçılıq bazarının qlobal və regional oyunçularının fikirlərini dərc etməyə başlayır.\n\nStada şirkətinin Avrasiya regionundakı vitse-prezidenti Arminas Matseviçus. Şirkət regionun tənzimləyici orqanları ilə qarşılıqlı fəaliyyətini davam etdirəcək.\n\n– Arminas, Avrasiya regionunda şirkətinizin qarşısında hansı prioritetlər dayanır? Hansı ölkələrdə və seqmentlərdə STADA şirkəti üçün daha böyük perspektivlər görürsünüz?\n\n– Sanofi məhsullarının Avrasiyada STADA şirkətinin portfelinə birləşdirilməsindən sonra biz СНС (Consumer Healthcare) seqmentində onsuz da güclü olan mövqelərimizi əhəmiyyətli dərəcədə möhkəmləndirməyi bacardıq. Şübhəsiz ki, biz bu istiqaməti həm investisiyalar vasitəsilə, həm də Sanofi kimi tərəfdaşları cəlb etməklə inkişaf etdirəcəyik.\n\nEyni zamanda yaxın bir neçə il ərzində şirkət hospital seqmentində və resept biznesində mövqeyini gücləndirmək niyyətindədir. Tanınma və/və ya sadələşdirilmiş qeydiyyat prosedurunun olduğu Avrasiya ölkələrində (məsələn, Moldova, Özbəkistan, Gürcüstanda) biz artıq bir sıra yeni Avropa resept dərmanlarını qeydiyyatdan keçirtmişik.\n\nBu işi davam etdirəcəyik, eləcə də bazara giriş prosedurunu daha da asanlaşdırmaq üçün bütün ölkələrimizin tənzimləyici orqanları ilə qarşılıqlı əlaqələr yaradacağıq.\n\nOrta və uzun müddətdə ceneriklər ilə yanaşı STADA şirkəti üçün əsas bizneslərdən biri olan biosimilyar seqmentinin inkişafını düşünürük. Hesab edirəm ki, artıq bir və ya il yarım ərzində biz Avrasiyanın sürətləndirilmiş qeydiyyatının mövcud olduğu bazarlarına bu cür dərmanları təklif edə biləcəyik. Daha ətraflı: STADA şirkəti hansı regionda mövqelərini gücləndirmək niyyətindədir (kursiv.media)"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "STADA şirkətinin tarixçəsi 14 mart 1895-ci ildə Almaniyanın Drezden şəhərində başlamışdır. Yerli əczaçılar assosiasiya altında birləşərək effektiv və ucuz ictimai səhiyyəni təmin etmək məqsədi ilə standartlaşdırılmış preparatlar yaratmışlar."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Alman əczaçılıq assosiasiyası istehsalda vahid yanaşma yaratdı. Dərmanlar müxtəlif apteklərdə olmaqla eyni reseptlə, eyni qablaşmalarda hazırlanır və eyni qiymətə satılırdı. Və beləcə St.d.A abbreviaturası, yəni Standard Arzneimittel die Deutscher Apotheke yaradıldı ki, bu da rus dilinə tərcümədə “alman apteklərinin dərman standartı” deməkdir. O, ticarət markası kimi qeydiyyata alınmışdır."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "İkinci Dünya müharibəsi zamanı Cənub və Şimal olmaqla iki şirkətə bölünən STADA şirkəti 1954-cü ildə yenidən birləşmiş və Frankfurt Mayn yaxınlığındakı Bad-Vilbel şəhərində qərarlaşmışdır."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA yeni bir səviyyəyə çatır: Frankfurt Mayn ətrafında yerləşən istehsal meydançasında (əvvəllər olduğu kimi apteklərdə deyil) sənaye miqyasında preparatlarının istehsalına başlayır."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "STADA şirkəti üçün çevrilmə ili oldu. Şirkət səhmdar cəmiyyətə çevrildi ki, bu da onun inkişafı üçün yeni təkan yaratdı."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Şirkət cenerik preparatların (patentləşdirilməmiş dərman vasitələrinin) istehsalı və satışına yönəlməyə qərar verir."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA şirkəti Avropa və Asiyada nümayəndəliklərin açılması, eləcə də aktiv birləşmə və satınalınma strategiyası sayəsində beynəlxalq mövcudluğunu genişləndirməyə başlamışdır."
          ]
        },
        {
          "date": "1993-cü ildən 2000-ci ilədək",
          "paragraphs": [
            "100 illik yubileyində biznes öz yüksəlişini yaşamaqdadır. Şirkət satış həcminə görə alman sənayesi liderlərinin ilk onluğunda qərarlaşmışdır. 1997-1998-ci illərdə IPO keçirilmişdir. Şirkətin əsas fəaliyyət istiqamətləri ceneriklərin və reseptsiz satılan preparatların istehsalı olmuşdur. STADA şirkəti öz beynəlmiləlləşmə strategiyasına ardıcıllıqla riayət etməyə davam etməklə dinamik qlobal oyunçuya çevrilir."
          ]
        },
        {
          "date": "2005-ci ildən 2010-cu ilədək",
          "paragraphs": [
            "STADA şirkəti Qrup üçün strateji əhəmiyyət daşıyan Serbiyanın Hemofarm AG şirkətini satın alır. Alman törəmə şirkəti STADA ilk biosimilyarını təqdim edir. STADA şirkəti öz ilk korporativ istiqrazlarını uğurla yerləşdirir."
          ]
        },
        {
          "date": "2010-cu ildən 2015-ci ilədək",
          "paragraphs": [
            "STADA şirkəti firma məhsulların istehsalı sahəsində uğurlu satınalmalar həyata keçirir ki, bu da Qrup üçün getdikcə daha vacib hala gəlməkdədir. Bütün “STADA - gələcəyi qururuq” Qrupu çərçivəsində xərclərin səmərəliliyinin artırılması proqramı vaxtından əvvəl uğurla başa çatmışdır. STADA şirkəti reseptsiz olaraq satılan məhsulların istehsalçısı olan Thornton & Ross şirkətini satın alır."
          ]
        },
        {
          "date": "2019-cu ildən 2020-ci ilədək",
          "paragraphs": [
            "STADA AG şirkəti Walmark, GSK və Takeda kimi bir neçə iri əqdlərin bağlanması sayəsində Mərkəzi və Şərqi Avropa, Rusiya və Avrasiya bazarlarında mövqelərini gücləndirməkdədir. STADA şirkəti Consumer Healthcare seqmentinin liderinə çevrilir."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA şirkəti Specialty istiqamətində biznesini gücləndirməyə davam etməkdədir. Şirkət ilk qlobal inkişaf hesabatını təqdim etmiş və ən dayanıqlı əczaçılıq şirkətlərinin 10%-i arasında yer almışdır."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "STADA şirkəti Qazaxıstanda “İlin sıçrayışı” və “İlin lideri” mükafatlarına layiq görülüb.",
          "date": "15.02.2024",
          "text": "Əczaçılıq bazarının aparıcı ekspert analitikasını aparan Vi-ORTIS konsaltinq agentliyi Stada şirkətinin Qazaxıstan bazarındakı xidmətlərini qeyd edib.\n\nŞirkət pərakəndə bazarda “2023-cü ilin lideri” inamlı mövqeyini tutub. Bundan əlavə Stada şirkəti “Enterojermina” brendi ilə birgə OTC seqmentində və “Ksefokam” markası ilə birgə RX seqmentində “İlin sıçrayışı” adını qazanaraq liderlik mövqeyini gücləndirib.\n\nÜmumilikdə isə STADA şirkəti beş kateqoriya üzrə qeyd edilib:\n\nPərakəndə bazarda СНС seqmentində “İlin Sıçrayışı”\n\nPərakəndə bazarda ОТС seqmentində “İlin Sıçrayışı”\n\nPərakəndə bazarda “İlin Lideri”\n\nTibbi Təyinatlı Məmulatların pərakəndə bazarında 3-cü yer\n\nPərakəndə bazarda СНС seqmentində 3-cü yer",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA Avrasiya şirkəti Eurasian Pharma Awards-da mükafat layiq görülüb",
          "date": "04.10.2023",
          "text": "Mükafat Sanofi portfelinin uğurla birləşdirilməsinə görə “İlin tərəfdaşlığı” nominasiyasında qazanılıb.\n\nAvrasiya əczaçılıq sammiti çərçivəsində Avrasiya regionunun əczaçılıq sahəsi oyunçuları üçün əlamətdar olan mükafatlandırma mərasimi keçirilib.\n\nEurasian Pharma Awards — Orta Asiya, Qafqaz və Şərqi Avropa ölkələrinin əczaçılıq sahəsinin qabaqcıl şirkətlərini və peşəkarlarını birləşdirən parlaq hadisədir. Müsabiqə hər il bu sahənin müxtəlifliyini və yeniliyini əks etdirən 16 unikal nominasiyada keçirilir.\n\nSTADA Avrasiya şirkətinin vitse-prezidenti Arminas Matseviçus mükafatı müsabiqə təşkilatçılarından qəbul edib. “Sanofi məhsullarının Avrasiyada STADA şirkətinin portfelinə birləşdirilməsindən sonra şirkət СНС (Consumer Healthcare) seqmentində onsuz da güclü olan mövqelərini əhəmiyyətli dərəcədə möhkəmləndirməyi bacardı və planımızda bu istiqamətlərin həm investisiyalar, həm də Sanofi kimi tərəfdaşların cəlb edilməsi yolu ilə daha da inkişaf etdirilməsi var” - deyə spiker qeyd edib.\n\n2022-ci ildə STADA və Sanofi şirkətləri bir sıra Avrasiya ölkələrində CHC məhsul portfelinin distribyusiyasına dair razılaşma bağladılar. STADA şirkəti bu razılaşma çərçivəsində 01 aprel 2023-cü il tarixindən etibarən Avrasiya regionunun 10 ölkəsində istehlakçı sağlamlığı sahəsində tanınmış brendlərdən ibarət olan Sanofi şirkətinin preparat portfelinin distribyusiyasını və marketinq dəstəyini həyata keçirir.\n\nBu razılaşmaya Avrasiya ölkələri bazarlarında özünü yaxşı şəkildə sübut etmiş, istehlakçıların etibar etdiyi, brendin tanınmasının yüksək göstəricilərinə sahib olan və bir çox hallarda bazarda lider mövqe tutan 19 məhsul daxil edilmişdir.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Dövlət başçısı STADA Group şirkətinin vitse-prezidenti Kristos Qallislə görüşüb.",
          "date": "29.09.2023Almaniya, Berlin şəh.",
          "text": "Görüşdə səhiyyə və əczaçılıq sahəsində əməkdaşlığın perspektivləri müzakirə olunub.\n\nKasım-Jomart Tokayev qeyd edib ki, STADA şirkəti Qazaxıstan bazarının sağlamlıq üçün istehlak malları seqmentinin ilk üçlüyünə daxildir. Onun sözlərinə görə, uğurlu və dinamik inkişaf edən əməkdaşlığın bariz nümunəsi kimi şirkətin Almatıdakı ofisinin açılışını qeyd etmək olar.\n\nPrezident qeyd edib ki, Qazaxıstanda biotexnoloji klasterin yaradılması üzrə fəal işlər aparılır.\n\nDövlət başçısının fikrincə STADA şirkətinin qarşısında QazBioPharm milli holdinqi ilə tədqiqat və istehsal sahəsində səylərin birləşdirilməsi üçün geniş imkanlar yaranmışdır.\n\nKasım-Jomart Tokayev birgə tədqiqatların və işlərin aparılması, istehsalın təşkili, təcrübə mübadiləsi və mütəxəssislərin ixtisasının artırılması məqsədilə alman şirkətini dəvət edib.\n\nÖz növbəsində Kristos Qallis əməkdaşlığın dərinləşdirilməsində maraqlı olduğunu bildirərək şirkətin Qazaxıstanda tibbi layihələrə və proqramlara investisiya qoymaq imkanlarını araşdırmağa hazır olduğunu vurğulayıb.\n\nSTADA şirkəti yüksək keyfiyyətli dərman vasitələrinin aparıcı istehsalçılarından biridir. Şirkət dünyanın 120 ölkəsində öz məhsullarının satışını həyata keçirir.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Kristos Qallis: biotexnoloji klasterin yaradılması – olduqca iddialı tapşırıqdır.",
          "date": "19.12.2023",
          "text": "STADA Group şirkətinin vitse-prezidenti bazar tendensiyaları və Qazaxıstan Respublikasının hansı ölkələrin təcrübəsini mənimsəyə biləcəyi barədə danışdı\n\nIQVIA Institute for Human Data Science-in proqnozlarına görə dünya dərman vasitələri bazarı üç il ərzində orta hesabla 3-6% artacaqdır. Analitiklər bunun 2027-ci ilədək təxminən 1,9 trilyon dollara çatacağını təxmin edirlər. STADA Group şirkətinin vitse-prezidenti Kristos Qallis hesab edir ki, Qazaxıstanda əczaçılıq sənayesinin inkişafı üçün dərman vəsaitlərinin qeydiyyatı prosedurunu sürətləndirmək lazımdır. “Əczaçılıq bazarında çalışan və dövlət seqmentində böyük portfelə sahib olan həmkarlarımızın hesablamalarına görə, dosyenin hazırlanmasına başladıqdan innovativ preparatın bazara çıxdığı anadək 3,5 ildən 5 ilədək vaxt tələb olunur. Belə uzun qeydiyyat müddətləri əczaçılıq şirkətlərinin öz dərmanlarını Qazaxıstan bazarına çıxarmamaq qərarına gəlməsinin əsas səbəblərindən biridir”, - deyə ekspert hesab edir. Kapital.kz işgüzar informasiya mərkəzinin müxbiri ilə söhbətdə o, həmçinin Health Report 2023 tədqiqatının nəticələrindən, niyə bir çox əczaçılıq şirkətlərinin preparatların qiymətlərini qaldırmaq məcburiyyətində qaldığından və ölkəmizin biotexnoloji klaster yaratmaq üçün hansı bazaya ehtiyac duyduğundan danışıb.\n\nDaha ətrafıl: Kristos Qallis: biotexnoloji klasterin yaradılması – olduqca iddialı tapşırıqdır – Kapital (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "STADA şirkəti Avrasiyanın hospital seqmentində mövqeyini gücləndirmək niyyətindədir",
          "date": "13.09.2023",
          "text": "Sentyabrın 26-dan 28-dək Səmərqənddə IV Avrasiya əczaçılıq sammiti keçiriləcək. “Kursiv Özbəkistan” biznes nəşri tədbirin baş informasiya tərəfdaşı kimi çıxış edəcək. Qarşıdan gələn sammit çərçivəsində “Kursiv” əczaçılıq bazarının qlobal və regional oyunçularının fikirlərini dərc etməyə başlayır.\n\nStada şirkətinin Avrasiya regionundakı vitse-prezidenti Arminas Matseviçus. Şirkət regionun tənzimləyici orqanları ilə qarşılıqlı fəaliyyətini davam etdirəcək.\n\n– Arminas, Avrasiya regionunda şirkətinizin qarşısında hansı prioritetlər dayanır? Hansı ölkələrdə və seqmentlərdə STADA şirkəti üçün daha böyük perspektivlər görürsünüz?\n\n– Sanofi məhsullarının Avrasiyada STADA şirkətinin portfelinə birləşdirilməsindən sonra biz СНС (Consumer Healthcare) seqmentində onsuz da güclü olan mövqelərimizi əhəmiyyətli dərəcədə möhkəmləndirməyi bacardıq. Şübhəsiz ki, biz bu istiqaməti həm investisiyalar vasitəsilə, həm də Sanofi kimi tərəfdaşları cəlb etməklə inkişaf etdirəcəyik.\n\nEyni zamanda yaxın bir neçə il ərzində şirkət hospital seqmentində və resept biznesində mövqeyini gücləndirmək niyyətindədir. Tanınma və/və ya sadələşdirilmiş qeydiyyat prosedurunun olduğu Avrasiya ölkələrində (məsələn, Moldova, Özbəkistan, Gürcüstanda) biz artıq bir sıra yeni Avropa resept dərmanlarını qeydiyyatdan keçirtmişik.\n\nBu işi davam etdirəcəyik, eləcə də bazara giriş prosedurunu daha da asanlaşdırmaq üçün bütün ölkələrimizin tənzimləyici orqanları ilə qarşılıqlı əlaqələr yaradacağıq.\n\nOrta və uzun müddətdə ceneriklər ilə yanaşı STADA şirkəti üçün əsas bizneslərdən biri olan biosimilyar seqmentinin inkişafını düşünürük. Hesab edirəm ki, artıq bir və ya il yarım ərzində biz Avrasiyanın sürətləndirilmiş qeydiyyatının mövcud olduğu bazarlarına bu cür dərmanları təklif edə biləcəyik. Daha ətraflı: STADA şirkəti hansı regionda mövqelərini gücləndirmək niyyətindədir (kursiv.media)",
          "image": {}
        }
      ]
    },
    "hy": {
      "source": "АРМ/01.10.2024_Stada.kz_Армянский.docx",
      "text": {
        "about_par1": "«ՇՏԱԴԱ»-ն միջազգային դեղագործական ընկերություն է, որն ավելի քան 130 տարի շարունակ հետամուտ է իր առաքելությանը՝ «Հոգ տանել մարդկանց առողջության մասին՝ վստահելի հարաբերություններ կառուցելով գործընկերների և սպառողների հետ»: «ՇՏԱԴԱ»-ի գործունեության հիմնական ոլորտներն են սպառողների առողջության պահպանման (CHC) հատվածի արտադրանքը, ջեներիկ դեղերը և մասնագիտացված դեղամիջոցները (ներառյալ կենսահամանման դեղապատրաստուկները): «ՇՏԱԴԱ»-ի արտադրանքը ներկայացված է աշխարհի 100 երկրներում:",
        "about_par2": "2022 թվականին ԱՊՀ երկրների տարածաշրջանը դարձավ անկախ ձեռնարկատիրական միավոր և վերանվանվեց «ՇՏԱԴԱ Եվրասիա»՝ որն անմիջականորեն ենթարկվում է Գերմանիայում գտնվող գլխավոր գրասենյակին։ Տարածաշրջանում ներկայացված է 11 երկիր՝ Ղազախստան, Ուզբեկստան, Բելառուս, Ադրբեջան, Վրաստան, Մոլդովա, Ղրղզստան, Հայաստան, Մոնղոլիա, Տաջիկստան, Թուրքմենստան։",
        "about_list1": "«ՇՏԱԴԱ Եվրասիա»-ի գլխավոր գրասենյակը գտնվում է Ալմաթիում, Ղազաստան: Ընկերությունը նաև «STADA Arzneimittel AG» իրավաբանական անձինք է գրանցել տարածաշրջանի երկրների մեծ մասում: 2023 թվականի ապրիլի 1-ից «ՇՏԱԴԱ»-ն տարածաշրջանում ներկայացնում է «Սանոֆի» ընկերության առանց դեղատոմսերի դեղամիջոցների պորտֆելը:",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Հոգ տանել մարդկանց առողջության մասին՝ որպես վստահելի գործընկեր",
        "about_page_overview_1": "«ՇՏԱԴԱ»-ն միջազգային դեղագործական ընկերություն է, որն ավելի քան 130 տարի շարունակ հետամուտ է իր առաքելությանը՝ «Հոգ տանել մարդկանց առողջության մասին՝ վստահելի հարաբերություններ կառուցելով գործընկերների և սպառողների հետ»: «ՇՏԱԴԱ»-ի գործունեության հիմնական ոլորտներն են սպառողների առողջության պահպանման (CHC) հատվածի արտադրանքը, ջեներիկ դեղերը և մասնագիտացված դեղամիջոցները (ներառյալ կենսահամանման դեղապատրաստուկները): «ՇՏԱԴԱ»-ի արտադրանքը ներկայացված է աշխարհի 100 երկրներում:",
        "about_page_intro_2": "2022 թվականին ԱՊՀ երկրների տարածաշրջանը դարձավ անկախ ձեռնարկատիրական միավոր և վերանվանվեց «ՇՏԱԴԱ Եվրասիա»՝ որն անմիջականորեն ենթարկվում է Գերմանիայում գտնվող գլխավոր գրասենյակին։ Տարածաշրջանում ներկայացված է 11 երկիր՝ Ղազախստան, Ուզբեկստան, Բելառուս, Ադրբեջան, Վրաստան, Մոլդովա, Ղրղզստան, Հայաստան, Մոնղոլիա, Տաջիկստան, Թուրքմենստան։",
        "about_page_intro_3": "«ՇՏԱԴԱ Եվրասիա»-ի գլխավոր գրասենյակը գտնվում է Ալմաթիում, Ղազաստան: Ընկերությունը նաև «STADA Arzneimittel AG» իրավաբանական անձինք է գրանցել տարածաշրջանի երկրների մեծ մասում: 2023 թվականի ապրիլի 1-ից «ՇՏԱԴԱ»-ն տարածաշրջանում ներկայացնում է «Սանոֆի» ընկերության առանց դեղատոմսերի դեղամիջոցների պորտֆելը:",
        "culture_purpose_heading": "ԱՌԱՔԵԼՈՒԹՅՈՒՆ ԵՎ ԱՐԺԵՔՆԵՐ",
        "culture_purpose_statement": "Հոգ տանել մարդկանց առողջության մասին՝ որպես վստահելի գործընկեր",
        "culture_purpose_text_1": "«ՇՏԱԴԱ»-ն միջազգային դեղագործական ընկերություն է, որն ավելի քան 125 տարի շարունակ հետամուտ է մարդկանց առողջության մասին հոգ տանելու իր առաքելությանը՝ որպես վստահելի գործընկեր: «ՇՏԱԴԱ»-ն ձգտում է ապահովել, որպեսզի ընկերության կողմից արտադրված դեղամիջոցները լինեն մասնագետների և սպառողների վստահ ընտրությունն այն բոլոր երկրներում, որտեղ ընկերությունը ներկայացված է:",
        "culture_purpose_text_2": "«ՇՏԱԴԱ»-ի ձեռնարկատիրական գործունեության հիմնական ոլորտներն են սպառողների առողջության պահպանման հատվածը (առանց դեղատոմսի դեղամիջոցներ, սննդային հավելումներ, կոսմետիկա, բժշկական սարքեր) և ջեներիկ դեղեր, ներառյալ մասնագիտացված դեղամիջոցները: Ընկերությունն առաջնահերթ ուշադրություն է դարձնում արտադրանքի որակին. ընկերության սեփական և պայմանագրային արտադրամասերն ամբողջ աշխարհում գործում են որակի միջազգային միասնական չափանիշներին (GMP) համապատասխան:",
        "culture_values_heading": "Մեր արժեքները",
        "culture_values_eyebrow": "Մեր արժեքները",
        "culture_values_intro": "Ընդհանուր արժեքները մեզ թույլ են տալիս իրագործել հավակնոտ նպատակներ՝ երկարաժամկետ հեռանկարում ապահովելով «ՇՏԱԴԱ»-ի աճն ու հաջողությունը:",
        "about_compliance_heading": "ԿՈՄՊԼԱԵՆՍ (ՀԱՄԱՊԱՏԱՍԽԱՆՈՒԹՅՈՒՆ ԵՎ ԲԱՐԵՎԱՐՔՈՒԹՅՈՒՆ)",
        "about_compliance_intro_1": "Մեր ընկերությունը ձգտում է լավագույնը լինել ամեն հարցում, ներառյալ էթիկական գործարար վարքագիծը և համապատասխանությունը: Հետևելով մեր առաքելությանը` մենք գիտակցում ենք սպառողների հանդեպ մեր պատասխանատվությունը և, հետևաբար, փոխզիջման չենք գնում ազնիվ և բարեխիղճ աշխատանքին առնչվող հարցերում:",
        "about_compliance_intro_2": "Մենք խստորեն առաջնորդվում ենք օրենսդրության պահանջներով և մեր արժեքներով, որոնք ամրագրված են Վարքագծի կանոնագրքում: Էթիկական և պատասխանատու գործարար վարքագիծը մեր կորպորատիվ մշակույթի անբաժանելի մասն է, որը հիմք է հանդիսանում մեր ընկերության նկատմամբ վստահության ձևավորման համար:",
        "about_compliance_speakup_heading": "«Speak up» պորտալ և Եվրասիայի Կոմպլաենսի ու էթիկայի խմբի ընդհանուր փոստարկղ",
        "about_compliance_speakup_text": "Մենք կարծում ենք, որ յուրաքանչյուր ոք, անկախ նրանից՝ ընկերությունում է աշխատում, թե ոչ, պետք է հնարավորություն ունենա հաղորդել ընկերության անձնակազմի, գործընկերների, մատակարարների և կապալառուների կողմից ոչ էթիկական կամ անիրավաչափ վարքագծի միջադեպերի մասին:",
        "about_compliance_tools_text": "Այդ նպատակով «ՇՏԱԴԱ» ընկերությունների խմբում ներդրվել է տեղեկատվական համակարգ՝ «Speak up» պորտալը, ինչպես նաև Եվրասիայի համապատասխանության և Էթիկայի խմբի ընդհանուր փոստարկղը (էլ.փոստը)․ այս գործիքները ցանկացած անձի թույլ են տալիս հաղորդագրություններ ուղարկել համապատասխանության նորմերի և պահանջների չկատարման դեպքերի և փաստերի, մասնավորապես, ի թիվս այլոց.",
        "about_compliance_item_fraud": "խարդախության,",
        "about_compliance_item_corruption": "կոռուպցիայի,",
        "about_compliance_item_competition": "մրցակցության պաշտպանության ոլորտում (հակամենաշնորհային պահանջների) խախտումների,",
        "about_compliance_item_conflict": "շահերի բախման մասին։",
        "about_compliance_report_text": "Անիրավաչափ վարքագծի նմանատիպ միջադեպերի մասին տեղյակ լինելու դեպքում, խնդրում ենք գրել մեզ eurasia_compliance@stada.kz  հասցեով կամ Պորտալում՝ անմիջականորեն լրացրեք հայտը՝ անցնելով հղմամբ:",
        "about_compliance_confidentiality": "«ՇՏԱԴԱ» ընկերությունների խումբը երաշխավորում է ստացված տեղեկատվության գաղտնիությունը:",
        "about_compliance_questions": "Կոմպլաենսի և էթիկայի խմբի էլեկտրոնային հասցեով՝ eurasia_compliance@stada.kz, կարող եք ուղարկել համատեղ աշխատանքի բարելավման վերաբերյալ ցանկացած հարց և առաջարկ՝ հօգուտ հիվանդների և սպառողների:",
        "about_pv_heading": "ԴԵՂԱԶԳՈՆՈՒԹՅՈՒՆ",
        "about_pv_text": "Մարդկանց առողջության և բարեկեցության մասին հոգալը մեր ընկերության հիմնական առաջնահերթությունն է: Անկախ նրանից՝ դուք հիվանդ եք, խնամող, թե բուժաշխատող, կարևոր է հաղորդել «Շտադա»-ի արտադրանքի հետ կապված անբարենպաստ ազղեցությունների մասին: Ձեր տրամադրած տեղեկատվությունն օգնում է ապահովել մեր արտադրանքի և հիվանդների անվտանգությունը:",
        "about_pv_contact_label": "Խնդրում ենք «Շտադա» դեղամիջոցների անբարենպաստ ազդեցությունների բոլոր դեպքերը հաղորդել հետևյալ կոնտակտային տվյալներով.",
        "about_leadership_intro": "Արմինաս Մացևիչուս, Նատալյա Գարիպովա",
        "about_leader_ospanov_name": "Արմինաս Մացևիչուս",
        "about_leader_garipova_name": "Նատալյա Գարիպովա",
        "culture_integrity_title": "ԲԱՐԵՎԱՐՔՈՒԹՅՈՒՆ",
        "culture_integrity_tagline": "Մեզնից յուրաքանչյուրը գործում է կորպորատիվ և ընդհանուր ընդունված էթիկական չափանիշներին համապատասխան: Մեր գործունեությունը հիմնված է խոսքի ազատության և միմյանց նկատմամբ հարգանքի վրա:",
        "culture_entrepreneurship_title": "ՁԵՌՆԱՐԿԱՏԻՐՈՒԹՅՈՒՆ",
        "culture_entrepreneurship_tagline": "Մեզնից յուրաքանչյուրը ներմուծում է նոր գաղափարներ և լուծումներ, նպաստում ընկերության աճին և զարգացմանը:",
        "culture_agility_title": "ՃԿՈՒՆՈՒԹՅՈՒՆ",
        "culture_agility_tagline": "Մեզնից յուրաքանչյուրը փոփոխությունների առաջնորդ է։ Ճկունությունն ու վճռականությունը մեր զարգացման և հաջողության ուղու հիմքն են:",
        "culture_one_title": "ՄԵԿ «ՇՏԱԴԱ»",
        "culture_one_tagline": "Մենք գործում ենք ընկերության ընդհանուր շահերից ելնելով, «ՇՏԱԴԱ»-ի հաջողությունն ավելի կարևոր է, քան առանձին գործառույթների և բաժինների շահերը:",
        "supplied_history_date_0": "1895թ․",
        "supplied_history_text_0": "«ՇՏԱԴԱ»-ի պատմությունը սկսվել է 1895 թվականի մարտի 14-ին Գերմանիայի Դրեզդեն քաղաքում։ Տեղացի դեղագործները, միավորվելով մեկ ընկերակցության մեջ, ստեղծում են ստանդարտացված դեղամիջոցներ՝ հանրության համար արդյունավետ և մատչելի առողջապահություն ապահովելու նպատակով:",
        "supplied_history_date_1": "1935թ․",
        "supplied_history_text_1": "Գերմանական դեղագործական ընկերակցությունը արտադրությունում ստեղծում է միասնական մոտեցում։ Դեղերը պատրաստվում են տարբեր դեղատներում, բայց նույն բաղադրատոմսով, միանման փաթեթավորմամբ և վաճառվում են միևնույն գնով։ Այսպես, ի հայտ է գալիս St.d.A հապավումը՝ Standard Arzneimittel die Deutscher Apotheke, որը հայերեն թարգմանաբար նշանակում է «Գերմանական դեղատների դեղորայքային չափորոշիչ»։ Այն գրանցված է որպես ապրանքային նշան:",
        "supplied_history_date_2": "1954թ․",
        "supplied_history_text_2": "Երկրորդ համաշխարհային պատերազմի ժամանակ բաժանվելով երկու ընկերությունների՝ Հարավային և Հյուսիսային, «ՇՏԱԴԱ»-ն կրկին միավորվում է 1954 թվականին և հաստատվում Մայնի Ֆրանկֆուրտից ոչ հեռու գտնվող Բադ Վիլբել քաղաքում։",
        "supplied_history_date_3": "1961թ․",
        "supplied_history_text_3": "«ՇՏԱԴԱ»-ն ձեռք է բերում նոր մակարդակ. սկսում է արդյունաբերական ընդգրկմամբ դեղամիջոցներ արտադրել Մայնի Ֆրանկֆուրտի արվարձանում գտնվող արտադրամասում (և ոչ դեղատներում, ինչպես նախկինում):",
        "supplied_history_date_4": "1970թ․",
        "supplied_history_text_4": "Շրջադարձային տարեթիվ «ՇՏԱԴԱ»-ի համար: Ընկերությունը վերակազմակերպվել է բաժնետիրական ընկերության, ինչը նոր թափ է հաղորդում նրա զարգացմանը։",
        "supplied_history_date_5": "1975թ․",
        "supplied_history_text_5": "Ընկերությունը որոշում է կենտրոնանալ ջեներիկ դեղերի (չարտոնագրված դեղամիջոցների) արտադրության և վաճառքի վրա։",
        "supplied_history_date_6": "1986թ․",
        "supplied_history_text_6": "«ՇՏԱԴԱ»-ն սկսում է ընդլայնել իր միջազգային ներկայությունը՝ Եվրոպայում և Ասիայում ներկայացուցչություններ բացելու, ինչպես նաև միաձուլումների և կլանումների ակտիվ ռազմավարության միջոցով:",
        "supplied_history_date_7": "1993 – 2000թթ․",
        "supplied_history_text_7": "Իր գործունեության 100-ամյակին ձեռնարկատիրությունը վերելք է ապրում: Ընկերությունը վաճառքի ծավալով գերմանական արդյունաբերության առաջատար տասնյակում է: 1997-1998թթ. անցկացվել է արժեթղթերի առաջնային հրապարակային առաջարկ (IPO)։ Ընկերության գործունեության հիմնական ոլորտները ներկայացնում է ջեներիկ դեղերի և առանց դեղատոմսի դեղամիջոցների արտադրությունը։ «ՇՏԱԴԱ»-ն շարունակում է հետևողականորեն հետամուտ լինել միջազգայնացման իր ռազմավարությանը և վերածվում է հարաճուն համաշխարհային դերակատարի:",
        "supplied_history_date_8": "2005 – 2010 թթ․",
        "supplied_history_text_8": "«ՇՏԱԴԱ»-ն ձեռք է բերում սերբական «Հեմոֆարմ AG» ընկերությունը, որը ռազմավարական նշանակություն ունի Խմբի համար: «ՇՏԱԴԱ»-ի գերմանական դուստր ձեռնարկությունը ներկայացնում է առաջին կենսահամանման դեղապատրաստուկը: «ՇՏԱԴԱ»-ն հաջողությամբ թողարկում է իր առաջին կորպորատիվ բաժնետոմսերը:",
        "supplied_history_date_9": "2010 – 2015թթ․",
        "supplied_history_text_9": "«ՇՏԱԴԱ»-ն հաջող ձեռքբերումներ է գրանցում ֆիրմային ապրանքների արտադրության ոլորտում, ինչը գնալով ավելի մեծ կարևորություն է ձեռք բերում Խմբի համար: Հաջողությամբ վաղաժամկետ ավարտվում է Խմբի ողջ ընդգրկմամբ ծախսերի արդյունավետության բարձրացման ««ՇՏԱԴԱ» – կառուցում ենք ապագան» ծրագիրը: «ՇՏԱԴԱ»-ն ձեռք է բերում առանց դեղատոմսի արտադրանք արտադրող բրիտանական «Thornton & Ross» ընկերությունը:",
        "supplied_history_date_10": "2019 – 2020թթ․",
        "supplied_history_text_10": "«ՇՏԱԴԱ» ԲԸ-ն ամրապնդում է իր դիրքերը Կենտրոնական և Արևելյան Եվրոպայի, Ռուսաստանի և Եվրասիայի շուկաներում մի քանի խոշոր գործարքների՝ Walmark-ի, GSK-ի և Takeda-ի կնքման շնորհիվ: «ՇՏԱԴԱ»-ն դառնում է սպառողների առողջության պահպանման հատվածի առաջատարը:",
        "supplied_history_date_11": "2022թ․",
        "supplied_history_text_11": "«ՇՏԱԴԱ»-ն շարունակում է ամրապնդել իր ձեռնարկատիրությունը Specialty (Մասնագիտացված բարձր սեգմենտի) դեղորայքի ուղղությամբ: Ընկերությունը ներկայացնում է կայուն զարգացման մասին առաջին համաշխարհային զեկույցը և ընդգրկվում 10% առավել կայուն դեղագործական ընկերությունների շարքում:",
        "supplied_history_heading": "ՊԱՏՄՈՒԹՅՈՒՆ․",
        "hero_text1": "«ՇՏԱԴԱ»-ն Ղազախստանում արժանացել է «Տարվա բեկում» և «Տարվա առաջատար» մրցանակներին",
        "news_1_text": "Դեղագործական շուկայի փորձագիտական ​​վերլուծությամբ զբաղվող «Vi-ORTIS» խորհրդատվական գործակալությունը նշել է Ղազախստանի շուկայում «ՇՏԱԴԱ»-ի ձեռքբերումները:\n\nԸնկերությունը վստահ դիրք է գրավել որպես «2023 թվականի տարվա առաջատար» մանրածախ շուկայում: Ի թիվս այլոց, «ՇՏԱԴԱ»-ն ամրապնդել է իր առաջատար դիրքերը՝ նվաճելով «Տարվա բեկում» մրցանակն առանց դեղատոմսի դեղամիջոցների  հատվածում «Էնտերոժերմինա» ապրանքանիշով և դեղատոմսով դեղամիջոցների հատվածում՝ «Քսեֆոկամ» ապրանքանիշով:\n\nԸնդհանուր առմամբ, «ՇՏԱԴԱ»-ն հաղթել է հինգ անվանակարգերում.\n\n«Տարվա բեկում» մանրածախ շուկայում՝ սպառողների առողջության պահպանման\n\nհատվածում\n\n«Տարվա բեկում» մանրածախ շուկայում՝ առանց դեղատոմսի դեղամիջոցների հատվածում\n\n«Տարվա առաջատար» մանրածախ շուկայում\n\n3-րդ տեղ բժշկական պարագաների մանրածախ շուկայում\n\n3-րդ տեղ մանրածախ շուկայում՝ սպառողների առողջության պահպանման\n\nհատվածում",
        "hero_text2": "«ՇՏԱԴԱ Եվրասիա»-ն մրցանակ է ստացել «Eurasian Pharma Awards» մրցանակաբաշխությունում",
        "news_2_text": "Մրցանակը տրվել է «Տարվա գործընկերություն» անվանակարգում՝ «Սանոֆի»-ի պորտֆելի հաջող միացման համար:\n\nԵվրասիական դեղագործական գագաթաժողովի շրջանակներում անցկացվել է մրցանակաբաշխություն, որը նշանակալի իրադարձություն էր Եվրասիայի տարածաշրջանի դեղագործական ոլորտի դերակատարների համար։\n\n«Eurasian Pharma Awards» մրցանակաբաշխությունն ուշագրավ միջոցառում է, որը համախմբում է Կենտրոնական Ասիայի, Կովկասի և Արևելյան Եվրոպայի երկրների դեղագործության ոլորտի առաջատար ընկերություններին և մասնագետներին: Մրցույթն անցկացվում է ամեն տարի 16 եզակի անվանակարգերում, որոնք արտացոլում են ոլորտի բազմազանությունն ու նորարարությունը։\n\nՄրցանակը մրցույթի կազմակերպիչներից ստացել է «ՇՏԱԴԱ Եվրասիա»-ի փոխնախագահ Արմինաս Մացևիչուսը։ ««Սանոֆի»-ի արտադրանքը Եվրասիայում «ՇՏԱԴԱ»-ի պորտֆելին միացնելուց հետո ընկերությանը հաջողվել է զգալիորեն ամրապնդել իր առանց այն էլ ամուր դիրքերը սպառողների առողջության պահպանման հատվածում (Consumer Healthcare) և նախատեսում է հետագայում զարգացնել այդ ոլորտներն ինչպես ներդրումների, այնպես էլ, հնարավոր է, այնպիսի գործընկերների ներգրավման միջոցով, ինչպիսին «Սանոֆի»-ն է»,- նշել է բանախոսը։\n\n2022 թվականին «ՇՏԱԴԱ»-ն և «Սանոֆի»-ն համաձայնագիր են կնքել սպառողների առողջության պահպանման հատվածի արտադրանքի պորտֆելը եվրասիական մի շարք երկրներում բաշխելու վերաբերյալ։ Համաձայնագրի շրջանակում «ՇՏԱԴԱ»-ն 2023 թվականի ապրիլի 1-ից Եվրասիայի տարածաշրջանի 10 երկրներում իրականացնում է սպառողների առողջության պահպանման ոլորտի հայտնի ապրանքանիշերից բաղկացած «Սանոֆի» ընկերության դեղամիջոցների պորտֆելի բաշխում, ինչպես նաև տրամադրում շուկայավարման հարցերով աջակցություն:\n\nՀամաձայնագրում ներառված են Եվրասիայի երկրների շուկաներում իրենց դրականորեն հանձնարարած 19 ապրանքներ, որոնց վստահում են ապրանքանիշի վերաբերյալ գիտելիքների բարձր ցուցանիշներ ունեցող և շատ դեպքերում շուկայում առաջատար դիրքեր զբաղեցնող սպառողները։",
        "hero_text3": "Երկրի ղեկավարը հանդիպել է «ՇՏԱԴԱ գրուպ»-ի փոխնախագահ Քրիստոս Գալիսի հետ",
        "news_3_text": "Հանդիպման ընթացքում քննարկվել են առողջապահության և դեղագործության ոլորտում համագործակցության հեռանկարները։\n\nԿասիմ-Ժոմարտ Տոկաևը նշել է, որ «ՇՏԱԴԱ»-ն Ղազախստանի շուկայի երեք առաջատարներից մեկն է սպառողների առողջության պահպանման արտադրանքի հատվածում։ Նրա խոսքերով, հաջող և հարաճուն զարգացող համագործակցության վառ օրինակ է Ալմաթիում ընկերության գրասենյակի բացումը։\n\nՆախագահն ուշադրություն է դարձրել այն հանգամանքի վրա, որ Ղազախստանում ակտիվ աշխատանքներ են տարվում կենսատեխնոլոգիական կլաստերի ստեղծման ուղղությամբ։\n\nԵրկրի ղեկավարի խոսքերով, «ՇՏԱԴԱ»-ի համար լայն հնարավորություններ են բացվում հետազոտությունների և արտադրության ոլորտում «QazBioPharm» ազգային հոլդինգի հետ ջանքերը միավորելու առումով։\n\nԿասիմ-Ժոմարտ Տոկաևը գերմանական ընկերությանը հրավիրել է համատեղ հետազոտություններ և մշակումներ իրականացնել, արտադրություն կազմակերպել, փորձի փոխանակում կատարել և բարձրացնել մասնագետների որակավորումը։\n\nՔրիստոս Գալիսն, իր հերթին, շահագրգռություն է դրսևորել համագործակցության խորացման հարցում և ընդգծել ընկերության պատրաստակամությունը՝ ուսումնասիրելու Ղազախստանում բժշկական նախագծերում և ծրագրերում ներդրումներ կատարելու հնարավորությունները։\n\n«ՇՏԱԴԱ»-ն հանդիսանում է բարձրորակ դեղամիջոցների առաջատար արտադրողներից մեկը։ Ընկերությունն իր արտադրանքն իրացնում է աշխարհի 120 երկրներում։",
        "news_4_title": "Քրիստոս Գալիս. Կենսատեխնոլոգիական կլաստերի ստեղծումը խիստ հավակնոտ խնդիր է:",
        "news_4_text": "«ՇՏԱԴԱ գրուպ»-ի փոխնախագահը խոսել է շուկայի միտումների, ինչպես նաև այն մասին, թե որ երկրների փորձը կարող է որդեգրել Ղազախստանը։\n\nՄարդկային տվյալների ուսումնասիրության IQVIA առաջադեմ վերլուծությունների, տեխնոլոգիական լուծումների և կլինիկական հետազոտությունների ինստիտուտի կանխատեսումների համաձայն՝ դեղամիջոցների համաշխարհային շուկան երեք տարվա ընթացքում աճելու է միջինը 3-6%-ով։ Վերլուծաբաններն ակնկալում են, որ մինչև 2027 թվականը այն կհասնի մոտ 1,9 տրիլիոն դոլարի: «ՇՏԱԴԱ գրուպ»-ի փոխնախագահ Քրիստոս Գալիսը կարծում է, որ Ղազախստանում դեղագործական արդյունաբերությունը զարգացնելու համար անհրաժեշտ է արագացնել դեղերի գրանցման ընթացակարգը։ «Դեղագործական շուկայում աշխատող և պետական ​​հատվածում մեծ պորտֆել ունեցող մեր գործընկերների հաշվարկներով՝ նորարարական դեղամիջոցի գրանցման դոսյեի պատրաստման սկզբից մինչև շուկա դուրս գալը տևում է 3,5-ից 5 տարի։ Գրանցման այդպիսի երկար ժամկետը հանդիսանում է հիմնական պատճառներից մեկը, որ դեղագործական ընկերությունները որոշում են իրենց դեղամիջոցները չներկայացնել ղազախական շուկա»,- կարծում է փորձագետը։ «Kapital.kz» ձեռնարկատիրական գործունեության տեղեկատվական կենտրոնի թղթակցի հետ զրույցում նա խոսել է նաև «Առողջապահության զեկույց 2023» հետազոտության արդյունքների մասին՝ նշելով, թե ինչու են բազմաթիվ դեղագործական ընկերություններ հարկադրված բարձրացնել դեղամիջոցների գները, և ինչպիսի հիմք է անհրաժեշտ մեր երկրին՝ կենսատեխնոլոգիական կլաստեր ստեղծելու համար։\n\nԱվելի մանրամասն՝ Քրիստոս Գալիս. «Կենսատեխնոլոգիական կլաստերի ստեղծումը խիստ հավակնոտ խնդիր է» - «Կապիտալ՛ (kapital.kz)",
        "news_5_title": "«ՇՏԱԴԱ»-ն մտադիր է ամրապնդել իր դիրքերը Եվրասիայում՝ հիվանդանոցային հատվածում",
        "news_5_text": "Սեպտեմբերի 26-ից 28-ը Սամարղանդում անցկացվելու է Եվրասիական IV դեղագործական գագաթաժողովը։ «Կուրսիվ Ուզբեկստան» գործարար հրատարակությունը հանդես է գալու որպես միջոցառման գլխավոր տեղեկատվական գործընկեր։ Առաջիկա գագաթաժողովի շրջանակներում «Կուրսիվ»-ը մեկնարկել է դեղագործական շուկայում համաշխարհային և տարածաշրջանային դերակատարների տեսակետների հրապարակումը։\n\nԱրմինաս Մացևիչուս, Եվրասիայի տարածաշրջանում «ՇՏԱԴԱ»-ի փոխնախագահ։ Ընկերությունը շարունակելու է համագործակցել տարածաշրջանի կարգավորող մարմինների հետ:\n\n– Արմինաս, որո՞նք են Ձեր ընկերության առաջնահերթությունները Եվրասիայի տարածաշրջանում: Ո՞ր երկրներում և հատվածներում եք տեսնում «ՇՏԱԴԱ»-ի առավել մեծ հեռանկարները:\n\n– Եվրասիայում «ՇՏԱԴԱ» պորտֆելում «Սանոֆի»-ի արտադրանքի ավելացմամբ մենք զգալիորեն ամրապնդել ենք մեր առանց այն էլ ամուր դիրքերը սպառողների առողջության պահպանման հատվածում (Consumer Healthcare): Իհարկե, մենք կզարգացնենք այդ ոլորտն ինչպես ներդրումների, այնպես էլ, հնարավոր է, այնպիսի գործընկերների ներգրավման միջոցով, ինչպիսին «Սանոֆի»-ն է։\n\nՄիևնույն ժամանակ, առաջիկա մի քանի տարիների ընթացքում ընկերությունը մտադիր է ամրապնդել իր դիրքերը հիվանդանոցային հատվածում և դեղատոմսով դեղամիջոցների արտադրության ոլորտում։ Եվրասիայի երկրներում, որտեղ գործում է ընդունման և/կամ գրանցման պարզեցված ընթացակարգ (օրինակ՝ Մոլդովայում, Ուզբեկստանում, Վրաստանում), մենք արդեն գրանցել ենք եվրոպական մի շարք նոր դեղատոմսով դեղամիջոցներ։\n\nՄենք շարունակելու ենք այդ ուղղությամբ աշխատանքը, ինչպես նաև համագործակցելու ենք մեր բոլոր երկրների կարգավորող մարմինների հետ՝ շուկա մուտք գործելու ընթացակարգն ավելի պարզեցնելու նպատակով:\n\nՄիջնաժամկետ և երկարաժամկետ հեռանկարում կենսահամանման դեղապատրաստուկների հատվածի զարգացումն է, որոնք, ջեներիկ դեղերի հետ մեկտեղ, հանդիսանում են «ՇՏԱԴԱ»-ի ձեռնարկատիրական գործունեության առանցքային ուղղություններից մեկը: Կարծում եմ, որ մեկից մեկուկես տարվա ընթացքում մենք կկարողանանք նման դեղամիջոց առաջարկել եվրասիական այն շուկաներին, որտեղ գործում է արագացված գրանցման ընթացակարգ։ Ավելի մանրամասն՝ Ո՞ր տարածաշրջանում է «ՇՏԱԴԱ»-ն մտադիր ամրապնդել իր դիրքերը (kursiv.media)",
        "news_6_title": "««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտություն. Ղազախստանի բնակչության առողջապահության հիմնական միտումները",
        "news_6_text": "2023 թվականի սեպտեմբերի 19-ին «ՇՏԱԴԱ» ընկերությունը ներկայացրել է ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» միջազգային հետազոտության արդյունքները։ Հատկանշական է, որ արդեն երկրորդ տարին է, Ղազախստանը մասնակցում է այդ հետազոտությանը եվրոպական 15 երկրների հետ միասին։ Բացի այդ, առաջին անգամ հետազոտությունն ընդգրկել է Ուզբեկստանը։ Հետազոտությունն իրականացվել է «Human8» հետազոտական ​​ընկերության աջակցությամբ: Յուրաքանչյուր երկրում հարցվել է մոտ 2000 մարդ, իսկ ընդհանուր առմամբ հետազոտության մասնակիցների թիվը կազմել է 18-ից 99 տարեկան 32 013 մարդ:\n\nՂազախստանի մայրաքաղաքում զեկույցը ներկայացնելով՝ Եվրասիայի տարածաշրջանում «ՇՏԱԴԱ»-ի փոխնախագահ Արմինաս Մացևիչուսը նշել է. «Անցյալ տարի «Առողջապահության զեկույց»-ը մեծ հետաքրքրություն առաջացրեց ինչպես հանրային առողջապահության ոլորտի մասնագետների, այնպես էլ լրագրողների շրջանում: Եվ դա պատահական չէ, քանի որ զեկույցում ներկայացվում է առավել արդիական տեղեկատվությունն այն մասին, թե Ղազախստանի բնակիչներն ինչ են մտածում իրենց առողջության մասին, առողջապահական ինչ խնդիրներ են նրանց առավել հուզում, ինչ են ակնկալում Առողջապահության նախարարությունից, ինչից են ամենից շատ վախենում, ինչպես են բուժվում և հանգստանում։ Ավանդույթի համաձայն, ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտությունը պարունակում է տվյալներ, որոնք օգնում են ավելի լավ հասկանալ մարդկանց վարքագիծը, դեղագործական և բժշկական գրագիտության մակարդակը, ինչպես նաև առողջապահության ոլորտի միտումները: Բացի այդ, ստացված տվյալներն օգնում են «ՇՏԱԴԱ» ընկերությանն ավելի լավ բավարարել հիվանդների և բուժաշխատողների ակնկալիքները և, հետևաբար, ամբողջությամբ իրականացնել մեր առաքելությունը՝ հոգալ մարդկանց առողջության մասին որպես վստահելի գործընկեր»: Ավելի մանրամասն՝ ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտություն. Ղազախստանի բնակչության առողջապահության հիմնական միտումները․ Ղազախստանի դեղագործական տեսություն (pharm.reviews)"
      },
      "history": [
        {
          "date": "1895թ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ի պատմությունը սկսվել է 1895 թվականի մարտի 14-ին Գերմանիայի Դրեզդեն քաղաքում։ Տեղացի դեղագործները, միավորվելով մեկ ընկերակցության մեջ, ստեղծում են ստանդարտացված դեղամիջոցներ՝ հանրության համար արդյունավետ և մատչելի առողջապահություն ապահովելու նպատակով:"
          ]
        },
        {
          "date": "1935թ․",
          "paragraphs": [
            "Գերմանական դեղագործական ընկերակցությունը արտադրությունում ստեղծում է միասնական մոտեցում։ Դեղերը պատրաստվում են տարբեր դեղատներում, բայց նույն բաղադրատոմսով, միանման փաթեթավորմամբ և վաճառվում են միևնույն գնով։ Այսպես, ի հայտ է գալիս St.d.A հապավումը՝ Standard Arzneimittel die Deutscher Apotheke, որը հայերեն թարգմանաբար նշանակում է «Գերմանական դեղատների դեղորայքային չափորոշիչ»։ Այն գրանցված է որպես ապրանքային նշան:"
          ]
        },
        {
          "date": "1954թ․",
          "paragraphs": [
            "Երկրորդ համաշխարհային պատերազմի ժամանակ բաժանվելով երկու ընկերությունների՝ Հարավային և Հյուսիսային, «ՇՏԱԴԱ»-ն կրկին միավորվում է 1954 թվականին և հաստատվում Մայնի Ֆրանկֆուրտից ոչ հեռու գտնվող Բադ Վիլբել քաղաքում։"
          ]
        },
        {
          "date": "1961թ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ն ձեռք է բերում նոր մակարդակ. սկսում է արդյունաբերական ընդգրկմամբ դեղամիջոցներ արտադրել Մայնի Ֆրանկֆուրտի արվարձանում գտնվող արտադրամասում (և ոչ դեղատներում, ինչպես նախկինում):"
          ]
        },
        {
          "date": "1970թ․",
          "paragraphs": [
            "Շրջադարձային տարեթիվ «ՇՏԱԴԱ»-ի համար: Ընկերությունը վերակազմակերպվել է բաժնետիրական ընկերության, ինչը նոր թափ է հաղորդում նրա զարգացմանը։"
          ]
        },
        {
          "date": "1975թ․",
          "paragraphs": [
            "Ընկերությունը որոշում է կենտրոնանալ ջեներիկ դեղերի (չարտոնագրված դեղամիջոցների) արտադրության և վաճառքի վրա։"
          ]
        },
        {
          "date": "1986թ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ն սկսում է ընդլայնել իր միջազգային ներկայությունը՝ Եվրոպայում և Ասիայում ներկայացուցչություններ բացելու, ինչպես նաև միաձուլումների և կլանումների ակտիվ ռազմավարության միջոցով:"
          ]
        },
        {
          "date": "1993 – 2000թթ․",
          "paragraphs": [
            "Իր գործունեության 100-ամյակին ձեռնարկատիրությունը վերելք է ապրում: Ընկերությունը վաճառքի ծավալով գերմանական արդյունաբերության առաջատար տասնյակում է: 1997-1998թթ. անցկացվել է արժեթղթերի առաջնային հրապարակային առաջարկ (IPO)։ Ընկերության գործունեության հիմնական ոլորտները ներկայացնում է ջեներիկ դեղերի և առանց դեղատոմսի դեղամիջոցների արտադրությունը։ «ՇՏԱԴԱ»-ն շարունակում է հետևողականորեն հետամուտ լինել միջազգայնացման իր ռազմավարությանը և վերածվում է հարաճուն համաշխարհային դերակատարի:"
          ]
        },
        {
          "date": "2005 – 2010 թթ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ն ձեռք է բերում սերբական «Հեմոֆարմ AG» ընկերությունը, որը ռազմավարական նշանակություն ունի Խմբի համար: «ՇՏԱԴԱ»-ի գերմանական դուստր ձեռնարկությունը ներկայացնում է առաջին կենսահամանման դեղապատրաստուկը: «ՇՏԱԴԱ»-ն հաջողությամբ թողարկում է իր առաջին կորպորատիվ բաժնետոմսերը:"
          ]
        },
        {
          "date": "2010 – 2015թթ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ն հաջող ձեռքբերումներ է գրանցում ֆիրմային ապրանքների արտադրության ոլորտում, ինչը գնալով ավելի մեծ կարևորություն է ձեռք բերում Խմբի համար: Հաջողությամբ վաղաժամկետ ավարտվում է Խմբի ողջ ընդգրկմամբ ծախսերի արդյունավետության բարձրացման ««ՇՏԱԴԱ» – կառուցում ենք ապագան» ծրագիրը: «ՇՏԱԴԱ»-ն ձեռք է բերում առանց դեղատոմսի արտադրանք արտադրող բրիտանական «Thornton & Ross» ընկերությունը:"
          ]
        },
        {
          "date": "2019 – 2020թթ․",
          "paragraphs": [
            "«ՇՏԱԴԱ» ԲԸ-ն ամրապնդում է իր դիրքերը Կենտրոնական և Արևելյան Եվրոպայի, Ռուսաստանի և Եվրասիայի շուկաներում մի քանի խոշոր գործարքների՝ Walmark-ի, GSK-ի և Takeda-ի կնքման շնորհիվ: «ՇՏԱԴԱ»-ն դառնում է սպառողների առողջության պահպանման հատվածի առաջատարը:"
          ]
        },
        {
          "date": "2022թ․",
          "paragraphs": [
            "«ՇՏԱԴԱ»-ն շարունակում է ամրապնդել իր ձեռնարկատիրությունը Specialty (Մասնագիտացված բարձր սեգմենտի) դեղորայքի ուղղությամբ: Ընկերությունը ներկայացնում է կայուն զարգացման մասին առաջին համաշխարհային զեկույցը և ընդգրկվում 10% առավել կայուն դեղագործական ընկերությունների շարքում:"
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "«ՇՏԱԴԱ»-ն Ղազախստանում արժանացել է «Տարվա բեկում» և «Տարվա առաջատար» մրցանակներին",
          "date": "15.02.2024թ․",
          "text": "Դեղագործական շուկայի փորձագիտական ​​վերլուծությամբ զբաղվող «Vi-ORTIS» խորհրդատվական գործակալությունը նշել է Ղազախստանի շուկայում «ՇՏԱԴԱ»-ի ձեռքբերումները:\n\nԸնկերությունը վստահ դիրք է գրավել որպես «2023 թվականի տարվա առաջատար» մանրածախ շուկայում: Ի թիվս այլոց, «ՇՏԱԴԱ»-ն ամրապնդել է իր առաջատար դիրքերը՝ նվաճելով «Տարվա բեկում» մրցանակն առանց դեղատոմսի դեղամիջոցների  հատվածում «Էնտերոժերմինա» ապրանքանիշով և դեղատոմսով դեղամիջոցների հատվածում՝ «Քսեֆոկամ» ապրանքանիշով:\n\nԸնդհանուր առմամբ, «ՇՏԱԴԱ»-ն հաղթել է հինգ անվանակարգերում.\n\n«Տարվա բեկում» մանրածախ շուկայում՝ սպառողների առողջության պահպանման\n\nհատվածում\n\n«Տարվա բեկում» մանրածախ շուկայում՝ առանց դեղատոմսի դեղամիջոցների հատվածում\n\n«Տարվա առաջատար» մանրածախ շուկայում\n\n3-րդ տեղ բժշկական պարագաների մանրածախ շուկայում\n\n3-րդ տեղ մանրածախ շուկայում՝ սպառողների առողջության պահպանման\n\nհատվածում",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "«ՇՏԱԴԱ Եվրասիա»-ն մրցանակ է ստացել «Eurasian Pharma Awards» մրցանակաբաշխությունում",
          "date": "04.10.2023թ․",
          "text": "Մրցանակը տրվել է «Տարվա գործընկերություն» անվանակարգում՝ «Սանոֆի»-ի պորտֆելի հաջող միացման համար:\n\nԵվրասիական դեղագործական գագաթաժողովի շրջանակներում անցկացվել է մրցանակաբաշխություն, որը նշանակալի իրադարձություն էր Եվրասիայի տարածաշրջանի դեղագործական ոլորտի դերակատարների համար։\n\n«Eurasian Pharma Awards» մրցանակաբաշխությունն ուշագրավ միջոցառում է, որը համախմբում է Կենտրոնական Ասիայի, Կովկասի և Արևելյան Եվրոպայի երկրների դեղագործության ոլորտի առաջատար ընկերություններին և մասնագետներին: Մրցույթն անցկացվում է ամեն տարի 16 եզակի անվանակարգերում, որոնք արտացոլում են ոլորտի բազմազանությունն ու նորարարությունը։\n\nՄրցանակը մրցույթի կազմակերպիչներից ստացել է «ՇՏԱԴԱ Եվրասիա»-ի փոխնախագահ Արմինաս Մացևիչուսը։ ««Սանոֆի»-ի արտադրանքը Եվրասիայում «ՇՏԱԴԱ»-ի պորտֆելին միացնելուց հետո ընկերությանը հաջողվել է զգալիորեն ամրապնդել իր առանց այն էլ ամուր դիրքերը սպառողների առողջության պահպանման հատվածում (Consumer Healthcare) և նախատեսում է հետագայում զարգացնել այդ ոլորտներն ինչպես ներդրումների, այնպես էլ, հնարավոր է, այնպիսի գործընկերների ներգրավման միջոցով, ինչպիսին «Սանոֆի»-ն է»,- նշել է բանախոսը։\n\n2022 թվականին «ՇՏԱԴԱ»-ն և «Սանոֆի»-ն համաձայնագիր են կնքել սպառողների առողջության պահպանման հատվածի արտադրանքի պորտֆելը եվրասիական մի շարք երկրներում բաշխելու վերաբերյալ։ Համաձայնագրի շրջանակում «ՇՏԱԴԱ»-ն 2023 թվականի ապրիլի 1-ից Եվրասիայի տարածաշրջանի 10 երկրներում իրականացնում է սպառողների առողջության պահպանման ոլորտի հայտնի ապրանքանիշերից բաղկացած «Սանոֆի» ընկերության դեղամիջոցների պորտֆելի բաշխում, ինչպես նաև տրամադրում շուկայավարման հարցերով աջակցություն:\n\nՀամաձայնագրում ներառված են Եվրասիայի երկրների շուկաներում իրենց դրականորեն հանձնարարած 19 ապրանքներ, որոնց վստահում են ապրանքանիշի վերաբերյալ գիտելիքների բարձր ցուցանիշներ ունեցող և շատ դեպքերում շուկայում առաջատար դիրքեր զբաղեցնող սպառողները։",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Երկրի ղեկավարը հանդիպել է «ՇՏԱԴԱ գրուպ»-ի փոխնախագահ Քրիստոս Գալիսի հետ",
          "date": "29.09.2023թ․                                                                                                                      Բեռլին, Գերմանիա",
          "text": "Հանդիպման ընթացքում քննարկվել են առողջապահության և դեղագործության ոլորտում համագործակցության հեռանկարները։\n\nԿասիմ-Ժոմարտ Տոկաևը նշել է, որ «ՇՏԱԴԱ»-ն Ղազախստանի շուկայի երեք առաջատարներից մեկն է սպառողների առողջության պահպանման արտադրանքի հատվածում։ Նրա խոսքերով, հաջող և հարաճուն զարգացող համագործակցության վառ օրինակ է Ալմաթիում ընկերության գրասենյակի բացումը։\n\nՆախագահն ուշադրություն է դարձրել այն հանգամանքի վրա, որ Ղազախստանում ակտիվ աշխատանքներ են տարվում կենսատեխնոլոգիական կլաստերի ստեղծման ուղղությամբ։\n\nԵրկրի ղեկավարի խոսքերով, «ՇՏԱԴԱ»-ի համար լայն հնարավորություններ են բացվում հետազոտությունների և արտադրության ոլորտում «QazBioPharm» ազգային հոլդինգի հետ ջանքերը միավորելու առումով։\n\nԿասիմ-Ժոմարտ Տոկաևը գերմանական ընկերությանը հրավիրել է համատեղ հետազոտություններ և մշակումներ իրականացնել, արտադրություն կազմակերպել, փորձի փոխանակում կատարել և բարձրացնել մասնագետների որակավորումը։\n\nՔրիստոս Գալիսն, իր հերթին, շահագրգռություն է դրսևորել համագործակցության խորացման հարցում և ընդգծել ընկերության պատրաստակամությունը՝ ուսումնասիրելու Ղազախստանում բժշկական նախագծերում և ծրագրերում ներդրումներ կատարելու հնարավորությունները։\n\n«ՇՏԱԴԱ»-ն հանդիսանում է բարձրորակ դեղամիջոցների առաջատար արտադրողներից մեկը։ Ընկերությունն իր արտադրանքն իրացնում է աշխարհի 120 երկրներում։",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Քրիստոս Գալիս. Կենսատեխնոլոգիական կլաստերի ստեղծումը խիստ հավակնոտ խնդիր է:",
          "date": "19.12.2023թ․",
          "text": "«ՇՏԱԴԱ գրուպ»-ի փոխնախագահը խոսել է շուկայի միտումների, ինչպես նաև այն մասին, թե որ երկրների փորձը կարող է որդեգրել Ղազախստանը։\n\nՄարդկային տվյալների ուսումնասիրության IQVIA առաջադեմ վերլուծությունների, տեխնոլոգիական լուծումների և կլինիկական հետազոտությունների ինստիտուտի կանխատեսումների համաձայն՝ դեղամիջոցների համաշխարհային շուկան երեք տարվա ընթացքում աճելու է միջինը 3-6%-ով։ Վերլուծաբաններն ակնկալում են, որ մինչև 2027 թվականը այն կհասնի մոտ 1,9 տրիլիոն դոլարի: «ՇՏԱԴԱ գրուպ»-ի փոխնախագահ Քրիստոս Գալիսը կարծում է, որ Ղազախստանում դեղագործական արդյունաբերությունը զարգացնելու համար անհրաժեշտ է արագացնել դեղերի գրանցման ընթացակարգը։ «Դեղագործական շուկայում աշխատող և պետական ​​հատվածում մեծ պորտֆել ունեցող մեր գործընկերների հաշվարկներով՝ նորարարական դեղամիջոցի գրանցման դոսյեի պատրաստման սկզբից մինչև շուկա դուրս գալը տևում է 3,5-ից 5 տարի։ Գրանցման այդպիսի երկար ժամկետը հանդիսանում է հիմնական պատճառներից մեկը, որ դեղագործական ընկերությունները որոշում են իրենց դեղամիջոցները չներկայացնել ղազախական շուկա»,- կարծում է փորձագետը։ «Kapital.kz» ձեռնարկատիրական գործունեության տեղեկատվական կենտրոնի թղթակցի հետ զրույցում նա խոսել է նաև «Առողջապահության զեկույց 2023» հետազոտության արդյունքների մասին՝ նշելով, թե ինչու են բազմաթիվ դեղագործական ընկերություններ հարկադրված բարձրացնել դեղամիջոցների գները, և ինչպիսի հիմք է անհրաժեշտ մեր երկրին՝ կենսատեխնոլոգիական կլաստեր ստեղծելու համար։\n\nԱվելի մանրամասն՝ Քրիստոս Գալիս. «Կենսատեխնոլոգիական կլաստերի ստեղծումը խիստ հավակնոտ խնդիր է» - «Կապիտալ՛ (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "«ՇՏԱԴԱ»-ն մտադիր է ամրապնդել իր դիրքերը Եվրասիայում՝ հիվանդանոցային հատվածում",
          "date": "13.09.2023թ․",
          "text": "Սեպտեմբերի 26-ից 28-ը Սամարղանդում անցկացվելու է Եվրասիական IV դեղագործական գագաթաժողովը։ «Կուրսիվ Ուզբեկստան» գործարար հրատարակությունը հանդես է գալու որպես միջոցառման գլխավոր տեղեկատվական գործընկեր։ Առաջիկա գագաթաժողովի շրջանակներում «Կուրսիվ»-ը մեկնարկել է դեղագործական շուկայում համաշխարհային և տարածաշրջանային դերակատարների տեսակետների հրապարակումը։\n\nԱրմինաս Մացևիչուս, Եվրասիայի տարածաշրջանում «ՇՏԱԴԱ»-ի փոխնախագահ։ Ընկերությունը շարունակելու է համագործակցել տարածաշրջանի կարգավորող մարմինների հետ:\n\n– Արմինաս, որո՞նք են Ձեր ընկերության առաջնահերթությունները Եվրասիայի տարածաշրջանում: Ո՞ր երկրներում և հատվածներում եք տեսնում «ՇՏԱԴԱ»-ի առավել մեծ հեռանկարները:\n\n– Եվրասիայում «ՇՏԱԴԱ» պորտֆելում «Սանոֆի»-ի արտադրանքի ավելացմամբ մենք զգալիորեն ամրապնդել ենք մեր առանց այն էլ ամուր դիրքերը սպառողների առողջության պահպանման հատվածում (Consumer Healthcare): Իհարկե, մենք կզարգացնենք այդ ոլորտն ինչպես ներդրումների, այնպես էլ, հնարավոր է, այնպիսի գործընկերների ներգրավման միջոցով, ինչպիսին «Սանոֆի»-ն է։\n\nՄիևնույն ժամանակ, առաջիկա մի քանի տարիների ընթացքում ընկերությունը մտադիր է ամրապնդել իր դիրքերը հիվանդանոցային հատվածում և դեղատոմսով դեղամիջոցների արտադրության ոլորտում։ Եվրասիայի երկրներում, որտեղ գործում է ընդունման և/կամ գրանցման պարզեցված ընթացակարգ (օրինակ՝ Մոլդովայում, Ուզբեկստանում, Վրաստանում), մենք արդեն գրանցել ենք եվրոպական մի շարք նոր դեղատոմսով դեղամիջոցներ։\n\nՄենք շարունակելու ենք այդ ուղղությամբ աշխատանքը, ինչպես նաև համագործակցելու ենք մեր բոլոր երկրների կարգավորող մարմինների հետ՝ շուկա մուտք գործելու ընթացակարգն ավելի պարզեցնելու նպատակով:\n\nՄիջնաժամկետ և երկարաժամկետ հեռանկարում կենսահամանման դեղապատրաստուկների հատվածի զարգացումն է, որոնք, ջեներիկ դեղերի հետ մեկտեղ, հանդիսանում են «ՇՏԱԴԱ»-ի ձեռնարկատիրական գործունեության առանցքային ուղղություններից մեկը: Կարծում եմ, որ մեկից մեկուկես տարվա ընթացքում մենք կկարողանանք նման դեղամիջոց առաջարկել եվրասիական այն շուկաներին, որտեղ գործում է արագացված գրանցման ընթացակարգ։ Ավելի մանրամասն՝ Ո՞ր տարածաշրջանում է «ՇՏԱԴԱ»-ն մտադիր ամրապնդել իր դիրքերը (kursiv.media)",
          "image": {}
        },
        {
          "id": "supplied-6",
          "title": "««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտություն. Ղազախստանի բնակչության առողջապահության հիմնական միտումները",
          "date": "19.09.2023թ․",
          "text": "2023 թվականի սեպտեմբերի 19-ին «ՇՏԱԴԱ» ընկերությունը ներկայացրել է ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» միջազգային հետազոտության արդյունքները։ Հատկանշական է, որ արդեն երկրորդ տարին է, Ղազախստանը մասնակցում է այդ հետազոտությանը եվրոպական 15 երկրների հետ միասին։ Բացի այդ, առաջին անգամ հետազոտությունն ընդգրկել է Ուզբեկստանը։ Հետազոտությունն իրականացվել է «Human8» հետազոտական ​​ընկերության աջակցությամբ: Յուրաքանչյուր երկրում հարցվել է մոտ 2000 մարդ, իսկ ընդհանուր առմամբ հետազոտության մասնակիցների թիվը կազմել է 18-ից 99 տարեկան 32 013 մարդ:\n\nՂազախստանի մայրաքաղաքում զեկույցը ներկայացնելով՝ Եվրասիայի տարածաշրջանում «ՇՏԱԴԱ»-ի փոխնախագահ Արմինաս Մացևիչուսը նշել է. «Անցյալ տարի «Առողջապահության զեկույց»-ը մեծ հետաքրքրություն առաջացրեց ինչպես հանրային առողջապահության ոլորտի մասնագետների, այնպես էլ լրագրողների շրջանում: Եվ դա պատահական չէ, քանի որ զեկույցում ներկայացվում է առավել արդիական տեղեկատվությունն այն մասին, թե Ղազախստանի բնակիչներն ինչ են մտածում իրենց առողջության մասին, առողջապահական ինչ խնդիրներ են նրանց առավել հուզում, ինչ են ակնկալում Առողջապահության նախարարությունից, ինչից են ամենից շատ վախենում, ինչպես են բուժվում և հանգստանում։ Ավանդույթի համաձայն, ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտությունը պարունակում է տվյալներ, որոնք օգնում են ավելի լավ հասկանալ մարդկանց վարքագիծը, դեղագործական և բժշկական գրագիտության մակարդակը, ինչպես նաև առողջապահության ոլորտի միտումները: Բացի այդ, ստացված տվյալներն օգնում են «ՇՏԱԴԱ» ընկերությանն ավելի լավ բավարարել հիվանդների և բուժաշխատողների ակնկալիքները և, հետևաբար, ամբողջությամբ իրականացնել մեր առաքելությունը՝ հոգալ մարդկանց առողջության մասին որպես վստահելի գործընկեր»: Ավելի մանրամասն՝ ««ՇՏԱԴԱ»-ի Առողջապահության զեկույց 2023» հետազոտություն. Ղազախստանի բնակչության առողջապահության հիմնական միտումները․ Ղազախստանի դեղագործական տեսություն (pharm.reviews)",
          "image": {}
        }
      ]
    },
    "kz": {
      "source": "КАЗ/Stada.КАЗ перевод.docx",
      "text": {
        "about_par1": "STADA-халықаралық фармацевтика компаниясы, бұл компания 130 жылдан аса «Серіктестер және тұтынушылармен сенімді қарым-қатынас орната отырып, адамдардың денсаулығына қамқоршылық таныту» миссиясынан  айнымаған.  STADA-ның негізгі бағыты Consumer Healthcare (CHC) сегментінің өнімдері, дженериктер мен мамандандырылған препараттар (биосимилярды қоса айтқанда).  STADA өнімдері әлемнің 100 елінде ұсынылған.",
        "about_par2": "2022 жылы ТМД  елдерінің аймақтары дербес бизнес-бөлімшесіне айналып, Германиядағы пәтер -штабына тікелей бағынатын  STADA Евразия деп атауын өзгертті. Аймаққа 11 ел кіреді: Қазақстан, Өзбекстан, Беларусь, Әзербайжан, Грузия,  Молдова, Қырғызстан, Армения, Монголия, Тәжікстан, Түрікменстан.",
        "about_list1": "STADA Евразия бас кеңсесі Қазақстанда Алматы қ.  орналасқан. Сонымен қатар, Компания аймақтың басым көп елдерінде STADA Arzneimittel AG заңды тұлғасын тіркеді. STADA 2023 жылдың 01 сәуірінен аймақта Sanofi. Компаниясының  рецептісіз босатылатын препараттар портфелін  ұсынады.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Сенімді серіктес ретінде адамдардың денсаулығына қамқоршы болу.",
        "about_page_overview_1": "STADA-халықаралық фармацевтика компаниясы, бұл компания 130 жылдан аса «Серіктестер және тұтынушылармен сенімді қарым-қатынас орната отырып, адамдардың денсаулығына қамқоршылық таныту» миссиясынан  айнымаған.  STADA-ның негізгі бағыты Consumer Healthcare (CHC) сегментінің өнімдері, дженериктер мен мамандандырылған препараттар (биосимилярды қоса айтқанда).  STADA өнімдері әлемнің 100 елінде ұсынылған.",
        "about_page_intro_2": "2022 жылы ТМД  елдерінің аймақтары дербес бизнес-бөлімшесіне айналып, Германиядағы пәтер -штабына тікелей бағынатын  STADA Евразия деп атауын өзгертті. Аймаққа 11 ел кіреді: Қазақстан, Өзбекстан, Беларусь, Әзербайжан, Грузия,  Молдова, Қырғызстан, Армения, Монголия, Тәжікстан, Түрікменстан.",
        "about_page_intro_3": "STADA Евразия бас кеңсесі Қазақстанда Алматы қ.  орналасқан. Сонымен қатар, Компания аймақтың басым көп елдерінде STADA Arzneimittel AG заңды тұлғасын тіркеді. STADA 2023 жылдың 01 сәуірінен аймақта Sanofi. Компаниясының  рецептісіз босатылатын препараттар портфелін  ұсынады.",
        "culture_purpose_heading": "МИССИЯСЫ  мен ҚҰНДЫЛЫҚТАРЫ",
        "culture_purpose_statement": "Сенімді серіктес ретінде адамдардың денсаулығына қамқоршы болу.",
        "culture_purpose_text_1": "STADA — 125 жылдан аса сенімді  серіктес ретінде адамдардың денсаулығына қамқоршы болу миссиясын  орындап келе жатқан фармацевтикалық компания. STADA - компания өндірген препараттар кәсіби мамандардың   және қатысы бар елдердегі барлық  тұтынушылардың  сенімді таңдауы болуына талпынады.",
        "culture_purpose_text_2": "STADA бизнесінің шешуші бағыттары- Consumer Healthcare сегменті (рецептісіз препараттар, тағам қоспалары, косметика, медициналық бұйымдар)  және генериктер, оның ішінде мамандандырылған  препараттар. Компания өнімнің сапасына басты назар аударады: компанияның әлемдегі меншікті және контрактілі өндіріс алаңдары сапаның бірыңғай халықаралық стандарттарына сәйкес жұмыс жүргізеді (GMP).",
        "culture_values_heading": "Біздің құндылықтарымыз",
        "culture_values_eyebrow": "Біздің құндылықтарымыз",
        "culture_values_intro": "Жалпы құндылықтар болашақта STADA  өсуін және табыстылығын қамтамасыз етіп,  мардатты мақсаттарға жеткізуге мүмкіндік береді.",
        "about_compliance_heading": "КОМПЛАЕНС",
        "about_compliance_intro_1": "Біздің компания барлық салада үздік болуға тырысады, оның ішіне іскерлік тәртібінің әдеп нормаларын орындау және комплаенс та кіреді. Біздің миссиямыздан ауытқымай, тұтынушылар алдындағы жауапкершілігімізді  ұғынамыз, сондықтан адал және сапалы жұмыс мәселелеріне келгенде ымыраға (компромисске) бармаймыз.",
        "about_compliance_intro_2": "Біз заңнама талаптарын және Мінез-құлық кодексімен бекітілген құндылықтарымызды   қатаң түрде басшылыққа  ала отырып жұмыс жасаймыз. Әдепті  және жауапты іскерлік мінез-құлық -  біздің компанияға деген сенімді нығайтатын, корпоративтік мәдениеттің  құрамдас бөлігі болып табылады.",
        "about_compliance_speakup_heading": "Speak up Портал және Комплаенс Тобы  мен Евразия Этикасының жалпы почта жәшігі.",
        "about_compliance_speakup_text": "Әр адамның, компанияда жұмыс істеуі – істемеуіне байланыссыз компания персоналының, оның серіктестері , жеткізушілері мен мердігерлерінің әдепсіз және заңсыз іс-әрекеті туралы   хабарлау мүмкіндігі болу керек деп санаймыз.",
        "about_compliance_tools_text": "Бұл үшін STADA компаниясының тобында Speak up Портал  ақпарат жүйесі, Комплаенс Тобы мен Евразия этикасының жалпы пошта жәшігі  енгізілген, бұл құралдар әр тұлға комплаенс нормалары мен талаптары орындалмауы туралы хабарлама жіберуіне мүмкіндік жасайды.  Атап айтқанда, және бұлармен шектелмей:",
        "about_compliance_item_fraud": "алаяқтық,",
        "about_compliance_item_corruption": "жемқорлық,",
        "about_compliance_item_competition": "бәсекелестікті қорғау саласындағы бұзушылықтар (антимонополиялық талаптар)",
        "about_compliance_item_conflict": "мүдделер қақтығысы",
        "about_compliance_report_text": "Сіз жоғарыда аталған заңсыз әрекеттер туралы хабардар болсаңыз, келесі мекенжайға жазуыңызды сұраймыз: eurasia_compliance@stada.kz немесе сілтеме арқылы Порталға  тура жазуыңызға болады.",
        "about_compliance_confidentiality": "STADA компаниясының тобы түскен ақпараттың құпиялығын сақтауға кепілдік береді.",
        "about_compliance_questions": "eurasia_compliance@stada.kz Комплаенс және Этика тобының почта жәшігіне барлық сізге қажетті ақпарат жайлы сұрақтар және пациент пен тұтынушылар игілігіне жасайтын бірлескен жұмысты жақсартуға арналған ұсыныстарды жіберуіңізге болады.",
        "about_pv_heading": "ФАРМАКОЛОГИЯЛЫҚ ҚАДАҒАЛАУ",
        "about_pv_text": "Адамдардың денсаулығы және  ырыс-берекесі   туралы  қамқорлық біздің компания қызметінің басты мақсаты. Сіз пациент, немесе күтуді іске асыратын тұлға, әлде медициналық қызметкер болсаңыз да, Stada өнімдеріне байланысты  кемшілік байқасаңыз, бізді мәлімдеуіңізді сұраймыз. Сіз  ұсынған ақпарат біздің өнімдердің  және пациенттердің қауіпсіздігін қамтамасыз етуге себін тигізеді.",
        "about_pv_contact_label": "Stada дәрілік препараттарының теріс әсерін байқаған барлық жағдайларда келесі деректердегі мекен жайға хабарласуыңызды өтіне сұраймыз:",
        "about_leadership_intro": "Арминас Мацевичус, Наталья Гарипова",
        "about_leader_ospanov_name": "Арминас Мацевичус",
        "about_leader_garipova_name": "Наталья Гарипова",
        "culture_integrity_title": "ПАРАСАТТЫЛЫҚ",
        "culture_integrity_tagline": "Біздің әрқайсымыз корпоративті және көпшілік мақұлдаған әдептілік  стандарттарына сәйкес іс-әрекет жасаймыз. Біздің қызметіміз пікір айту бостандығы мен арамыздағы силастық қатынасқа негізделеді.",
        "culture_entrepreneurship_title": "КӘСІПКЕРЛІК",
        "culture_entrepreneurship_tagline": "Біздің әрқайсымыз жаңа идеялар мен шешімдерді енгізіп, өсу және дамуға өз  үлесін қосады.",
        "culture_agility_title": "БЕЙІМДІЛІК",
        "culture_agility_tagline": "Біздің әрқайсымыз-өзгерістер көшбасшысымыз. Икемділік пен табандылық - біздің  дамуымыздың және табысқа жету жолымыздың негізі.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Біз компанияның жалпы мүддесі үшін әрекет етеміз, жеке қызметтер мен бөлімшелердің мүддесіне қарағанда, STADA-ның  табысы мен сәттілігінің маңызы зор.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "STADA тарихы  1895 жылы 14 наурызда неміс қаласы Дрезденде басталды. Жергілікті фармацевттер қауымдастыққа бірлесіп, тиімді және арзан қоғамдық  денсаулық сақтауды қамтамасыз ететін стандартталған препараттар шығарды.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Неміс фармацевтика қауымдастығы өндірісте бірыңғай көзқараспен жұмыс істеді.  Дәрілер әртүрлі дәріханаларда  әзірленді, бірақ бірыңғай  рецептімен,  сәйкестендірілген орамада, бірдей бағаға сатылды. Осылайша St.d.A - Standard Arzneimittel die Deutscher аббревиатурасы пайда болған, бұл қазақ тіліне аударғанда «неміс дәріханалары препараттарының стандарты» дегенді білдіреді. Және сауда маркасы ретінде тіркелген.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "Екінші дүниежүзілік соғыс кезінде екі – Оңтүстік және Солтүстік компанияға бөлінген STADA,  1954 жылы қайтадан бірігіп, Франкфурт-на-Майнеден алыс емес Бад-Фильбель қаласында орнығады.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA жаңа деңгейге шығады: дәрілік препараттарды Франкфурт-на-Майне қаласының маңайындағы өндірістік алаңда өнеркәсіптік масштабта өндіруге кіріседі. (бұрынғыдай, дәріханаларда емес)",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "STADA үшін түбірлі өзгеріс жылы болды. Компания акционерлік қоғам ретінде қайта құрылды, бұл оның дамуына жаңа серпін берді.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Компания  генерикалық (патентсіз дәрі- дәрмек) препараттарды  өндіру мен оларды сатуға ден қоюға  шешім қабылдады.",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA  Европа мен Азияда өкілдіктерін ашуға, сонымен қатар қосылу мен жұтылудың белсенді стратегиясына байланысты халықаралық қатысуын кеңейте бастады.",
        "supplied_history_date_7": "1993 – 2000 ж. аралығында",
        "supplied_history_text_7": "Өзінің 100 – жылдығында бизнесі  көтеріңкі жағдайда. Компания сату көлемі бойынша  неміс өнеркәсібінің жетекші ондығына  кіреді. 1997/1998 жылдары IPO жүргізілді. Компания жұмысының негізгі  бағыты дженериктер мен рецептсіз препараттар өндіру. STADA өзінің интернационалдық  стратегиясын дәйекті түрде жүргізуді жалғастырып, ғаламдық серпінді ойнаушыға айналуда.",
        "supplied_history_date_8": "2005 - 2010 ж. аралығында",
        "supplied_history_text_8": "STADA, Топ үшін стратегиялық маңызды болып табылатын, Hemofarm AG серб компаниясын сатып алады. STADA еншілес компаниясы бірінші биосимиляр ұсынады. STADA табыстылықпен бірінші корпоративтік облигацияларын ұсынады.",
        "supplied_history_date_9": "2010 – 2015ж. аралығында",
        "supplied_history_text_9": "STADA, Топқа өте маңызды болған, фирмалық өнімдердің өндіріс саласында табысты сатып алу жұмыстарын жүргізді. Бүкіл Топтың  аясындағы шыққан қаражаттың тиімділігін арттыру жөніндгі \"STADA – болашақты құру\"  бағдарламасы кесте уақытынан бұрын табысты аяқталды. STADA Thornton & Ross британиялық өндірушінің рецептісіз тауарларын сатып алады.",
        "supplied_history_date_10": "2019 – 2020 ж. аралығында",
        "supplied_history_text_10": "STADA AG  Walmark, GSK мен Takeda ірі мәмілелерінің жабылуына байланысты Орталық  және Шығыс  Европа, Ресей және Евразия нарықтарындағы  жайғасымын күшейтті. STADA Consumer Healthcare сегментінің көшбасшысы  атанды.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA  Specialty бағыты бойынша бизнесті күшейтуді  жалғастыруда. Компания тұрақты даму туралы бірінші ғаламдық есепті ұсынды және 10 % тұрақты фармацевтикалық компаниялар санына енді.",
        "supplied_history_heading": "ТАРИХЫ:",
        "hero_text1": "STADA  Қазақстанда   «Жыл серпілісі»  және «Жыл көшбасшысы» марапаттарын иемденді.",
        "news_1_text": "Фармацевтикалық сараптама аналитикасын жүргізетін Vi-ORTIS консалтинг агенттігі STADA Қазақстан нарығындағы жетістіктерін атап өтті.\n\nКомпания бөлшектеп сату нарығында «2023 жыл көшбасшысы»  атағын  алды.\n\nБұдан басқа ОТС сегментінде“Энтерожермина” бренді және RX сегментінде  “Ксефокам” бренді бойынша  STADA -өзінің көшбасшылық қасиеттерін «Жыл серпілісі» марапатын жеңіп алып күшейтті.\n\nБарлығын есептегенде  STADA бес санат бойынша атап өтілді:\n\n\"Жыл серпілісі\" СНС сегментінде бөлшек сауда нарығында\n\n\"Жыл серпілісі\" ОТС сегментінде бөлшек сауда нарығында\n\n\"Жыл көшбасшысы\" бөлшек сауда нарығында\n\nМедицина саласындағы бұйымдар бөлшек сауда нарығында 3-орын.\n\nСНС сегментіндегі бөлшек сауда нарығында 3-орын.",
        "hero_text2": "STADA Евразия Eurasian Pharma Awards-та марапатқа ие болды.",
        "news_2_text": "Марапат  «Жыл серіктестігі»  айдарында  Sanofi портфелі табысты  қосылғаны үшін.\n\nЕвразия фармацевтика саммитінің аясында евразия аймағының фармсаласы ойыншыларына  маңызды марапаттау рәсімі болды.\n\nEurasian Pharma Awards – бұл Орта Азия, Кавказ және Шығыс Европа елдерінің фармацевтика саласындағы  алдыңғы қатарлы компаниялар  мен кәсіби мамандарын біріктірген жарқын оқиға.\n\nСайыс жыл сайын, саланың әртүрлілігін және жаңашылдығын көрсететін 16 бірегей  айдарда өткізіледі.\n\nАрминас Мацевичус,   STADA Евразия Вице-президенті марапатты сайыс ұйымдастырушыларының қолынан алды.\n\nСпикер: «Sanofi өнімдерін Евразиядағы STADA портфеліне қосқаннан кейін компания СНС сегментіндегі (Consumer Healthcare) онсыз да  мықты жайғасымын едәуір күшейтті, және осы бағыттағы жұмысты инвестициялар арқылы және Sanofi сияқты серіктестерді табу жолымен әлі де күшейтуді жоспарлап отырмыз», -деп атап өтті.\n\n2022 жылы STADA мен  Sanofi бір шама евразия елдерінде СНС өнімдері портфелінің  дистрибуциясы жайлы келісім жасады.\n\nКелісім аясында STADA 2023 жылдың 01 сәуірінен Евразия аймағының  10  елінде тұтынушылық денсаулық сақтау  саласындағы белгілі брендтерден тұратын Sanofi компаниясының препараттар портфеліне дистрибуцияны  және маркетингілік қолдауды  іске асырады\n\nКелісімге тұтынушылар сенім білдірген және бренд туралы білім көрсеткіштері жоғары, көптеген жағдайда нарықта көшбасшылық жайғасымға ие болған, Евразия елдерінің нарығында жақсы жағынан танылған  19 өнім түрі енгізілді.",
        "hero_text3": "Мемлекет басшысы STADA Group компаниясының вице-президенті Кристосом Галлиспен кездесу өткізді.",
        "news_3_text": "Кездесу барысында денсаулық сақтау және фармацевтика саласында болашақта ынтымақтастықпен біріге еңбек жасау жолдары талқыланды.\n\nҚасым-Жомарт Тоқаев  STADA денсаулыққа арналған тұтынушылық тауарлар сегментінде Қазақстан нарығында көшбасшылардың үштігіне кіретінін айтты. Оның айтуы бойынша, компанияның Алматыда кеңсе ашуы, ынтымақтастықпен біріге табысты жұмыс жасаудың жарқын мысалы болып табылады.\n\nПрезидент Қазақстанда биотехнологиялық кластер құру бойынша белсенді жұмыстар жүргізіліп жатқанын  айтты.\n\nМемлекет басшысының пікірі бойынша, STADA алдында QazBioPharm ұлттық холдингімен зерттеу және өндіру саласында күш-жігерін біріктіру үшін үлкен мүмкіндіктер ашылады.\n\nҚасым-Жомарт Тоқаев  неміс компаниясын бірлескен зерттеулер мен жұмыстар жүргізуге, өндірісті ұйымдастыруға, тәжірибе бөлісуге және мамандардың біліктілігін  жетілдіруге шақырды.\n\nӨз кезегінде Кристос Галлис   бірлескен жұмысты тереңдетуге мүдделілігін танытты және компанияның Қазақстандағы бағдарламалар мен медициналық жобаларға инвестиция жасау мүмкіндігін қарастыруға дайын екенін көрсетті.\n\nSTADA жоғары сапалы дәрі-дәрмек  шығаруда алдыңғы қатарлы өндірушілердің бірі болып табылады. Компания өз өнімдерін әлемнің 120 елінде  сатады."
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "STADA тарихы  1895 жылы 14 наурызда неміс қаласы Дрезденде басталды.",
            "Жергілікті фармацевттер қауымдастыққа бірлесіп, тиімді және арзан қоғамдық  денсаулық сақтауды қамтамасыз ететін стандартталған препараттар шығарды."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Неміс фармацевтика қауымдастығы өндірісте бірыңғай көзқараспен жұмыс істеді.  Дәрілер әртүрлі дәріханаларда  әзірленді, бірақ бірыңғай  рецептімен,  сәйкестендірілген орамада, бірдей бағаға сатылды. Осылайша St.d.A - Standard Arzneimittel die Deutscher аббревиатурасы пайда болған, бұл қазақ тіліне аударғанда «неміс дәріханалары препараттарының стандарты» дегенді білдіреді. Және сауда маркасы ретінде тіркелген."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "Екінші дүниежүзілік соғыс кезінде екі – Оңтүстік және Солтүстік компанияға бөлінген STADA,  1954 жылы қайтадан бірігіп, Франкфурт-на-Майнеден алыс емес Бад-Фильбель қаласында орнығады."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA жаңа деңгейге шығады: дәрілік препараттарды Франкфурт-на-Майне қаласының маңайындағы өндірістік алаңда өнеркәсіптік масштабта өндіруге кіріседі. (бұрынғыдай, дәріханаларда емес)"
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "STADA үшін түбірлі өзгеріс жылы болды. Компания акционерлік қоғам ретінде қайта құрылды, бұл оның дамуына жаңа серпін берді."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Компания  генерикалық (патентсіз дәрі- дәрмек) препараттарды  өндіру мен оларды сатуға ден қоюға  шешім қабылдады."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA  Европа мен Азияда өкілдіктерін ашуға, сонымен қатар қосылу мен жұтылудың белсенді стратегиясына байланысты халықаралық қатысуын кеңейте бастады."
          ]
        },
        {
          "date": "1993 – 2000 ж. аралығында",
          "paragraphs": [
            "Өзінің 100 – жылдығында бизнесі  көтеріңкі жағдайда. Компания сату көлемі бойынша  неміс өнеркәсібінің жетекші ондығына  кіреді.",
            "1997/1998 жылдары IPO жүргізілді. Компания жұмысының негізгі  бағыты дженериктер мен рецептсіз препараттар өндіру. STADA өзінің интернационалдық  стратегиясын дәйекті түрде жүргізуді жалғастырып, ғаламдық серпінді ойнаушыға айналуда."
          ]
        },
        {
          "date": "2005 - 2010 ж. аралығында",
          "paragraphs": [
            "STADA, Топ үшін стратегиялық маңызды болып табылатын, Hemofarm AG серб компаниясын сатып алады. STADA еншілес компаниясы бірінші биосимиляр ұсынады. STADA табыстылықпен бірінші корпоративтік облигацияларын ұсынады."
          ]
        },
        {
          "date": "2010 – 2015ж. аралығында",
          "paragraphs": [
            "STADA, Топқа өте маңызды болған, фирмалық өнімдердің өндіріс саласында табысты сатып алу жұмыстарын жүргізді. Бүкіл Топтың  аясындағы шыққан қаражаттың тиімділігін арттыру жөніндгі \"STADA – болашақты құру\"  бағдарламасы кесте уақытынан бұрын табысты аяқталды. STADA Thornton & Ross британиялық өндірушінің рецептісіз тауарларын сатып алады."
          ]
        },
        {
          "date": "2019 – 2020 ж. аралығында",
          "paragraphs": [
            "STADA AG  Walmark, GSK мен Takeda ірі мәмілелерінің жабылуына байланысты Орталық  және Шығыс  Европа, Ресей және Евразия нарықтарындағы  жайғасымын күшейтті. STADA Consumer Healthcare сегментінің көшбасшысы  атанды."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA  Specialty бағыты бойынша бизнесті күшейтуді  жалғастыруда.",
            "Компания тұрақты даму туралы бірінші ғаламдық есепті ұсынды және",
            "10 % тұрақты фармацевтикалық компаниялар санына енді."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "STADA  Қазақстанда   «Жыл серпілісі»  және «Жыл көшбасшысы» марапаттарын иемденді.",
          "date": "15.02.2024",
          "text": "Фармацевтикалық сараптама аналитикасын жүргізетін Vi-ORTIS консалтинг агенттігі STADA Қазақстан нарығындағы жетістіктерін атап өтті.\n\nКомпания бөлшектеп сату нарығында «2023 жыл көшбасшысы»  атағын  алды.\n\nБұдан басқа ОТС сегментінде“Энтерожермина” бренді және RX сегментінде  “Ксефокам” бренді бойынша  STADA -өзінің көшбасшылық қасиеттерін «Жыл серпілісі» марапатын жеңіп алып күшейтті.\n\nБарлығын есептегенде  STADA бес санат бойынша атап өтілді:\n\n\"Жыл серпілісі\" СНС сегментінде бөлшек сауда нарығында\n\n\"Жыл серпілісі\" ОТС сегментінде бөлшек сауда нарығында\n\n\"Жыл көшбасшысы\" бөлшек сауда нарығында\n\nМедицина саласындағы бұйымдар бөлшек сауда нарығында 3-орын.\n\nСНС сегментіндегі бөлшек сауда нарығында 3-орын.",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA Евразия Eurasian Pharma Awards-та марапатқа ие болды.",
          "date": "04.10.2023",
          "text": "Марапат  «Жыл серіктестігі»  айдарында  Sanofi портфелі табысты  қосылғаны үшін.\n\nЕвразия фармацевтика саммитінің аясында евразия аймағының фармсаласы ойыншыларына  маңызды марапаттау рәсімі болды.\n\nEurasian Pharma Awards – бұл Орта Азия, Кавказ және Шығыс Европа елдерінің фармацевтика саласындағы  алдыңғы қатарлы компаниялар  мен кәсіби мамандарын біріктірген жарқын оқиға.\n\nСайыс жыл сайын, саланың әртүрлілігін және жаңашылдығын көрсететін 16 бірегей  айдарда өткізіледі.\n\nАрминас Мацевичус,   STADA Евразия Вице-президенті марапатты сайыс ұйымдастырушыларының қолынан алды.\n\nСпикер: «Sanofi өнімдерін Евразиядағы STADA портфеліне қосқаннан кейін компания СНС сегментіндегі (Consumer Healthcare) онсыз да  мықты жайғасымын едәуір күшейтті, және осы бағыттағы жұмысты инвестициялар арқылы және Sanofi сияқты серіктестерді табу жолымен әлі де күшейтуді жоспарлап отырмыз», -деп атап өтті.\n\n2022 жылы STADA мен  Sanofi бір шама евразия елдерінде СНС өнімдері портфелінің  дистрибуциясы жайлы келісім жасады.\n\nКелісім аясында STADA 2023 жылдың 01 сәуірінен Евразия аймағының  10  елінде тұтынушылық денсаулық сақтау  саласындағы белгілі брендтерден тұратын Sanofi компаниясының препараттар портфеліне дистрибуцияны  және маркетингілік қолдауды  іске асырады\n\nКелісімге тұтынушылар сенім білдірген және бренд туралы білім көрсеткіштері жоғары, көптеген жағдайда нарықта көшбасшылық жайғасымға ие болған, Евразия елдерінің нарығында жақсы жағынан танылған  19 өнім түрі енгізілді.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Мемлекет басшысы STADA Group компаниясының вице-президенті Кристосом Галлиспен кездесу өткізді.",
          "date": "29.09.2023                                                                                                                          Берлин қ, Германия",
          "text": "Кездесу барысында денсаулық сақтау және фармацевтика саласында болашақта ынтымақтастықпен біріге еңбек жасау жолдары талқыланды.\n\nҚасым-Жомарт Тоқаев  STADA денсаулыққа арналған тұтынушылық тауарлар сегментінде Қазақстан нарығында көшбасшылардың үштігіне кіретінін айтты. Оның айтуы бойынша, компанияның Алматыда кеңсе ашуы, ынтымақтастықпен біріге табысты жұмыс жасаудың жарқын мысалы болып табылады.\n\nПрезидент Қазақстанда биотехнологиялық кластер құру бойынша белсенді жұмыстар жүргізіліп жатқанын  айтты.\n\nМемлекет басшысының пікірі бойынша, STADA алдында QazBioPharm ұлттық холдингімен зерттеу және өндіру саласында күш-жігерін біріктіру үшін үлкен мүмкіндіктер ашылады.\n\nҚасым-Жомарт Тоқаев  неміс компаниясын бірлескен зерттеулер мен жұмыстар жүргізуге, өндірісті ұйымдастыруға, тәжірибе бөлісуге және мамандардың біліктілігін  жетілдіруге шақырды.\n\nӨз кезегінде Кристос Галлис   бірлескен жұмысты тереңдетуге мүдделілігін танытты және компанияның Қазақстандағы бағдарламалар мен медициналық жобаларға инвестиция жасау мүмкіндігін қарастыруға дайын екенін көрсетті.\n\nSTADA жоғары сапалы дәрі-дәрмек  шығаруда алдыңғы қатарлы өндірушілердің бірі болып табылады. Компания өз өнімдерін әлемнің 120 елінде  сатады.",
          "image": {}
        }
      ]
    },
    "kg": {
      "source": "КГ/Stada.kz_Кыргызский.docx",
      "text": {
        "about_par1": "STADA – 130 жылдан ашык убакыттан бери өзүнүн \"Өнөктөштөр жана керектөөчүлөр менен ишенимдүү мамиле түзүү аркылуу адамдардын ден соолугуна кам көрүү\" миссиясын аткарып келе жаткан эл аралык фармацевтикалык компания. STADA негизги багыттары – бул Consumer Healthcare (CHC) сегментинин продукциясы, дженериктер жана адистештирилген препараттар (анын ичинде биосимилярлар). Продукция дүйнөнүн 100 өлкөсүндө көрсөтүлөт.",
        "about_par2": "2022-жылы КМШ өлкөлөрүнүн аймагы өз алдынча бизнес-бөлүмгө айланып, аталышы «STADA Евразия» деп өзгөртүлүп, Германиядагы штаб-квартирага түздөн-түз баш ийе турган болду. Аймакта 11 өлкөнүн өкүлдөрү бар: Казакстан, Өзбекстан, Беларусь, Азербайжан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Тажикстан, Түркмөнстан.",
        "about_list1": "STADA Евразия башкы кеңсеси Казакстандын Алматы шаарында жайгашкан. Компания ошондой эле аймактын көпчүлүк өлкөлөрүндө STADA Arzneimittel AG юридикалык жактарын каттаган. 2023-жылдын 01-апрелинен баштап STADA аймакта Sanofi компаниясынын рецептурасыз препараттары портфелин сунуштап келет.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Ишенимдүү өнөктөш катары адамдардын ден соолугуна кам көрүү",
        "about_page_overview_1": "STADA – 130 жылдан ашык убакыттан бери өзүнүн \"Өнөктөштөр жана керектөөчүлөр менен ишенимдүү мамиле түзүү аркылуу адамдардын ден соолугуна кам көрүү\" миссиясын аткарып келе жаткан эл аралык фармацевтикалык компания. STADA негизги багыттары – бул Consumer Healthcare (CHC) сегментинин продукциясы, дженериктер жана адистештирилген препараттар (анын ичинде биосимилярлар). Продукция дүйнөнүн 100 өлкөсүндө көрсөтүлөт.",
        "about_page_intro_2": "2022-жылы КМШ өлкөлөрүнүн аймагы өз алдынча бизнес-бөлүмгө айланып, аталышы «STADA Евразия» деп өзгөртүлүп, Германиядагы штаб-квартирага түздөн-түз баш ийе турган болду. Аймакта 11 өлкөнүн өкүлдөрү бар: Казакстан, Өзбекстан, Беларусь, Азербайжан, Грузия, Молдова, Кыргызстан, Армения, Монголия, Тажикстан, Түркмөнстан.",
        "about_page_intro_3": "STADA Евразия башкы кеңсеси Казакстандын Алматы шаарында жайгашкан. Компания ошондой эле аймактын көпчүлүк өлкөлөрүндө STADA Arzneimittel AG юридикалык жактарын каттаган. 2023-жылдын 01-апрелинен баштап STADA аймакта Sanofi компаниясынын рецептурасыз препараттары портфелин сунуштап келет.",
        "culture_purpose_heading": "МИССИЯ ЖАНА БААЛУУЛУКТАР",
        "culture_purpose_statement": "Ишенимдүү өнөктөш катары адамдардын ден соолугуна кам көрүү",
        "culture_purpose_text_1": "STADA – 125 жылдан ашык убакыттан бери ишенимдүү өнөктөш катары адамдардын ден соолугуна кам көрүү миссиясын аткарып келе жаткан эл аралык фармацевтикалык компания. STADA, компания тарабынан өндүрүлгөн дары-дармектер, анын катышуусунун бардык өлкөлөрүндө кесипкөйлөрдүн жана керектөөчүлөрдүн ишенимдүү тандоосу болушу үчүн аракет кылат.",
        "culture_purpose_text_2": "STADAнын негизги бизнес чөйрөлөрү — Consumer Healthcare сегменти (рецептурасыз дары-дармектер, тамак-аш кошулмалары, косметика, медициналык буюмдар) жана генериктер, анын ичинде адистештирилген препараттар. Компания продукциянын сапатына артыкчылыктуу көңүл бурат: компаниянын өзүнүн жана бүткүл дүйнө боюнча контракттык өндүрүш аянтчалары бирдиктүү эл аралык сапат стандарттарына (GMP) ылайык иштейт.",
        "culture_values_heading": "Биздин баалуулуктар",
        "culture_values_eyebrow": "Биздин баалуулуктар",
        "culture_values_intro": "Жалпы баалуулуктар STADAнын узак мөөнөттүү келечекте өсүшүн жана ийгилигин камсыз кылуу менен амбициялуу максаттарга жетүүгө мүмкүнчүлүк берет.",
        "about_compliance_heading": "КОМПЛАЕНС",
        "about_compliance_intro_1": "Биздин компания этикалык ишкердик жүрүм-турумун сактоо жана комплаенсти кошкондо, бардык жагынан мыкты болууга умтулат. Миссиябызга ылайык, биз керектөөчүлөрдүн алдындагы жоопкерчилигибизди түшүнөбүз жана ошондуктан чынчылдык жана ак ниеттик маселелеринде компромисске барбайбыз.",
        "about_compliance_intro_2": "Биз Жүрүм-турум кодексинде бекитилген мыйзам талаптарын жана баалуулуктарыбызды катуу жетекчиликке алабыз. Этикалык жана жоопкерчиликтүү ишкердик жүрүм-турум — бул биздин компанияга ишенимди бекемдөө үчүн негиз болуп кызмат кылган корпоративдик маданияттын ажырагыс бөлүгү.",
        "about_compliance_speakup_heading": "Speak up Порталы жана Евразиянын Этика жана Комплаенс тобунун жалпы почта жашиги",
        "about_compliance_speakup_text": "Биз ар бир адам, компанияда иштеген же иштебегенине карабастан, компаниянын кызматкерлери, өнөктөштөр, жеткирүүчүлөр жана подрядчылар тарабынан этикага туура келбеген же мыйзамсыз жүрүм-туруму жөнүндө кабарлоого жөндөмдүү болушу керек деп эсептейбиз.",
        "about_compliance_tools_text": "Бул максатта STADA компаниялар тобунда маалымдоо системасы киргизилген – бул Speak up Порталы, ошондой эле Евразиянын Комплаенс жана Этика тобунун жалпы почта жашиги (электрондук почта), бул инструменттер каалаган адамга учурлар жөнүндө жана нормалар менен талаптарды сактабоо фактылары жөнүндө билдирүүлөрдү жөнөтүүгө мүмкүндүк берет, атап айтканда, бирок алар менен чектелбестен:",
        "about_compliance_item_fraud": "алдамчылык,",
        "about_compliance_item_corruption": "коррупция,",
        "about_compliance_item_competition": "атаандаштыкты коргоо чөйрөсүндөгү бузуулар (монополияга каршы талаптар),",
        "about_compliance_item_conflict": "таламдардын кагылышуусу.",
        "about_compliance_report_text": "Эгер сиз мындай туура эмес жүрүм-турум учурлары жөнүндө билсеңиз, бизге eurasia_compliance@stada.kz дареги боюнча жазыңыз же болбосо шилтеме боюнча өтүп, кайрылууну Порталда түздөн-түз толтуруңуз.",
        "about_compliance_confidentiality": "STADA компаниялар тобу алынган маалыматтын купуялуулугуна кепилдик берет.",
        "about_compliance_questions": "Сиз пациенттердин жана керектөөчүлөрдүн жыргалчылыгы үчүн командалык ишти жакшыртуу боюнча бардык суроолор менен сунуштарды Комплаенс жана Этика Тобунун eurasia_compliance@stada.kz электрондук дарегине жөнөтө аласыз.",
        "about_pv_heading": "ФАРМАКӨЗӨМӨЛ",
        "about_pv_text": "Адамдардын ден соолугуна жана жыргалчылыгына кам көрүү биздин компаниянын негизги алгачкылыгы болуп саналат.  Сиз бейтап, камкорчу жемедициналык кызматчы болсоңуз дагы, Stada өнүмдөрүнө байланыштуу жагымсыз окуялар жөнүндө кабарлоо маанилүү. Сиз берген маалымат өнүмдөрүбүздүн жана бейтаптарыбыздын коопсуздугун камсыздоого жардам берет.",
        "about_pv_contact_label": "Stada дары препараттарына жагымсыз көрүнүштөрдүн бардык учурларын төмөнкү катташуу маалыматтары боюнча билдирүүңүздөрдү суранабыз:",
        "about_leadership_intro": "Арминас Мацевичус, Наталья Гарипова",
        "about_leader_ospanov_name": "Арминас Мацевичус",
        "about_leader_garipova_name": "Наталья Гарипова",
        "culture_integrity_title": "АДЕПТҮҮЛҮК",
        "culture_integrity_tagline": "Ар бирибиз корпоративдик жана кабыл алынган этикалык стандарттарга ылайык иш алып барабыз. Биздин ишибиздин өзөгүн — сөз эркиндиги жана бири-бирибизди урматтоо түзөт.",
        "culture_entrepreneurship_title": "ИШКЕРДИК",
        "culture_entrepreneurship_tagline": "Ар бирибиз жаңы идеяларды жана чечимдерди алып келип, компаниянын өсүшүнө жана өнүгүшүнө салым кошобуз.",
        "culture_agility_title": "ЫҢГАЙЛАШУУЧУЛУК",
        "culture_agility_tagline": "Ар бирибиз — өзгөрүүлөрдүн лидери. Ийкемдүүлүк жана чечкиндүүлүк — биздин өнүгүүбүздүн жана ийгиликке жетүү жолубуздун негизи.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Биз бүтүндөй компаниянын кызыкчылыгында аракеттенебиз, жеке функциялардын жана бөлүмдөрдүн кызыкчылыгына караганда STADAнын ийгилиги маанилүү.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "STADA тарыхы 14-жылдын 1895-мартында Германиянын Дрезден шаарында башталган. Жергиликтүү фармацевттер ассоциацияга биригип, натыйжалуу жана арзан коомдук саламаттыкты сактоо үчүн стандартташтырылган препараттар түзүштү.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Германиянын фармацевтикалык ассоциациясы өндүрүштө бирдиктүү ыкманы түзөт. Дары-дармектер ар кандай дарыканаларда, бирок бирдей формулада, бирдей таңгакта жасалат, бирдей баада сатылат. Ушундайча, Standard Arzneimittel die Deutscher Apotheke – St.d.A аббревиатурасы пайда болот, орус тилине которгондо «немис дарыканалары препараттарынын стандарты» дегенди билдирет. Ал соода маркасы катары катталган.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "Экинчи дүйнөлүк согуш учурунда Түштүк жана Түндүк болуп, эки компанияга бөлүнгөн STADA компаниясы 1954-жылы кайрадан биригип, Майндагы Франкфуртка жакын жайгашкан Бад-Вильбель шаарына отурукташкан.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA жаңы деңгээлге көтөрүлөт: ал Майндагы Франкфурт четиндеги өндүрүш аянтында (мурдагыдай дарыканаларда эмес) өндүрүштүк масштабда дары препараттарын чыгара баштайды.",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "STADA үчүн бурулуш жыл. Компания акционердик коомго айланып, бул анын өнүгүшүнө жаңы дем берет.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Компания генерикалык препараттарды (патент берилбеген дары каражаттарын) өндүрүүгө жана сатууга көңүл бурууну чечет.",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA компаниясы Европа жана Азияда өкүлчүлүктөрдү ачуу, ошондой эле активдүү кошулуу жана биригүү стратегиясы аркылуу өзүнүн эл аралык катышуусун кеңейте баштайт.",
        "supplied_history_date_7": "1993-жылдан 2000-жылга чейин",
        "supplied_history_text_7": "Өзүнүн 100 жылдык юбилейинде бизнес гүлдөп жатат. Компания сатуу көлөмү боюнча Германиянын өнөр жайынын алдыңкы он лидеринин бири. 1997/1998-жылдары IPO өткөрүлдү. Компаниянын негизги иш-аракеттери дженериктерди жана рецептсиз дарыларды өндүрүү болуп саналат. STADA өзүнүн интернационалдаштыруу стратегиясын ырааттуу улантууда жана динамикалуу глобалдык оюнчуга айланууда.",
        "supplied_history_date_8": "2005-жылдан 2010-жылга чейин",
        "supplied_history_text_8": "STADA топ үчүн стратегиялык жактан маанилүү болгон сербиялык Hemofarm AG компаниясын сатып алат. Германиянын STADA туунду компаниясы биринчи биосимилярды сунуштайт. STADA өзүнүн биринчи корпоративдик облигацияларын ийгиликтүү жайгаштырат.",
        "supplied_history_date_9": "2010-жылдан 2015-жылга чейин",
        "supplied_history_text_9": "STADA фирмалык продуктылар тармагында ийгиликтүү сатып алууларды жасайт, бул Топ үчүн барган сайын маанилүү болот. Жалпы Топтун алкагындагы «STADA – келечекти куруу» чыгымдардын эффективдүүлүгүн жогорулатуу программасы мөөнөтүнөн мурда ийгиликтүү аякталды. STADA, британиялык рецептурасыз товарлар өндүрүүчүсү Thornton & Rossту компаниясын сатып алат.",
        "supplied_history_date_10": "2019-жылдан 2020-жылга чейин",
        "supplied_history_text_10": "STADA AG Борбордук жана Чыгыш Европа, Россия жана Евразия рынокторундагы бир нече ири келишимдердин (Walmark, GSK жана Takeda) жабылышынын аркасында өз позицияларын бекемдөөдө. STADA компаниясы Consumer Healthcare сегментинин лидери болууда.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA өзүнүн бизнесин Specialty багыты боюнча күчөтүүнү улантат. Компания туруктуу өнүгүү тууралуу биринчи глобалдык отчетту тартуулап, эң туруктуу фармацевтикалык компаниялардын 10%на кирди.",
        "supplied_history_heading": "ТАРЫХ",
        "hero_text1": "Казакстандагы STADA уюму «Жылдын мыктысы» жана «Жылдын лидери» сыйлыктарына ээ болду.",
        "news_1_text": "Дары-дармек рыногунун эксперттик аналитикасын жүргүзгөн Vi-ORTIS консалтинг агенттиги STADAнын Казакстан рыногундагы жетишкендиктерин белгиледи.\n\nКомпания чекене соода рыногунда «2023-жылдын лидери» катары ишенимдүү позицияны ээледи. Мындан тышкары, STADA “Энтерожермина” бренди менен OTC сегментинде жана “Ксефокам” бренди менен RX сегментинде «Жылдын ачылышын» жеңип, лидерлик позициясын бекемдеди.\n\nЖалпысынан, STADA беш категория боюнча белгиленди:\n\nСНС сегментиндеги чекене рыноктогу \"Жылдын жетишкендиги\"\n\nОТС сегментиндеги чекене рыноктогу \"Жылдын жетишкендиги\"\n\nЧекене рыноктогу \"Жылдын жетишкендиги\"\n\nМедициналык Максаттагы Буюмдардын чекене рыногунда 3-орун\n\nЧекене рынокто, СНС сегментинде 3-орун",
        "hero_text2": "STADA Евразия компаниясы Eurasian Pharma Awardsта сыйлыкка ээ болду",
        "news_2_text": "Сыйлык, Sanofi портфелинин ийгиликтүү кошулгандыгы үчүн \"Жылдын өнөктөштүгү\" номинациясында алынган.\n\nЕвразиялык фармацевтикалык саммиттин алкагында Евразия аймагынын фармацевтика тармагынын оюнчулары үчүн өзгөчө сыйлык тапшыруу аземи өткөрүлдү.\n\nEurasian Pharma Awards - бул Борбордук Азия, Кавказ жана Чыгыш Европанын фармацевтика тармагындагы алдыңкы компанияларын жана адистерин бириктирген жаркын окуя. Конкурс жыл сайын тармактын ар түрдүүлүгүн жана инновациялуулугун чагылдырган 16 уникалдуу номинацияда өткөрүлөт.\n\nSTADA Eurasia Вице-президенти Арминас Мацевичюс, сыйлыкты уюштуруучулардын колунан алды. «Евразиядагы STADA портфелине Sanofi өнүмдөрүн кошкондон кийин, компания CHC (Consumer Healthcare) сегментинде өзүнүн күчтүү позициясын бир кыйла бекемдөөгө жетишти жана бул чөйрөлөрдү инвестициялар аркылуу да, балким, Sanofi сыяктуу өнөктөштөрдү тартуу аркылуу дагы өнүктүрүүнү пландаштырууда» — деп белгиледи спикер.\n\n2022-жылы STADA жана Sanofi бир катар Евразия өлкөлөрүндө CHC продуктылары портфелин жайылтуу боюнча келишим түзүшкөн. Келишим алкагында STADA 2023-жылдын 1-апрелинен тартып Евразия аймагынын 10 өлкөсүндө керектөөчүлөрдүн ден соолугун сактоо тармагындагы белгилүү бренддерден турган Sanofi компаниясынын дары-дармек портфелине дистрибьютордук жана маркетингдик колдоо көрсөтөт.\n\nКелишимге Евразия өлкөлөрүнүн рынокторунда өзүн далилдеген, керектөөчүлөрдүн ишенимине ээ болгон, бренд боюнча жогорку билимге ээ болгон жана көпчүлүк учурларда рынокто алдыңкы орундарды ээлеген 19 продукция камтылган.",
        "hero_text3": "Мамлекет башчысы STADA Group компаниясынын вице-президенти Кристос Галлис менен жолугушту",
        "news_3_text": "Жолугушуунун жүрүшүндө саламаттык сактоо жана фармацевтика тармагында кызматташуунун келечеги талкууланды.\n\nКасым-Жомарт Токаев белгилегендей, STADA компаниясы Казакстан рыногундагы керектөөчү ден соолук товарлары сегментинде алдыңкы үчтүктүн катарына кирет. Анын айтымында, ийгиликтүү жана динамикалуу өнүгүп жаткан кызматташтыктын айкын мисалы – Алматыда компания кеңсесинин ачылышы болуп саналат.\n\nПрезидент Казакстанда биотехнологиялык кластерди түзүү боюнча жигердүү иштер жүрүп жатканына өзгөчө токтолду.\n\nМамлекет башчынын айтымында, STADAга изилдөө жана өндүрүш тармагында QazBioPharm улуттук холдинги менен күчтөрдү бириктирүүгө кеңири мүмкүнчүлүктөр ачылууда.\n\nКасым-Жомарт Токаев немис компаниясын биргелешкен изилдөөлөр менен иштелмелерди өткөрүүгө, өндүрүштү уюштурууга, тажрыйба алмашууга жана адистердин квалификациясын жогорулатууга чакырды.\n\nӨз кезегинде Кристос Галлис кызматташууну тереңдетүүгө кызыкдар экенин билдирип, компаниянын Казакстандагы медициналык долбоорлор менен программаларга инвестиция салуу мүмкүнчүлүктөрүн изилдөөгө даяр экендигин баса белгиледи.\n\nSTADA жогорку сапаттагы дары-дармектердин алдыңкы өндүрүүчүлөрүнүн бири болуп саналат. Компания өз продукциясын дүйнөнүн 120 өлкөсүндө сатат.",
        "news_4_title": "Кристос Галлис: Биотехнологиялык кластерди түзүү – бул өтө дымактуу иш.",
        "news_4_text": "STADA Group вице-президенти рыноктогу тенденциялар жана Казакстан Республикасы кайсы өлкөлөрдүн тажрыйбасын колдонушу мүмкүн экендиги жөнүндө айтып берди\n\nIQVIA Institute for Human Data Science божомолуна ылайык, дүйнөлүк дары-дармек рыногу үч жылдын ичинде орточо 3-6%га өсөт. Аналитиктер 2027-жылга чейин ал болжол менен 1,9 триллион долларга жетет деп болжолдошууда. STADA Group вице-президенти Кристос Галлис Казакстанда фармацевтика тармагын өнүктүрүү үчүн дарыларды каттоо процедурасын тездетүү зарыл деп эсептейт. «Фармацевтика рыногунда иштеген жана мамлекеттик сегментте чоң портфелге ээ болгон кесиптештерибиздин эсептөөлөрү боюнча, досье даярдалгандан баштап инновациялык препарат рынокко киргенге чейин 3,5 жылдан 5 жылга чейин убакыт кетет. Каттоонун мындай узак мөөнөттөрү фармацевтикалык компаниялар дары-дармектерин казакстандык рынокко чыгарбоо чечимин кабыл алышынын башкы себептеринин бири болуп саналат», - деп эсептейт эксперт. Kapital.kz ишкердик маалымат борборунун корреспонденти менен сүйлөшүүдө ал ошондой эле Health Report 2023 изилдөөсүнүн жыйынтыктары, эмне үчүн көптөгөн фармацевтикалык компаниялар препараттардын баасын көтөрүүгө аргасыз болуп жатканы жана биотехнологиялык кластерди түзүү үчүн өлкөбүзгө кандай база керек экендиги жөнүндө айтып берди.\n\nКененирээк: Кристос Галлис: Биотехнологиялык кластерди түзүү – бул өтө дымактуу иш - Капитал (kapital.kz)",
        "news_5_title": "STADA Евразиядагы оорукана сегментинде өз позициясын бекемдөөгө ниеттенүүдө",
        "news_5_text": "26-28-сентябрь аралыгында Самаркандда IV Евразия фармацевтикалык саммити өтөт. Иш-чаранын башкы маалыматтык өнөктөшү катары «Курсив Узбекистан» бизнес-басылмасы чыгат. Алдыдагы саммиттин алкагында «Курсив» фармацевтика рыногундагы дүйнөлүк жана аймактык оюнчулардын пикирлерин жарыялай баштайт.\n\nАрминас Мацевичус, Stada компаниясының Евразия чөлкөмү боюнча вице-президенти. Компания аймактагы көзөмөлдөөчү органдар менен иштешүүнү улантат.\n\n– Арминас, Евразия чөлкөмүндө сиздин компанияңыз алдында кандай артыкчылыктар тур? Кайсы өлкөлөрдө жана сегменттерде STADA үчүн эң чоң келечекти көрөсүз?\n\n– Евразиядагы STADA портфелине Sanofi өнүмдөрүн кошкондон кийин биз CHC (Consumer Healthcare) сегментинде ансыз да күчтүү позициябызды кыйла бекемдедик. Албетте, биз бул багытты инвестиция аркылуу да, балким, Sanofi сыяктуу өнөктөштөрдү тартуу менен да өнүктүрөбүз.\n\nОшол эле учурда, жакынкы бир нече жылдын ичинде компания оорукана сегментинде жана рецептуралық бизнесте өз ордун бекемдөөгө ниеттенүүдө. Таануу жана/же жөнөкөйлөштүрүлгөн каттоо процедурасы бар Евразия өлкөлөрүндө (мисалы, Молдовада, Өзбекстанда, Грузияда) биз бир катар жаңы европалык дары-дармектерди каттоодон өткөрдүк.\n\nБиз бул ишти улантабыз, ошондой эле рынокко кирүү жол-жобосун мындан ары жөнөкөйлөтүү үчүн бардык өлкөлөрүбүздүн көзөмөлдөөчү органдары менен өз ара аракеттенебиз.\n\nОрто жана узак мөөнөттүү келечекте — дженериктер менен бирге STADA үчүн негизги бизнестердин бири болуп санала турган биосимилярлар сегментин өнүктүрүү максаты бар. Бир-бир жарым жылдын ичинде биз Евразиянын тездетилген каттоосу бар рынокторуна мындай дарыларды сунуштай алабыз деп ойлойм. Кененирээк: STADA кайсы аймакта өз позициясын бекемдөөгө ниеттенүүдө (kursiv.media)"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "STADA тарыхы 14-жылдын 1895-мартында Германиянын Дрезден шаарында башталган. Жергиликтүү фармацевттер ассоциацияга биригип, натыйжалуу жана арзан коомдук саламаттыкты сактоо үчүн стандартташтырылган препараттар түзүштү."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Германиянын фармацевтикалык ассоциациясы өндүрүштө бирдиктүү ыкманы түзөт. Дары-дармектер ар кандай дарыканаларда, бирок бирдей формулада, бирдей таңгакта жасалат, бирдей баада сатылат. Ушундайча, Standard Arzneimittel die Deutscher Apotheke – St.d.A аббревиатурасы пайда болот, орус тилине которгондо «немис дарыканалары препараттарынын стандарты» дегенди билдирет. Ал соода маркасы катары катталган."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "Экинчи дүйнөлүк согуш учурунда Түштүк жана Түндүк болуп, эки компанияга бөлүнгөн STADA компаниясы 1954-жылы кайрадан биригип, Майндагы Франкфуртка жакын жайгашкан Бад-Вильбель шаарына отурукташкан."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA жаңы деңгээлге көтөрүлөт: ал Майндагы Франкфурт четиндеги өндүрүш аянтында (мурдагыдай дарыканаларда эмес) өндүрүштүк масштабда дары препараттарын чыгара баштайды."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "STADA үчүн бурулуш жыл. Компания акционердик коомго айланып, бул анын өнүгүшүнө жаңы дем берет."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Компания генерикалык препараттарды (патент берилбеген дары каражаттарын) өндүрүүгө жана сатууга көңүл бурууну чечет."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA компаниясы Европа жана Азияда өкүлчүлүктөрдү ачуу, ошондой эле активдүү кошулуу жана биригүү стратегиясы аркылуу өзүнүн эл аралык катышуусун кеңейте баштайт."
          ]
        },
        {
          "date": "1993-жылдан 2000-жылга чейин",
          "paragraphs": [
            "Өзүнүн 100 жылдык юбилейинде бизнес гүлдөп жатат. Компания сатуу көлөмү боюнча Германиянын өнөр жайынын алдыңкы он лидеринин бири. 1997/1998-жылдары IPO өткөрүлдү. Компаниянын негизги иш-аракеттери дженериктерди жана рецептсиз дарыларды өндүрүү болуп саналат. STADA өзүнүн интернационалдаштыруу стратегиясын ырааттуу улантууда жана динамикалуу глобалдык оюнчуга айланууда."
          ]
        },
        {
          "date": "2005-жылдан 2010-жылга чейин",
          "paragraphs": [
            "STADA топ үчүн стратегиялык жактан маанилүү болгон сербиялык Hemofarm AG компаниясын сатып алат. Германиянын STADA туунду компаниясы биринчи биосимилярды сунуштайт. STADA өзүнүн биринчи корпоративдик облигацияларын ийгиликтүү жайгаштырат."
          ]
        },
        {
          "date": "2010-жылдан 2015-жылга чейин",
          "paragraphs": [
            "STADA фирмалык продуктылар тармагында ийгиликтүү сатып алууларды жасайт, бул Топ үчүн барган сайын маанилүү болот. Жалпы Топтун алкагындагы «STADA – келечекти куруу» чыгымдардын эффективдүүлүгүн жогорулатуу программасы мөөнөтүнөн мурда ийгиликтүү аякталды. STADA, британиялык рецептурасыз товарлар өндүрүүчүсү Thornton & Rossту компаниясын сатып алат."
          ]
        },
        {
          "date": "2019-жылдан 2020-жылга чейин",
          "paragraphs": [
            "STADA AG Борбордук жана Чыгыш Европа, Россия жана Евразия рынокторундагы бир нече ири келишимдердин (Walmark, GSK жана Takeda) жабылышынын аркасында өз позицияларын бекемдөөдө. STADA компаниясы Consumer Healthcare сегментинин лидери болууда."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA өзүнүн бизнесин Specialty багыты боюнча күчөтүүнү улантат. Компания туруктуу өнүгүү тууралуу биринчи глобалдык отчетту тартуулап, эң туруктуу фармацевтикалык компаниялардын 10%на кирди."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "Казакстандагы STADA уюму «Жылдын мыктысы» жана «Жылдын лидери» сыйлыктарына ээ болду.",
          "date": "15.02.2024",
          "text": "Дары-дармек рыногунун эксперттик аналитикасын жүргүзгөн Vi-ORTIS консалтинг агенттиги STADAнын Казакстан рыногундагы жетишкендиктерин белгиледи.\n\nКомпания чекене соода рыногунда «2023-жылдын лидери» катары ишенимдүү позицияны ээледи. Мындан тышкары, STADA “Энтерожермина” бренди менен OTC сегментинде жана “Ксефокам” бренди менен RX сегментинде «Жылдын ачылышын» жеңип, лидерлик позициясын бекемдеди.\n\nЖалпысынан, STADA беш категория боюнча белгиленди:\n\nСНС сегментиндеги чекене рыноктогу \"Жылдын жетишкендиги\"\n\nОТС сегментиндеги чекене рыноктогу \"Жылдын жетишкендиги\"\n\nЧекене рыноктогу \"Жылдын жетишкендиги\"\n\nМедициналык Максаттагы Буюмдардын чекене рыногунда 3-орун\n\nЧекене рынокто, СНС сегментинде 3-орун",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA Евразия компаниясы Eurasian Pharma Awardsта сыйлыкка ээ болду",
          "date": "04.10.2023",
          "text": "Сыйлык, Sanofi портфелинин ийгиликтүү кошулгандыгы үчүн \"Жылдын өнөктөштүгү\" номинациясында алынган.\n\nЕвразиялык фармацевтикалык саммиттин алкагында Евразия аймагынын фармацевтика тармагынын оюнчулары үчүн өзгөчө сыйлык тапшыруу аземи өткөрүлдү.\n\nEurasian Pharma Awards - бул Борбордук Азия, Кавказ жана Чыгыш Европанын фармацевтика тармагындагы алдыңкы компанияларын жана адистерин бириктирген жаркын окуя. Конкурс жыл сайын тармактын ар түрдүүлүгүн жана инновациялуулугун чагылдырган 16 уникалдуу номинацияда өткөрүлөт.\n\nSTADA Eurasia Вице-президенти Арминас Мацевичюс, сыйлыкты уюштуруучулардын колунан алды. «Евразиядагы STADA портфелине Sanofi өнүмдөрүн кошкондон кийин, компания CHC (Consumer Healthcare) сегментинде өзүнүн күчтүү позициясын бир кыйла бекемдөөгө жетишти жана бул чөйрөлөрдү инвестициялар аркылуу да, балким, Sanofi сыяктуу өнөктөштөрдү тартуу аркылуу дагы өнүктүрүүнү пландаштырууда» — деп белгиледи спикер.\n\n2022-жылы STADA жана Sanofi бир катар Евразия өлкөлөрүндө CHC продуктылары портфелин жайылтуу боюнча келишим түзүшкөн. Келишим алкагында STADA 2023-жылдын 1-апрелинен тартып Евразия аймагынын 10 өлкөсүндө керектөөчүлөрдүн ден соолугун сактоо тармагындагы белгилүү бренддерден турган Sanofi компаниясынын дары-дармек портфелине дистрибьютордук жана маркетингдик колдоо көрсөтөт.\n\nКелишимге Евразия өлкөлөрүнүн рынокторунда өзүн далилдеген, керектөөчүлөрдүн ишенимине ээ болгон, бренд боюнча жогорку билимге ээ болгон жана көпчүлүк учурларда рынокто алдыңкы орундарды ээлеген 19 продукция камтылган.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Мамлекет башчысы STADA Group компаниясынын вице-президенти Кристос Галлис менен жолугушту",
          "date": "29.09.2023                                                                                                                         Берлин ш., Германия",
          "text": "Жолугушуунун жүрүшүндө саламаттык сактоо жана фармацевтика тармагында кызматташуунун келечеги талкууланды.\n\nКасым-Жомарт Токаев белгилегендей, STADA компаниясы Казакстан рыногундагы керектөөчү ден соолук товарлары сегментинде алдыңкы үчтүктүн катарына кирет. Анын айтымында, ийгиликтүү жана динамикалуу өнүгүп жаткан кызматташтыктын айкын мисалы – Алматыда компания кеңсесинин ачылышы болуп саналат.\n\nПрезидент Казакстанда биотехнологиялык кластерди түзүү боюнча жигердүү иштер жүрүп жатканына өзгөчө токтолду.\n\nМамлекет башчынын айтымында, STADAга изилдөө жана өндүрүш тармагында QazBioPharm улуттук холдинги менен күчтөрдү бириктирүүгө кеңири мүмкүнчүлүктөр ачылууда.\n\nКасым-Жомарт Токаев немис компаниясын биргелешкен изилдөөлөр менен иштелмелерди өткөрүүгө, өндүрүштү уюштурууга, тажрыйба алмашууга жана адистердин квалификациясын жогорулатууга чакырды.\n\nӨз кезегинде Кристос Галлис кызматташууну тереңдетүүгө кызыкдар экенин билдирип, компаниянын Казакстандагы медициналык долбоорлор менен программаларга инвестиция салуу мүмкүнчүлүктөрүн изилдөөгө даяр экендигин баса белгиледи.\n\nSTADA жогорку сапаттагы дары-дармектердин алдыңкы өндүрүүчүлөрүнүн бири болуп саналат. Компания өз продукциясын дүйнөнүн 120 өлкөсүндө сатат.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Кристос Галлис: Биотехнологиялык кластерди түзүү – бул өтө дымактуу иш.",
          "date": "19.12.2023",
          "text": "STADA Group вице-президенти рыноктогу тенденциялар жана Казакстан Республикасы кайсы өлкөлөрдүн тажрыйбасын колдонушу мүмкүн экендиги жөнүндө айтып берди\n\nIQVIA Institute for Human Data Science божомолуна ылайык, дүйнөлүк дары-дармек рыногу үч жылдын ичинде орточо 3-6%га өсөт. Аналитиктер 2027-жылга чейин ал болжол менен 1,9 триллион долларга жетет деп болжолдошууда. STADA Group вице-президенти Кристос Галлис Казакстанда фармацевтика тармагын өнүктүрүү үчүн дарыларды каттоо процедурасын тездетүү зарыл деп эсептейт. «Фармацевтика рыногунда иштеген жана мамлекеттик сегментте чоң портфелге ээ болгон кесиптештерибиздин эсептөөлөрү боюнча, досье даярдалгандан баштап инновациялык препарат рынокко киргенге чейин 3,5 жылдан 5 жылга чейин убакыт кетет. Каттоонун мындай узак мөөнөттөрү фармацевтикалык компаниялар дары-дармектерин казакстандык рынокко чыгарбоо чечимин кабыл алышынын башкы себептеринин бири болуп саналат», - деп эсептейт эксперт. Kapital.kz ишкердик маалымат борборунун корреспонденти менен сүйлөшүүдө ал ошондой эле Health Report 2023 изилдөөсүнүн жыйынтыктары, эмне үчүн көптөгөн фармацевтикалык компаниялар препараттардын баасын көтөрүүгө аргасыз болуп жатканы жана биотехнологиялык кластерди түзүү үчүн өлкөбүзгө кандай база керек экендиги жөнүндө айтып берди.\n\nКененирээк: Кристос Галлис: Биотехнологиялык кластерди түзүү – бул өтө дымактуу иш - Капитал (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "STADA Евразиядагы оорукана сегментинде өз позициясын бекемдөөгө ниеттенүүдө",
          "date": "13.09.2023",
          "text": "26-28-сентябрь аралыгында Самаркандда IV Евразия фармацевтикалык саммити өтөт. Иш-чаранын башкы маалыматтык өнөктөшү катары «Курсив Узбекистан» бизнес-басылмасы чыгат. Алдыдагы саммиттин алкагында «Курсив» фармацевтика рыногундагы дүйнөлүк жана аймактык оюнчулардын пикирлерин жарыялай баштайт.\n\nАрминас Мацевичус, Stada компаниясының Евразия чөлкөмү боюнча вице-президенти. Компания аймактагы көзөмөлдөөчү органдар менен иштешүүнү улантат.\n\n– Арминас, Евразия чөлкөмүндө сиздин компанияңыз алдында кандай артыкчылыктар тур? Кайсы өлкөлөрдө жана сегменттерде STADA үчүн эң чоң келечекти көрөсүз?\n\n– Евразиядагы STADA портфелине Sanofi өнүмдөрүн кошкондон кийин биз CHC (Consumer Healthcare) сегментинде ансыз да күчтүү позициябызды кыйла бекемдедик. Албетте, биз бул багытты инвестиция аркылуу да, балким, Sanofi сыяктуу өнөктөштөрдү тартуу менен да өнүктүрөбүз.\n\nОшол эле учурда, жакынкы бир нече жылдын ичинде компания оорукана сегментинде жана рецептуралық бизнесте өз ордун бекемдөөгө ниеттенүүдө. Таануу жана/же жөнөкөйлөштүрүлгөн каттоо процедурасы бар Евразия өлкөлөрүндө (мисалы, Молдовада, Өзбекстанда, Грузияда) биз бир катар жаңы европалык дары-дармектерди каттоодон өткөрдүк.\n\nБиз бул ишти улантабыз, ошондой эле рынокко кирүү жол-жобосун мындан ары жөнөкөйлөтүү үчүн бардык өлкөлөрүбүздүн көзөмөлдөөчү органдары менен өз ара аракеттенебиз.\n\nОрто жана узак мөөнөттүү келечекте — дженериктер менен бирге STADA үчүн негизги бизнестердин бири болуп санала турган биосимилярлар сегментин өнүктүрүү максаты бар. Бир-бир жарым жылдын ичинде биз Евразиянын тездетилген каттоосу бар рынокторуна мындай дарыларды сунуштай алабыз деп ойлойм. Кененирээк: STADA кайсы аймакта өз позициясын бекемдөөгө ниеттенүүдө (kursiv.media)",
          "image": {}
        }
      ]
    },
    "ro": {
      "source": "МД/Stada.kz_Румынский N2.docx",
      "text": {
        "about_par1": "STADA este o companie farmaceutică internațională care, de peste 130 de ani, își urmează misiunea: „Grija pentru sănătatea oamenilor prin construirea unor relații de încredere cu partenerii și consumatorii”. Principalele linii de afaceri ale STADA sunt produsele din segmentul Consumer Healthcare (CHC), medicamentele generice și medicamentele speciale (inclusiv biosimilare). Produsele STADA sunt disponibile în 100 de țări din întreaga lume.",
        "about_par2": "În 2022, regiunea CSI a devenit o unitate de afaceri independentă și a fost redenumită STADA Eurasia, cu raportare directă la sediul central din Germania. Unsprezece țări sunt reprezentate în regiune: Kazahstan, Uzbekistan, Belarus, Azerbaidjan, Georgia, Moldova, Kârgâzstan, Armenia, Mongolia, Tadjikistan, Turkmenistan.",
        "about_list1": "Sediul central al STADA Eurasia este situat în Almatî, Kazahstan. De asemenea, societatea a înregistrat entități juridice ale STADA Arzneimittel AG în majoritatea țărilor din regiune. Începând cu 1 aprilie 2023, STADA reprezintă portofoliul OTC al Sanofi în regiune.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Avem grijă de sănătatea oamenilor ca un partener de încredere",
        "about_page_overview_1": "STADA este o companie farmaceutică internațională care, de peste 130 de ani, își urmează misiunea: „Grija pentru sănătatea oamenilor prin construirea unor relații de încredere cu partenerii și consumatorii”. Principalele linii de afaceri ale STADA sunt produsele din segmentul Consumer Healthcare (CHC), medicamentele generice și medicamentele speciale (inclusiv biosimilare). Produsele STADA sunt disponibile în 100 de țări din întreaga lume.",
        "about_page_intro_2": "În 2022, regiunea CSI a devenit o unitate de afaceri independentă și a fost redenumită STADA Eurasia, cu raportare directă la sediul central din Germania. Unsprezece țări sunt reprezentate în regiune: Kazahstan, Uzbekistan, Belarus, Azerbaidjan, Georgia, Moldova, Kârgâzstan, Armenia, Mongolia, Tadjikistan, Turkmenistan.",
        "about_page_intro_3": "Sediul central al STADA Eurasia este situat în Almatî, Kazahstan. De asemenea, societatea a înregistrat entități juridice ale STADA Arzneimittel AG în majoritatea țărilor din regiune. Începând cu 1 aprilie 2023, STADA reprezintă portofoliul OTC al Sanofi în regiune.",
        "culture_purpose_heading": "MISIUNE ȘI VALORI",
        "culture_purpose_statement": "Avem grijă de sănătatea oamenilor ca un partener de încredere",
        "culture_purpose_text_1": "STADA este o companie farmaceutică internațională, care își urmează misiunea de mai bine de 125 de ani - are grijă de sănătatea oamenilor ca un partener de încredere. STADA se străduiește să se asigure că produsele fabricate de companie sunt alegerea sigură a profesioniștilor și consumatorilor din toate țările în care este prezentă.",
        "culture_purpose_text_2": "Principalele domenii de activitate ale STADA sunt segmentul Consumer Healthcare (medicamente fără rețetă, suplimente alimentare, cosmetice, dispozitive medicale) și medicamentele generice, inclusiv medicamentele specializate. Compania acordă prioritate calității produselor: unitățile de producție proprii și contractuale ale companiei din întreaga lume funcționează în conformitate cu standardele unice internaționale de calitate (GMP).",
        "culture_values_heading": "Valorile noastre",
        "culture_values_eyebrow": "Valorile noastre",
        "culture_values_intro": "Valorile comune ne permit să atingem obiective ambițioase, asigurând creșterea și succesul STADA pe termen lung.",
        "about_compliance_heading": "COMPLIANCE",
        "about_compliance_intro_1": "Compania noastră se străduiește să fie cea mai bună în tot ceea ce face, inclusiv aderarea la un comportament etic în afaceri și la conformitate. În conformitate cu misiunea noastră, ne recunoaștem responsabilitatea față de clienții noștri și prin urmare, nu facem compromisuri privind onestitatea și integritatea.",
        "about_compliance_intro_2": "Suntem strict ghidați de cerințele legale și de valorile noastre, care sunt stabilite în Codul nostru de conduită. Comportamentul etic și responsabil în afaceri este o parte integrantă a culturii noastre corporative, care servește drept bază pentru construirea încrederii în compania noastră.",
        "about_compliance_speakup_heading": "Portalul Speak up și cutia poștală comună a Grupului Eurasia pentru conformitate și etică",
        "about_compliance_speakup_text": "Credem că oricine, indiferent dacă lucrează sau nu pentru companie, ar trebui să poată raporta cazurile de comportament neetic și ilegal al personalului, partenerilor, furnizorilor și contractorilor companiei.",
        "about_compliance_tools_text": "În acest scop, Grupul STADA a implementat un sistem de raportare - Speak up Portal, precum și o căsuță poștală comună (e-mail) a Grupului de conformitate și etică din Eurasia, aceste instrumente permițând oricărei persoane să trimită rapoarte cu privire la cazuri și fapte de nerespectare a normelor și cerințelor de conformitate, și anume, dar fără a se limita la",
        "about_compliance_item_fraud": "- fraudă,",
        "about_compliance_item_corruption": "- corupție,",
        "about_compliance_item_competition": "- încălcări în domeniul protecției concurenței (cerințe antitrust),",
        "about_compliance_item_conflict": "- conflicte de interese.",
        "about_compliance_report_text": "Dacă aveți cunoștință de astfel de cazuri de comportament ilegal, vă rugăm să ne scrieți la adresa eurasia_compliance@stada.kz sau să completați direct o cerere pe portal făcând clic pe link.",
        "about_compliance_confidentiality": "Grupul STADA garantează confidențialitatea informațiilor primite.",
        "about_compliance_questions": "Puteți expedia orice întrebări și sugestii pentru îmbunătățirea colaborării noastre în beneficiul pacienților și consumatorilor la căsuța poștală Compliance and Ethics Group: eurasia_compliance@stada.kz.",
        "about_pv_heading": "FARMACOVIGILENȚA",
        "about_pv_text": "Grija pentru sănătatea și bunăstarea oamenilor este o prioritate cheie pentru compania noastră.  Fie că sunteți pacient, îngrijitor sau cadru medical, este important să raportați evenimentele adverse asociate cu produsele Stada. Informațiile pe care le furnizați contribuie la asigurarea siguranței produselor noastre și a pacienților noștri.",
        "about_pv_contact_label": "Vă rugăm să raportați orice reacții adverse legate de produsele Stada pe următoarea adresă  de contact:",
        "culture_integrity_title": "INTEGRITATE",
        "culture_integrity_tagline": "Fiecare dintre noi acționează în conformitate cu standardele etice corporative și general acceptate. Activitățile noastre se bazează pe libertatea de exprimare și pe respectul reciproc.",
        "culture_entrepreneurship_title": "ANTREPRENORIAT",
        "culture_entrepreneurship_tagline": "Fiecare dintre noi aduce idei și soluții noi  ce contribuie la creșterea și dezvoltarea companiei.",
        "culture_agility_title": "ADAPTIVITATE",
        "culture_agility_tagline": "Fiecare dintre noi este un lider al schimbării. Flexibilitatea și determinarea sunt baza dezvoltării noastre și a căii către succes.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Acționăm în interesul întregii companii; succesul STADA este mai important decât interesele funcțiilor și departamentelor individuale.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "Istoria STADA a început la 14 martie 1895 în orașul german Drezden. Farmaciștii locali s-au reunit într-o asociație și au creat medicamente standardizate pentru a oferi asistență medicală publică eficientă și accesibilă.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Asociația farmaceutică germană creează o abordare uniformă a fabricării. Medicamentele sunt fabricate în farmacii diferite, dar în conformitate cu o formulă unică, în ambalaje identice, vândute la același preț. Așa apare abrevierea St.d.A - Standard Arzneimittel die Deutscher Apotheke -, care se traduce prin „standardul produselor farmaciilor germane”. Ea este înregistrată ca marcă comercială.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "Divizată în două companii în timpul celui de-al Doilea Război Mondial – de Sud și de Nord - STADA fuzionează din nou în 1954 și se stabilește în Bad Filbel, lângă Frankfurt pe Main.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA trece la nivelul următor: începe să producă produse farmaceutice la scară industrială într-o unitate de producție de la periferia orașului Frankfurt pe Main (în loc să le producă în farmacii, ca înainte).",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "Un an decisiv pentru STADA. Compania este transformată în societate pe acțiuni, ceea ce dă un nou impuls dezvoltării sale.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Compania decide să se concentreze pe producția și vânzarea de medicamente generice (produse medicale nepatentate).",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA începe să își extindă prezența internațională prin deschiderea de birouri de reprezentare în Europa și Asia și printr-o strategie activă de fuziuni și achiziții.",
        "supplied_history_date_7": "Din 1993 până în 2000",
        "supplied_history_text_7": "În anul celei de-a 100-a aniversări, afacerile sunt în plină expansiune. Compania se numără printre primii zece lideri din industria germană în ceea ce privește vânzările. În 1997/1998 a fost efectuată o ofertă publică inițială. Activitățile principale ale societății sunt medicamentele generice și medicamentele fără prescripție medicală. STADA continuă să își urmeze în mod consecvent strategia de internaționalizare și se transformă într-un actor global dinamic.",
        "supplied_history_date_8": "Din 2005 până în 2010",
        "supplied_history_text_8": "STADA achiziționează compania sârbă Hemofarm AG, care are o importanță strategică pentru Grup. Filiala germană STADA introduce primul său biosimilar. STADA plasează cu succes primele sale obligațiuni corporative.",
        "supplied_history_date_9": "Din 2010 până în 2015",
        "supplied_history_text_9": "STADA face achiziții de succes în domeniul produselor de marcă, care devine din ce în ce mai important pentru Grup. Programul de eficientizare a costurilor la nivel de grup „STADA - Construim viitorul” este finalizat cu succes înainte de termen. STADA achiziționează producătorul britanic de OTC Thornton & Ross.",
        "supplied_history_date_10": "Din 2019 până în 2020",
        "supplied_history_text_10": "STADA AG își consolidează poziția pe piață în Europa Centrală și de Est, Rusia și Eurasia prin încheierea mai multor tranzacții majore - Walmark, GSK și Takeda. STADA devine lider al segmentului Consumer Healthcare.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA continuă să își consolideze afacerea cu produse de specialitate. Compania prezintă primul său raport global de sustenabilitate și se clasează printre primele 10% cele mai sustenabile companii farmaceutice.",
        "supplied_history_heading": "ISTORIC:",
        "hero_text1": "STADA Eurasia a primit un premiu la Eurasian Pharma Awards",
        "news_1_text": "Premiul a fost primit la categoria „Parteneriatul anului” pentru achiziționarea cu succes a portofoliului Sanofi.\n\nEurasian Pharma Summit a găzduit o ceremonie de premiere, un eveniment de referință pentru actorii din industria farmaceutică din regiunea eurasiatică.\n\nEurasian Pharma Awards este un eveniment vibrant care reunește companii de vârf și profesioniști din domeniul farmaceutic din Asia Centrală, Caucaz și Europa de Est. Competiția se desfășoară anual în 16 categorii unice, reflectând diversitatea și inovația industriei.\n\nArminas Matsevicius, vicepreședinte al STADA Eurasia, a acceptat premiul din mâinile organizatorilor concursului. \"După aderarea produselor Sanofi la portofoliul STADA Eurasia, compania a reușit să-și consolideze semnificativ poziția deja puternică în segmentul SNS (Consumer Healthcare) și intenționează să dezvolte în continuare aceste domenii atât prin investiții, cât și, eventual, prin atragerea de parteneri precum Sanofi\" - a declarat vorbitorul.\n\nÎn 2022, STADA și Sanofi au încheiat un acord privind distribuția portofoliului de produse CHC într-o serie de țări eurasiatice. Conform acordului, STADA va distribui și va oferi sprijin de marketing pentru portofoliul Sanofi de mărci bine cunoscute în domeniul sănătății consumatorilor în 10 țări din regiunea Eurasia începând cu 01 aprilie 2023.\n\nAcordul include 19 produse bine stabilite, care se bucură de încrederea consumatorilor de pe piețele din Eurasia, au o mare notorietate a mărcii și, în multe cazuri, dețin poziții de lider pe piață.",
        "hero_text2": "STADA intenționează să își consolideze poziția în segmentul spitalicesc din Eurasia",
        "news_2_text": "Al IV-lea Summit farmaceutic eurasiatic va avea loc la Samarkand în perioada 26-28 septembrie. Publicația de afaceri Kursiv Uzbekistan va fi partenerul general de informare al evenimentului. în cadrul viitorului summit, Kursiv începe să publice opiniile jucătorilor globali și regionali de pe piața farmaceutică.\n\nArminas Macevicius, vicepreședinte pentru Eurasia la Stada, va continua să interacționeze cu autoritățile de reglementare din regiune.\n\n- Arminas, care sunt prioritățile companiei Dumneavoastră. în regiunea Eurasia? În ce țări și segmente vedeți cele mai mari perspective pentru STADA?\n\n- Odată cu adăugarea produselor Sanofi la portofoliul STADA în Eurasia, ne-am consolidat semnificativ poziția deja puternică pe segmentul Consumer Healthcare. Desigur, vom dezvolta acest domeniu atât prin investiții, cât și, eventual, prin atragerea de parteneri precum Sanofi.\n\nÎn același timp, în următorii ani, compania intenționează să își consolideze pozițiile pe segmentul spitalicesc și pe cel al rețetelor. Am înregistrat deja o serie de noi medicamente europene eliberate pe bază de rețetă în țările eurasiatice în care există o procedură de recunoaștere și/sau înregistrare simplificată (de exemplu, Moldova, Uzbekistan, Georgia).\n\nVom continua această activitate, precum și cooperarea cu autoritățile de reglementare din toate țările noastre pentru a simplifica și mai mult procedura de acces pe piață.\n\nPe termen mediu și lung, vom dezvolta segmentul biosimilarelor, care, alături de medicamentele generice, este una dintre activitățile cheie pentru STADA. Cred că într-un an și jumătate vom fi capabili să oferim acest tip de medicamente pe acele piețe din Eurasia unde este disponibilă înregistrarea accelerată. Citiți mai mult: În ce regiune intenționează STADA să își consolideze poziția (kursiv.media)",
        "hero_text3": "Șeful statului a avut o întâlnire cu vicepreședintele grupului STADA, Christos Gallis",
        "news_3_text": "STADA este unul dintre cei mai importanți producători de medicamente de înaltă calitate. Compania își vinde produsele în 120 de țări ale lumii.",
        "news_4_title": "Christos Gallis: Crearea unui cluster biotehnologic este o sarcină foarte ambițioasă.",
        "news_4_text": "Vicepreședintele STADA Group a vorbit despre tendințele de pe piață și despre experiența țărilor din care RoK poate învăța"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "Istoria STADA a început la 14 martie 1895 în orașul german Drezden. Farmaciștii locali s-au reunit într-o asociație și au creat medicamente standardizate pentru a oferi asistență medicală publică eficientă și accesibilă."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Asociația farmaceutică germană creează o abordare uniformă a fabricării. Medicamentele sunt fabricate în farmacii diferite, dar în conformitate cu o formulă unică, în ambalaje identice, vândute la același preț. Așa apare abrevierea St.d.A - Standard Arzneimittel die Deutscher Apotheke -, care se traduce prin „standardul produselor farmaciilor germane”. Ea este înregistrată ca marcă comercială."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "Divizată în două companii în timpul celui de-al Doilea Război Mondial – de Sud și de Nord - STADA fuzionează din nou în 1954 și se stabilește în Bad Filbel, lângă Frankfurt pe Main."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA trece la nivelul următor: începe să producă produse farmaceutice la scară industrială într-o unitate de producție de la periferia orașului Frankfurt pe Main (în loc să le producă în farmacii, ca înainte)."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "Un an decisiv pentru STADA. Compania este transformată în societate pe acțiuni, ceea ce dă un nou impuls dezvoltării sale."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Compania decide să se concentreze pe producția și vânzarea de medicamente generice (produse medicale nepatentate)."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA începe să își extindă prezența internațională prin deschiderea de birouri de reprezentare în Europa și Asia și printr-o strategie activă de fuziuni și achiziții."
          ]
        },
        {
          "date": "Din 1993 până în 2000",
          "paragraphs": [
            "În anul celei de-a 100-a aniversări, afacerile sunt în plină expansiune. Compania se numără printre primii zece lideri din industria germană în ceea ce privește vânzările. În 1997/1998 a fost efectuată o ofertă publică inițială. Activitățile principale ale societății sunt medicamentele generice și medicamentele fără prescripție medicală. STADA continuă să își urmeze în mod consecvent strategia de internaționalizare și se transformă într-un actor global dinamic."
          ]
        },
        {
          "date": "Din 2005 până în 2010",
          "paragraphs": [
            "STADA achiziționează compania sârbă Hemofarm AG, care are o importanță strategică pentru Grup. Filiala germană STADA introduce primul său biosimilar. STADA plasează cu succes primele sale obligațiuni corporative."
          ]
        },
        {
          "date": "Din 2010 până în 2015",
          "paragraphs": [
            "STADA face achiziții de succes în domeniul produselor de marcă, care devine din ce în ce mai important pentru Grup. Programul de eficientizare a costurilor la nivel de grup „STADA - Construim viitorul” este finalizat cu succes înainte de termen. STADA achiziționează producătorul britanic de OTC Thornton & Ross."
          ]
        },
        {
          "date": "Din 2019 până în 2020",
          "paragraphs": [
            "STADA AG își consolidează poziția pe piață în Europa Centrală și de Est, Rusia și Eurasia prin încheierea mai multor tranzacții majore - Walmark, GSK și Takeda. STADA devine lider al segmentului Consumer Healthcare."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA continuă să își consolideze afacerea cu produse de specialitate. Compania prezintă primul său raport global de sustenabilitate și se clasează printre primele 10% cele mai sustenabile companii farmaceutice."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "STADA Eurasia a primit un premiu la Eurasian Pharma Awards",
          "date": "04.10.2023",
          "text": "Premiul a fost primit la categoria „Parteneriatul anului” pentru achiziționarea cu succes a portofoliului Sanofi.\n\nEurasian Pharma Summit a găzduit o ceremonie de premiere, un eveniment de referință pentru actorii din industria farmaceutică din regiunea eurasiatică.\n\nEurasian Pharma Awards este un eveniment vibrant care reunește companii de vârf și profesioniști din domeniul farmaceutic din Asia Centrală, Caucaz și Europa de Est. Competiția se desfășoară anual în 16 categorii unice, reflectând diversitatea și inovația industriei.\n\nArminas Matsevicius, vicepreședinte al STADA Eurasia, a acceptat premiul din mâinile organizatorilor concursului. \"După aderarea produselor Sanofi la portofoliul STADA Eurasia, compania a reușit să-și consolideze semnificativ poziția deja puternică în segmentul SNS (Consumer Healthcare) și intenționează să dezvolte în continuare aceste domenii atât prin investiții, cât și, eventual, prin atragerea de parteneri precum Sanofi\" - a declarat vorbitorul.\n\nÎn 2022, STADA și Sanofi au încheiat un acord privind distribuția portofoliului de produse CHC într-o serie de țări eurasiatice. Conform acordului, STADA va distribui și va oferi sprijin de marketing pentru portofoliul Sanofi de mărci bine cunoscute în domeniul sănătății consumatorilor în 10 țări din regiunea Eurasia începând cu 01 aprilie 2023.\n\nAcordul include 19 produse bine stabilite, care se bucură de încrederea consumatorilor de pe piețele din Eurasia, au o mare notorietate a mărcii și, în multe cazuri, dețin poziții de lider pe piață.",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA intenționează să își consolideze poziția în segmentul spitalicesc din Eurasia",
          "date": "13.09.2023",
          "text": "Al IV-lea Summit farmaceutic eurasiatic va avea loc la Samarkand în perioada 26-28 septembrie. Publicația de afaceri Kursiv Uzbekistan va fi partenerul general de informare al evenimentului. în cadrul viitorului summit, Kursiv începe să publice opiniile jucătorilor globali și regionali de pe piața farmaceutică.\n\nArminas Macevicius, vicepreședinte pentru Eurasia la Stada, va continua să interacționeze cu autoritățile de reglementare din regiune.\n\n- Arminas, care sunt prioritățile companiei Dumneavoastră. în regiunea Eurasia? În ce țări și segmente vedeți cele mai mari perspective pentru STADA?\n\n- Odată cu adăugarea produselor Sanofi la portofoliul STADA în Eurasia, ne-am consolidat semnificativ poziția deja puternică pe segmentul Consumer Healthcare. Desigur, vom dezvolta acest domeniu atât prin investiții, cât și, eventual, prin atragerea de parteneri precum Sanofi.\n\nÎn același timp, în următorii ani, compania intenționează să își consolideze pozițiile pe segmentul spitalicesc și pe cel al rețetelor. Am înregistrat deja o serie de noi medicamente europene eliberate pe bază de rețetă în țările eurasiatice în care există o procedură de recunoaștere și/sau înregistrare simplificată (de exemplu, Moldova, Uzbekistan, Georgia).\n\nVom continua această activitate, precum și cooperarea cu autoritățile de reglementare din toate țările noastre pentru a simplifica și mai mult procedura de acces pe piață.\n\nPe termen mediu și lung, vom dezvolta segmentul biosimilarelor, care, alături de medicamentele generice, este una dintre activitățile cheie pentru STADA. Cred că într-un an și jumătate vom fi capabili să oferim acest tip de medicamente pe acele piețe din Eurasia unde este disponibilă înregistrarea accelerată. Citiți mai mult: În ce regiune intenționează STADA să își consolideze poziția (kursiv.media)",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Șeful statului a avut o întâlnire cu vicepreședintele grupului STADA, Christos Gallis",
          "date": "",
          "text": "STADA este unul dintre cei mai importanți producători de medicamente de înaltă calitate. Compania își vinde produsele în 120 de țări ale lumii.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Christos Gallis: Crearea unui cluster biotehnologic este o sarcină foarte ambițioasă.",
          "date": "",
          "text": "Vicepreședintele STADA Group a vorbit despre tendințele de pe piață și despre experiența țărilor din care RoK poate învăța",
          "image": {}
        }
      ]
    },
    "uz": {
      "source": "УЗБ/ТОО Stada.uz перевод на узбекский.docx",
      "text": {
        "about_par1": "STADA – xalqaro farmatsevtika kompaniyasi bo’lib, u 130 yildan ortiq vaqtdan beri \"Hamkorlar va iste’molchilar bilan ishonchli munosabatlarni o’rnatish orqali odamlarning sog’lig’iga g’amxo’rlik qilish\" missiyasiga amal qilib keladi. STADA-ning asosiy yo’nalishlari – Consumer Healthcare (CHC) segmenti mahsulotlari, jeneriklar va maxsus dorilar (shu jumladan biosimilyarlar). STADA mahsulotlari dunyoning 100 mamlakatida namoyish etilgan.",
        "about_par2": "2022-yilda MDH mintaqasi mustaqil biznes bo‘linmasiga aylandi va nomi Germaniyadagi shtab-kvartirasiga bevosita bo‘ysunuvchi STADA Eurasia deb o‘zgartirildi. Mintaqada 11 davlat vakillari bor: Qozogʻiston, Oʻzbekiston, Belarus, Ozarbayjon, Gruziya, Moldova, Qirgʻiziston, Armaniston, Moʻgʻuliston, Tojikiston, Turkmaniston.",
        "about_list1": "STADA Eurasia bosh ofisi Qozogʻistonning Olmaota shahrida joylashgan. Kompaniya, shuningdek, mintaqaning aksariyat mamlakatlarida STADA Arzneimittel AG yuridik shaxslarini ham roʻyxatdan oʻtkazdi. 2023-yil 1-apreldan boshlab STADA mintaqada Sanofi kompaniyasining retseptsiz sotiladigan dori preparatlari portfelini taqdim etadi.",
        "about_list2": "",
        "about_list3": "",
        "about_page_intro": "Ishonchli sherik sifatida odamlarning sog’lig’iga g’amxo’rlik qilish",
        "about_page_overview_1": "STADA – xalqaro farmatsevtika kompaniyasi bo’lib, u 130 yildan ortiq vaqtdan beri \"Hamkorlar va iste’molchilar bilan ishonchli munosabatlarni o’rnatish orqali odamlarning sog’lig’iga g’amxo’rlik qilish\" missiyasiga amal qilib keladi. STADA-ning asosiy yo’nalishlari – Consumer Healthcare (CHC) segmenti mahsulotlari, jeneriklar va maxsus dorilar (shu jumladan biosimilyarlar). STADA mahsulotlari dunyoning 100 mamlakatida namoyish etilgan.",
        "about_page_intro_2": "2022-yilda MDH mintaqasi mustaqil biznes bo‘linmasiga aylandi va nomi Germaniyadagi shtab-kvartirasiga bevosita bo‘ysunuvchi STADA Eurasia deb o‘zgartirildi. Mintaqada 11 davlat vakillari bor: Qozogʻiston, Oʻzbekiston, Belarus, Ozarbayjon, Gruziya, Moldova, Qirgʻiziston, Armaniston, Moʻgʻuliston, Tojikiston, Turkmaniston.",
        "about_page_intro_3": "STADA Eurasia bosh ofisi Qozogʻistonning Olmaota shahrida joylashgan. Kompaniya, shuningdek, mintaqaning aksariyat mamlakatlarida STADA Arzneimittel AG yuridik shaxslarini ham roʻyxatdan oʻtkazdi. 2023-yil 1-apreldan boshlab STADA mintaqada Sanofi kompaniyasining retseptsiz sotiladigan dori preparatlari portfelini taqdim etadi.",
        "culture_purpose_heading": "MISSIYA VA QADRIYATLAR",
        "culture_purpose_statement": "Ishonchli sherik sifatida odamlarning sog’lig’iga g’amxo’rlik qilish",
        "culture_purpose_text_1": "STADA — xalqaro farmatsevtika kompaniyasi bo‘lib, 125 yildan ortiq vaqtdan beri ishonchli hamkor sifatida odamlar salomatligiga g‘amxo‘rlik qilish vazifasini bajarib kelmoqda. STADA, kompaniya tomonidan ishlab chiqarilgan dori vositalari, o’zi mavjud bo’lgan barcha mamlakatlarda professionallar va iste’molchilarning ishonchli tanlovi bo’lishini ta’minlashga intiladi.",
        "culture_purpose_text_2": "STADA biznesining asosiy yo’nalishlari — Consumer Healthcare segmenti (retseptsiz sotiladigan dori preparatlari, oziq-ovqat qo’shimchalari, kosmetika, tibbiy mahsulotlar) va generiklar, shu jumladan ixtisoslashgan preparatlar. Kompaniya mahsulot sifatiga ustuvor ahamiyat beradi: kompaniyaning butun dunyo bo’ylab o’z va shartnomaviy ishlab chiqarish maydonchalari yagona xalqaro sifat standartlariga (GMP) muvofiq ishlaydi.",
        "culture_values_heading": "Bizning qadriyatlarimiz",
        "culture_values_eyebrow": "Bizning qadriyatlarimiz",
        "culture_values_intro": "Umumiy qadriyatlar bizga STADA ning uzoq muddatli o’sishi va muvaffaqiyatini ta’minlash orqali ulkan maqsadlarga erishishga imkon beradi.",
        "about_compliance_heading": "RIOYA QILISH",
        "about_compliance_intro_1": "Bizning kompaniyamiz hamma narsada, jumladan, axloqiy ish yuritish va rioya qilishda eng yaxshi bo’lishga intiladi. Bizning vazifamizga rioya qilgan holda, biz iste’molchilar oldidagi mas’uliyatimizni tushunamiz va shuning uchun vijdonli va halol ish masalalarida murosaga bormaymiz.",
        "about_compliance_intro_2": "Biz Odob-axloq kodeksida mustahkamlangan qonuniy talablar va qadriyatlarimizga qat’iy amal qilamiz. Axloqiy va mas’uliyatli ishbilarmonlik xulq-atvori – korporativ madaniyatimizning ajralmas qismi bo’lib, kompaniyamizga ishonchni mustahkamlash uchun asos bo’lib xizmat qiladi.",
        "about_compliance_speakup_heading": "Evrosiyoning Rioya qilish va axloq guruhining Speak up Portali va umumiy pochta qutisi",
        "about_compliance_speakup_text": "Kompaniya xodimlari, uning hamkorlari, yetkazib beruvchilari va pudratchilarining axloqsiz yoki noqonuniy xatti-harakatlari haqida har kim, kompaniyada ishlaydimi yoki yo’qmi, xabar berishi kerak deb hisoblaymiz.",
        "about_compliance_tools_text": "Buning uchun STADA kompaniyalar guruhida axborot tizimi joriy etildi – bu Speak up Portali, shuningdek Evrosiyoning Rioya qilish va axloq guruhining umumiy pochta qutisi (email), ushbu vositalar har qanday shaxsga komplaens me’yorlari va talablariga rioya qilmaslik holatlari va faktlari to’g’risida xabarlarni yuborishga imkon beradi, ya’ni, quyidagilar bilan cheklanmasdan:",
        "about_compliance_item_fraud": "firibgarlik,",
        "about_compliance_item_corruption": "korruptsiya,",
        "about_compliance_item_competition": "raqobatni himoya qilish sohasidagi qoidabuzarliklar (monopoliyaga qarshi talablar),",
        "about_compliance_item_conflict": "manfaatlar to’qnashuvi.",
        "about_compliance_report_text": "Agar siz bunday noto’g’ri xatti-harakatlar haqida bilsangiz, bizga eurasia_compliance@stada.kz elektron pochtasi orqali xabar yuboring yoki havolani bosish orqali to’g’ridan-to’g’ri Portaldagi murojaatni to’ldiring.",
        "about_compliance_confidentiality": "STADA kompaniyalar guruhi olingan ma’lumotlarning maxfiyligini kafolatlaydi.",
        "about_compliance_questions": "Komplaens va axloq guruhining eurasia_compliance@stada.kz pochta qutisiga bemorlar va iste’molchilar manfaati uchun birgalikdagi ishni yaxshilash uchun sizni qiziqtirgan har qanday savol va takliflarni yuborishingiz mumkin.",
        "about_pv_heading": "FARMAKONAZORAT",
        "about_pv_text": "Odamlar salomatligi va farovonligiga g’amxo’rlik qilish kompaniyamizning asosiy ustuvor vazifasidir.  Bemor, parvarish qiluvchi yoki sog’liqni saqlash mutaxassisi bo’lasizmi, Stada mahsulotlari bilan bog’liq noxush hodisalar haqida xabar berish muhimdir. Siz taqdim etadigan ma’lumotlar mahsulotlarimiz va bemorlarimiz xavfsizligini ta’minlashga yordam beradi.",
        "about_pv_contact_label": "Quyidagi aloqa ma’lumotlari bo’yicha Stada dori-darmonlariga noxush hodisalarning barcha holatlari to’g’risida xabar berishingizni so’raymiz:",
        "about_leadership_intro": "Arminas Matsevichus, Natalya Garipova",
        "about_leader_ospanov_name": "Arminas Matsevichus",
        "about_leader_garipova_name": "Natalya Garipova",
        "culture_integrity_title": "ODOBLILIK",
        "culture_integrity_tagline": "Har birimiz korporativ va umumiy qabul qilingan axloqiy me’yorlarga muvofiq harakat qilamiz. Fikr erkinligi va bir-birimizga hurmat-ehtirom – bizning faoliyatimizning asosini tashkil etadi.",
        "culture_entrepreneurship_title": "TADBIRKORLIK",
        "culture_entrepreneurship_tagline": "Har birimiz yangi g’oyalar va yechimlarni olib kelamiz, kompaniyaning o’sishi va rivojlanishiga hissa qo’shamiz.",
        "culture_agility_title": "MOSLASHISH QOBILIYATI",
        "culture_agility_tagline": "Har birimiz – o’zgarishlar liderimiz. Moslashuvchanlik va qat’iyatlilik – bizning rivojlanishimiz va muvaffaqiyatga erishish yo’limizning asosidir.",
        "culture_one_title": "ONE STADA",
        "culture_one_tagline": "Biz butun kompaniya manfaatlarini ko’zlab ishlaymiz, STADA muvaffaqiyati alohida funktsiyalar va bo’linmalarning manfaatlaridan ko’ra muhimroqdir.",
        "supplied_history_date_0": "1895",
        "supplied_history_text_0": "STADA tarixi 1895-yil 14-martda Germaniyaning Drezden shahrida boshlangan. Mahalliy farmatsevtlar assotsiatsiyaga birlashib, aholi salomatligini ta’minlash uchun standartlashtirilgan samarali va arzon dori vositalarini yaratdilar.",
        "supplied_history_date_1": "1935",
        "supplied_history_text_1": "Germaniya farmatsevtika assotsiatsiyasi ishlab chiqarishda yagona yondashuvni yaratadi. Dori-darmonlar turli dorixonalarda, lekin bir xil retsept bo’yicha, bir xil qadoqlarda tayyorlanadi va bir xil narxda sotiladi. Shunday qilib, rus tiliga tarjima qilinganda \"nemis dorixonalaridagi dori-darmonlar standarti\" degan ma’noni anglatadigan Standard Arzneimittel die Deutscher Apotheke, ya’ni St.d.A qisqartmasi paydo bo’ladi. U savdo belgisi sifatida ro’yxatdan o’tgan.",
        "supplied_history_date_2": "1954",
        "supplied_history_text_2": "Ikkinchi Jahon urushi paytida Janubiy va Shimoliy kabi ikkita kompaniyaga bo’lingan STADA kompaniyasi 1954 yilda yana birlashdi va Frankfurt-Mayn yaqinidagi Bad-Vilbel shahrida joylashdi.",
        "supplied_history_date_3": "1961",
        "supplied_history_text_3": "STADA yangi bosqichga ko’tarilmoqda: u Frankfurt-Mayn chekkasidagi ishlab chiqarish maydonchasida (avvalgi kabi dorixonalarda emas) sanoat miqyosida dori vositalarini ishlab chiqarishni boshlaydi.",
        "supplied_history_date_4": "1970",
        "supplied_history_text_4": "STADA uchun burilish yili. Kompaniya aksiyadorlik jamiyatiga aylantirilgani uning rivojlanishiga yangi sur’at bag‘ishlamoqda.",
        "supplied_history_date_5": "1975",
        "supplied_history_text_5": "Kompaniya generik dori vositalarini (patent berilmagan dori vositalarini) ishlab chiqarish va sotishga e’tibor qaratish to’g’risida qaror qabul qiladi.",
        "supplied_history_date_6": "1986",
        "supplied_history_text_6": "STADA Yevropa va Osiyoda vakolatxonalar ochish, shuningdek, faol qoʻshilish va sotib olish strategiyasi orqali xalqaro ishtirokini kengaytirishni boshlaydi.",
        "supplied_history_date_7": "1993-yildan 2000-yilgacha",
        "supplied_history_text_7": "100 yillik yubileyida biznes jadal rivojlanmoqda. Kompaniya savdo hajmi bo’yicha Germaniya sanoatining eng yaxshi o’ntaligiga kiradi. 1997/1998 yillarda IPO o’tkazildi. Kompaniyaning asosiy faoliyati jeneriklar va retseptsiz dori vositalarini ishlab chiqarishdir. STADA o’zining xalqarolashtirish strategiyasini izchil davom ettirmoqda va dinamik global o’yinchiga aylanib bormoqda.",
        "supplied_history_date_8": "2005-yildan 2010-yilgacha",
        "supplied_history_text_8": "STADA, Guruh uchun strategik ahamiyatga ega bo’lgan Serbiyaning Hemofarm AG kompaniyasini sotib oladi. Germaniyaning STADA sho’ba korxonasi birinchi biosimilyarni taqdim etadi. STADA o’zining birinchi korporativ obligatsiyalarini muvaffaqiyatli joylashtirmoqda.",
        "supplied_history_date_9": "2010-yildan 2015-yilgacha",
        "supplied_history_text_9": "STADA brend mahsulotlarini ishlab chiqarish sohasida muvaffaqiyatli xaridlarni amalga oshirmoqda, bu Guruh uchun tobora muhim ahamiyat kasb etmoqda. \"STADA - kelajakni quramiz\" Guruh doirasida xarajatlar samaradorligini oshirish dasturi muddatidan oldin muvaffaqiyatli yakunlandi. STADA retseptsiz sotiladigan Thornton & Ross britaniyalik ishlab chiqaruvchisini sotib oladi.",
        "supplied_history_date_10": "2019-yildan 2020-yilgacha",
        "supplied_history_text_10": "STADA AG bir nechta yirik bitimlar — Walmark, GSK va Takeda yopilishi tufayli Markaziy va Sharqiy Evropa, Rossiya va Yevroosiyo bozorlaridagi mavqeini mustahkamlamoqda. STADA kompaniyasi Consumer Healthcare segmentining lideriga aylanadi.",
        "supplied_history_date_11": "2022",
        "supplied_history_text_11": "STADA kompaniyasi Specialty yo’nalishi bo’yicha biznesni mustahkamlashda davom etmoqda. Kompaniya barqarorlik bo’yicha birinchi global hisobotni taqdim etdi va eng barqaror farmatsevtika kompaniyalarining 10% qatoriga kirdi.",
        "supplied_history_heading": "TARIX:",
        "hero_text1": "Qozog’istondagi STADA \"Yilning yutug’i\" va \"Yilning lideri\" mukofotlariga sazovor bo’ldi.",
        "news_1_text": "Farmatsevtika bozorining yetakchi ekspert tahlilchisi Vi-ORTIS konsalting agentligi STADA ning Qozog’iston bozoridagi xizmatlarini qayd etdi.\n\nKompaniya chakana savdo bozorida \"2023 yil lideri\" sifatida ishonchli pozitsiyani egalladi. Boshqa narsalar qatorida, STADA \"Enterogermina\" brendi bilan ОТС segmentida va \"Xefocam\" brendi bilan RX segmentida \"Yilning yutug’i\"ni qo’lga kiritib, lider pozitsiyasini mustahkamladi.\n\nUmuman olganda, STADA quyidagi beshta toifada qayd etildi:\n\nСНС segmentidagi chakana bozorda \"Yilning yutug’i\"\n\nOTS segmentidagi chakana bozorda \"Yilning yutug’i\"\n\nChakana bozorda \"Yilning lideri\"\n\nTibbiy Buyumlar chakana bozorida 3-o’rin\n\nChakana bozorda, SNS segmentida 3-o’rin",
        "hero_text2": "STADA Yevrosiyo kompaniyasi Eurasian Pharma Awards’da mukofotga sazovor bo’ldi",
        "news_2_text": "Mukofot, Sanofi portfelini muvaffaqiyatli qo’shganligi uchun \"Yil sherikligi\" nominatsiyasida olingan.\n\nYevroosiyo farmatsevtika sammiti doirasida Yevroosiyo mintaqasi farmatsevtika tarmog’i o’yinchilari uchun mukofotlash marosimi o’tkazildi.\n\nEurasian Pharma Awards – Markaziy Osiyo, Kavkaz va Sharqiy Yevropa farmatsevtika sohasidagi yetakchi kompaniyalar va mutaxassislarni birlashtirgan jonli tadbirdir. Tanlov har yili sohaning xilma-xilligi va innovatsionligini aks ettiruvchi 16 noyob nominatsiya bo‘yicha o‘tkaziladi.\n\nArminas Matsevichus, STADA Yevroosiyo vitse-prezidenti mukofotni tanlov tashkilotchilari qo’lidan oldi. “Sanofi mahsulotlarini Yevroosiyodagi STADA portfeliga qo‘shgandan so‘ng, kompaniya CHC (Consumer Healthcare) segmentida o‘zining kuchli pozitsiyasini sezilarli darajada mustahkamlashga muvaffaq bo‘ldi va bu sohalarni ham investitsiyalar orqali, ham, ehtimol, Sanofi kabi hamkorlarni jalb qilish orqali yanada rivojlantirishni rejalashtirmoqda“, dedi ma‘ruzachi.\n\n2022-yilda STADA va Sanofi kompaniyalari bir qator Yevroosiyo mamlakatlarida CHC portfelini distributsiya qilish bo’yicha shartnoma tuzdilar. Shartnoma doirasida STADA 2023-yil 1-apreldan boshlab Yevroosiyo mintaqasining 10 mamlakatida iste’molchilar salomatligi sohasidagi taniqli brendlardan tashkil topgan Sanofi dori portfelini distributsiya qilishni va marketing yordamida qo’llab-quvvatlashni amalga oshiradi.\n\nShartnomaga Yevroosiyo mamlakatlari bozorlarida o‘zini yaxshi tomondan ko‘rsatgan, iste’molchilar ishonchiga sazovor bo‘lgan, brend haqida yuqori bilimga ega bo‘lgan va ko‘p hollarda bozorda yetakchi o‘rinlarni egallagan 19 ta mahsulot kiritilgan edi.",
        "hero_text3": "Davlat rahbari STADA Group kompaniyasining vitse-prezidenti Kristos Gallis bilan uchrashuv o’tkazdi",
        "news_3_text": "Uchrashuvda sog‘liqni saqlash va farmatsevtika sohasidagi hamkorlik istiqbollari muhokama qilindi.\n\nQosim-Jomart Tokayevning ta’kidlashicha, STADA kompaniyasi Qozog‘iston bozorida iste’molchi sog‘liqni saqlash mahsulotlari segmentida uchta liderdan biri hisoblanadi. Uning so’zlariga ko’ra, muvaffaqiyatli va jadal rivojlanayotgan hamkorlikning yorqin namunasi kompaniyaning Olmaotadagi ofisini ochishdir.\n\nPrezidentimiz Qozog‘istonda biotexnologiya klasterini yaratish bo‘yicha faol ishlar olib borilayotganiga e’tibor qaratdi.\n\nDavlat rahbarining fikriga ko’ra, STADA tadqiqot va ishlab chiqarish sohasida QazBioPharm milliy xoldingi bilan kuchlarni birlashtirish uchun keng imkoniyatlar yaratmoqda.\n\nQosim-Jomart Tokayev nemis kompaniyasini qo’shma tadqiqot va ishlanmalar o’tkazish, ishlab chiqarishni tashkil etish, tajriba almashish va mutaxassislarning malakasini oshirishga taklif qildi.\n\nO‘z navbatida, Kristos Gallis hamkorlikni chuqurlashtirishga qiziqish bildirdi va kompaniyaning Qozog‘istondagi tibbiy loyiha va dasturlarga sarmoya kiritish imkoniyatlarini o‘rganishga tayyorligini ta’kidladi.\n\nSTADA yuqori sifatli dori vositalarini ishlab chiqaruvchi yetakchi kompaniyalardan biridir. Kompaniya o’z mahsulotlarini dunyoning 120 mamlakatida sotadi.",
        "news_4_title": "Kristos Gallis: Biotexnologiya klasterini yaratish – juda ambitsiyali vazifadir.",
        "news_4_text": "STADA Group vitse-prezidenti bozordagi tendentsiyalar va Qozog’iston Respublikasi qaysi mamlakatlar tajribasini o’zlashtirishi mumkinligi haqida gapirdi\n\nIQVIA Institute for Human Data Science prognozlariga ko’ra, jahon dori vositalari bozori uch yil ichida o’rtacha 3-6 foizga o’sadi. Tahlilchilar 2027-yilga borib bu ko’rsatkich 1,9 trillion dollarga yetishini taxmin qilmoqda. STADA Group vitse-prezidenti Kristos Gallis Qozog‘istonda farmatsevtika sanoatini rivojlantirish uchun dori vositalarini ro‘yxatdan o‘tkazish tartibini tezlashtirish zarur, deb hisoblaydi. “Farmatsevtika bozorida ishlovchi va davlat segmentida katta portfolioga ega bo‘lgan hamkasblarimizning hisob-kitoblariga ko‘ra, dosyeni tayyorlash boshlangandan to bozorga innovatsion preparat kirib kelguniga qadar 3,5 yildan 5 yilgacha vaqt ketadi. Bunday uzoq ro‘yxatga olish muddatlari farmatsevtika kompaniyalarining o‘z dori-darmonlarini Qozog‘iston bozoriga chiqarmaslikka qaror qilishiga asosiy sabablardan biri hisoblanadi”, deb hisoblaydi ekspert. “Kapital.kz” biznes-axborot markazi muxbiri bilan suhbatda u “Salomatlik hisoboti 2023” tadqiqoti natijalari, nega ko‘plab farmatsevtika kompaniyalari dori vositalari narxini oshirishga majbur bo‘layotgani va mamlakatimizda biotexnologiya klasterini yaratish uchun qanday baza zarurligi haqida gapirib berdi.\n\nBatafsil: Kristos Gallis: Biotexnologiya klasterini yaratish – juda ambitsiyali vazifadir - Kapital (kapital.kz)",
        "news_5_title": "STADA Yevroosiyodagi gospitalʼ segmentidagi pozitsiyalarini mustahkamlash niyatida",
        "news_5_text": "26-28 sentabr kunlari Samarqand shahrida IV Yevroosiyo farmatsevtika sammiti bo‘lib o‘tadi. “Kursiv Uzbekistan” biznes-nashri tadbirning bosh axborot hamkori sifatida ishtirok etadi. Bo’lajak sammit doirasida “Kursiv” farmatsevtika bozoridagi global va mintaqaviy o’yinchilarning fikrlarini nashr etishni boshlaydi.\n\nStada ning Yevroosiyo mintaqasi bo’yicha vitse-prezidenti Arminas Matsevichus. Kompaniya mintaqadagi nazorat organlari bilan hamkorlikni davom ettiradi.\n\n– Arminas, Yevroosiyo mintaqasidagi kompaniyangiz uchun qanday ustuvorliklar mavjud? Qaysi mamlakatlar va segmentlarda STADA uchun eng katta istiqbollarni ko’rasiz?\n\n– Yevroosiyodagi STADA portfeliga Sanofi mahsulotlarini qo‘shish bilan, biz CHC (Consumer Healthcare) segmentidagi kuchli pozitsiyani sezilarli darajada mustahkamladik. Albatta, biz bu sohani ham investitsiyalar orqali, ham, ehtimol, Sanofi kabi hamkorlarni jalb qilish orqali rivojlantiramiz.\n\nShu bilan birga, kelgusi bir necha yil ichida kompaniya gospital’ segmentida va retsept bo’yicha sotiladigan dori vositalari biznesida o’z pozitsiyasini mustahkamlash niyatida. Tan olish va/yoki soddalashtirilgan ro’yxatga olish tartibi mavjud bo’lgan Yevroosiyo mamlakatlarida (masalan, Moldova, O’zbekiston, Gruziya) biz allaqachon bir qator yangi Evropa retsept bo’yicha dori-darmonlarni ro’yxatdan o’tkazdik.\n\nBiz ushbu ishni davom ettiramiz, shuningdek, bozorga kirish tartibini yanada soddalashtirish uchun barcha mamlakatlarimizning tartibga soluvchi organlari bilan hamkorlik qilamiz.\n\nO’rta va uzoq muddatli istiqbolda biosimilyarlar segmentining rivojlanishi, ular generiklar bilan bir qatorda STADA uchun asosiy bizneslardan biridir. Ishonamanki, bir-bir yarim yil ichida biz bunday dori-darmonlarni tezlashtirilgan ro‘yxatdan o‘tkazish imkoni bo’lgan Yevroosiyo bozorlariga taklif qila olamiz. Batafsil: STADA qaysi mintaqada o’z pozitsiyasini mustahkamlamoqchi (kursiv.media)",
        "news_6_title": "STADA Health Report 2023 tadqiqoti: qozog’istonliklar salomatligining asosiy tendentsiyalari",
        "news_6_text": "2023-yil 19-sentabrda STADA Health Report 2023 xalqaro tadqiqoti natijalarini taqdim etdi. E’tiborlisi, Yevropaning 15 davlati qatorida Qozog‘iston ham ikkinchi yil ishtirokchi bo‘lib kelmoqda. Bundan tashqari, tadqiqot birinchi marta O‘zbekistonni qamrab oldi. Tadqiqot Human8 tadqiqot kompaniyasi ko‘magida o‘tkazildi. Har bir mamlakatda 2000 ga yaqin odam so’rovnomada o’tkazildi, biroq umumiy hisobda tadqiqot ishtirokchilari soni 18 yoshdan 99 yoshgacha bo’lgan 32 013 kishini tashkil etdi.\n\nQozog‘iston poytaxtida hisobot taqdim etar ekan, STADA kompaniyasining Yevroosiyo mintaqasidagi vitse-prezidenti Arminas Macevichius shunday deb ta’kidladi: “O‘tgan yili “Salomatlik hisoboti” sog‘liqni saqlash xodimlari va jurnalistlarda katta qiziqish uyg‘otdi. Va bu tasodif emas, chunki hisobotda qozog’istonliklarning sog’lig’i haqida qanday fikrda ekanligi, qanday sog’liqni saqlash masalalari ularni ko’proq tashvishga solayotgani, sog’liqni saqlash vazirligidan nimani kutayotgani, nimadan qo’rqishi, qanday davolanishi va qanday dam olishlari haqida eng dolzarb ma’lumotlar berilgan. An’anaga ko’ra, STADA Health Report 2023 tadqiqotida odamlarning xulq-atvori, farmatsevtika va sog’liqni saqlash savodxonligi darajasi va sog’liqni saqlash tendentsiyalari haqida ko’proq ma’lumot olishga yordam beradigan ma’lumotlar mavjud. STADAning o’zi uchun olingan ma’lumotlar bizga bemorlar va tibbiyot xodimlarining umidlarini yaxshiroq qondirishga yordam beradi va shuning uchun ishonchli hamkor sifatida odamlarning sog’lig’iga g’amxo’rlik qilish missiyamizni to’liq bajarishga yordam beradi. Batafsil: STADA Health Report 2023 tadqiqoti: qozog’istonliklar salomatligi sohasidagi asosiy tendentsiyalar - Qozog’istonning farmatsevtika sharhi (pharm.reviews)"
      },
      "history": [
        {
          "date": "1895",
          "paragraphs": [
            "STADA tarixi 1895-yil 14-martda Germaniyaning Drezden shahrida boshlangan. Mahalliy farmatsevtlar assotsiatsiyaga birlashib, aholi salomatligini ta’minlash uchun standartlashtirilgan samarali va arzon dori vositalarini yaratdilar."
          ]
        },
        {
          "date": "1935",
          "paragraphs": [
            "Germaniya farmatsevtika assotsiatsiyasi ishlab chiqarishda yagona yondashuvni yaratadi. Dori-darmonlar turli dorixonalarda, lekin bir xil retsept bo’yicha, bir xil qadoqlarda tayyorlanadi va bir xil narxda sotiladi. Shunday qilib, rus tiliga tarjima qilinganda \"nemis dorixonalaridagi dori-darmonlar standarti\" degan ma’noni anglatadigan Standard Arzneimittel die Deutscher Apotheke, ya’ni St.d.A qisqartmasi paydo bo’ladi. U savdo belgisi sifatida ro’yxatdan o’tgan."
          ]
        },
        {
          "date": "1954",
          "paragraphs": [
            "Ikkinchi Jahon urushi paytida Janubiy va Shimoliy kabi ikkita kompaniyaga bo’lingan STADA kompaniyasi 1954 yilda yana birlashdi va Frankfurt-Mayn yaqinidagi Bad-Vilbel shahrida joylashdi."
          ]
        },
        {
          "date": "1961",
          "paragraphs": [
            "STADA yangi bosqichga ko’tarilmoqda: u Frankfurt-Mayn chekkasidagi ishlab chiqarish maydonchasida (avvalgi kabi dorixonalarda emas) sanoat miqyosida dori vositalarini ishlab chiqarishni boshlaydi."
          ]
        },
        {
          "date": "1970",
          "paragraphs": [
            "STADA uchun burilish yili. Kompaniya aksiyadorlik jamiyatiga aylantirilgani uning rivojlanishiga yangi sur’at bag‘ishlamoqda."
          ]
        },
        {
          "date": "1975",
          "paragraphs": [
            "Kompaniya generik dori vositalarini (patent berilmagan dori vositalarini) ishlab chiqarish va sotishga e’tibor qaratish to’g’risida qaror qabul qiladi."
          ]
        },
        {
          "date": "1986",
          "paragraphs": [
            "STADA Yevropa va Osiyoda vakolatxonalar ochish, shuningdek, faol qoʻshilish va sotib olish strategiyasi orqali xalqaro ishtirokini kengaytirishni boshlaydi."
          ]
        },
        {
          "date": "1993-yildan 2000-yilgacha",
          "paragraphs": [
            "100 yillik yubileyida biznes jadal rivojlanmoqda. Kompaniya savdo hajmi bo’yicha Germaniya sanoatining eng yaxshi o’ntaligiga kiradi. 1997/1998 yillarda IPO o’tkazildi. Kompaniyaning asosiy faoliyati jeneriklar va retseptsiz dori vositalarini ishlab chiqarishdir. STADA o’zining xalqarolashtirish strategiyasini izchil davom ettirmoqda va dinamik global o’yinchiga aylanib bormoqda."
          ]
        },
        {
          "date": "2005-yildan 2010-yilgacha",
          "paragraphs": [
            "STADA, Guruh uchun strategik ahamiyatga ega bo’lgan Serbiyaning Hemofarm AG kompaniyasini sotib oladi. Germaniyaning STADA sho’ba korxonasi birinchi biosimilyarni taqdim etadi. STADA o’zining birinchi korporativ obligatsiyalarini muvaffaqiyatli joylashtirmoqda."
          ]
        },
        {
          "date": "2010-yildan 2015-yilgacha",
          "paragraphs": [
            "STADA brend mahsulotlarini ishlab chiqarish sohasida muvaffaqiyatli xaridlarni amalga oshirmoqda, bu Guruh uchun tobora muhim ahamiyat kasb etmoqda. \"STADA - kelajakni quramiz\" Guruh doirasida xarajatlar samaradorligini oshirish dasturi muddatidan oldin muvaffaqiyatli yakunlandi. STADA retseptsiz sotiladigan Thornton & Ross britaniyalik ishlab chiqaruvchisini sotib oladi."
          ]
        },
        {
          "date": "2019-yildan 2020-yilgacha",
          "paragraphs": [
            "STADA AG bir nechta yirik bitimlar — Walmark, GSK va Takeda yopilishi tufayli Markaziy va Sharqiy Evropa, Rossiya va Yevroosiyo bozorlaridagi mavqeini mustahkamlamoqda. STADA kompaniyasi Consumer Healthcare segmentining lideriga aylanadi."
          ]
        },
        {
          "date": "2022",
          "paragraphs": [
            "STADA kompaniyasi Specialty yo’nalishi bo’yicha biznesni mustahkamlashda davom etmoqda. Kompaniya barqarorlik bo’yicha birinchi global hisobotni taqdim etdi va eng barqaror farmatsevtika kompaniyalarining 10% qatoriga kirdi."
          ]
        }
      ],
      "news": [
        {
          "id": "supplied-1",
          "title": "Qozog’istondagi STADA \"Yilning yutug’i\" va \"Yilning lideri\" mukofotlariga sazovor bo’ldi.",
          "date": "15.02.2024",
          "text": "Farmatsevtika bozorining yetakchi ekspert tahlilchisi Vi-ORTIS konsalting agentligi STADA ning Qozog’iston bozoridagi xizmatlarini qayd etdi.\n\nKompaniya chakana savdo bozorida \"2023 yil lideri\" sifatida ishonchli pozitsiyani egalladi. Boshqa narsalar qatorida, STADA \"Enterogermina\" brendi bilan ОТС segmentida va \"Xefocam\" brendi bilan RX segmentida \"Yilning yutug’i\"ni qo’lga kiritib, lider pozitsiyasini mustahkamladi.\n\nUmuman olganda, STADA quyidagi beshta toifada qayd etildi:\n\nСНС segmentidagi chakana bozorda \"Yilning yutug’i\"\n\nOTS segmentidagi chakana bozorda \"Yilning yutug’i\"\n\nChakana bozorda \"Yilning lideri\"\n\nTibbiy Buyumlar chakana bozorida 3-o’rin\n\nChakana bozorda, SNS segmentida 3-o’rin",
          "image": {}
        },
        {
          "id": "supplied-2",
          "title": "STADA Yevrosiyo kompaniyasi Eurasian Pharma Awards’da mukofotga sazovor bo’ldi",
          "date": "04.10.2023",
          "text": "Mukofot, Sanofi portfelini muvaffaqiyatli qo’shganligi uchun \"Yil sherikligi\" nominatsiyasida olingan.\n\nYevroosiyo farmatsevtika sammiti doirasida Yevroosiyo mintaqasi farmatsevtika tarmog’i o’yinchilari uchun mukofotlash marosimi o’tkazildi.\n\nEurasian Pharma Awards – Markaziy Osiyo, Kavkaz va Sharqiy Yevropa farmatsevtika sohasidagi yetakchi kompaniyalar va mutaxassislarni birlashtirgan jonli tadbirdir. Tanlov har yili sohaning xilma-xilligi va innovatsionligini aks ettiruvchi 16 noyob nominatsiya bo‘yicha o‘tkaziladi.\n\nArminas Matsevichus, STADA Yevroosiyo vitse-prezidenti mukofotni tanlov tashkilotchilari qo’lidan oldi. “Sanofi mahsulotlarini Yevroosiyodagi STADA portfeliga qo‘shgandan so‘ng, kompaniya CHC (Consumer Healthcare) segmentida o‘zining kuchli pozitsiyasini sezilarli darajada mustahkamlashga muvaffaq bo‘ldi va bu sohalarni ham investitsiyalar orqali, ham, ehtimol, Sanofi kabi hamkorlarni jalb qilish orqali yanada rivojlantirishni rejalashtirmoqda“, dedi ma‘ruzachi.\n\n2022-yilda STADA va Sanofi kompaniyalari bir qator Yevroosiyo mamlakatlarida CHC portfelini distributsiya qilish bo’yicha shartnoma tuzdilar. Shartnoma doirasida STADA 2023-yil 1-apreldan boshlab Yevroosiyo mintaqasining 10 mamlakatida iste’molchilar salomatligi sohasidagi taniqli brendlardan tashkil topgan Sanofi dori portfelini distributsiya qilishni va marketing yordamida qo’llab-quvvatlashni amalga oshiradi.\n\nShartnomaga Yevroosiyo mamlakatlari bozorlarida o‘zini yaxshi tomondan ko‘rsatgan, iste’molchilar ishonchiga sazovor bo‘lgan, brend haqida yuqori bilimga ega bo‘lgan va ko‘p hollarda bozorda yetakchi o‘rinlarni egallagan 19 ta mahsulot kiritilgan edi.",
          "image": {}
        },
        {
          "id": "supplied-3",
          "title": "Davlat rahbari STADA Group kompaniyasining vitse-prezidenti Kristos Gallis bilan uchrashuv o’tkazdi",
          "date": "29.09.2023                                                                                                                   Berlin, Germaniya",
          "text": "Uchrashuvda sog‘liqni saqlash va farmatsevtika sohasidagi hamkorlik istiqbollari muhokama qilindi.\n\nQosim-Jomart Tokayevning ta’kidlashicha, STADA kompaniyasi Qozog‘iston bozorida iste’molchi sog‘liqni saqlash mahsulotlari segmentida uchta liderdan biri hisoblanadi. Uning so’zlariga ko’ra, muvaffaqiyatli va jadal rivojlanayotgan hamkorlikning yorqin namunasi kompaniyaning Olmaotadagi ofisini ochishdir.\n\nPrezidentimiz Qozog‘istonda biotexnologiya klasterini yaratish bo‘yicha faol ishlar olib borilayotganiga e’tibor qaratdi.\n\nDavlat rahbarining fikriga ko’ra, STADA tadqiqot va ishlab chiqarish sohasida QazBioPharm milliy xoldingi bilan kuchlarni birlashtirish uchun keng imkoniyatlar yaratmoqda.\n\nQosim-Jomart Tokayev nemis kompaniyasini qo’shma tadqiqot va ishlanmalar o’tkazish, ishlab chiqarishni tashkil etish, tajriba almashish va mutaxassislarning malakasini oshirishga taklif qildi.\n\nO‘z navbatida, Kristos Gallis hamkorlikni chuqurlashtirishga qiziqish bildirdi va kompaniyaning Qozog‘istondagi tibbiy loyiha va dasturlarga sarmoya kiritish imkoniyatlarini o‘rganishga tayyorligini ta’kidladi.\n\nSTADA yuqori sifatli dori vositalarini ishlab chiqaruvchi yetakchi kompaniyalardan biridir. Kompaniya o’z mahsulotlarini dunyoning 120 mamlakatida sotadi.",
          "image": {}
        },
        {
          "id": "supplied-4",
          "title": "Kristos Gallis: Biotexnologiya klasterini yaratish – juda ambitsiyali vazifadir.",
          "date": "19.12.2023",
          "text": "STADA Group vitse-prezidenti bozordagi tendentsiyalar va Qozog’iston Respublikasi qaysi mamlakatlar tajribasini o’zlashtirishi mumkinligi haqida gapirdi\n\nIQVIA Institute for Human Data Science prognozlariga ko’ra, jahon dori vositalari bozori uch yil ichida o’rtacha 3-6 foizga o’sadi. Tahlilchilar 2027-yilga borib bu ko’rsatkich 1,9 trillion dollarga yetishini taxmin qilmoqda. STADA Group vitse-prezidenti Kristos Gallis Qozog‘istonda farmatsevtika sanoatini rivojlantirish uchun dori vositalarini ro‘yxatdan o‘tkazish tartibini tezlashtirish zarur, deb hisoblaydi. “Farmatsevtika bozorida ishlovchi va davlat segmentida katta portfolioga ega bo‘lgan hamkasblarimizning hisob-kitoblariga ko‘ra, dosyeni tayyorlash boshlangandan to bozorga innovatsion preparat kirib kelguniga qadar 3,5 yildan 5 yilgacha vaqt ketadi. Bunday uzoq ro‘yxatga olish muddatlari farmatsevtika kompaniyalarining o‘z dori-darmonlarini Qozog‘iston bozoriga chiqarmaslikka qaror qilishiga asosiy sabablardan biri hisoblanadi”, deb hisoblaydi ekspert. “Kapital.kz” biznes-axborot markazi muxbiri bilan suhbatda u “Salomatlik hisoboti 2023” tadqiqoti natijalari, nega ko‘plab farmatsevtika kompaniyalari dori vositalari narxini oshirishga majbur bo‘layotgani va mamlakatimizda biotexnologiya klasterini yaratish uchun qanday baza zarurligi haqida gapirib berdi.\n\nBatafsil: Kristos Gallis: Biotexnologiya klasterini yaratish – juda ambitsiyali vazifadir - Kapital (kapital.kz)",
          "image": {}
        },
        {
          "id": "supplied-5",
          "title": "STADA Yevroosiyodagi gospitalʼ segmentidagi pozitsiyalarini mustahkamlash niyatida",
          "date": "13.09.2023",
          "text": "26-28 sentabr kunlari Samarqand shahrida IV Yevroosiyo farmatsevtika sammiti bo‘lib o‘tadi. “Kursiv Uzbekistan” biznes-nashri tadbirning bosh axborot hamkori sifatida ishtirok etadi. Bo’lajak sammit doirasida “Kursiv” farmatsevtika bozoridagi global va mintaqaviy o’yinchilarning fikrlarini nashr etishni boshlaydi.\n\nStada ning Yevroosiyo mintaqasi bo’yicha vitse-prezidenti Arminas Matsevichus. Kompaniya mintaqadagi nazorat organlari bilan hamkorlikni davom ettiradi.\n\n– Arminas, Yevroosiyo mintaqasidagi kompaniyangiz uchun qanday ustuvorliklar mavjud? Qaysi mamlakatlar va segmentlarda STADA uchun eng katta istiqbollarni ko’rasiz?\n\n– Yevroosiyodagi STADA portfeliga Sanofi mahsulotlarini qo‘shish bilan, biz CHC (Consumer Healthcare) segmentidagi kuchli pozitsiyani sezilarli darajada mustahkamladik. Albatta, biz bu sohani ham investitsiyalar orqali, ham, ehtimol, Sanofi kabi hamkorlarni jalb qilish orqali rivojlantiramiz.\n\nShu bilan birga, kelgusi bir necha yil ichida kompaniya gospital’ segmentida va retsept bo’yicha sotiladigan dori vositalari biznesida o’z pozitsiyasini mustahkamlash niyatida. Tan olish va/yoki soddalashtirilgan ro’yxatga olish tartibi mavjud bo’lgan Yevroosiyo mamlakatlarida (masalan, Moldova, O’zbekiston, Gruziya) biz allaqachon bir qator yangi Evropa retsept bo’yicha dori-darmonlarni ro’yxatdan o’tkazdik.\n\nBiz ushbu ishni davom ettiramiz, shuningdek, bozorga kirish tartibini yanada soddalashtirish uchun barcha mamlakatlarimizning tartibga soluvchi organlari bilan hamkorlik qilamiz.\n\nO’rta va uzoq muddatli istiqbolda biosimilyarlar segmentining rivojlanishi, ular generiklar bilan bir qatorda STADA uchun asosiy bizneslardan biridir. Ishonamanki, bir-bir yarim yil ichida biz bunday dori-darmonlarni tezlashtirilgan ro‘yxatdan o‘tkazish imkoni bo’lgan Yevroosiyo bozorlariga taklif qila olamiz. Batafsil: STADA qaysi mintaqada o’z pozitsiyasini mustahkamlamoqchi (kursiv.media)",
          "image": {}
        },
        {
          "id": "supplied-6",
          "title": "STADA Health Report 2023 tadqiqoti: qozog’istonliklar salomatligining asosiy tendentsiyalari",
          "date": "19.09.2023",
          "text": "2023-yil 19-sentabrda STADA Health Report 2023 xalqaro tadqiqoti natijalarini taqdim etdi. E’tiborlisi, Yevropaning 15 davlati qatorida Qozog‘iston ham ikkinchi yil ishtirokchi bo‘lib kelmoqda. Bundan tashqari, tadqiqot birinchi marta O‘zbekistonni qamrab oldi. Tadqiqot Human8 tadqiqot kompaniyasi ko‘magida o‘tkazildi. Har bir mamlakatda 2000 ga yaqin odam so’rovnomada o’tkazildi, biroq umumiy hisobda tadqiqot ishtirokchilari soni 18 yoshdan 99 yoshgacha bo’lgan 32 013 kishini tashkil etdi.\n\nQozog‘iston poytaxtida hisobot taqdim etar ekan, STADA kompaniyasining Yevroosiyo mintaqasidagi vitse-prezidenti Arminas Macevichius shunday deb ta’kidladi: “O‘tgan yili “Salomatlik hisoboti” sog‘liqni saqlash xodimlari va jurnalistlarda katta qiziqish uyg‘otdi. Va bu tasodif emas, chunki hisobotda qozog’istonliklarning sog’lig’i haqida qanday fikrda ekanligi, qanday sog’liqni saqlash masalalari ularni ko’proq tashvishga solayotgani, sog’liqni saqlash vazirligidan nimani kutayotgani, nimadan qo’rqishi, qanday davolanishi va qanday dam olishlari haqida eng dolzarb ma’lumotlar berilgan. An’anaga ko’ra, STADA Health Report 2023 tadqiqotida odamlarning xulq-atvori, farmatsevtika va sog’liqni saqlash savodxonligi darajasi va sog’liqni saqlash tendentsiyalari haqida ko’proq ma’lumot olishga yordam beradigan ma’lumotlar mavjud. STADAning o’zi uchun olingan ma’lumotlar bizga bemorlar va tibbiyot xodimlarining umidlarini yaxshiroq qondirishga yordam beradi va shuning uchun ishonchli hamkor sifatida odamlarning sog’lig’iga g’amxo’rlik qilish missiyamizni to’liq bajarishga yordam beradi. Batafsil: STADA Health Report 2023 tadqiqoti: qozog’istonliklar salomatligi sohasidagi asosiy tendentsiyalar - Qozog’istonning farmatsevtika sharhi (pharm.reviews)",
          "image": {}
        }
      ]
    }
  },
  "countries": {
    "azerbaijan": {
      "az": {
        "leadership": {
          "name": "Fərəh Sadıxova",
          "role": "STADA şirkətinin Azərbaycandakı rəhbəri",
          "biography": "Fərəh Sadıxova \nSTADA şirkətinin Azərbaycandakı rəhbəri \n \nFərəh Sadıxova STADA şirkətinin \nAzərbaycandakı rəhbəri \nFərəh Sadıxova STADA komandasına \n2021-ci ildə qoşulub. Sandoz, Novartis və \nGrindex beynəlxalq şirkətlərindəki \nəczaçılıq biznesində 20 illik fəaliyyəti \nərzində Fərəh tibb nümayəndəsindən \nSTADA şirkətinin biznes bölməsinin \nrəhbəri və bölgə direktoru vəzifəsinədək \nyol keçmişdir. \nFərəh beş ildən artıq müddətdə bölgə direktoru vəzifəsində çalışdığı \nvə şirkətin Azərbaycandakı kommersiya fəaliyyətindən məsul olduğu \nAvropanın “Qrindeks” şirkətindən STADA-ya qoşulmuşdur.  \nSandoz şirkətində Fərəhin rəhbərliyi altında ixtisaslaşdırılmış \nonkoloji preparatlar bölməsi yaradılmışdır. Fərəh N.Nərimanov \nadına Azərbaycan Tibb Universitetinin müalicə fakültəsini nevroloq \nixtisası üzrə bitirib.",
          "href": "assets/biographies/azerbaijan/az.pdf"
        },
        "text": {
          "about_leadership_intro": "Fərəh Sadıxova",
          "about_leader_ospanov_name": "Fərəh Sadıxova",
          "about_leader_ospanov_role": "STADA şirkətinin Azərbaycandakı rəhbəri",
          "supplied_contacts_heading": "Tel : +994123101527 (7001)",
          "supplied_contacts_text": "Chıraq Plaza Biznes Mərkəzi, 7-ci mərtəbə\nAZ1065, Azərbaycan, Bakı ş., Tbilisi prospekti 49C\nAzerbaijan@stada.az"
        }
      },
      "ru": {
        "leadership": {
          "name": "Фарах Садыхова",
          "role": "Глава STADA в Азербайджане",
          "biography": "Фарах Садыхова \nГлава STADA в Азербайджане \n \nФарах Садыхова присоединилась к \nкоманде STADA в 2021 году. За 20 лет в \nфармацевтическом бизнесе в \nмеждународных компаниях Sandoz, \nNovartis и Grindex Фарах прошла путь от \nмедицинского представителя до \nруководителя бизнес-юнита и директора \nрегиона в STADA. \n \nФарах присоединилась к STADA из европейской компании \n«Гриндекс», где более пяти лет занимала позицию директора \nрегиона и отвечала за коммерческую деятельность компании в \nАзербайджане.  \nВ компании Sandoz под руководством Фарах было создано \nподразделение специализированных онкологических \nпрепаратов. Фарах окончила лечебный факультет \nАзербайджанского медицинского университета имени Н. \nНариманова по специальности невролог.",
          "href": "assets/biographies/azerbaijan/ru.pdf"
        },
        "text": {
          "about_leadership_intro": "Фарах Садыхова",
          "about_leader_ospanov_name": "Фарах Садыхова",
          "about_leader_ospanov_role": "Глава STADA в Азербайджане",
          "supplied_contacts_heading": "КОНТАКТЫ.",
          "supplied_contacts_text": "Бизнес-центр Chıraq Plaza, 7 этаж\nAZ1065, Азербайджан, г. Баку, Тбилисский проспект 49С.\nAzerbaijan@stada.az"
        }
      }
    },
    "armenia": {
      "hy": {
        "leadership": {
          "name": "Արման Աքոբյան",
          "role": "GAM ենթախմբի ղեկավար (Վրաստան, Հայաստան, Մոլդովա)",
          "biography": "Արման Աքոբյան  \nGAM ենթախմբի ղեկավար (Վրաստան, Հայաստան, Մոլդովա)  \n \nԱրմանն սկսել է իր կարիերան 1994 \nթվականին, ակադեմիական միջավայրում՝ \nԵրևանի պետական բժշկական \nհամալսարանում, և աշխատել այնտեղ \nընդհանուր առմամբ ավելի քան 15 տարի: \n2007-ից 2010 թվականներին ղեկավարել է \nդեղագործական մարկետինգի և մենեջմենթի \nամբիոնը:  \n2009 թվականից սկսել է աշխատել \nդեղագործական ոլորտում, որտեղ անցել է ճանապարհը բժշկական \nներկայացուցիչից մինչև տարածաշրջանի տնօրեն, ներառելով \nեվրասիական տարածաշրջանի հինգ երկրներ, այնպիսի \nընկերություններում, ինչպիսիք են Intas, Astellas և Takeda: 2010 \nթվականից ղեկավարում է GAM խմբավորումը (Վրաստան, \nՀայաստան, Մոլդովա) STADA-ում, և հանդիսանում է «STADA \nArmenia» ՍՊԸ-ի գլխավոր տնօրենը:",
          "href": "assets/biographies/armenia/hy.pdf"
        },
        "text": {
          "about_leadership_intro": "Արման Աքոբյան",
          "about_leader_ospanov_name": "Արման Աքոբյան",
          "about_leader_ospanov_role": "GAM ենթախմբի ղեկավար (Վրաստան, Հայաստան, Մոլդովա)",
          "supplied_contacts_heading": "ԿԱՊ.",
          "supplied_contacts_text": "ՀՀ, 0025, Երևան, Մյասնիկյան 38/5, Մոստ բիզնես կենտրոն, 2-րդ հարկ\nyerevan@stada.am"
        }
      },
      "ru": {
        "leadership": {
          "name": "Армен Акобян",
          "role": "Глава кластера ГАМ (Грузия, Армения, Молдова)",
          "biography": "Армен Акобян \nГлава кластера ГАМ (Грузия, Армения, Молдова)  \n \nАрмен начал свою карьеру в 1994 \nгоду в академической среде в \nЕреванском государственном \nмедицинском университете и \nпроработал там в общей \nсложности более 15 лет. \nС 2007 по 2010 год возглавлял \nкафедру аптечного маркетинга и \nменеджмента. С 2009 года начал \nработать в фармацевтической \nотрасли, где прошел путь от \nмедицинского представителя до директора региона, \nвключавшего пять стран Евразийского региона, в таких \nкомпаниях, как Intas, Astellas и Takeda.  \nС 2000 года управляет кластером GAM (Грузия, Армения, \nМолдова) в STADA, генеральный директор ООО «STADA Armenia»",
          "href": "assets/biographies/armenia/ru.pdf"
        },
        "text": {
          "about_leadership_intro": "Армен Акобян",
          "about_leader_ospanov_name": "Армен Акобян",
          "about_leader_ospanov_role": "Глава кластера ГАМ (Грузия, Армения, Молдова)",
          "supplied_contacts_heading": "КОНТАКТЫ.",
          "supplied_contacts_text": "РА, 0025, г․ Ереван, проспект Мясникяна 38/5, Мост б/ц, 2-й этаж\nyerevan@stada.am"
        }
      }
    },
    "georgia": {
      "ge": {
        "leadership": {
          "name": "არმენ აკობიანი",
          "role": "GAM ქვეკლასტერის ხელმძღვანელი (საქართველო, სომხეთი, მოლდოვა)",
          "biography": "არმენ აკობიანი \nGAM ქვეკლასტერის ხელმძღვანელი \n(საქართველო, სომხეთი, მოლდოვა) \n \nარმენმა კარიერა 1994 წელს დაიწყო \nერევნის სახელმწიფო სამედიცინო \nუნივერსიტეტის აკადემიაში და იქ \nმუშაობდა 15 წელზე მეტი ხნის \nგანმავლობაში. \n2007 წლიდან 2010 წლამდე \nხელმძღვანელობდა ფარმაციის \nმარკეტინგისა და მენეჯმენტის \nდეპარტამენტს. 2009 წლიდან მან დაიწყო \nმუშაობა ფარმაცევტულ ინდუსტრიაში, სადაც სამედიცინო \nწარმომადგენლიდან გადავიდა რეგიონალურ დირექტორად, \nრომელიც მოიცავდა ევრაზიის რეგიონის ხუთ ქვეყანას, ისეთ \nკომპანიებში, როგორიცაა Intas, Astellas და Takeda. \n2000 წლიდან ხელმძღვანელობს GAM კლასტერს (საქართველო, \nსომხეთი, მოლდოვა) STADA-ში, შპს STADA Armenia-ს გენერალური \nდირექტორი.",
          "href": "assets/biographies/georgia/ge.pdf"
        },
        "text": {
          "about_leadership_intro": "არმენ აკობიანი",
          "about_leader_ospanov_name": "არმენ აკობიანი",
          "about_leader_ospanov_role": "GAM ქვეკლასტერის ხელმძღვანელი (საქართველო, სომხეთი, მოლდოვა)",
          "supplied_contacts_heading": "კონტაქტები.",
          "supplied_contacts_text": "კაპაროვა, 408\nმედეუს რაიონი, ალმათი, 050044\nalmaty@stada.kz"
        }
      }
    },
    "moldova": {
      "ro": {
        "leadership": {
          "name": "Armen Akobyan",
          "role": "Șeful subclusterei GAM (Georgia, Armenia, Moldova)",
          "biography": "Armen Akobyan \nȘeful subclusterei GAM (Georgia, Armenia, Moldova) \n \nArmen și-a început cariera în 1994 în \nmediul academic la Universitatea de Stat \nde Medicină din Erevan, unde a lucrat în \ntotal mai mult de 15 ani. \nDin 2007 până în 2010 a condus \ndepartamentul de marketing farmaceutic \nși management. Începând din 2009, a \nînceput să lucreze în industria \nfarmaceutică, parcurgând un drum de la \nreprezentant medical la director a regiunii \ncare cuprinde cinci țări din regiunea \neurasiatică, în companii precum Intas, Astellas și Takeda. \nDin 2000, conduce clusterul GAM (Georgia, Armenia, Moldova) la \nSTADA, director general al companiei STADA Armenia LLC.",
          "href": "assets/biographies/moldova/ro.pdf"
        },
        "text": {
          "about_leadership_intro": "Armen Akobyan",
          "about_leader_ospanov_name": "Armen Akobyan",
          "about_leader_ospanov_role": "Șeful subclusterei GAM (Georgia, Armenia, Moldova)",
          "supplied_contacts_heading": "CONTACTE.",
          "supplied_contacts_text": "R.Moldova , Chisinau, S. Lazo str.38\nTel+373 22 90 30 44"
        }
      },
      "ru": {
        "leadership": {
          "name": "Армен Акобян",
          "role": "Глава кластера ГАМ (Грузия, Армения, Молдова)",
          "biography": "Армен Акобян \nГлава кластера ГАМ (Грузия, Армения, Молдова)  \n \nАрмен начал свою карьеру в 1994 \nгоду в академической среде в \nЕреванском государственном \nмедицинском университете и \nпроработал там в общей \nсложности более 15 лет. \nС 2007 по 2010 год возглавлял \nкафедру аптечного маркетинга и \nменеджмента. С 2009 года начал \nработать в фармацевтической \nотрасли, где прошел путь от \nмедицинского представителя до директора региона, \nвключавшего пять стран Евразийского региона, в таких \nкомпаниях, как Intas, Astellas и Takeda.  \nС 2000 года управляет кластером GAM (Грузия, Армения, \nМолдова) в STADA, генеральный директор ООО «STADA Armenia»",
          "href": "assets/biographies/moldova/ru.pdf"
        },
        "text": {
          "about_leadership_intro": "Армен Акобян",
          "about_leader_ospanov_name": "Армен Акобян",
          "about_leader_ospanov_role": "Глава кластера ГАМ (Грузия, Армения, Молдова)"
        }
      }
    },
    "uzbekistan": {
      "ru": {
        "leadership": {
          "name": "Бахтияр Хаджимухамедов",
          "role": "Генеральный директор",
          "biography": "Бахтияр Хаджимухамедов присоединился к команде STADA в 2020 году. Свой карьерный путь в фармацевтическом бизнесе Бахтияр начал в SANOFI с медицинского представителя и дошел до руководителя отдела продаж с покрытием трех стран (Узбекистан, Туркменистан, Таджикистан), далее занимал позицию главы представительства в таких компаниях, как Hoffmann La Roche, Novartis/ Sandoz Pharmaceuticals, Takeda.\n\nБахтияр с отличием окончил Ташкентский медицинский институт, а потом клиническую ординатуру в НИИ глазных болезней, Москва. Имеет степень PhD по офтальмологии. Несколько лет проработал врачом-офтальмологом и преподавателем в Ташкентском медицинском институте",
          "href": "assets/biographies/uzbekistan/ru.docx"
        },
        "text": {
          "about_leadership_intro": "Бахтияр Хаджимухамедов",
          "about_leader_ospanov_name": "Бахтияр Хаджимухамедов",
          "about_leader_ospanov_role": "Генеральный директор"
        }
      },
      "uz": {
        "leadership": {
          "name": "Baxtiyor Xadjimuxamedov",
          "role": "Bosh direktor",
          "biography": "Baxtiyor Xadjimuxamedov 2020-yilda STADA jamoasiga qo‘shildi. U farmatsevtika sohasidagi kasbiy faoliyatini SANOFI kompaniyasida tibbiy vakil sifatida boshlab, keyinchalik uchta mamlakatni (O‘zbekiston, Turkmaniston, Tojikiston) qamrab olgan savdo bo‘limi rahbari lavozimiga qadar yetib bordi. Shundan so‘ng, u Hoffmann La Roche, Novartis/ Sandoz Pharmaceuticals, Takeda kabi kompaniyalarda mamlakat vakolatxonalari rahbari lavozimlarida faoliyat yuritdi.\n\nBaxtiyor Xadjimuxamedov Toshkent tibbiyot institutini imtiyozli diplom bilan tamomlagan, shuningdek, Moskva shahridagi Ko‘z kasalliklari ilmiy-tadqiqot institutida klinik ordinaturani yakunlagan. Oftalmologiya bo‘yicha PhD darajasiga ega. U bir necha yil oftalmolog-shifokor va Toshkent tibbiyot institutida o‘qituvchi sifatida faoliyat yuritgan.",
          "href": "assets/biographies/uzbekistan/uz.docx"
        },
        "text": {
          "about_leadership_intro": "Baxtiyor Xadjimuxamedov",
          "about_leader_ospanov_name": "Baxtiyor Xadjimuxamedov",
          "about_leader_ospanov_role": "Bosh direktor",
          "supplied_contacts_heading": "ALOQALAR.",
          "supplied_contacts_text": "O‘zbekiston, 100060, Toshkent shahri, Mirobod tumani, Oybek MFY, Taras Shevchenko ko‘chasi, 21A-uy, tel.: +998 78.140.35.81, +998 78.140.35.79\ninfo@stada.uz."
        }
      }
    },
    "kazakhstan": {
      "ru": {
        "text": {
          "supplied_contacts_heading": "КОНТАКТЫ.",
          "supplied_contacts_text": "+7 (727) 222‒21‒00\nКаппарова, 408\nМедеуский район, Алматы, 050044\nalmaty@stada.kz"
        }
      },
      "kz": {
        "text": {
          "supplied_contacts_heading": "КОНТАКТІЛЕРІ",
          "supplied_contacts_text": "+7 (727) 222‒21‒00\nКаппаров к., 408\nМедеу ауданы , Алматы, 050044\nalmaty@stada.kz"
        }
      }
    },
    "kyrgyzstan": {
      "kg": {
        "text": {
          "supplied_contacts_heading": "БАЙЛАНЫШТАР.",
          "supplied_contacts_text": "+996 755 111 448\nИгембердиев көч., 1а\nБишкек, 720005\nBishkek@stada.kg"
        }
      }
    }
  },
  "files": [
    {
      "path": "GE/Stada.kz_Грузинский.docx",
      "sha256": "5c49bcaa80490155b67cc7f54d2eb52442ad0464c9ab168ddc8cac563b4f7d04"
    },
    {
      "path": "GE/ГР_Армен Акобян биография.pdf",
      "sha256": "723c3e514c34e5f65205e3c620aa4d5b76ac4d464f4228405252e0e8fe6520d3"
    },
    {
      "path": "АЗ/Stada.kz_Азербайджанский.docx",
      "sha256": "04a7b37ae580c36f4b3de4d1b535ab57c033048d4a3768718ad7e9e66c8ac304"
    },
    {
      "path": "АЗ/АЗ_Фарах Садыхова_биография.pdf",
      "sha256": "905b2de73f6bbbedb34d7e5b5636aaf2e08048e96fa1916ae7fd54329e02cc0e"
    },
    {
      "path": "АЗ/РУС_Фарах Садыхова_биография.pdf",
      "sha256": "00a4e29524de04b47e6de373e9995f947a18b30e45fa2eda82bff1194a1e860a"
    },
    {
      "path": "АРМ/01.10.2024_Stada.kz_Армянский.docx",
      "sha256": "508b064a6d98ee224b6ea98c0237fe7029d28ec5708b4652d38553af7efeb563"
    },
    {
      "path": "АРМ/АРМ_Армен Акобян биография.pdf",
      "sha256": "c8a0d66c4cdd524d6bc018d1a23ef8d77284cd959e0e32d0dae4c510d560b309"
    },
    {
      "path": "АРМ/РУС_Армен Акобян биография.pdf",
      "sha256": "15a4a10337d45b5ac880484c83877a48a6b245704c173dda155694d60cff6528"
    },
    {
      "path": "КАЗ/Stada.КАЗ перевод.docx",
      "sha256": "32bdfe2186cb9b9cf210d9c1dd30ab184ea1d392f1ccf2c7eac8899ea55783f0"
    },
    {
      "path": "КГ/Stada.kz_Кыргызский.docx",
      "sha256": "083a89a0faa908c220547651955d6ea205f8983050ed792a9281cdba29ce84b5"
    },
    {
      "path": "МД/Stada.kz_Румынский N2.docx",
      "sha256": "9121b7d9d9ac7d2af98a67f53a658942ea6f98765c8fdf5d858ef718e43195aa"
    },
    {
      "path": "МД/РУМЫНСКИЙ_Армен Акобян биография.pdf",
      "sha256": "37bdad1740c4dce0fe8cafac77bf6ced8f3a3ffa32d2b2417b55f2e26c85e2a2"
    },
    {
      "path": "РУС/Stada.kz.docx",
      "sha256": "e2c0fb22b8cc3ab03512b1f8db58d6e8f7ce857fb6847942a1e0890eaf18ee32"
    },
    {
      "path": "УЗБ/Руководство_Бахтияр Хаджимухамедов_РУС.docx",
      "sha256": "181e1e1c05d91a10dcca2cba7a7d0175caff9a402a975b5611272e39aed76d26"
    },
    {
      "path": "УЗБ/Руководство_Бахтияр Хаджимухамедов_УЗБ.docx",
      "sha256": "c0b2ae02df21304a041baf0fa8d617c56ae269ad36acfa205d34bde616c1afdf"
    },
    {
      "path": "УЗБ/ТОО Stada.uz перевод на узбекский.docx",
      "sha256": "8ed26c86cc20aad653c966321887695ba96bd57e92d8fe59a5abe9881e2e9191"
    }
  ]
};
