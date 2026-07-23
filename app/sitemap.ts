import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

// Next.js otomatis serve ini di /sitemap.xml. Cuma satu halaman (single-page
// site), tapi tetap penting biar Google tau halaman ini ada & kapan terakhir
// diupdate — kalau nanti nambah halaman baru (misal /kebijakan), tambahkan
// entry baru di array ini.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
