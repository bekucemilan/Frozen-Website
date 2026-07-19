import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'Cemilan Beku — Frozen Food Berkualitas',
  description: 'Frozen food berkualitas, siap masak kapan saja. Segar, praktis, dan terpercaya untuk keluarga Anda.',
  icons: { icon: '/logo.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06213c',
};

// dijalankan sebelum React hydrate, biar gak ada "kedipan" tema salah
// (misalnya sekilas kelihatan light padahal user sudah pilih dark)
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('cb-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
