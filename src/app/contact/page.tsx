import React from 'react';
import type { Metadata } from 'next';
import { SubpageHeroBanner } from '@/components/navigation';
import {
  SupportQueryCardSection,
  BranchMapLocatorSection,
} from '@/components/contact';
import { FooterSection } from '@/components/home/FooterSection';

export const metadata: Metadata = {
  title: 'Contact Us | NemiCapital International Bank',
  description:
    'Get in touch with NemiCapital International Bank. Reach out to customer care, direct support desks, and global wealth hubs worldwide.',
};

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Matches user screenshot 2)
             - Background Photography with Grayscale & High Contrast
             - Overlapping White Card with Crimson Top Border: "CONTACT US"
             - Breadcrumbs on the right: "Home > CONTACT US"
          ========================================================================= */}
      <SubpageHeroBanner
        title="CONTACT US"
        breadcrumbs={[
          { label: 'CONTACT US' },
        ]}
      />

      {/* =========================================================================
          2. CORE SUPPORT & COMPLAINTS SECTION (Exact Card BG Design from Screenshot)
             - Two-tone container: White left half + Warm Sand (#FAF7F2) right half
             - Left: "Get Support for any Queries or Complaints" + floating info card
             - Bottom Left: Crimson polygon corner "↓ Customer Care" + Social icons
             - Right: Name, Email Address, Ph. Num, Subject, Message, "Send A Message"
             - Dispatches directly to support@nemicapital.com
          ========================================================================= */}
      <SupportQueryCardSection />

      {/* =========================================================================
          3. BRANCH & ATM MAP LOCATOR SECTION (Grayscale Map Snapshot & Floating Detail Card)
             - Top dark search bar with BRANCH / ATM toggles and search input
             - Detailed branch card with ROUTING / BIC, ADDRESS, PHONE & EMAIL
             - Interactive location pin
          ========================================================================= */}
      <BranchMapLocatorSection />

      {/* Space between Map and Footer */}
      <div className="w-full h-16 sm:h-20 lg:h-24 bg-white" />


      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
