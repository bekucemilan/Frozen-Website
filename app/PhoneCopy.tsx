'use client';

import { useState } from 'react';

/** Nomor telepon yang bisa diklik untuk disalin ke clipboard device user.
 *  `display` = teks yang tampil (format lokal 08xx biar familiar dibaca),
 *  `copyValue` = teks yang benar-benar disalin ke clipboard. */
export default function PhoneCopy({
  display,
  copyValue,
  className,
}: {
  display: string;
  copyValue: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(copyValue);
      } else {
        throw new Error('clipboard API tidak tersedia');
      }
    } catch {
      // fallback untuk browser lama / konteks non-https
      const textarea = document.createElement('textarea');
      textarea.value = copyValue;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        // kalau semua cara gagal, biarkan saja — nomornya tetap kelihatan
      }
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className={'phone-copy' + (className ? ' ' + className : '')}
      onClick={handleCopy}
      title="Klik untuk salin nomor"
    >
      <span>{display}</span>
      <span className={'phone-copy-feedback' + (copied ? ' show' : '')} aria-live="polite">
        {copied ? 'Disalin ✓' : ''}
      </span>
    </button>
  );
}
