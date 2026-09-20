'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

export const MoneyProtectionSection: React.FC = () => {
  const { moneyProtectionSection } = SITE_CONFIG;
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      id="protect-your-money"
      className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F3] border-b border-[#EDE5DB] text-[#1A1818] select-none overflow-hidden scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading, Subtext, 3 Protection Pillars & CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Tag / Eyebrow Badge with Brand Accent Line */}
            <div
              className={`transition-all duration-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-5 h-[2px] bg-[#B81446]" />
                <span className="font-poppins font-bold text-xs uppercase tracking-[0.2em] text-[#B81446]">
                  {moneyProtectionSection.tag}
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h2
              className={`font-poppins text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1A1818] tracking-tight leading-[1.22] transition-all duration-700 delay-100 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {moneyProtectionSection.title}
            </h2>

            {/* Explanatory Paragraph */}
            <p
              className={`font-roboto text-sm sm:text-base text-gray-600 leading-relaxed mt-4 font-normal max-w-xl transition-all duration-700 delay-200 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {moneyProtectionSection.description}
            </p>

            {/* 3 Numbered Protection Pillars */}
            <div className="mt-7 space-y-3.5">
              {moneyProtectionSection.pillars.map((pillar, idx) => {
                const delays = ['delay-300', 'delay-[450ms]', 'delay-[600ms]'];

                return (
                  <Link
                    key={pillar.number}
                    href={pillar.href}
                    className={`group p-3.5 sm:p-4 bg-white border border-[#EDE5DB] border-l-4 border-l-transparent hover:border-l-[#B81446] hover:border-r-[#EDE5DB] hover:border-y-[#EDE5DB] hover:shadow-md shadow-black/[0.02] flex items-start gap-4 rounded-none transition-all duration-300 ease-out transform ${
                      delays[idx]
                    } ${
                      isInView
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-8'
                    }`}
                  >
                    {/* Red Circular Number Badge */}
                    <div className="w-9 h-9 rounded-full bg-[#B81446] text-white flex items-center justify-center font-poppins font-bold text-sm shadow-sm group-hover:bg-[#910E36] group-hover:scale-105 transition-all duration-300 flex-shrink-0 mt-0.5">
                      {pillar.number}
                    </div>

                    {/* Pillar Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-poppins font-bold text-base text-[#1A1818] group-hover:text-[#B81446] transition-colors leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="font-roboto text-xs sm:text-[13px] text-gray-500 leading-relaxed mt-1 font-normal">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Subtle Arrow Indicator on Hover */}
                    <div className="text-gray-300 group-hover:text-[#B81446] transition-all duration-300 self-center flex-shrink-0 pl-1">
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions: Security Center CTA & 24/7 Hotline */}
            <div
              className={`mt-6 flex flex-wrap items-center gap-4 pt-1 transition-all duration-700 delay-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link
                href="/security"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1818] hover:bg-[#B81446] text-white text-xs font-poppins font-semibold uppercase tracking-wider rounded-none transition-colors duration-300 shadow-sm"
              >
                <span>Visit Security Center</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-roboto">
                <svg
                  className="w-4 h-4 text-[#B81446] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>
                  Fraud Hotline: <strong className="text-[#1A1818] font-medium">+1 (800) 555-NEMI</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Capital Protection Photography & Security Badges */}
          <div
            className={`lg:col-span-6 flex justify-center transition-all duration-800 delay-200 ease-out ${
              isInView ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-10'
            }`}
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-none overflow-hidden shadow-2xl border-4 border-white bg-neutral-900 group">
              <Image
                src={ASSETS.images.moneyProtection}
                alt="Money Protection & Wealth Preservation"
                fill
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />

              {/* Subtle ambient gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Overlaid Floating Security Guarantee Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-3.5 sm:p-4 border border-[#E7DFD4] shadow-xl rounded-none flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#B81446]/10 text-[#B81446] flex items-center justify-center flex-shrink-0">
                  {/* Security Shield Icon */}
                  <svg
                    className="w-5 h-5 text-[#B81446]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818] leading-tight">
                    {moneyProtectionSection.badgeText}
                  </h4>
                  <p className="font-roboto text-[11px] text-gray-500 mt-0.5 leading-snug">
                    Multi-tier cold storage vault & regulatory deposit protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyProtectionSection;
