'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export const MarketLeadStorySection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Scroll View Observers for Header and Kinetic Split Card
  const { ref: headerRef, isInView: isHeaderInView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const { ref: cardRef, isInView: isCardInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Crimson Horizon Expansion & Headline Glide) */}
        <div
          ref={headerRef}
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 transition-all duration-700 ease-out ${
            isHeaderInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2.5 mb-2.5">
              <span
                className={`h-[2.5px] bg-[#B81446] inline-block flex-shrink-0 transition-all duration-700 ease-out ${
                  isHeaderInView ? 'w-5 sm:w-6' : 'w-0'
                }`}
              />
              <span className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-[#B81446]">
                Cover Story &amp; Flagship Analysis
              </span>
            </div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1818] tracking-tight">
              Featured Macro Intelligence
            </h2>
          </div>

          <div
            className={`text-xs text-stone-500 font-medium transition-all duration-700 ease-out delay-200 ${
              isHeaderInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
          >
            Published weekly by NemiCapital Strategic Research
          </div>
        </div>

        {/* Featured 2-Column Hero Card (Kinetic Split Reveal) */}
        <div
          ref={cardRef}
          className={`bg-[#FAF7F2] border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-700 group ${
            isCardInView ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Image Column (7 cols) with Kinetic Entrance */}
            <div
              className={`lg:col-span-7 relative min-h-[300px] sm:min-h-[400px] lg:min-h-[460px] overflow-hidden bg-stone-900 transition-all duration-800 ease-out ${
                isCardInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <Image
                src={ASSETS.images.marketLeadTradingFloor}
                alt="Global Liquidity Transitions"
                fill
                priority
                className="object-cover grayscale contrast-[112%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Pill Badges with Drop-In Animation */}
              <div
                className={`absolute top-4 left-4 z-10 flex flex-wrap gap-2 transition-all duration-700 ease-out delay-300 ${
                  isCardInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <span className="bg-[#B81446] text-white font-poppins font-semibold text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 shadow-md">
                  Institutional Briefing
                </span>
                <span className="bg-black/75 backdrop-blur-sm text-stone-200 text-[10px] sm:text-xs px-2.5 py-1">
                  6 min read
                </span>
              </div>
            </div>

            {/* Right Content Column (5 cols) with Sweep Entrance */}
            <div
              className={`lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 transition-all duration-800 ease-out delay-150 ${
                isCardInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span className="uppercase tracking-wider text-[#B81446] font-semibold">
                    Global Macro &amp; FX
                  </span>
                  <span>Sep 23, 2026</span>
                </div>

                <h3 className="font-poppins font-bold text-xl sm:text-2xl lg:text-[26px] text-[#1A1818] leading-snug tracking-tight group-hover:text-[#B81446] transition-colors duration-300">
                  Global Liquidity Transitions: Central Bank Easing Cycles and Portfolio Duration Strategy
                </h3>

                <p className="font-roboto text-xs sm:text-sm text-stone-600 leading-relaxed">
                  As major central banks pivot toward calibrated rate normalization, sovereign curve dynamics present historic opportunities for duration re-balancing. We evaluate institutional liquidity syndication and asset allocation models across tier-one credit markets.
                </p>

                {/* Key Takeaways with Cascading Crimson Diamonds */}
                <div className="space-y-2 pt-2 border-t border-stone-200/80">
                  <span className="font-poppins font-semibold text-xs text-[#1A1818] uppercase tracking-wider block mb-1">
                    Key Executive Takeaways:
                  </span>
                  {[
                    'Yield curve steepening favors 5–7 year intermediate sovereign paper',
                    'Private credit covenants remain resilient amidst cross-border easing',
                    'USD resilience anticipated through fourth-quarter balance adjustments',
                  ].map((point, idx) => (
                    <div
                      key={idx}
                      style={{
                        transitionDelay: isCardInView ? `${idx * 150 + 300}ms` : '0ms',
                      }}
                      className={`flex items-start gap-2 text-xs text-stone-700 transition-all duration-500 ease-out ${
                        isCardInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                      }`}
                    >
                      <span
                        className={`text-[#B81446] text-xs flex-shrink-0 mt-0.5 transition-transform duration-500 ${
                          isCardInView ? 'scale-100 rotate-0' : 'scale-50 rotate-45'
                        }`}
                      >
                        ◆
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Info & Action Buttons */}
              <div
                className={`pt-4 border-t border-stone-200/80 flex items-center justify-between transition-all duration-600 ease-out delay-400 ${
                  isCardInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white shadow-xs">
                    <Image
                      src={ASSETS.images.authorPaulAnderson}
                      alt="Paul Anderson"
                      fill
                      className="object-cover grayscale"
                    />
                  </div>
                  <div>
                    <span className="font-poppins font-semibold text-xs text-[#1A1818] block leading-tight">
                      Paul Anderson
                    </span>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                      Chief Market Strategist
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share article"
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center p-2 hover:border-[#B81446] transition-colors shadow-2xs"
                    title={copied ? 'Link copied!' : 'Share brief'}
                  >
                    <div className="w-full h-full relative">
                      <Image src={ASSETS.icons.share} alt="Share" fill className="object-contain" />
                    </div>
                  </button>

                  <Link
                    href="/news/press-releases"
                    className="inline-flex items-center gap-1.5 bg-[#1A1818] hover:bg-[#B81446] text-white font-poppins font-semibold text-xs px-4 py-2.5 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <span>Read Brief</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
