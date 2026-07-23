import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import ThemeProvider from './ThemeProvider';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import InstallPWA from './InstallPWA';
import { SITE_URL } from '@/lib/site-config';

// next/font: font di-download & di-hosting sendiri saat build (bukan request
// live ke Google Fonts tiap kunjungan), otomatis self-host + no layout shift +
// no render-blocking request — jauh lebih cepat dari @import di CSS.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-plus-jakarta', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Cemilan Beku — Frozen Food Berkualitas',
  description: 'Frozen food berkualitas, siap masak kapan saja. Segar, praktis, dan terpercaya untuk keluarga Anda.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cemilan Beku',
  },
  openGraph: {
    title: 'Cemilan Beku — Frozen Food Berkualitas',
    description: 'Frozen food berkualitas, siap masak kapan saja. Segar, praktis, dan terpercaya untuk keluarga Anda.',
    url: SITE_URL,
    siteName: 'Cemilan Beku',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Cemilan Beku' }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cemilan Beku — Frozen Food Berkualitas',
    description: 'Frozen food berkualitas, siap masak kapan saja.',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06213c',
};

// dijalankan sebelum React hydrate, biar gak ada "kedipan" tema salah
// (misalnya sekilas kelihatan light padahal user sudah pilih dark)
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('cb-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

// Daftarin service worker biar web bisa di-install jadi app (PWA) di
// Android/iOS. Dijalankan setelah load, gak ganggu render pertama.
const SW_REGISTER_SCRIPT = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable} ${fraunces.variable}`}>
      <head>
        {/* Kasih tau browser eksplisit kalau situs ini support kedua tema.
           Tanpa ini, "force dark" / auto-dark Chrome Android suka
           nge-override warna tombol yang udah di-styling manual (mis.
           tombol "Instal" jadi putih-di-atas-putih & gak kebaca),
           walau warnanya udah di-set lewat CSS var --ice / !important. */}
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <InstallPWA />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
