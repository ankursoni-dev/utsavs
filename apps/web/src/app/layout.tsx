import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Marcellus } from 'next/font/google';
import './globals.css';

const marcellus = Marcellus({
  variable: '--font-marcellus',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Utsavs — Your Wedding, Orchestrated',
  description:
    'A luxury event operating system for weddings. Editorial, jewel-toned, end-to-end.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-bg text-text min-h-full">{children}</body>
    </html>
  );
}
