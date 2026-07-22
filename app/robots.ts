import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

// Next.js otomatis serve ini di /robots.txt — kasih tau Google (dan bot lain)
// semua halaman boleh di-crawl, dan kasih tau lokasi sitemap.xml.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
