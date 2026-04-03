import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { constituencies } from '@/lib/data';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'Kerala Elections Dashboard',
    template: '%s — Kerala Elections Dashboard',
  },
  description:
    'Interactive dashboard analyzing Kerala election data across 6 elections covering all 140 assembly constituencies.',
  metadataBase: new URL('https://kerala-elections-dashboard.vercel.app'),
  openGraph: {
    title: 'Kerala Elections Dashboard',
    description:
      'Interactive dashboard analyzing Kerala election data across Assembly (2011, 2016, 2021) and Lok Sabha (2014, 2019, 2024) elections covering all 140 constituencies.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Kerala Elections Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerala Elections Dashboard',
    description:
      'Interactive dashboard analyzing Kerala election data across 6 elections covering 140 constituencies.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const constituencyNames = constituencies.map((c) => ({
  id: c.CONST_ID,
  name: c.CONSTITUENCY,
  district: c.DISTRICT,
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-body">
        <Header constituencyNames={constituencyNames} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
