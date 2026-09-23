'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ASSETS } from '@/core';

interface Strategist {
  name: string;
  role: string;
  specialty: string;
  image: StaticImageData | string;
  publicationsCount: number;
}

const STRATEGISTS: Strategist[] = [
  {
    name: 'Paul Anderson',
    role: 'Chief Market Strategist',
    specialty: 'Global Macro, Central Bank Policy, Sovereign Yields',
    image: ASSETS.images.authorPaulAnderson,
    publicationsCount: 42,
  },
  {
    name: 'Elena Rostova',
    role: 'VP of Global Markets',
    specialty: 'Cross-Border FX Syndication, Liquidity & Commodities',
    image: ASSETS.images.team6Markets,
    publicationsCount: 38,
  },
  {
    name: 'Arthur Sterling',
    role: 'Chief Risk Officer',
    specialty: 'Enterprise Credit Stress-Testing, Regulatory Capital Adequacy',
    image: ASSETS.images.team4Cro,
    publicationsCount: 29,
  },
  {
    name: 'David Chen',
    role: 'Head of Quantitative Technology',
    specialty: 'Machine Learning Risk Models, Real-Time Settlement Rails',
    image: ASSETS.images.team7Cto,
    publicationsCount: 34,
  },
];

export const MarketStrategistsSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <span className="w-5 sm:w-6 h-[2.5px] bg-[#B81446] inline-block flex-shrink-0" />
            <span className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-[#B81446]">
              Executive Research Leadership
            </span>
          </div>

          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#1A1818] tracking-tight leading-tight">
            Meet Our Global Research Strategists
          </h2>
          <p className="font-roboto text-stone-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Our market commentary is authored by senior economists and risk officers with decades of experience steering institutional treasuries through complex financial cycles.
          </p>
        </div>

        {/* 4 Strategist Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STRATEGISTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Photo with Smooth Zoom */}
                <div className="relative w-full aspect-square overflow-hidden bg-stone-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover grayscale contrast-[110%] transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Publications Badge */}
                  <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 shadow-sm">
                    <span className="text-[10px] font-poppins font-semibold text-[#B81446]">
                      {item.publicationsCount} Papers
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-2">
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] group-hover:text-[#B81446] transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#B81446] uppercase tracking-wider block">
                    {item.role}
                  </span>
                  <p className="font-roboto text-xs text-stone-600 pt-1 leading-relaxed">
                    {item.specialty}
                  </p>
                </div>
              </div>

              {/* Bottom Card Link */}
              <div className="px-6 pb-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-medium">NemiCapital Global Desk</span>
                <span className="text-xs font-semibold text-[#B81446] group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
