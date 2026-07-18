import type { Metadata, Viewport } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
