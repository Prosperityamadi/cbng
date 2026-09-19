'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

export const BankingNeedsSection: React.FC = () => {
  const { bankingNeedsSection } = SITE_CONFIG;
  const [activeTab, setActiveTab] = useState<'individuals' | 'companies'>('individuals');
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const cardIconMap = {
    coin: ASSETS.icons.coin,
    mobileBanking: ASSETS.icons.mobileBanking,
    debt: ASSETS.icons.debt,
  };

  const currentItems = bankingNeedsSection.items[activeTab];

  return (
    <section
      ref={ref}
      className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#111111] overflow-hidden select-none"
    >
      {/* Background Image with Cinematic Subtle Zoom */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={ASSETS.backgrounds.bankingNeeds}
          alt="Corporate Banking Background"
          fill
          className={`object-cover object-center grayscale contrast-[115%] brightness-[32%] transition-transform duration-1000 ease-out ${
            isInView ? 'scale-100' : 'scale-110'
          }`}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/85 via-black/55 to-[#111111]/90" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top Header Row with Red Floating Chat Bubble */}
        <div className="flex items-center justify-between pb-8">
          <div
            className={`transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight">
              {bankingNeedsSection.title}
            </h2>
            <p className="font-roboto text-sm sm:text-base text-gray-300/80 mt-2 font-normal">
              {bankingNeedsSection.subtitle}
            </p>
          </div>

          {/* Red Circular Floating Chat Support Button with Spin Reveal */}
          <Link
            href={SITE_CONFIG.contact.supportHref}
            className={`w-12 h-12 rounded-full bg-[#B81446] hover:bg-[#8C0E35] flex items-center justify-center shadow-2xl transition-all duration-700 delay-300 transform hover:scale-110 active:scale-95 flex-shrink-0 ${
              isInView ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'
            }`}
            aria-label="Live Chat Support"
          >
            <div className="relative w-6 h-6">
              <Image
                src={ASSETS.icons.chat}
                alt="Chat Support"
                fill
                sizes="24px"
                className="object-contain brightness-0 invert"
              />
            </div>
          </Link>
        </div>

        {/* Large Two-Column Category Selectors ("Banking for Individuals" vs "Banking for Companies") */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {bankingNeedsSection.tabs.map((tab, tabIdx) => {
            const isActive = activeTab === tab.id;
            const lateralTransform = tabIdx === 0 ? '-translate-x-16' : 'translate-x-16';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'individuals' | 'companies')}
                className={`w-full text-left p-5 sm:p-6 transition-all duration-700 delay-200 rounded-none flex items-center justify-between cursor-pointer ${
                  isInView ? 'opacity-100 translate-x-0' : `opacity-0 ${lateralTransform}`
                } ${
                  isActive
                    ? 'bg-white text-[#1A1818] shadow-2xl'
                    : 'bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 hover:border-white/30'
                }`}
              >
                <div>
                  <span
                    className={`block font-roboto text-xs font-normal tracking-wide ${
                      isActive ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {tab.prefix}
                  </span>
                  <span className="block font-poppins font-bold text-xl sm:text-2xl mt-0.5">
                    {tab.label}
                  </span>
                </div>

                {/* Dropdown / Arrow Box */}
                <div
                  className={`w-9 h-9 border flex items-center justify-center rounded-none transition-colors ${
                    isActive
                      ? 'bg-[#FAF7F3] border-[#EDE5DB] text-[#1A1818]'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3 Proposition Glassmorphic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-8">
          {currentItems.map((item, idx) => {
            const cardDelays = ['delay-300', 'delay-[450ms]', 'delay-[600ms]'];

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative bg-black/45 backdrop-blur-md border border-white/15 hover:border-[#B81446]/60 transition-all duration-700 ease-out p-6 sm:p-7 flex flex-col justify-between group rounded-none transform ${
                  cardDelays[idx]
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-14 scale-[0.97]'
                }`}
              >
                {/* Card Top Row: Custom Icon & Arrow Button */}
                <div>
                  <div className="flex items-center justify-between">
                    {/* Category Line Art Icon (Inverted to Crisp White) */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <Image
                        src={cardIconMap[item.icon]}
                        alt={item.title}
                        fill
                        sizes="40px"
                        className="object-contain brightness-0 invert"
                      />
                    </div>

                    {/* Sharp Arrow Action Button (Highlights in Brand Red on Hover) */}
                    <div className="w-8 h-8 rounded-none border border-white/30 text-white flex items-center justify-center group-hover:bg-[#B81446] group-hover:border-[#B81446] transition-all duration-200">
                      <svg
                        className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Title & Two-Tone Accent Line */}
                  <div className="mt-6">
                    <h3 className="font-poppins font-bold text-lg sm:text-[19px] text-white leading-snug">
                      {item.title}
                    </h3>

                    {/* Horizontal Line with Left Red Accent Segment */}
                    <div className="w-full h-[1px] bg-white/15 mt-3 relative overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 bottom-0 bg-[#B81446] h-[2px] transition-all duration-700 delay-700 ease-out ${
                          isInView ? 'w-12' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="font-roboto text-xs sm:text-[13px] text-gray-300/80 leading-relaxed mt-3.5 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Footnote Highlight with Red Asterisk */}
                {item.footnote && (
                  <div className="pt-5 mt-4 border-t border-white/10">
                    <p className="font-roboto text-[11px] sm:text-xs text-gray-300/75 flex items-center gap-1.5">
                      <span className="text-[#B81446] font-bold text-sm leading-none">*</span>
                      <span>{item.footnote.replace(/^\*\s*/, '')}</span>
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Center Bottom Action Button ("View All Services") */}
        <div
          className={`mt-12 flex justify-center transition-all duration-700 delay-700 ease-out ${
            isInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'
          }`}
        >
          <Link
            href={bankingNeedsSection.viewAllHref}
            className="inline-flex items-center justify-center px-8 py-3 rounded-none bg-white hover:bg-[#F7F1EB] text-[#1A1818] font-poppins font-semibold text-xs sm:text-sm tracking-wide shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <span>{bankingNeedsSection.viewAllText}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BankingNeedsSection;
