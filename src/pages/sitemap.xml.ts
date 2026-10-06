import type { APIRoute } from 'astro';
import { SITE, NAV_TESTS } from '../config/site';
import { CPS_DURATION_PAGES } from '../config/tests';

export const GET: APIRoute = () => {
  const pages = [
    '',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
    ...NAV_TESTS.map(t => `/${t.slug}`),
    ...CPS_DURATION_PAGES.map(p => `/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE.url}${p}</loc>
    <changefreq>monthly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
