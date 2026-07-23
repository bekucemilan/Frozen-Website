'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import { Promo } from '@/lib/supabase';

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
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
function IconWhatsapp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.44 5.13L2 22l5.13-1.55a9.85 9.85 0 0 0 4.9 1.31h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.64-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .9 2.14.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.93.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
    </svg>
  );
}

/** Sisa waktu jadi teks singkat "2h 4j 12m" — dihitung dari tanggal
 *  ends_at yang asli, bukan angka karangan, jadi countdown-nya jujur. */
function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return 'Berakhir';
  const totalMin = Math.floor(msLeft / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}h ${hours}j lagi`;
  if (hours > 0) return `${hours}j ${mins}m lagi`;
  return `${mins}m lagi`;
}

function PromoCountdown({ endsAt, now }: { endsAt: string; now: number }) {
  const msLeft = new Date(endsAt).getTime() - now;
  return (
    <span className="promo-countdown">
      <IconClock /> {formatCountdown(msLeft)}
    </span>
  );
}

export default function PromoSection({ promos, waLink }: { promos: Promo[]; waLink: string | null }) {
  // Satu timer aja buat semua kartu promo (bukan 1 timer per kartu) — lebih
  // ringan, dan cuma jalan pas tab lagi dibuka (visibilitychange) biar gak
  // buang-buang proses pas tab di-minimize/pindah tab.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    function start() {
      if (id) return;
      id = setInterval(() => setNow(Date.now()), 30000);
    }
    function stop() {
      if (id) { clearInterval(id); id = undefined; }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') { setNow(Date.now()); start(); } else stop();
    }
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  // Sudah difilter tanggal aktif lewat query, tapi jaga-jaga kalau sesi
  // terbuka lama sampai lewat ends_at, sembunyikan juga di sisi client.
  const activePromos = promos.filter((p) => new Date(p.ends_at).getTime() > now);

  if (activePromos.length === 0) return null;

  return (
    <section className="promos-section">
      <div className="wrap">
        <div className="section-title">
          <h2>Promo Minggu Ini</h2>
          <span>{activePromos.length} promo aktif</span>
        </div>
        <div className="promo-scroll">
          {activePromos.map((promo) => {
            const product = promo.products;
            if (!product) return null;
            const photo = (product.photo_urls && product.photo_urls[0]) || product.photo_url;
            const orderLink = waLink
              ? (() => {
                  const sep = waLink.includes('?') ? '&' : '?';
                  const text = encodeURIComponent(
                    `Halo, saya mau pesan promo: ${product.name} — Rp ${formatPrice(promo.promo_price)}`
                  );
                  return waLink.startsWith('https://wa.me') || waLink.includes('api.whatsapp.com')
                    ? `${waLink}${sep}text=${text}`
                    : waLink;
                })()
              : null;
            return (
              <div className="promo-card" key={promo.id}>
                <div className="promo-card-photo">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={product.name} />
                  ) : (
                    <div className="placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <IconSnowflake style={{ width: 32, height: 32, color: 'var(--ice-soft)' }} />
                    </div>
                  )}
                  <span className="promo-card-badge">{promo.label?.trim() || 'Promo'}</span>
                </div>
                <div className="promo-card-body">
                  <h3>{product.name}</h3>
                  <div className="promo-price-row">
                    <span className="promo-price-old">Rp {formatPrice(product.price)}</span>
                    <span className="promo-price-new">Rp {formatPrice(promo.promo_price)}</span>
                  </div>
                  <PromoCountdown endsAt={promo.ends_at} now={now} />
                  {orderLink && (
                    <a href={orderLink} target="_blank" rel="noopener noreferrer" className="promo-card-cta">
                      <IconWhatsapp /> Pesan Sekarang
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
