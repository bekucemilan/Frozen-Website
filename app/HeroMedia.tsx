'use client';

import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { useTheme } from './ThemeProvider';

type MediaType = 'none' | 'image' | 'video' | null;

function FallbackArt() {
  // dekorasi default kalau belum ada gambar/video hero yang diupload dari controller
  return (
    <div className="hero-media-fallback" aria-hidden="true">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11M8 4.5l4 3 4-3M8 19.5l4-3 4 3M2.5 9.5l4 2.5-4 2.5M21.5 9.5l-4 2.5 4 2.5" />
      </svg>
    </div>
  );
}

// Ambil file media lewat fetch (bukan <video>/<img src> langsung ke URL asli),
// lalu tampilkan lewat blob: URL sementara di browser. Ini bikin download
// manager (mis. IDM) yang biasanya "nangkep" video/gambar dari request
// jaringan langsung jadi gak ketemu file media aslinya di request halaman —
// karena yang dia lihat cuma request fetch biasa, bukan file media utuh.
// Kalau fetch gagal (mis. CORS), fallback ke URL asli biar media tetap tampil.
function useProtectedMediaSrc(url: string | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(null);
    if (!url) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('fetch gagal');
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(url);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return src;
}

function blockContextMenu(e: SyntheticEvent) {
  e.preventDefault();
}

export default function HeroMedia({
  dayType,
  dayUrl,
  nightType,
  nightUrl,
  mascotUrl,
  mascotWidth,
  mascotBottom,
  mascotRight,
}: {
  dayType: MediaType;
  dayUrl: string | null;
  nightType: MediaType;
  nightUrl: string | null;
  mascotUrl?: string | null;
  mascotWidth?: number | null;
  mascotBottom?: number | null;
  mascotRight?: number | null;
}) {
  const { theme } = useTheme();

  // hooks selalu dipanggil di urutan yang sama tiap render (gak boleh
  // ditaruh setelah early return), makanya dipanggil duluan di sini
  const protectedDayUrl = useProtectedMediaSrc(dayUrl);
  const protectedNightUrl = useProtectedMediaSrc(nightUrl);

  const hasDay = !!(dayType && dayType !== 'none' && dayUrl);
  const hasNight = !!(nightType && nightType !== 'none' && nightUrl);

  if (!hasDay && !hasNight) return <FallbackArt />;

  // ikuti tema situs (toggle di header): dark -> versi malam, light -> versi siang.
  // kalau salah satu belum diupload dari controller, tetap pakai yang tersedia.
  const wantNight = theme === 'dark';
  const showNight = wantNight ? hasNight : hasNight && !hasDay;

  function renderLayer(type: MediaType, protectedUrl: string | null, active: boolean) {
    if (type === 'none' || !type) return null;
    if (!protectedUrl) return null; // masih diambil lewat fetch, belum siap tampil
    const commonStyle: CSSProperties = { opacity: active ? 1 : 0 };
    if (type === 'video') {
      return (
        <video
          className="hero-media-layer"
          style={commonStyle}
          src={protectedUrl}
          autoPlay
          loop
          muted
          playsInline
          draggable={false}
          controlsList="nodownload noremoteplayback nofullscreen"
          disablePictureInPicture
          onContextMenu={blockContextMenu}
        />
      );
    }
    return (
      <img
        className="hero-media-layer"
        style={commonStyle}
        src={protectedUrl}
        alt=""
        draggable={false}
        onContextMenu={blockContextMenu}
      />
    );
  }

  return (
    <div className="hero-media-inner" onContextMenu={blockContextMenu}>
      {renderLayer(dayType, protectedDayUrl, hasDay && !showNight)}
      {renderLayer(nightType, protectedNightUrl, hasNight && showNight)}
      {/* Maskot (GIF/WebP transparan, looping): elemen "stiker" dengan
         ukuran & posisi manual (persen dari box), BUKAN full-cover —
         supaya rasio aslinya kejaga (gak ke-stretch) dan komposisinya
         (mis. penguin di depan freezer, pojok kanan bawah) tetap sama
         persis di semua ukuran layar, karena persen ikut scale bareng
         box-nya. Tampil di mode siang & malam, gak ikut fade siang/malam. */}
      {mascotUrl && (
        <div
          className="hero-mascot-wrap"
          style={{
            width: `${mascotWidth ?? 38}%`,
            bottom: `${mascotBottom ?? 4}%`,
            right: `${mascotRight ?? 8}%`,
          }}
        >
          {/\.(webm|mp4)(\?|$)/i.test(mascotUrl) ? (
            <video className="hero-mascot-img" src={mascotUrl} autoPlay loop muted playsInline draggable={false} onContextMenu={blockContextMenu} />
          ) : (
            <img className="hero-mascot-img" src={mascotUrl} alt="" draggable={false} onContextMenu={blockContextMenu} />
          )}
        </div>
      )}
      <div className="hero-media-overlay" />
    </div>
  );
}
