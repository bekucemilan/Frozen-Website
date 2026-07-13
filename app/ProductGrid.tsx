'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import { Product } from '@/lib/supabase';

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

function IconSnowflake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11" />
    </svg>
  );
}
function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function IconChevron(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 5l7 7-7 7" />
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
function IconChef(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 21h12M8 21v-6.3M16 21v-6.3" />
      <path d="M7 10.5c-1.8 0-3-1.4-2.7-3.1C4.6 6 5.8 5 7 5.3 7.4 3.4 9 2 11 2h2c2 0 3.6 1.4 4 3.3 1.2-.3 2.4.7 2.7 2.1.3 1.7-.9 3.1-2.7 3.1H7Z" />
      <path d="M6 10.5 6.6 14.7h10.8L18 10.5" />
    </svg>
  );
}

function getGallery(p: Product): string[] {
  if (p.photo_urls && p.photo_urls.length) return p.photo_urls;
  if (p.photo_url) return [p.photo_url];
  return [];
}

export default function ProductGrid({
  products,
  waLink,
  usageTitle,
  usageSubtitle,
  recipeTitle,
  recipeSubtitle,
}: {
  products: Product[];
  waLink: string | null;
  usageTitle: string;
  usageSubtitle: string;
  recipeTitle: string;
  recipeSubtitle: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const active = products.find((p) => p.id === activeId) || null;
  const gallery = active ? getGallery(active) : [];

  useEffect(() => {
    if (activeId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function openProduct(p: Product) {
    setActiveId(p.id);
    setImgIndex(0);
  }

  const orderLink = active && waLink
    ? (() => {
        const sep = waLink.includes('?') ? '&' : '?';
        const text = encodeURIComponent(`Halo, saya mau pesan: ${active.name} (Rp ${formatPrice(active.price)})`);
        return waLink.startsWith('https://wa.me') || waLink.includes('api.whatsapp.com')
          ? `${waLink}${sep}text=${text}`
          : waLink;
      })()
    : waLink;

  return (
    <>
      <div className="product-grid">
        {products.map((p) => {
          const cover = getGallery(p)[0];
          return (
            <button
              type="button"
              className="product-card"
              key={p.id}
              onClick={() => openProduct(p)}
              aria-label={`Lihat detail ${p.name}`}
            >
              <div className="product-photo">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={p.name} />
                ) : (
                  <div className="placeholder"><IconSnowflake style={{ width: 36, height: 36 }} /></div>
                )}
                {getGallery(p).length > 1 && (
                  <span className="product-photo-count">+{getGallery(p).length - 1} foto</span>
                )}
              </div>
              <div className="product-body">
                {p.category && <div className="product-cat">{p.category}</div>}
                <h3>{p.name}</h3>
                {p.description && <p>{p.description}</p>}
                {p.usage_info && <div className="product-usage">{p.usage_info}</div>}
                <div className="product-price">Rp {formatPrice(p.price)}</div>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActiveId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveId(null)} aria-label="Tutup">
              <IconClose />
            </button>

            <div className="modal-gallery">
              {gallery.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gallery[imgIndex]} alt={active.name} className="modal-main-img" />
              ) : (
                <div className="placeholder" style={{ height: '100%' }}><IconSnowflake style={{ width: 48, height: 48 }} /></div>
              )}
              {gallery.length > 1 && (
                <>
                  <button
                    className="modal-nav modal-nav-prev"
                    onClick={() => setImgIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                    aria-label="Foto sebelumnya"
                  >
                    <IconChevron style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button
                    className="modal-nav modal-nav-next"
                    onClick={() => setImgIndex((i) => (i + 1) % gallery.length)}
                    aria-label="Foto berikutnya"
                  >
                    <IconChevron />
                  </button>
                  <div className="modal-thumbs">
                    {gallery.map((g, i) => (
                      <button
                        key={g + i}
                        className={'modal-thumb' + (i === imgIndex ? ' active' : '')}
                        onClick={() => setImgIndex(i)}
                        aria-label={`Foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g} alt="" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-body">
              {active.category && <div className="product-cat">{active.category}</div>}
              <h2>{active.name}</h2>
              <div className="modal-price">Rp {formatPrice(active.price)}</div>

              {active.description && (
                <div className="modal-section">
                  <p>{active.description}</p>
                </div>
              )}

              {active.usage_info && (
                <div className="modal-section modal-section-box">
                  <h4><IconSnowflake style={{ width: 15, height: 15 }} /> {usageTitle}</h4>
                  {usageSubtitle && <p className="section-subtitle">{usageSubtitle}</p>}
                  <p>{active.usage_info}</p>
                </div>
              )}

              {active.recipe && (
                <div className="modal-section modal-section-box recipe">
                  <h4><IconChef style={{ width: 15, height: 15 }} /> {recipeTitle}</h4>
                  {recipeSubtitle && <p className="section-subtitle">{recipeSubtitle}</p>}
                  <p style={{ whiteSpace: 'pre-line' }}>{active.recipe}</p>
                  {active.recipe_source && (
                    <p className="recipe-source">Sumber: {active.recipe_source}</p>
                  )}
                </div>
              )}

              {orderLink && (
                <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-order-btn">
                  <IconWhatsapp /> Pesan Produk Ini
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
