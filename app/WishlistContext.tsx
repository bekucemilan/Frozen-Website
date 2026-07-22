'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type WishlistContextValue = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = 'cb-wishlist-v1';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Disimpan per-device lewat localStorage — bukan akun/login, jadi tiap
  // browser/HP punya daftar favoritnya sendiri-sendiri, gak nyampur ke
  // pengunjung lain.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // localStorage gak tersedia / data korup -> mulai kosong
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage penuh/diblokir -> abaikan, tetap jalan di memori
    }
  }, [ids, hydrated]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  // Toggle nge-update 2 hal: (1) daftar favorit PERSONAL di device ini
  // (localStorage, buat filter "Favorit Saya" & biar tombol hati kelihatan
  // aktif/enggak), dan (2) angka suka PUBLIK di database lewat fungsi
  // toggle_product_like — ini yang bikin totalnya kelihatan sama ke SEMUA
  // pengunjung, bukan cuma kelihatan di device sendiri. Karena ini toggle
  // (bukan penghitung klik), spam klik di 1 device cuma geser antara +1/-1,
  // gak bisa numpuk jadi ratusan.
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const wasLiked = prev.includes(id);
      const next = wasLiked ? prev.filter((x) => x !== id) : [...prev, id];
      supabase.rpc('toggle_product_like', { p_id: id, p_increment: !wasLiked }).then(({ error }) => {
        if (error) console.error('Gagal update jumlah suka:', error.message);
      });
      return next;
    });
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, has, toggle, count: ids.length }),
    [ids, has, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
