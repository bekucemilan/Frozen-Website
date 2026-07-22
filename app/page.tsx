import type { SVGProps } from 'react';
import { supabase, Product, SiteInfo, Social, AboutSection, FeatureBadge, Promo } from '@/lib/supabase';
import ProductGrid from './ProductGrid';
import HeroMedia from './HeroMedia';
import ThemeToggle from './ThemeToggle';
import { CartButton, CartDrawer } from './CartDrawer';
import PhoneCopy from './PhoneCopy';
import PromoSection from './PromoSection';
import { SITE_URL } from '@/lib/site-config';

export const revalidate = 0; // selalu ambil data terbaru, gak di-cache

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  shopee: 'Shopee',
  youtube: 'YouTube',
  website: 'Website',
  lainnya: 'Link',
};

async function getData() {
  const nowIso = new Date().toISOString();
  const [{ data: products }, { data: siteInfo }, { data: socials }, { data: sections }, { data: badges }, { data: promos }] =
    await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('site_info').select('*').eq('id', 1).single(),
      supabase.from('socials').select('*').order('sort_order'),
      supabase.from('about_sections').select('*').order('sort_order'),
      supabase.from('feature_badges').select('*').order('sort_order'),
      supabase
        .from('promos')
        .select('*, products(name, photo_url, photo_urls, price, category)')
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .gte('ends_at', nowIso)
        .order('sort_order'),
    ]);

  return {
    products: (products as Product[]) || [],
    siteInfo: siteInfo as SiteInfo | null,
    socials: (socials as Social[]) || [],
    sections: (sections as AboutSection[]) || [],
    badges: (badges as FeatureBadge[]) || [],
    promos: (promos as unknown as Promo[]) || [],
  };
}

/** Pastikan URL selalu punya skema http(s), biar link gak dianggap
 *  path relatif di web sendiri (yang bisa berujung 404) kalau
 *  orang lupa nulis "https://" pas paste link Maps/sosmed. */
function ensureAbsoluteUrl(url: string | null | undefined): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(mailto:|tel:|wa\.me)/i.test(trimmed)) return trimmed.startsWith('wa.me') ? `https://${trimmed}` : trimmed;
  return `https://${trimmed}`;
}

/** Link Google Maps universal — otomatis buka app Maps di HP (Android/iOS) kalau terpasang,
 *  atau buka Google Maps web kalau di desktop / app tidak ada. */
