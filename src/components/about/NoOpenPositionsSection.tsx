'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export const NoOpenPositionsSection: React.FC = () => {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="w-full bg-[#FAF7F2] pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12 relative overflow-hidden select-none"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center">
          
          {/* 1. Special Nano Illustration with Slow Bouncing Effect */}
          <div
            className={`relative mb-6 sm:mb-8 transition-all duration-800 ease-out ${
              isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 animate-slow-float cursor-pointer">
              <Image
                src={ASSETS.icons.noOpenPositions}
                alt="No open positions currently available at NemiCapital"
                fill
                priority
                unoptimized
                className="object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* 2. Section Heading & Concise Narrative (Directly on Cream Background) */}
          <div
            className={`transition-all duration-800 delay-150 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1818] tracking-tight leading-tight">
              No Open Positions At The Moment
            </h2>
            <p className="font-roboto text-sm sm:text-base text-[#5A5550] mt-3 sm:mt-4 leading-relaxed max-w-xl mx-auto">
              Thank you for your interest in building your career with NemiCapital International Bank. While all our global positions are currently filled, new opportunities arise regularly as we expand.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
