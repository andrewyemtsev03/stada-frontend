const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../frontend');
const template = fs.readFileSync(path.join(root, 'partials/footer.html'), 'utf8').trim();
const pages = ['index.html', 'about.html', 'culture.html', 'history.html', 'worldwide.html', 'news.html', 'news-article.html', 'products/index.html', 'products/product.html'];

for (const page of pages) {
  const file = path.join(root, page);
  const prefix = '../'.repeat(page.split('/').length - 1);
  const footer = template.replaceAll('{{root}}', prefix);
  const original = fs.readFileSync(file, 'utf8');
  if (!/<footer\b[\s\S]*?<\/footer>/.test(original)) throw new Error(`Missing footer: ${page}`);
  fs.writeFileSync(file, original.replace(/<footer\b[\s\S]*?<\/footer>/, footer));
}
