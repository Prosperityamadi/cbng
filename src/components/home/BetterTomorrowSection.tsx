'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/core';
import { OrigamiDiamondBadge } from './OrigamiDiamondBadge';
import { CardPetalBackdrop } from './CardPetalBackdrop';

export const BetterTomorrowSection: React.FC = () => {
  const { betterTomorrowSection } = SITE_CONFIG;

  return (
    <section className="w-full bg-[#F7F1EB] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#EDE3D7] relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1A1818] tracking-tight leading-tight">
            {betterTomorrowSection.title}
          </h2>
          <p className="font-roboto text-sm sm:text-base text-[#6E6660] mt-2.5 font-normal">
            {betterTomorrowSection.subtitle}
          </p>
        </div>

        {/* 3 Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mt-16 items-center">
          {betterTomorrowSection.cards.map(card => (
            <div
              key={card.number}
              className="relative flex flex-col items-center text-center group py-8 px-5 sm:px-6 min-h-[440px] justify-between transition-all duration-300"
            >
              {/* Organic Translucent Petal Backdrop */}
              <CardPetalBackdrop />

              {/* Card Content Overlay */}
              <div className="relative z-10 flex flex-col items-center text-center w-full">
                {/* 3D Origami Faceted Diamond Badge with Step Number */}
                <OrigamiDiamondBadge number={card.number} className="w-20 h-20 mb-6" />

                {/* Proposition Tag (Title Case in Primary Red) */}
                <span className="font-poppins font-semibold text-xs sm:text-sm text-[#B81446] tracking-normal">
                  {card.tag}
                </span>

                {/* Proposition Title */}
                <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] mt-2 leading-snug max-w-[270px]">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="font-roboto text-xs sm:text-[13px] text-[#6E6660] leading-relaxed mt-3 max-w-[270px] font-normal">
                  {card.description}
                </p>
              </div>

              {/* Read More Action Link */}
              <div className="relative z-10 mt-6 pt-2">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1 font-poppins font-semibold text-xs sm:text-sm text-[#1A1818] group-hover:text-[#B81446] transition-colors"
                >
                  <span>{card.actionText ?? 'Read More +'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BetterTomorrowSection;
