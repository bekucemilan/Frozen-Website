'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';

const DISMISS_KEY = 'cb-pwa-dismissed-at';
const DISMISS_DAYS = 14; // kalau ditutup, jangan muncul lagi selama ini biar gak nyebelin

function IconDownload(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 19h16" />
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
function IconShare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}
function IconSquarePlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_DAYS;
  } catch {
    return false;
  }
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Udah keinstall & lagi dibuka dari homescreen (mode standalone) -> gak
    // perlu nawarin lagi.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    if (isDismissedRecently()) return;

    const ua = navigator.userAgent || '';
    const iOS = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(iOS);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS gak punya event beforeinstallprompt sama sekali, jadi munculin
    // pill-nya langsung (tapi tetap nunggu sedikit biar gak keliatan pas
    // halaman baru kebuka).
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (iOS) {
      timer = setTimeout(() => setVisible(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIOSSteps(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // abaikan kalau storage gak bisa dipakai
    }
  }

  async function handleInstallClick() {
    if (isIOS) {
      setShowIOSSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <>
      <div className="pwa-pill">
        <div className="pwa-pill-icon"><IconDownload style={{ width: 16, height: 16 }} /></div>
        <span>Instal app Cemilan Beku, buka lebih cepat lain kali</span>
        <button type="button" className="pwa-pill-cta" onClick={handleInstallClick}>
          Instal
        </button>
        <button type="button" className="pwa-pill-close" onClick={dismiss} aria-label="Tutup">
          <IconClose style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {showIOSSteps && (
        <div className="modal-backdrop" onClick={() => setShowIOSSteps(false)}>
          <div className="pwa-ios-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowIOSSteps(false)} aria-label="Tutup">
              <IconClose />
            </button>
            <h3>Cara Instal di iPhone/iPad</h3>
            <ol className="pwa-ios-steps">
              <li>
                <span className="pwa-ios-step-icon"><IconShare /></span>
                Tap tombol <b>Share</b> (kotak dengan panah ke atas) di bar Safari
              </li>
              <li>
                <span className="pwa-ios-step-icon"><IconSquarePlus /></span>
                Scroll lalu pilih <b>&quot;Add to Home Screen&quot;</b>
              </li>
              <li>
                <span className="pwa-ios-step-icon"><IconDownload /></span>
                Tap <b>&quot;Add&quot;</b> — ikon Cemilan Beku langsung muncul di layar utama
              </li>
            </ol>
            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={dismiss}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
