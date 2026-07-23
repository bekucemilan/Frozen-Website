'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SVGProps } from 'react';
import { Product } from '@/lib/supabase';
import { useCart, unitPriceForQty } from './CartContext';
import { useWishlist } from './WishlistContext';

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
function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
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

function IconCartPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
      <path d="M15.5 9.5v4M13.5 11.5h4" />
    </svg>
  );
}

function IconHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20s-7.5-4.6-9.6-9.2C1.1 7.4 3 4.3 6.3 4.3c2 0 3.3 1 5.7 3.4 2.4-2.4 3.7-3.4 5.7-3.4 3.3 0 5.2 3.1 3.9 6.5C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

function IconShare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="M8.3 10.7 15.7 6.3M8.3 13.3l7.4 4.4" />
    </svg>
  );
}

function getGallery(p: Product): string[] {
  if (p.photo_urls && p.photo_urls.length) return p.photo_urls;
  if (p.photo_url) return [p.photo_url];
  return [];
}

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase();
}

/* Pencarian "expert": mendukung
   - kata biasa (bisa lebih dari satu, semua harus cocok — AND)
   - "frasa dalam kutip" (dicocokkan sebagai satu kesatuan)
   - tag:namatag  atau  #namatag  -> cari khusus di tags
   - kategori:namakategori  atau  kat:...  -> cari khusus di category
   - <angka  -> harga maksimum
   - >angka  -> harga minimum
   Semua token digabung dengan logika AND (semua syarat harus terpenuhi). */
type ParsedToken =
  | { type: 'text'; value: string }
  | { type: 'tag'; value: string }
  | { type: 'category'; value: string }
  | { type: 'maxPrice'; value: number }
  | { type: 'minPrice'; value: number };

function parseQuery(raw: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const chunk = (m[1] ?? m[2] ?? '').trim();
    if (!chunk) continue;
    const lower = chunk.toLowerCase();
    if (lower.startsWith('tag:') || lower.startsWith('#')) {
      const value = chunk.replace(/^tag:|^#/i, '').trim();
      if (value) tokens.push({ type: 'tag', value: value.toLowerCase() });
      continue;
    }
    if (lower.startsWith('kategori:') || lower.startsWith('kat:') || lower.startsWith('category:')) {
      const value = chunk.replace(/^kategori:|^kat:|^category:/i, '').trim();
      if (value) tokens.push({ type: 'category', value: value.toLowerCase() });
      continue;
    }
    if (/^<\d+(\.\d+)?$/.test(chunk)) {
      tokens.push({ type: 'maxPrice', value: Number(chunk.slice(1)) });
      continue;
    }
    if (/^>\d+(\.\d+)?$/.test(chunk)) {
      tokens.push({ type: 'minPrice', value: Number(chunk.slice(1)) });
      continue;
    }
    tokens.push({ type: 'text', value: lower });
  }
  return tokens;
}

