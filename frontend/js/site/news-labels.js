const STADA_NEWS_LABELS = {
  ru: ['Новости компании', 'Читать новость', '← Все новости', 'Пока нет новостей компании для этой страны.', 'Новость недоступна для этой страны.'],
  ro: ['Noutățile companiei', 'Citește știrea', '← Toate noutățile', 'Deocamdată nu există noutăți ale companiei pentru această țară.', 'Știrea nu este disponibilă pentru această țară.'],
  en: ['Company news', 'Read more', '← All news', 'There is no company news for this country yet.', 'This article is unavailable for this country.'],
  kz: ['Компания жаңалықтары', 'Жаңалықты оқу', '← Барлық жаңалықтар', 'Бұл ел үшін компания жаңалықтары әзірге жоқ.', 'Бұл жаңалық осы ел үшін қолжетімсіз.'],
  kg: ['Компаниянын жаңылыктары', 'Жаңылыкты окуу', '← Бардык жаңылыктар', 'Бул өлкө үчүн компаниянын жаңылыктары азырынча жок.', 'Бул жаңылык ушул өлкө үчүн жеткиликтүү эмес.'],
  ge: ['კომპანიის სიახლეები', 'წაიკითხეთ სიახლე', '← ყველა სიახლე', 'ამ ქვეყნისთვის კომპანიის სიახლეები ჯერ არ არის.', 'ეს სიახლე ამ ქვეყნისთვის მიუწვდომელია.'],
  az: ['Şirkət xəbərləri', 'Xəbəri oxuyun', '← Bütün xəbərlər', 'Bu ölkə üçün hələ şirkət xəbərləri yoxdur.', 'Bu xəbər bu ölkə üçün mövcud deyil.'],
  hy: ['Ընկերության նորություններ', 'Կարդալ նորությունը', '← Բոլոր նորությունները', 'Այս երկրի համար ընկերության նորություններ դեռ չկան։', 'Այս նորությունը հասանելի չէ այս երկրի համար։'],
  uz: ['Kompaniya yangiliklari', 'Yangilikni o‘qish', '← Barcha yangiliklar', 'Bu mamlakat uchun kompaniya yangiliklari hozircha yo‘q.', 'Bu yangilik ushbu mamlakat uchun mavjud emas.']
};
for (const [lang, labels] of Object.entries(STADA_NEWS_LABELS)) {
  Object.assign(FRONTEND_STATIC_TEXT[lang], Object.fromEntries(
    ['nav_news', 'news_read', 'news_back', 'news_empty', 'news_unavailable'].map((key, index) => [key, labels[index]])
  ));
}

