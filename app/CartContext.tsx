'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Product } from '@/lib/supabase';

export type PriceTier = { min_qty: number; price: number };

export type CartItem = {
  id: string;
  name: string;
  category: string | null;
  photo: string | null;
  basePrice: number;
  tiers: PriceTier[];
  qty: number;
};

export type Toast = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  restoreItems: (snapshot: CartItem[]) => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  unitPriceFor: (item: CartItem) => number;
  /** Animasi kepingan salju "terbang" dari elemen sumber (tombol yang diklik)
   *  menuju icon keranjang di header. Murni visual, gak nyentuh state cart. */
  flyToCart: (originEl: HTMLElement | null) => void;
  showToast: (message: string, opts?: { actionLabel?: string; onAction?: () => void; duration?: number }) => void;
  dismissToast: (id: string) => void;
  toasts: Toast[];
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'cb-cart-v1';

/** SVG kepingan salju dipakai untuk animasi "terbang" ke keranjang —
 *  senada tema Cemilan Beku (bukan icon keranjang generik). */
const SNOWFLAKE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11"/>' +
  '<path d="M12 2 9.8 4.6M12 2l2.2 2.6M12 22l-2.2-2.6M12 22l2.2-2.6' +
  'M4.9 6.5 3 5.8M4.9 6.5l.5 2.3M19.1 6.5l1.9-.7M19.1 6.5l-.5 2.3' +
  'M4.9 17.5l-1.9.7M4.9 17.5l.5-2.3M19.1 17.5l1.9.7M19.1 17.5l-.5-2.3"/>' +
  '</svg>';

/* Harga satuan efektif untuk qty tertentu: cari tier dengan min_qty
   tertinggi yang masih <= qty. Kalau gak ada tier yang cocok, pakai
   harga normal (basePrice). */
export function unitPriceForQty(basePrice: number, tiers: PriceTier[], qty: number): number {
  if (!tiers || tiers.length === 0) return basePrice;
  const eligible = tiers.filter((t) => qty >= t.min_qty).sort((a, b) => b.min_qty - a.min_qty);
  return eligible.length > 0 ? eligible[0].price : basePrice;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage tidak tersedia / data korup -> mulai dari keranjang kosong
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage penuh/diblokir -> abaikan, keranjang tetap jalan di memori
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) => (it.id === product.id ? { ...it, qty: it.qty + qty } : it));
      }
      const photo = (product.photo_urls && product.photo_urls[0]) || product.photo_url || null;
      const tiers = (product.wholesale_tiers || []) as PriceTier[];
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          photo,
          basePrice: product.price,
          tiers,
          qty,
        },
      ];
    });
    // sengaja gak auto-buka drawer di sini — biar gak motong alur user yang
    // masih mau nambah produk lain. Feedback cukup lewat animasi + toast
    // yang dipicu di tempat tombol "tambah" diklik (lihat ProductGrid).
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.id !== id);
      return prev.map((it) => (it.id === id ? { ...it, qty } : it));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  /** Dipakai untuk fitur "Batalkan" di toast — mengembalikan isi keranjang
   *  ke snapshot sebelum di-clear. */
  const restoreItems = useCallback((snapshot: CartItem[]) => setItems(snapshot), []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, opts?: { actionLabel?: string; onAction?: () => void; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction }]);
      const duration = opts?.duration ?? (opts?.actionLabel ? 5000 : 2600);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  /** Animasi kepingan salju terbang dari tombol yang diklik ke icon
   *  keranjang di header. Dijalankan lewat DOM langsung (bukan React state)
   *  biar ringan dan gak perlu re-render tiap frame. */
  const flyToCart = useCallback((originEl: HTMLElement | null) => {
    if (typeof window === 'undefined' || !originEl) return;
    const targetEl = document.getElementById('cart-icon-anchor');
    if (!targetEl) return;

    const startRect = originEl.getBoundingClientRect();
    const endRect = targetEl.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;

    const flake = document.createElement('div');
    flake.className = 'fly-snowflake';
    flake.innerHTML = SNOWFLAKE_SVG;
    flake.style.transform = 'translate(-50%, -50%)';
    flake.style.left = `${startX}px`;
    flake.style.top = `${startY}px`;
    document.body.appendChild(flake);

    // Reduced-motion: langsung hilang tanpa animasi lompat-lompat
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      flake.remove();
      return;
    }

    const anim = flake.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
        {
          transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.45 - 70}px)) scale(1.15) rotate(140deg)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25) rotate(320deg)`,
          opacity: 0.15,
          offset: 1,
        },
      ],
      { duration: 700, easing: 'cubic-bezier(0.3, 0, 0.15, 1)' }
    );
    anim.onfinish = () => flake.remove();
    anim.oncancel = () => flake.remove();
  }, []);

  const unitPriceFor = useCallback((item: CartItem) => unitPriceForQty(item.basePrice, item.tiers, item.qty), []);

  const totalItems = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + unitPriceForQty(it.basePrice, it.tiers, it.qty) * it.qty, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    restoreItems,
    totalItems,
    totalPrice,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    unitPriceFor,
    flyToCart,
    showToast,
    dismissToast,
    toasts,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span>{t.message}</span>
            {t.actionLabel && t.onAction && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  t.onAction?.();
                  dismissToast(t.id);
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
