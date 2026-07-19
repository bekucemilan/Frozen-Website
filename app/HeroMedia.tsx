'use client';

import { type CSSProperties } from 'react';
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

export default function HeroMedia({
  dayType,
  dayUrl,
  nightType,
  nightUrl,
  mascotUrl,
}: {
  dayType: MediaType;
  dayUrl: string | null;
  nightType: MediaType;
  nightUrl: string | null;
  mascotUrl?: string | null;
}) {
  const { theme } = useTheme();
  const hasDay = !!(dayType && dayType !== 'none' && dayUrl);
  const hasNight = !!(nightType && nightType !== 'none' && nightUrl);

  if (!hasDay && !hasNight) return <FallbackArt />;

  // ikuti tema situs (toggle di header): dark -> versi malam, light -> versi siang.
  // kalau salah satu belum diupload dari controller, tetap pakai yang tersedia.
  const wantNight = theme === 'dark';
  const showNight = wantNight ? hasNight : hasNight && !hasDay;

  function renderLayer(type: MediaType, url: string | null, active: boolean) {
    if (!url || type === 'none') return null;
    const commonStyle: CSSProperties = { opacity: active ? 1 : 0 };
    if (type === 'video') {
      return <video className="hero-media-layer" style={commonStyle} src={url} autoPlay loop muted playsInline />;
    }
    return <img className="hero-media-layer" style={commonStyle} src={url} alt="" />;
  }

  return (
    <div className="hero-media-inner">
      {renderLayer(dayType, dayUrl, hasDay && !showNight)}
      {renderLayer(nightType, nightUrl, hasNight && showNight)}
      {/* Maskot (GIF/WebP transparan, looping): full-canvas + object-fit:cover
         sama persis kayak layer foto di atas, sengaja BUKAN elemen posisi
         manual — supaya crop-nya ikut identik di tiap breakpoint dan
         posisinya relatif terhadap adegan (lantai/freezer) gak pernah geser.
         Tampil di mode siang & malam, gak ikut fade siang/malam. */}
      {mascotUrl && (
        <img className="hero-media-layer hero-mascot-layer" src={mascotUrl} alt="" />
      )}
      <div className="hero-media-overlay" />
    </div>
  );
}
