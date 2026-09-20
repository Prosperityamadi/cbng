'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { FooterSection } from '@/components/home/FooterSection';
import { LoansSection } from '@/components/loans';

export default function LoansPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Matches user screenshot)
             - Background Photography with Grayscale & Contrast
             - Overlapping White Card with Crimson Top Border: "Loan"
             - Breadcrumbs on the right: "Home > Loan"
          ========================================================================= */}
      <section className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#1A1818] overflow-hidden">
        {/* Background Photography with Grayscale & Contrast */}
        <div className="absolute inset-0 z-0">
          <Image
            src={ASSETS.images.customerRep}
            alt="NemiCapital Bank Loan Customer Support"
            fill
            priority
            unoptimized
            className="object-cover object-[center_35%] grayscale contrast-[115%] brightness-[85%]"
          />
          {/* Dark Atmospheric Gradient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/75" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Content Container aligned at the bottom */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end justify-between">
          
          {/* Overlapping White Box with Crimson Top Border: "Loan" */}
          <div className="bg-white border-t-4 border-[#B81446] px-6 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-5 shadow-2xl relative -mb-5 sm:-mb-6 z-20">
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1A1818] tracking-tight leading-none whitespace-nowrap">
              Loan
            </h1>
          </div>

          {/* Breadcrumbs on the bottom right */}
          <div className="hidden sm:flex items-center gap-2 pb-4 text-xs sm:text-sm font-medium text-white/90">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40">&gt;</span>
            <span className="text-white font-semibold">Loan</span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. LOANS SECTION
             - 5 Loan Types Selector & Details (Home, Vehicles, Personal, Business, Gold)
             - Explore And Apply Now 3-step workflow
             - Send Your Request & Get Call Back Form with smiling man
             - Corporate Partnership with logos
          ========================================================================= */}
      <LoansSection />

      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
