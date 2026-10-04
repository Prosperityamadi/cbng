import type { Metadata } from 'next';
import './globals.css';
import { SITE_CONFIG } from '@/core';
import { TopNavbar, TopUtilityBar } from '@/components/navigation';

export const metadata: Metadata = {
  title: `${SITE_CONFIG.brand.name} | ${SITE_CONFIG.brand.tagline}`,
  description: `Official portal for ${SITE_CONFIG.brand.name}. Modern private banking, high-yield savings accounts, and corporate financial solutions.`,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-roboto bg-white text-[#1A1818]" suppressHydrationWarning>
        {/* Very Top Utility Navigation Bar (Looking, Branch locator, FAQs, Search, Language) */}
        <TopUtilityBar />

        {/* Global Main Navigation Bar (Brand logo block, Nav links, Action buttons, Updates ticker) */}
        <TopNavbar />

        {/* Route Page Content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