function buildMapsUrl(siteInfo: SiteInfo | null) {
  if (siteInfo?.maps_url && siteInfo.maps_url.trim()) return ensureAbsoluteUrl(siteInfo.maps_url);
  const query = siteInfo?.address?.trim() || 'Cemilan Beku';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildMapsEmbedUrl(siteInfo: SiteInfo | null) {
  const query = siteInfo?.address?.trim() || siteInfo?.store_name || 'Cemilan Beku';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

/** Normalisasi nomor ke format internasional TANPA "+" (mis. "6289624444009"),
 *  cocok buat link wa.me. Terima input dalam format apa pun yang biasa
 *  diketik admin: "0896...", "62896...", "+62896...", atau "896...".
 *  WA API butuh format internasional — kalau nomornya masih diawali "0",
 *  linknya gak akan nyambung, makanya konversi ini penting dan gak boleh
 *  cuma strip karakter non-digit begitu saja. */
function toIntlPhone(raw: string | null | undefined): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

/** Format lokal "08xx-xxxx-xxxx" buat ditampilkan & disalin — ini yang
 *  orang Indonesia biasa lihat & pakai, walau data aslinya tersimpan
 *  dalam format lain. */
function toLocalPhoneDisplay(raw: string | null | undefined): string {
  const intl = toIntlPhone(raw);
  if (!intl) return '';
  const local = `0${intl.slice(2)}`;
  const head = local.slice(0, 4);
  const rest = local.slice(4).match(/.{1,4}/g) || [];
  return [head, ...rest].join('-');
}

function toLocalPhonePlain(raw: string | null | undefined): string {
  const intl = toIntlPhone(raw);
  return intl ? `0${intl.slice(2)}` : '';
}

/* ---------------- Icons ---------------- */
function IconWhatsapp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.44 5.13L2 22l5.13-1.55a9.85 9.85 0 0 0 4.9 1.31h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.64-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .9 2.14.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.93.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
    </svg>
  );
}
function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTiktok(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.1v13.6a2.9 2.9 0 1 1-2.06-2.78v-3.2a6.1 6.1 0 1 0 5.16 6.02V8.9a7.7 7.7 0 0 0 4.5 1.44V7.24A4.8 4.8 0 0 1 16.6 2Z" />
    </svg>
  );
}
function IconFacebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.7h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.2c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.4-3.9 4V10.3H7.5v3h2.4V21h3.6Z" />
    </svg>
  );
}
function IconShopee(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}
function IconLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.3 5.2a3.5 3.5 0 1 1 4.95 4.95L15.9 11.4" />
      <path d="M13 17.5 11.7 18.8a3.5 3.5 0 1 1-4.95-4.95L8 12.6" />
    </svg>
  );
}
function IconYoutube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.6a2.8 2.8 0 0 0-2-2C17.9 5.2 12 5.2 12 5.2s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.4 2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.4ZM10 15.2V8.8L15.8 12Z" />
    </svg>
  );
}
function IconGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}
function SocialIcon({ platform, ...props }: { platform: string } & SVGProps<SVGSVGElement>) {
  switch ((platform || '').trim().toLowerCase()) {
    case 'instagram': return <IconInstagram {...props} />;
    case 'tiktok': return <IconTiktok {...props} />;
    case 'facebook': return <IconFacebook {...props} />;
    case 'whatsapp': return <IconWhatsapp {...props} />;
    case 'shopee': return <IconShopee {...props} />;
    case 'youtube': return <IconYoutube {...props} />;
    case 'website': return <IconGlobe {...props} />;
    default: return <IconLink {...props} />;
  }
}
function IconMapPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}
function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 4h3.2l1.3 4.4-2 1.6a12.5 12.5 0 0 0 6 6l1.6-2 4.4 1.3v3.2c0 1-.9 1.8-1.9 1.6C9.8 19 5 14.2 3.9 6.9 3.7 5.9 4.5 4 4.5 4Z" />
    </svg>
  );
}
function IconTruck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}
function IconSnowflake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11" />
    </svg>
  );
}
function IconHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20s-7.5-4.6-9.6-9.2C1.1 7.4 3 4.3 6.3 4.3c2 0 3.3 1 5.7 3.4 2.4-2.4 3.7-3.4 5.7-3.4 3.3 0 5.2 3.1 3.9 6.5C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}
function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
/* ---- Icon library dipakai untuk badge fitur (bisa dipilih di controller) ---- */
function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}
function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 7.6-7 9-3.5-1.4-7-4-7-9V6l7-3Z" />
    </svg>
  );
}
function IconStar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3L3 10.5l6.4-.6Z" />
    </svg>
  );
}
function IconLeaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 20C5 12 9 5 19 4c1 9-5 15-13 16Z" />
      <path d="M6 20c1-4 3-7 8-9" />
    </svg>
  );
}
function IconGift(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9h16v11H4zM4 9V6.5A2.5 2.5 0 0 1 6.5 4c2 0 3.7 2 5.5 5 1.8-3 3.5-5 5.5-5A2.5 2.5 0 0 1 20 6.5V9M12 9v11" />
    </svg>
  );
}
function IconLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 11V8a6 6 0 1 1 12 0v3" />
      <path d="M5 11h14v10H5Z" />
    </svg>
  );
}
function IconSparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z" />
      <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" />
    </svg>
  );
}
function IconThumbsUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 11v9H4v-9h3ZM7 11l3.5-7c1 0 2 1 2 2v4h5.5c1 0 1.8.9 1.6 1.9l-1.3 6c-.2.9-1 1.6-2 1.6H7" />
    </svg>
  );
}
function IconTag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3h6a2 2 0 0 1 2 2v6L11 20l-8-8L12 3Z" />
      <circle cx="15.3" cy="7.7" r="1.2" />
    </svg>
  );
}
function IconPackage(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </svg>
  );
}
function IconRecycle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4v6h6" />
      <path d="M20 20v-6h-6" />
      <path d="M5.5 15A8 8 0 0 0 20 12M18.5 9A8 8 0 0 0 4 12" />
    </svg>
  );
}
const BADGE_ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  snowflake: IconSnowflake,
  truck: IconTruck,
  heart: IconHeart,
  check: IconCheck,
  shield: IconShield,
  star: IconStar,
  clock: IconClock,
  leaf: IconLeaf,
  gift: IconGift,
  phone: IconPhone,
  lock: IconLock,
  sparkle: IconSparkle,
  thumbsup: IconThumbsUp,
  tag: IconTag,
  package: IconPackage,
  recycle: IconRecycle,
};
function BadgeIcon({ icon, ...props }: { icon: string } & SVGProps<SVGSVGElement>) {
  const Cmp = BADGE_ICONS[icon] || IconSnowflake;
  return <Cmp {...props} />;
}
/* ---------------------------------------- */

