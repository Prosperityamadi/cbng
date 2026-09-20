'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

interface StatItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
}

const STATS_DATA: StatItem[] = [
  {
    id: 'network',
    title: 'Our Network',
    subtitle: '2545 Branches around the country',
    icon: ASSETS.icons.bank,
  },
  {
    id: 'customers',
    title: 'Customers',
    subtitle: 'More than 1.5 million customers',
    icon: ASSETS.icons.costumer,
  },
  {
    id: 'employee',
    title: 'Employee',
    subtitle: '1.6k professional employees',
    icon: ASSETS.icons.employee,
  },
  {
    id: 'loans',
    title: 'Loans Disbursed',
    subtitle: 'Over 100 million USD to 6k customers',
    icon: ASSETS.icons.debt,
  },
];

export const InterestingNumbersSection: React.FC = () => {
  // Initially null so all circles display with clean white outline and white icons.
  // The red & white active animation triggers ONLY when the user hovers over an item.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-[#111111] select-none">
      {/* Background Photography with Dark Vignette & Monochrome Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={ASSETS.images.bankStatsBg}
          alt="NemiCapital Bank Statistics Background"
          fill
          priority
          unoptimized
          className={`object-cover object-[center_35%] grayscale contrast-[125%] brightness-[50%] transition-transform duration-1000 ease-out ${
            isInView ? 'scale-100' : 'scale-105'
          }`}
        />
        {/* Layered Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-800 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight">
            Few Interesting Numbers
          </h2>
          <p className="font-roboto text-sm sm:text-base text-gray-300/85 mt-2.5 sm:mt-3 font-normal tracking-wide">
            Numbers that speak about banking service.
          </p>
        </div>

        {/* 4 Stats Grid with Interactive Red & White Animation on Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-6 mt-14 sm:mt-16 items-start">
          {STATS_DATA.map((item, idx) => {
            const isHovered = hoveredId === item.id;
            const iconUrl = typeof item.icon === 'string' ? item.icon : item.icon?.src;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  transitionDelay: isInView ? `${idx * 140 + 100}ms` : '0ms',
                }}
                className={`group flex flex-col items-center text-center cursor-pointer transition-all duration-700 ease-out ${
                  isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-75'
                }`}
              >
                {/* Circular Icon Container */}
                <div className="relative flex items-center justify-center">
                  {/* Ambient Glow behind hovered circle */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
                      isHovered
                        ? 'bg-white/25 blur-xl scale-125 opacity-100'
                        : 'bg-transparent blur-none scale-100 opacity-0'
                    }`}
                  />

                  {/* Circle Disc */}
                  <div
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-500 ease-out z-10 ${
                      isHovered
                        ? 'bg-white border-2 border-white scale-110 shadow-[0_12px_36px_rgba(255,255,255,0.35)] ring-4 ring-white/20'
                        : 'bg-white/5 border border-white/35 backdrop-blur-xs'
                    }`}
                  >
                    {/* Masked PNG Icon (pure white by default, transitions to crimson red #B81446 when mouse hovers) */}
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 transition-all duration-300 ease-out"
                      style={{
                        maskImage: `url(${iconUrl})`,
                        WebkitMaskImage: `url(${iconUrl})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        backgroundColor: isHovered ? '#B81446' : '#FFFFFF',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      }}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3
                  className={`font-poppins font-bold text-lg sm:text-xl mt-6 transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-white/90'
                  }`}
                >
                  {item.title}
                </h3>

                {/* Subtitle / Description */}
                <p className="font-roboto text-xs sm:text-sm text-gray-300/80 mt-1.5 max-w-[220px] leading-relaxed font-light">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
