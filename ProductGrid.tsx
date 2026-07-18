'use client';

import { useState, type CSSProperties } from 'react';

type MediaType = 'none' | 'image' | 'video' | null;

export default function HeroMedia({
  dayType,
  dayUrl,
  nightType,
  nightUrl,
}: {
  dayType: MediaType;
  dayUrl: string | null;
  nightType: MediaType;
  nightUrl: string | null;
}) {
  const hasDay = !!(dayType && dayType !== 'none' && dayUrl);
  const hasNight = !!(nightType && nightType !== 'none' && nightUrl);

  // kalau cuma satu mode yang punya media, itu yang tampil terus (tanpa toggle)
  // kalau dua-duanya ada, mulai dari mode malam (biar konsisten dengan tema "beku")
  const [isNight, setIsNight] = useState(hasNight);

  if (!hasDay && !hasNight) return null; // belum ada media, biarkan hero pakai gradient default

  function renderLayer(type: MediaType, url: string | null, active: boolean) {
    if (!url || type === 'none') return null;
    const commonStyle: CSSProperties = {
      opacity: active ? 1 : 0,
    };
    if (type === 'video') {
      return (
        <video
          className="hero-media-layer"
          style={commonStyle}
          src={url}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    return (
      <img
        className="hero-media-layer"
        style={commonStyle}
        src={url}
        alt=""
      />
    );
  }

  return (
    <div className="hero-media-wrap">
      {renderLayer(dayType, dayUrl, hasDay && !isNight)}
      {renderLayer(nightType, nightUrl, hasNight && isNight)}
      <div className="hero-media-overlay" />
      {hasDay && hasNight && (
        <button
          type="button"
          className="hero-toggle"
          aria-label={isNight ? 'Ganti ke mode siang' : 'Ganti ke mode malam'}
          onClick={() => setIsNight((v) => !v)}
        >
          <span className={'hero-toggle-icon' + (!isNight ? ' is-active' : '')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className={'hero-toggle-icon' + (isNight ? ' is-active' : '')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
