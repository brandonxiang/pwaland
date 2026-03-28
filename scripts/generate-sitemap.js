import { writeFileSync } from 'fs';

const BASE_URL = 'https://pwaland.brandonxiang.top';

const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/categories', priority: '0.8', changefreq: 'weekly' },
  { path: '/submit', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
];

const today = new Date().toISOString().split('T')[0];

const urlEntries = routes
  .map(
    (route) => `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

writeFileSync('./projects/web-next/dist/sitemap.xml', sitemap);
console.log('Sitemap generated at ./projects/web-next/dist/sitemap.xml');
