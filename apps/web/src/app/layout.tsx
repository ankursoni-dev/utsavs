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
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Utsavs — From Chaos to Command',
  description:
    'Manage guests, budgets, vendors, logistics, and shagun from one command center. Built for wedding organizers and host families.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="bg-bg text-text min-h-screen">{children}</body>
    </html>
  );
}
