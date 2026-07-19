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

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  unitPriceFor: (item: CartItem) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'cb-cart-v1';

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
    setIsOpen(true);
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
    totalItems,
    totalPrice,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    unitPriceFor,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
