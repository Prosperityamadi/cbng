'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { FooterSection, useInView } from '@/components/home';
import { BestCardsSection } from '@/components/cards/BestCardsSection';

export default function CardsPage() {
  const { ref: promoRef, isInView: isPromoInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <main className="w-full min-h-screen bg-white flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Matches user screenshot)
             - Customer support team image in grayscale
             - Dark atmospheric cinematic overlay
             - Overlapping white card with crimson top border: "Our Cards"
             - Breadcrumbs on the right: "Home > Our Cards"
          ========================================================================= */}
      <section className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#1A1818] z-20">
        {/* Background Photography with Grayscale & Contrast (clipped to section) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={ASSETS.images.customerRep}
            alt="NemiCapital Bank Customer Support"
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
          
          {/* Overlapping White Box with Crimson Top Border: "Our Cards" */}
          <div className="bg-white border-t-4 border-[#B81446] px-6 sm:px-10 md:px-12 pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-6 md:pb-6 shadow-2xl relative -mb-5 sm:-mb-6 z-30 animate-fadeInUp transition-all">
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1A1818] tracking-tight leading-snug pb-1 whitespace-nowrap block">
              Our Cards
            </h1>
          </div>

          {/* Breadcrumbs on the bottom right */}
          <div className="hidden sm:flex items-center gap-2 pb-4 text-xs sm:text-sm font-medium text-white/90 animate-fadeIn delay-200">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40">&gt;</span>
            <Link
              href="/services"
              className="text-white/80 hover:text-white transition-colors"
            >
              Services
            </Link>
            <span className="text-white/40">&gt;</span>
            <span className="text-white font-semibold">Our Cards</span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. CORPORATE CREDIT CARD PROMO BANNER (Matches user screenshot)
             - Scroll animation: Split origami collision reveal
               Left cream side slides from left, right crimson side slides from right,
               origami center facets unfold, and white laser slashes project.
          ========================================================================= */}
      <section ref={promoRef} className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="relative w-full bg-[#F8F3ED] shadow-xl border border-[#EDE5DB] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[420px]">
          
          {/* Left Column: Heading, Description & Action Button (Slides from left) */}
          <div
            className={`lg:col-span-7 xl:col-span-7 p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-center relative z-20 transition-all duration-800 ease-out ${
              isPromoInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            {/* Eyebrow */}
            <span className="font-poppins font-semibold text-xs sm:text-sm tracking-wider uppercase text-[#B81446]">
              Corporate Credit Card
            </span>

            {/* Heading */}
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] text-[#1A1818] tracking-tight leading-[1.18] mt-2.5 sm:mt-3">
              Higher Efficiencies &<br />
              Savings
            </h2>

            {/* Description */}
            <p className="font-roboto text-xs sm:text-sm text-[#736B65] leading-relaxed max-w-md mt-3.5 sm:mt-4">
              Rationally encounter consequences that are who loves or pursues desire.
            </p>

            {/* Apply Now Button */}
            <div className="mt-7 sm:mt-9">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#1A1818] hover:bg-[#B81446] hover:text-white font-poppins font-semibold text-xs tracking-wider uppercase shadow-md hover:shadow-xl transition-all duration-200 border border-[#E7DFD4]"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Right Column: Businessman with Credit Card & Geometric Accents (Slides from right) */}
          <div
            className={`lg:col-span-5 xl:col-span-5 relative bg-[#8E0B2F] min-h-[360px] sm:min-h-[420px] lg:min-h-full overflow-hidden flex items-end transition-all duration-800 ease-out ${
              isPromoInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Center Origami Facet Triangles Pattern (Unfolds and scales) */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-28 sm:w-36 pointer-events-none z-20 -translate-x-1/2 transition-all duration-1000 delay-300 ease-out ${
                isPromoInView ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-6'
              }`}
            >
              <svg viewBox="0 0 140 400" className="w-full h-full" preserveAspectRatio="none">
                <polygon points="0,80 70,30 70,130" fill="#FFCCD5" opacity="0.9" />
                <polygon points="70,30 140,80 70,130" fill="#F4728C" opacity="0.95" />
                <polygon points="0,130 70,180 0,230" fill="#FB7185" />
                <polygon points="70,130 140,180 70,230" fill="#E11D48" />
                <polygon points="0,230 70,280 0,330" fill="#BE123C" />
                <polygon points="70,230 140,280 70,330" fill="#9F1239" />
                <polygon points="0,330 70,370 0,400" fill="#881337" />
              </svg>
            </div>

            {/* Angled White Slash Lines on Far Right (Projects laser angle) */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-20 overflow-hidden transition-all duration-700 delay-450 ease-out ${
                isPromoInView ? 'opacity-90 translate-x-0 translate-y-0' : 'opacity-0 translate-x-8 -translate-y-8'
              }`}
            >
              <div className="absolute -right-6 top-16 w-3.5 h-64 bg-white rotate-[30deg] shadow-md" />
              <div className="absolute right-6 top-36 w-2 h-44 bg-white rotate-[30deg] opacity-90 shadow-sm" />
            </div>

            {/* Businessman Photo with Seamless Color Blend */}
            <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-full z-10 flex items-end justify-center">
              <Image
                src={ASSETS.images.corporateCreditCardMan}
                alt="NemiCapital Corporate Credit Card"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={`object-cover object-[center_15%] sm:object-[center_top] transition-transform duration-1000 ease-out ${
                  isPromoInView ? 'scale-100' : 'scale-105'
                }`}
                priority
              />
              {/* Subtle edge vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#8E0B2F]/40 via-transparent to-transparent pointer-events-none" />
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. BEST CARDS FOR YOUR NEEDS (Matches user screenshot)
             - Left filter sidebar (Card Types)
             - Right sorting and interactive card feed
             - Custom SVG/CSS branded NemiCapital cards
             - Crimson ribbon badges and compare capability
          ========================================================================= */}
      <BestCardsSection />

      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