export default async function Home() {
  const { products, siteInfo, socials, sections, badges, promos } = await getData();
  const storeName = siteInfo?.store_name || 'Cemilan Beku';
  // product_id -> promo aktif, dipakai ProductGrid buat nampilin harga
  // coret + pakai harga promo sebagai harga efektif pas ditambah ke keranjang.
  const promoMap: Record<string, { promo_price: number; ends_at: string; label: string | null }> = {};
  promos.forEach((p) => {
    if (!promoMap[p.product_id]) {
      promoMap[p.product_id] = { promo_price: p.promo_price, ends_at: p.ends_at, label: p.label };
    }
  });
  const waSocial = socials.find((s) => (s.platform || '').trim().toLowerCase() === 'whatsapp');
  const mapsUrl = buildMapsUrl(siteInfo);
  const mapsEmbedUrl = buildMapsEmbedUrl(siteInfo);
  const waLink = waSocial?.url
    ? ensureAbsoluteUrl(waSocial.url)
    : (siteInfo?.phone ? `https://wa.me/${toIntlPhone(siteInfo.phone)}` : null);
  const heroBadges = badges.filter((b) => b.section === 'hero');
  const footerBadges = badges.filter((b) => b.section === 'footer');
  const visibleSections = sections.filter((s) => s.title?.trim() && s.body?.trim());

  // Structured data (Schema.org) — bantu Google paham ini toko apa, di mana,
  // dan apa saja produknya, biar bisa muncul lebih kaya di hasil pencarian
  // (nama toko, alamat, jam buka, kontak, rating produk kalau ada).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: storeName,
    ...(siteInfo?.address ? { address: { '@type': 'PostalAddress', streetAddress: siteInfo.address } } : {}),
    ...(siteInfo?.phone ? { telephone: toIntlPhone(siteInfo.phone) || siteInfo.phone } : {}),
    ...(siteInfo?.open_hours ? { openingHours: siteInfo.open_hours } : {}),
    ...(mapsUrl ? { hasMap: mapsUrl } : {}),
    image: '/logo.png',
    servesCuisine: 'Frozen Food',
    ...(products.length > 0
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Produk Cemilan Beku',
            itemListElement: products.slice(0, 20).map((p) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Product', name: p.name },
              ...(p.price ? { price: p.price, priceCurrency: 'IDR' } : {}),
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="site-header-outer">
        <div className="wrap site-header">
          <div className="brand">
            <img src="/logo.png" alt={storeName} />
            <span className="brand-name">{storeName}</span>
          </div>
          <nav className="header-nav">
            <a href="#produk">Produk</a>
            <a href="#lokasi">Lokasi</a>
            <ThemeToggle />
            <CartButton />
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="header-cta">
                <IconWhatsapp /> Pesan
              </a>
            )}
          </nav>
        </div>
      </div>

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <div className="eyebrow"><IconSnowflake style={{ width: 13, height: 13 }} /> Segar &middot; Berkualitas &middot; Praktis</div>
            <h1>
              {siteInfo?.tagline || (
                <>
                  Stok beku, rasa <em>selalu segar.</em>
                </>
              )}
            </h1>
            <p>
              Untuk keluarga sehat dan bahagia — cemilan beku olahan berkualitas, tinggal digoreng atau dikukus, siap disantap kapan saja.
            </p>

            {heroBadges.length > 0 && (
              <div className="hero-badges">
                {heroBadges.map((b) => (
                  <div className="hero-badge" key={b.id}>
                    <div className="icon-circle"><BadgeIcon icon={b.icon} style={{ width: 16, height: 16 }} /></div>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="hero-actions">
              <a href="#produk" className="btn btn-primary">
                Lihat Produk <IconArrowUpRight />
              </a>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <IconWhatsapp /> Pesan via WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="hero-media-box">
            <HeroMedia
              dayType={siteInfo?.hero_day_media_type ?? 'none'}
              dayUrl={siteInfo?.hero_day_media_url ?? null}
              nightType={siteInfo?.hero_night_media_type ?? 'none'}
              nightUrl={siteInfo?.hero_night_media_url ?? null}
              mascotUrl={siteInfo?.hero_mascot_url ?? null}
              mascotWidth={siteInfo?.hero_mascot_width ?? 38}
              mascotBottom={siteInfo?.hero_mascot_bottom ?? 4}
              mascotRight={siteInfo?.hero_mascot_right ?? 8}
            />
            <div className="hero-snow" aria-hidden="true">
              <div className="snow-layer-3" />
            </div>
          </div>
        </div>
      </section>

      <PromoSection promos={promos} waLink={waLink} />

      <section className="about">
        {visibleSections.length === 0 ? (
          <div className="wrap about-grid">
            <div className="about-label">Tentang</div>
            <div className="about-body">
              <h2>Apa itu cemilan beku?</h2>
              <p>
                Makanan yang diproses lalu dibekukan pada suhu rendah agar kandungan gizi dan rasanya tetap terjaga, tanpa perlu bahan pengawet berlebihan. Praktis disimpan, praktis dimasak — solusi cemilan untuk keluarga sehat dan bahagia.
              </p>
            </div>
          </div>
        ) : (
          visibleSections.map((s, i) => (
            <div className={'wrap about-grid' + (i > 0 ? ' about-extra' : '')} key={s.id}>
              <div className="about-label">{s.label?.trim() || (i === 0 ? 'Tentang' : '\u00A0')}</div>
              <div className="about-body">
                <h2>{s.title}</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="products" id="produk">
        <div className="wrap">
          <div className="section-title">
            <h2>Produk Kami</h2>
            <span>{products.length} item tersedia</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">Belum ada produk ditambahkan.</div>
          ) : (
            <ProductGrid
              products={products}
              waLink={waLink}
              usageTitle={siteInfo?.usage_title || 'Cara Olah'}
              usageSubtitle={siteInfo?.usage_subtitle || ''}
              recipeTitle={siteInfo?.recipe_title || 'Resep'}
              recipeSubtitle={siteInfo?.recipe_subtitle || ''}
              promoMap={promoMap}
              siteUrl={SITE_URL}
              storeName={storeName}
            />
          )}
          {products.length > 0 && (
            <p className="products-hint">Klik salah satu produk untuk lihat foto, deskripsi, cara olah, dan resepnya.</p>
          )}
        </div>
      </section>

      <section className="location" id="lokasi">
        <div className="wrap location-grid">
          <div className="location-info">
            <div className="about-label">Lokasi</div>
            <h2>Kunjungi &amp; Pesan Langsung</h2>
            <p>
              Klik peta di samping untuk langsung diarahkan ke aplikasi Google Maps di HP kamu,
              atau ke Google Maps versi web kalau dibuka dari komputer.
            </p>
            <div className="location-facts">
              <div className="location-fact">
                <div className="fact-icon"><IconMapPin /></div>
                <div>
                  <b>Alamat</b>
                  <span>{siteInfo?.address || '-'}</span>
                </div>
              </div>
              <div className="location-fact">
                <div className="fact-icon"><IconClock /></div>
                <div>
                  <b>Jam Buka</b>
                  <span>{siteInfo?.open_hours || '-'}</span>
                </div>
              </div>
              {siteInfo?.phone && (
                <div className="location-fact">
                  <div className="fact-icon"><IconPhone /></div>
                  <div>
                    <b>Telepon / WA</b>
                    <PhoneCopy display={toLocalPhoneDisplay(siteInfo.phone)} copyValue={toLocalPhonePlain(siteInfo.phone)} />
                  </div>
                </div>
              )}
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <IconMapPin /> Buka di Google Maps
            </a>
          </div>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="map-card" aria-label="Buka lokasi di Google Maps">
            <div className="map-pin-badge"><IconMapPin /> {storeName}</div>
            <iframe src={mapsEmbedUrl} loading="lazy" title="Lokasi toko" />
            <div className="map-card-overlay">
              <span className="map-card-pill"><IconArrowUpRight /> Buka di Maps</span>
            </div>
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          {footerBadges.length > 0 && (
            <div className="footer-strip">
              {footerBadges.map((b) => (
                <span key={b.id}><BadgeIcon icon={b.icon} /> {b.label}</span>
              ))}
            </div>
          )}

          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src="/logo.png" alt={storeName} />
                <span>{storeName}</span>
              </div>
              <div className="footer-contact-row">
                <IconMapPin />
                <p style={{ margin: 0 }}>{siteInfo?.address || '-'}</p>
              </div>
              <div className="footer-contact-row">
                <IconClock />
                <p style={{ margin: 0 }}>Jam buka: {siteInfo?.open_hours || '-'}</p>
              </div>
              {siteInfo?.phone && (
                <div className="footer-contact-row">
                  <IconPhone />
                  <p style={{ margin: 0 }}>
                    Telp/WA:{' '}
                    <PhoneCopy display={toLocalPhoneDisplay(siteInfo.phone)} copyValue={toLocalPhonePlain(siteInfo.phone)} />
                  </p>
                </div>
              )}
            </div>
            <div className="footer-social-col">
              <h4>Sosial Media</h4>
              <div className="socials-col">
                {socials.length === 0 && <p>-</p>}
                {socials.map((s) => {
                  const label = SOCIAL_LABELS[(s.platform || '').trim().toLowerCase()] || s.platform;
                  return (
                    <a
                      key={s.id}
                      href={ensureAbsoluteUrl(s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-pill"
                      title={label}
                    >
                      <span className="social-pill-icon"><SocialIcon platform={s.platform} /></span>
                      <span className="social-pill-label">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
            <div>
              <h4>Kontak</h4>
              <p>Hubungi kami untuk pemesanan dalam jumlah besar atau kerja sama reseller.</p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ice)', fontWeight: 600 }}>
                Lihat lokasi di Maps →
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {storeName}. Semua hak dilindungi.</span>
          </div>
        </div>
      </footer>

      {waLink && (
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="floating-wa" aria-label="Chat WhatsApp">
          <IconWhatsapp />
        </a>
      )}

      <CartDrawer waLink={waLink} />
    </>
  );
}