// Shared contacts interface copy; retained keys support existing content records.
const STADA_CONTACTS_COPY = {
  "en": {
    "nav_worldwide": "Contacts",
    "footer_nav_worldwide": "Contacts",
    "worldwide_heading": "Contacts",
    "worldwide_page_title": "STADA - Contacts",
    "worldwide_eyebrow": "Contact STADA",
    "worldwide_subtitle": "Find addresses and contact details for STADA offices by country.",
    "worldwide_country_label": "Select a country",
    "worldwide_globe_topline": "STADA offices",
    "worldwide_globe_fallback_title": "STADA offices",
    "worldwide_globe_fallback_text": "Select a country to view its contact details.",
    "worldwide_globe_hint_regions": "STADA offices",
    "worldwide_globe_hint_markets": "Select a country"
  },
  "ru": {
    "nav_worldwide": "Контакты",
    "footer_nav_worldwide": "Контакты",
    "worldwide_heading": "Контакты",
    "worldwide_page_title": "STADA - Контакты",
    "worldwide_eyebrow": "Связаться со STADA",
    "worldwide_subtitle": "Адреса и контактные данные офисов STADA в разных странах.",
    "worldwide_country_label": "Выберите страну",
    "worldwide_globe_topline": "Офисы STADA",
    "worldwide_globe_fallback_title": "Офисы STADA",
    "worldwide_globe_fallback_text": "Выберите страну, чтобы посмотреть контактные данные.",
    "worldwide_globe_hint_regions": "Офисы STADA",
    "worldwide_globe_hint_markets": "Выберите страну"
  },
  "kz": {
    "nav_worldwide": "Байланыс",
    "footer_nav_worldwide": "Байланыс",
    "worldwide_heading": "Байланыс",
    "worldwide_page_title": "STADA - Байланыс",
    "worldwide_eyebrow": "STADA-мен байланысу",
    "worldwide_subtitle": "Әр елдегі STADA кеңселерінің мекенжайлары мен байланыс деректері.",
    "worldwide_country_label": "Елді таңдаңыз",
    "worldwide_globe_topline": "STADA кеңселері",
    "worldwide_globe_fallback_title": "STADA кеңселері",
    "worldwide_globe_fallback_text": "Байланыс деректерін көру үшін елді таңдаңыз.",
    "worldwide_globe_hint_regions": "STADA кеңселері",
    "worldwide_globe_hint_markets": "Елді таңдаңыз"
  },
  "kg": {
    "nav_worldwide": "Байланыш",
    "footer_nav_worldwide": "Байланыш",
    "worldwide_heading": "Байланыш",
    "worldwide_page_title": "STADA - Байланыш",
    "worldwide_eyebrow": "STADA менен байланышуу",
    "worldwide_subtitle": "Ар кайсы өлкөлөрдөгү STADA кеңселеринин даректери жана байланыш маалыматтары.",
    "worldwide_country_label": "Өлкөнү тандаңыз",
    "worldwide_globe_topline": "STADA кеңселери",
    "worldwide_globe_fallback_title": "STADA кеңселери",
    "worldwide_globe_fallback_text": "Байланыш маалыматтарын көрүү үчүн өлкөнү тандаңыз.",
    "worldwide_globe_hint_regions": "STADA кеңселери",
    "worldwide_globe_hint_markets": "Өлкөнү тандаңыз"
  },
  "ge": {
    "nav_worldwide": "კონტაქტები",
    "footer_nav_worldwide": "კონტაქტები",
    "worldwide_heading": "კონტაქტები",
    "worldwide_page_title": "STADA - კონტაქტები",
    "worldwide_eyebrow": "დაუკავშირდით STADA-ს",
    "worldwide_subtitle": "STADA-ს ოფისების მისამართები და საკონტაქტო ინფორმაცია სხვადასხვა ქვეყანაში.",
    "worldwide_country_label": "აირჩიეთ ქვეყანა",
    "worldwide_globe_topline": "STADA-ს ოფისები",
    "worldwide_globe_fallback_title": "STADA-ს ოფისები",
    "worldwide_globe_fallback_text": "საკონტაქტო ინფორმაციის სანახავად აირჩიეთ ქვეყანა.",
    "worldwide_globe_hint_regions": "STADA-ს ოფისები",
    "worldwide_globe_hint_markets": "აირჩიეთ ქვეყანა"
  },
  "az": {
    "nav_worldwide": "Əlaqə",
    "footer_nav_worldwide": "Əlaqə",
    "worldwide_heading": "Əlaqə",
    "worldwide_page_title": "STADA - Əlaqə",
    "worldwide_eyebrow": "STADA ilə əlaqə",
    "worldwide_subtitle": "Müxtəlif ölkələrdə STADA ofislərinin ünvanları və əlaqə məlumatları.",
    "worldwide_country_label": "Ölkə seçin",
    "worldwide_globe_topline": "STADA ofisləri",
    "worldwide_globe_fallback_title": "STADA ofisləri",
    "worldwide_globe_fallback_text": "Əlaqə məlumatlarına baxmaq üçün ölkə seçin.",
    "worldwide_globe_hint_regions": "STADA ofisləri",
    "worldwide_globe_hint_markets": "Ölkə seçin"
  },
  "hy": {
    "nav_worldwide": "Կոնտակտներ",
    "footer_nav_worldwide": "Կոնտակտներ",
    "worldwide_heading": "Կոնտակտներ",
    "worldwide_page_title": "STADA - Կոնտակտներ",
    "worldwide_eyebrow": "Կապ հաստատեք STADA-ի հետ",
    "worldwide_subtitle": "STADA-ի գրասենյակների հասցեներն ու կոնտակտային տվյալները տարբեր երկրներում։",
    "worldwide_country_label": "Ընտրեք երկիրը",
    "worldwide_globe_topline": "STADA-ի գրասենյակները",
    "worldwide_globe_fallback_title": "STADA-ի գրասենյակները",
    "worldwide_globe_fallback_text": "Կոնտակտային տվյալները դիտելու համար ընտրեք երկիրը։",
    "worldwide_globe_hint_regions": "STADA-ի գրասենյակները",
    "worldwide_globe_hint_markets": "Ընտրեք երկիրը"
  },
  "ro": {
    "nav_worldwide": "Contacte",
    "footer_nav_worldwide": "Contacte",
    "worldwide_heading": "Contacte",
    "worldwide_page_title": "STADA - Contacte",
    "worldwide_eyebrow": "Contactează STADA",
    "worldwide_subtitle": "Adresele și datele de contact ale birourilor STADA din diferite țări.",
    "worldwide_country_label": "Selectează țara",
    "worldwide_globe_topline": "Birourile STADA",
    "worldwide_globe_fallback_title": "Birourile STADA",
    "worldwide_globe_fallback_text": "Selectează o țară pentru a vedea datele de contact.",
    "worldwide_globe_hint_regions": "Birourile STADA",
    "worldwide_globe_hint_markets": "Selectează țara"
  },
  "uz": {
    "nav_worldwide": "Aloqa",
    "footer_nav_worldwide": "Aloqa",
    "worldwide_heading": "Aloqa",
    "worldwide_page_title": "STADA - Aloqa",
    "worldwide_eyebrow": "STADA bilan bog‘lanish",
    "worldwide_subtitle": "Turli mamlakatlardagi STADA ofislarining manzillari va aloqa ma’lumotlari.",
    "worldwide_country_label": "Mamlakatni tanlang",
    "worldwide_globe_topline": "STADA ofislari",
    "worldwide_globe_fallback_title": "STADA ofislari",
    "worldwide_globe_fallback_text": "Aloqa ma’lumotlarini ko‘rish uchun mamlakatni tanlang.",
    "worldwide_globe_hint_regions": "STADA ofislari",
    "worldwide_globe_hint_markets": "Mamlakatni tanlang"
  }
};
for (const [lang, text] of Object.entries(STADA_CONTACTS_COPY)) {
  Object.assign(FRONTEND_STATIC_TEXT[lang], text);
}
