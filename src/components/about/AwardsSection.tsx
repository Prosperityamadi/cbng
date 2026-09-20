'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

interface AwardItem {
  id: string;
  title: string;
  year: string;
  awardBy: string;
}

const LEFT_AWARDS: AwardItem[] = [
  {
    id: 'europe-bank-year',
    title: 'Bank of the Year Europe',
    year: '2020-2021',
    awardBy: 'Las Vegas Business Time',
  },
  {
    id: 'commercial-bank-award',
    title: 'Best Commercial Bank Award',
    year: '2017-2018',
    awardBy: 'Las Vegas Business Time',
  },
];

const RIGHT_AWARDS: AwardItem[] = [
  {
    id: 'private-bank-award',
    title: 'Best Private Bank Award',
    year: '2018-2019',
    awardBy: 'Las Vegas Business Time',
  },
  {
    id: 'bankers-bank-year',
    title: "Banker's Bank of the Year Awards",
    year: '2014-2015',
    awardBy: 'Las Vegas Business Time',
  },
];

const AwardCard: React.FC<{
  award: AwardItem;
  className?: string;
}> = ({ award, className = '' }) => {
  return (
    <div
      className={`group bg-white rounded-none border border-gray-100 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(184,20,70,0.08)] hover:border-[#B81446]/30 transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Top Header: Award Icon + Title */}
      <div className="flex items-center gap-4 pb-5">
        <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 relative flex items-center justify-center">
          <Image
            src={ASSETS.icons.award}
            alt="Award Icon"
            width={40}
            height={40}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <h3 className="font-poppins font-semibold text-[#1A1818] text-base sm:text-lg leading-snug group-hover:text-[#B81446] transition-colors duration-300">
          {award.title}
        </h3>
      </div>

      {/* Subtle Divider Line */}
      <div className="w-full h-px bg-gray-100 mb-4 group-hover:bg-[#B81446]/20 transition-colors" />

      {/* Details Table / Key-Values */}
      <div className="space-y-2 text-xs sm:text-[13px] font-roboto">
        <div className="grid grid-cols-12 items-baseline">
          <span className="col-span-4 text-gray-500 font-normal">Year</span>
          <span className="col-span-1 text-gray-400">:</span>
          <span className="col-span-7 text-gray-700 font-medium">{award.year}</span>
        </div>
        <div className="grid grid-cols-12 items-baseline">
          <span className="col-span-4 text-gray-500 font-normal">Award by</span>
          <span className="col-span-1 text-gray-400">:</span>
          <span className="col-span-7 text-gray-700 font-medium">{award.awardBy}</span>
        </div>
      </div>
    </div>
  );
};

export const AwardsSection: React.FC = () => {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#1A1818] tracking-tight">
            Awards &amp; Major Achievements
          </h2>
          <p className="font-roboto text-sm sm:text-base text-[#666666] mt-2.5 sm:mt-3 font-normal">
            Outstanding performance and achievements.
          </p>
        </div>

        {/* Desktop 3-Column Layout / Tablet & Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: 2 Stacked Award Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            {LEFT_AWARDS.map((award, idx) => (
              <div
                key={award.id}
                className={`transition-all duration-800 ease-out ${
                  isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
                style={{
                  transitionDelay: isInView ? `${idx * 160 + 150}ms` : '0ms',
                }}
              >
                <AwardCard award={award} />
              </div>
            ))}
          </div>

          {/* CENTER COLUMN: Prestigious Golden Trophy in Circular Frame */}
          <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2">
            <div
              className={`relative group transition-all duration-1000 delay-200 ease-out ${
                isInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-12'
              }`}
            >
              {/* Soft Ambient Gold Glow */}
              <div
                className={`absolute -inset-4 bg-amber-400/15 rounded-full blur-2xl transition-all duration-1000 delay-400 ease-out ${
                  isInView ? 'opacity-100 scale-110' : 'opacity-0 scale-50'
                } group-hover:bg-amber-400/25`}
              />

              {/* Circular Container matching the screenshot */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-white shadow-[0_16px_48px_rgba(0,0,0,0.06)] border border-[#EDE5DB] overflow-hidden flex items-center justify-center p-4">
                <Image
                  src={ASSETS.images.bankingAwardTrophy}
                  alt="Banking Excellence Award Trophy"
                  fill
                  priority
                  unoptimized
                  className="object-contain p-2 sm:p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 2 Stacked Award Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-3">
            {RIGHT_AWARDS.map((award, idx) => (
              <div
                key={award.id}
                className={`transition-all duration-800 ease-out ${
                  isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
                style={{
                  transitionDelay: isInView ? `${idx * 160 + 200}ms` : '0ms',
                }}
              >
                <AwardCard award={award} />
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

