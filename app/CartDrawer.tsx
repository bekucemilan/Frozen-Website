'use client';

import type { SVGProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useCart, unitPriceForQty } from './CartContext';

function IconCart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
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
function IconMinus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}
function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
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

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

export function CartButton() {
  const { totalItems, open } = useCart();
  const [bump, setBump] = useState(false);
  const prevTotal = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotal.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  return (
    <button
      id="cart-icon-anchor"
      type="button"
      className={'cart-button' + (bump ? ' cart-bump' : '')}
      onClick={open}
      aria-label="Buka keranjang"
    >
      <IconCart />
      {totalItems > 0 && <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
    </button>
  );
}

export function CartDrawer({ waLink }: { waLink: string | null }) {
  const { items, isOpen, close, removeItem, setQty, totalPrice, clear, restoreItems, showToast } = useCart();

  function buildWhatsAppMessage(): string {
    const lines = items.map((it) => {
      const unit = unitPriceForQty(it.basePrice, it.tiers, it.qty);
      const lineTotal = unit * it.qty;
      const tierNote = unit < it.basePrice ? ' (harga grosir)' : '';
      return `- ${it.qty}x ${it.name} @ Rp ${formatPrice(unit)}${tierNote} = Rp ${formatPrice(lineTotal)}`;
    });
    return [
      'Halo, saya mau pesan:',
      '',
      ...lines,
      '',
      `Total: Rp ${formatPrice(totalPrice)}`,
    ].join('\n');
  }

  function checkoutUrl(): string | null {
    if (!waLink) return null;
    const text = encodeURIComponent(buildWhatsAppMessage());
    const sep = waLink.includes('?') ? '&' : '?';
    return waLink.startsWith('https://wa.me') || waLink.includes('api.whatsapp.com')
      ? `${waLink}${sep}text=${text}`
      : waLink;
  }

  if (!isOpen) return null;

  return (
    <div className="cart-backdrop" onClick={close}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-panel-header">
          <h3>Keranjang</h3>
          <button className="cart-panel-close" onClick={close} aria-label="Tutup keranjang">
            <IconClose />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <IconCart style={{ width: 36, height: 36 }} />
            <p>Keranjang masih kosong. Yuk pilih produk dulu.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((it) => {
                const unit = unitPriceForQty(it.basePrice, it.tiers, it.qty);
                const nextTier = it.tiers
                  .filter((t) => t.min_qty > it.qty)
                  .sort((a, b) => a.min_qty - b.min_qty)[0];
                return (
                  <div className="cart-item" key={it.id}>
                    <div className="cart-item-photo">
                      {it.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.photo} alt={it.name} />
                      ) : (
                        <div className="placeholder" />
                      )}
                    </div>
                    <div className="cart-item-info">
                      <b>{it.name}</b>
                      <span className="cart-item-price">
                        Rp {formatPrice(unit)} {unit < it.basePrice && <em>grosir</em>}
                      </span>
                      {nextTier && (
                        <span className="cart-item-hint">
                          Tambah {nextTier.min_qty - it.qty} lagi jadi Rp {formatPrice(nextTier.price)}/pcs
                        </span>
                      )}
                      <div className="cart-item-qty">
                        <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Kurangi">
                          <IconMinus style={{ width: 13, height: 13 }} />
                        </button>
                        <span>{it.qty}</span>
                        <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Tambah">
                          <IconPlus style={{ width: 13, height: 13 }} />
                        </button>
                        <button type="button" className="cart-item-remove" onClick={() => removeItem(it.id)} aria-label="Hapus">
                          <IconTrash style={{ width: 15, height: 15 }} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">Rp {formatPrice(unit * it.qty)}</div>
                  </div>
                );
              })}
            </div>

            <div className="cart-panel-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <b>Rp {formatPrice(totalPrice)}</b>
              </div>
              {checkoutUrl() ? (
                <a
                  href={checkoutUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary cart-checkout-btn"
                  onClick={() => {
                    const snapshot = items;
                    close();
                    clear();
                    showToast('Pesanan dibuka di WhatsApp — keranjang dikosongkan', {
                      actionLabel: 'Batalkan',
                      onAction: () => restoreItems(snapshot),
                    });
                  }}
                >
                  <IconWhatsapp /> Checkout via WhatsApp
                </a>
              ) : (
                <p className="cart-no-wa">Nomor WhatsApp toko belum diatur di controller.</p>
              )}
              <button
                type="button"
                className="cart-clear-btn"
                onClick={() => {
                  const snapshot = items;
                  clear();
                  showToast('Keranjang dikosongkan', {
                    actionLabel: 'Batalkan',
                    onAction: () => restoreItems(snapshot),
                  });
                }}
              >
                Kosongkan keranjang
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
