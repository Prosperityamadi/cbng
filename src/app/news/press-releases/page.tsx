'use client';

import React from 'react';
import { SubpageHeroBanner } from '@/components/navigation';
import { PressReleaseArticle, PressReleaseSidebar } from '@/components/news';
import { FooterSection } from '@/components/home/FooterSection';

export default function PressReleasesPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Matches user screenshot)
             - Background Photography with Grayscale & Contrast (Customer Support Rep with Headset)
             - Overlapping White Card with Crimson Top Border: "Press Release"
             - Breadcrumbs on the right: "Home > News > Press Release"
          ========================================================================= */}
      <SubpageHeroBanner
        title="Press Release"
        breadcrumbs={[
          { label: 'News', href: '/news' },
          { label: 'Press Release' },
        ]}
      />

      {/* =========================================================================
          2. PRESS RELEASE DETAIL & SIDEBAR LAYOUT
          ========================================================================= */}
      <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Main Article Column (approx 66%) */}
            <div className="lg:col-span-8">
              <PressReleaseArticle />
            </div>

            {/* Right Sidebar Column (approx 34%) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <PressReleaseSidebar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
