'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [query, setQuery] = useState('');
  const active = products.find((p) => p.id === activeId) || null;
  const gallery = active ? getGallery(active) : [];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => (p.tags || []).forEach((t) => t && set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [products]);

  const tokens = useMemo(() => parseQuery(query), [query]);
  const filtered = useMemo(
    () => products.filter((p) => matchesProduct(p, tokens)),
    [products, tokens]
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
      <div className="product-search">
        <div className="product-search-input">
          <IconSearch />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Cari produk... coba "nugget", tag:pedas, kat:sosis, <20000'
            aria-label="Cari produk"
          />
          {query && (
            <button type="button" className="product-search-clear" onClick={() => setQuery('')} aria-label="Bersihkan pencarian">
              <IconClose style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <div className="product-tags-row">
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
      )}

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