function matchesProduct(p: Product, tokens: ParsedToken[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = [p.name, p.description, p.category, p.usage_info, ...(p.tags || [])]
    .map(norm)
    .join(' \u0000 ');
  const tags = (p.tags || []).map(norm);

  return tokens.every((t) => {
    switch (t.type) {
      case 'text':
        return haystack.includes(t.value);
      case 'tag':
        return tags.some((tag) => tag.includes(t.value));
      case 'category':
        return norm(p.category).includes(t.value);
      case 'maxPrice':
        return p.price <= t.value;
      case 'minPrice':
        return p.price >= t.value;
      default:
        return true;
    }
  });
}

type PromoInfo = { promo_price: number; ends_at: string; label: string | null };

export default function ProductGrid({
  products,
  waLink,
  usageTitle,
  usageSubtitle,
  recipeTitle,
  recipeSubtitle,
  promoMap,
  siteUrl,
  storeName,
}: {
  products: Product[];
  waLink: string | null;
  usageTitle: string;
  usageSubtitle: string;
  recipeTitle: string;
  recipeSubtitle: string;
  promoMap?: Record<string, PromoInfo>;
  siteUrl?: string;
  storeName?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [modalQty, setModalQty] = useState(1);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const { addItem, flyToCart, showToast, open: openCart } = useCart();
  const { has: isWishlisted, toggle: toggleWishlist, count: wishlistCount } = useWishlist();
  const active = products.find((p) => p.id === activeId) || null;
  const gallery = active ? getGallery(active) : [];

  /* Kalau produk lagi promo, harga promo dipakai sebagai harga efektif
     (buat keranjang & pesan WA) dan tier grosir diabaikan sementara —
     harga coret tetap nampilin harga normal aslinya. */
  function effectiveProduct(p: Product): Product {
    const promo = promoMap?.[p.id];
    if (!promo) return p;
    return { ...p, price: promo.promo_price, wholesale_tiers: [] };
  }

  function shareProduct(p: Product) {
    const url = siteUrl ? `${siteUrl}/#produk` : (typeof window !== 'undefined' ? window.location.href : '');
    const priceText = `Rp ${formatPrice(promoMap?.[p.id]?.promo_price ?? p.price)}`;
    const shareText = `${p.name} — ${priceText} di ${storeName || 'Cemilan Beku'}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: p.name, text: shareText, url }).catch(() => {});
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${url}`).then(
        () => showToast('Link produk disalin, siap dibagikan'),
        () => showToast('Gagal menyalin link')
      );
    }
  }

  /* Jumlah suka itu PUBLIK (tersimpan di database, kelihatan sama ke semua
     pengunjung) — p.likes_count datang dari server pas halaman dimuat.
     likeDelta cuma buat update tampilan LANGSUNG pas diklik di sesi ini
     (biar ga perlu reload halaman buat lihat angkanya berubah), sementara
     WishlistContext.toggle yang beneran ngirim perubahannya ke database. */
  function handleLike(id: string) {
    const wasLiked = isWishlisted(id);
    toggleWishlist(id);
    setLikeDelta((prev) => ({ ...prev, [id]: (prev[id] || 0) + (wasLiked ? -1 : 1) }));
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => (p.tags || []).forEach((t) => t && set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [products]);

  const tokens = useMemo(() => parseQuery(query), [query]);
  const filtered = useMemo(
    () =>
      products
        .filter((p) => matchesProduct(p, tokens))
        .filter((p) => !wishlistOnly || isWishlisted(p.id)),
    [products, tokens, wishlistOnly, isWishlisted]
  );

  const activeTagSet = useMemo(() => {
    const set = new Set<string>();
    tokens.forEach((t) => { if (t.type === 'tag') set.add(t.value); });
    return set;
  }, [tokens]);

  function toggleTag(tag: string) {
    const lower = tag.toLowerCase();
    if (activeTagSet.has(lower)) {
      // buang token tag: ini dari query (cocokkan tag:xxx atau #xxx, case-insensitive)
      const re = new RegExp(`(^|\\s)(tag:|#)${lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
      setQuery((q) => q.replace(re, ' ').replace(/\s+/g, ' ').trim());
    } else {
      setQuery((q) => (q.trim() ? `${q.trim()} #${tag}` : `#${tag}`));
    }
  }

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
    setModalQty(1);
  }

  const orderLink = active && waLink
    ? (() => {
        const promo = promoMap?.[active.id];
        const effTiers = promo ? [] : (active.wholesale_tiers || []);
        const unit = promo ? promo.promo_price : unitPriceForQty(active.price, effTiers, modalQty);
        const sep = waLink.includes('?') ? '&' : '?';
        const text = encodeURIComponent(
          `Halo, saya mau pesan: ${modalQty}x ${active.name} @ Rp ${formatPrice(unit)} = Rp ${formatPrice(unit * modalQty)}`
        );
        return waLink.startsWith('https://wa.me') || waLink.includes('api.whatsapp.com')
          ? `${waLink}${sep}text=${text}`
          : waLink;
      })()
    : waLink;

  return (
    <>
      <div className="product-search">
        <div className="product-search-input">
          <IconSearch />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk apapun, termurah, terlengkap hanya di Cemilan Beku"
            aria-label="Cari produk"
          />
          {query && (
            <button type="button" className="product-search-clear" onClick={() => setQuery('')} aria-label="Bersihkan pencarian">
              <IconClose style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
        {(allTags.length > 0 || wishlistCount > 0) && (
          <div className="product-tags-row">
            {wishlistCount > 0 && (
              <button
                type="button"
                className={'wishlist-filter-chip' + (wishlistOnly ? ' active' : '')}
                onClick={() => setWishlistOnly((v) => !v)}
              >
                <IconHeart style={wishlistOnly ? { fill: 'white' } : undefined} /> Favorit Saya ({wishlistCount})
              </button>
            )}
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={'tag-chip' + (activeTagSet.has(tag.toLowerCase()) ? ' active' : '')}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="product-search-empty">
          <IconSnowflake style={{ width: 32, height: 32 }} />
          <p>Tidak ada produk yang cocok dengan &quot;{query}&quot;.</p>
        </div>
      ) : (
      <div className="product-grid">
        {filtered.map((p) => {
          const cover = getGallery(p)[0];
          const promo = promoMap?.[p.id];
          const wishlisted = isWishlisted(p.id);
          const displayedLikes = (p.likes_count || 0) + (likeDelta[p.id] || 0);
          return (
            <div
              role="button"
              tabIndex={0}
              className="product-card"
              key={p.id}
              onClick={() => openProduct(p)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(p); } }}
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
                {promo && <span className="promo-card-badge">{promo.label?.trim() || 'Promo'}</span>}
                <span
                  role="button"
                  tabIndex={0}
                  className={'wishlist-heart-btn' + (wishlisted ? ' active' : '')}
                  onClick={(e) => { e.stopPropagation(); handleLike(p.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleLike(p.id); } }}
                  aria-label={wishlisted ? `Hapus ${p.name} dari favorit` : `Tambah ${p.name} ke favorit`}
                >
                  <IconHeart />
                  {displayedLikes > 0 && <span className="like-count">{displayedLikes}</span>}
                </span>
              </div>
              <div className="product-body">
                {p.category && <div className="product-cat">{p.category}</div>}
                <h3>{p.name}</h3>
                {p.weight_info && <div className="product-weight">{p.weight_info}</div>}
                {p.description && <p>{p.description}</p>}
                {p.usage_info && <div className="product-usage">{p.usage_info}</div>}
                <div className="product-price-row">
                  {promo ? (
                    <div>
                      <div className="promo-price-old" style={{ marginBottom: 2 }}>Rp {formatPrice(p.price)}</div>
                      <div className="product-price" style={{ borderTop: 'none', paddingTop: 0, color: 'var(--coral)' }}>
                        Rp {formatPrice(promo.promo_price)}
                      </div>
                    </div>
                  ) : (
                    <div className="product-price">Rp {formatPrice(p.price)}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="share-btn"
                      onClick={(e) => { e.stopPropagation(); shareProduct(p); }}
                      aria-label={`Bagikan ${p.name}`}
                    >
                      <IconShare />
                    </button>
                    <button
                      type="button"
                      className="product-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToCart(e.currentTarget);
                        addItem(effectiveProduct(p), 1);
                        showToast(`${p.name} ditambahkan ke keranjang`, { actionLabel: 'Lihat', onAction: openCart });
                      }}
                      aria-label={`Tambah ${p.name} ke keranjang`}
                    >
                      <IconCartPlus style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>
                {!promo && p.wholesale_tiers && p.wholesale_tiers.length > 0 && (
                  <div className="product-wholesale-hint">
                    Grosir mulai {p.wholesale_tiers[0].min_qty}pcs: Rp {formatPrice(p.wholesale_tiers[0].price)}/pcs
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {active && (
        <div className="modal-backdrop" onClick={() => setActiveId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveId(null)} aria-label="Tutup">
              <IconClose />
            </button>
            <button
              type="button"
              className={'modal-share-btn'}
              onClick={() => shareProduct(active)}
              aria-label={`Bagikan ${active.name}`}
            >
              <IconShare />
            </button>
            <button
              type="button"
              className={'modal-heart-btn' + (isWishlisted(active.id) ? ' active' : '')}
              onClick={() => handleLike(active.id)}
              aria-label={isWishlisted(active.id) ? `Hapus ${active.name} dari favorit` : `Tambah ${active.name} ke favorit`}
            >
              <IconHeart />
              {(active.likes_count || 0) + (likeDelta[active.id] || 0) > 0 && (
                <span className="like-count">{(active.likes_count || 0) + (likeDelta[active.id] || 0)}</span>
              )}
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
              {active.weight_info && <div className="product-weight" style={{ marginBottom: 8 }}>{active.weight_info}</div>}
              {promoMap?.[active.id] ? (
                <div className="modal-price" style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span className="promo-price-old" style={{ fontSize: 15 }}>Rp {formatPrice(active.price)}</span>
                  <span style={{ color: 'var(--coral)' }}>Rp {formatPrice(promoMap[active.id].promo_price)}</span>
                </div>
              ) : (
                <div className="modal-price">Rp {formatPrice(active.price)}</div>
              )}

              {!promoMap?.[active.id] && active.wholesale_tiers && active.wholesale_tiers.length > 0 && (
                <div className="modal-tiers">
                  <div className="modal-tiers-row modal-tiers-row-base">
                    <span>1 - {active.wholesale_tiers[0].min_qty - 1} pcs</span>
                    <b>Rp {formatPrice(active.price)}/pcs</b>
                  </div>
                  {active.wholesale_tiers.map((t, i) => {
                    const next = active.wholesale_tiers![i + 1];
                    return (
                      <div className="modal-tiers-row" key={t.min_qty}>
                        <span>{t.min_qty}{next ? ` - ${next.min_qty - 1}` : '+'} pcs</span>
                        <b>Rp {formatPrice(t.price)}/pcs</b>
                      </div>
                    );
                  })}
                </div>
              )}

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

              <div className="modal-qty-row">
                <span>Jumlah</span>
                <div className="modal-qty-stepper">
                  <button type="button" onClick={() => setModalQty((q) => Math.max(1, q - 1))} aria-label="Kurangi jumlah">−</button>
                  <span>{modalQty}</span>
                  <button type="button" onClick={() => setModalQty((q) => q + 1)} aria-label="Tambah jumlah">+</button>
                </div>
                <span className="modal-qty-subtotal">
                  Rp {formatPrice(
                    (promoMap?.[active.id]
                      ? promoMap[active.id].promo_price
                      : unitPriceForQty(active.price, active.wholesale_tiers || [], modalQty)) * modalQty
                  )}
                </span>
              </div>

              <div className="modal-order-actions">
                <button
                  type="button"
                  className="btn btn-outline modal-order-btn"
                  onClick={(e) => {
                    flyToCart(e.currentTarget);
                    addItem(effectiveProduct(active), modalQty);
                    showToast(`${active.name} ditambahkan ke keranjang`, { actionLabel: 'Lihat', onAction: openCart });
                    setActiveId(null);
                  }}
                >
                  <IconCartPlus /> Tambah ke Keranjang
                </button>
                {orderLink && (
                  <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary modal-order-btn">
                    <IconWhatsapp /> Pesan Langsung
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
