import type { SVGProps } from 'react';
import { supabase, Product, SiteInfo, Social } from '@/lib/supabase';
import ProductGrid from './ProductGrid';

export const revalidate = 0; // selalu ambil data terbaru, gak di-cache

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  shopee: 'Shopee',
  lainnya: 'Link',
};

async function getData() {
  const [{ data: products }, { data: siteInfo }, { data: socials }] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('site_info').select('*').eq('id', 1).single(),
    supabase.from('socials').select('*').order('sort_order'),
  ]);

  return {
    products: (products as Product[]) || [],
    siteInfo: siteInfo as SiteInfo | null,
    socials: (socials as Social[]) || [],
  };
}

/** Link Google Maps universal — otomatis buka app Maps di HP (Android/iOS) kalau terpasang,
 *  atau buka Google Maps web kalau di desktop / app tidak ada. */
function buildMapsUrl(siteInfo: SiteInfo | null) {
  if (siteInfo?.maps_url && siteInfo.maps_url.trim()) return siteInfo.maps_url.trim();
  const query = siteInfo?.address?.trim() || 'Cemilan Beku';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildMapsEmbedUrl(siteInfo: SiteInfo | null) {
  const query = siteInfo?.address?.trim() || siteInfo?.store_name || 'Cemilan Beku';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
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
function SocialIcon({ platform, ...props }: { platform: string } & SVGProps<SVGSVGElement>) {
  switch (platform) {
    case 'instagram': return <IconInstagram {...props} />;
    case 'tiktok': return <IconTiktok {...props} />;
    case 'facebook': return <IconFacebook {...props} />;
    case 'whatsapp': return <IconWhatsapp {...props} />;
    case 'shopee': return <IconShopee {...props} />;
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
/* ---------------------------------------- */

export default async function Home() {
  const { products, siteInfo, socials } = await getData();
  const storeName = siteInfo?.store_name || 'Cemilan Beku';
  const waSocial = socials.find((s) => s.platform === 'whatsapp');
  const mapsUrl = buildMapsUrl(siteInfo);
  const mapsEmbedUrl = buildMapsEmbedUrl(siteInfo);
  const waLink = waSocial?.url || (siteInfo?.phone ? `https://wa.me/${siteInfo.phone.replace(/\D/g, '')}` : null);

  return (
    <>
      <div className="site-header-outer">
        <div className="wrap site-header">
          <div className="brand">
            <img src="/logo.png" alt={storeName} />
            {storeName}
          </div>
          <nav className="header-nav">
            <a href="#produk">Produk</a>
            <a href="#lokasi">Lokasi</a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="header-cta">
                <IconWhatsapp /> Pesan
              </a>
            )}
          </nav>
        </div>
      </div>

      <section className="hero">
        <div className="wrap hero-inner">
          <div className="eyebrow"><IconSnowflake style={{ width: 13, height: 13 }} /> Segar &middot; Berkualitas &middot; Praktis</div>
          <h1>
            {siteInfo?.tagline || (
              <>
                Stok beku, rasa <em>selalu segar.</em>
              </>
            )}
          </h1>
          <p>
            {siteInfo?.about_text ||
              'Untuk keluarga sehat dan bahagia — cemilan beku olahan berkualitas, tinggal digoreng atau dikukus, siap disantap kapan saja.'}
          </p>

          <div className="hero-badges">
            <div className="hero-badge">
              <div className="icon-circle"><IconSnowflake style={{ width: 16, height: 16 }} /></div>
              <span>Produk Beku Segar</span>
            </div>
            <div className="hero-badge">
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 9.5 17 19 7.5" /></svg>
              </div>
              <span>Kualitas Terjamin</span>
            </div>
            <div className="hero-badge">
              <div className="icon-circle"><IconTruck style={{ width: 16, height: 16 }} /></div>
              <span>Praktis &amp; Hemat</span>
            </div>
          </div>

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
      </section>

      <section className="about">
        <div className="wrap about-grid">
          <div className="about-label">Tentang</div>
          <div className="about-body">
            <h2>Apa itu cemilan beku?</h2>
            <p>
              {siteInfo?.about_text ||
                'Makanan yang diproses lalu dibekukan pada suhu rendah agar kandungan gizi dan rasanya tetap terjaga, tanpa perlu bahan pengawet berlebihan. Praktis disimpan, praktis dimasak — solusi cemilan untuk keluarga sehat dan bahagia.'}
            </p>
          </div>
        </div>
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
            <ProductGrid products={products} waLink={waLink} />
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
                    <span>{siteInfo.phone}</span>
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
          <div className="footer-strip">
            <span><IconTruck /> Pengiriman Cepat &amp; Aman</span>
            <span><IconSnowflake /> Tetap Beku Sampai Tujuan</span>
            <span><IconHeart /> Solusi Praktis Untuk Semua</span>
          </div>

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
                  <p style={{ margin: 0 }}>Telp/WA: {siteInfo.phone}</p>
                </div>
              )}
            </div>
            <div>
              <h4>Sosial Media</h4>
              <div className="socials-row">
                {socials.length === 0 && <p>-</p>}
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title={SOCIAL_LABELS[s.platform] || s.platform}
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                ))}
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
    </>
  );
}
