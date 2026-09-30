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
