'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

export const EmergencyServicesSection: React.FC = () => {
  const { emergencyServicesSection } = SITE_CONFIG;
  const [activeCategory, setActiveCategory] = useState<string>('credit-debit');
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const categoryIconMap = {
    creditCard: ASSETS.icons.creditCard,
    mobileBanking: ASSETS.icons.mobileBanking,
    accountDetails: ASSETS.icons.accountDetails,
    chequeBook: ASSETS.icons.chequeBook,
  };

  const selectedCategoryData =
    emergencyServicesSection.categories.find(c => c.id === activeCategory) ||
    emergencyServicesSection.categories[0];

  const { calloutBanner } = emergencyServicesSection;

  return (
    <section
      ref={ref}
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F7F1EB] text-[#1A1818] select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header - Subtle Scale Pop */}
        <div
          className={`text-center max-w-xl mx-auto transition-all duration-700 ease-out ${
            isInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
          }`}
        >
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-[#1A1818] tracking-tight">
            {emergencyServicesSection.title}
          </h2>
          <p className="font-roboto text-sm sm:text-base text-gray-500 mt-2 font-normal">
            {emergencyServicesSection.subtitle}
          </p>
        </div>

        {/* 4 Category Filter Icons Row - Staggered Radial Drop & Pop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-10 sm:mt-14 mb-10 sm:mb-14 max-w-3xl mx-auto">
          {emergencyServicesSection.categories.map((category, idx) => {
            const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-[400ms]'];
            const isActive = activeCategory === category.id;
            const iconSrc = categoryIconMap[category.icon as keyof typeof categoryIconMap];

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`group flex flex-col items-center text-center cursor-pointer transition-all duration-700 ease-out focus:outline-none ${
                  delays[idx]
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-8 scale-75'
                }`}
              >
                {/* Circle Icon Container */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    isActive
                      ? 'bg-white border-2 border-[#B81446] shadow-lg shadow-[#B81446]/10 transform -translate-y-1'
                      : 'bg-white border border-[#E2DAD0] shadow-sm hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                    <Image
                      src={iconSrc}
                      alt={category.labelLine1}
                      width={36}
                      height={36}
                      unoptimized
                      priority
                      className={`w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                  </div>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-[#B81446]" />
                  )}
                </div>

                {/* Two-Line Category Title */}
                <div className="mt-3.5 leading-snug">
                  <span
                    className={`block font-roboto text-xs sm:text-[13px] font-medium tracking-tight ${
                      isActive ? 'text-[#B81446] font-semibold' : 'text-[#2C2A29] group-hover:text-black'
                    }`}
                  >
                    {category.labelLine1}
                  </span>
                  <span
                    className={`block font-roboto text-xs sm:text-[13px] font-normal ${
                      isActive ? 'text-[#B81446]' : 'text-gray-500'
                    }`}
                  >
                    {category.labelLine2}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Two-Column Grid: Split-Door Convergence Entrance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-4xl mx-auto">
          {/* Left Column: Interactive Request List (Slides in from Left) */}
          <div
            className={`bg-white border border-[#E7DFD4] shadow-sm rounded-none divide-y divide-[#E7DFD4] flex flex-col justify-between transition-all duration-800 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            {selectedCategoryData.requests.map((request, index) => (
              <Link
                key={`${selectedCategoryData.id}-${index}`}
                href={request.href}
                className="group flex items-stretch justify-between transition-colors duration-150 hover:bg-[#FAF7F3]"
              >
                {/* Request Title */}
                <div className="flex-1 px-5 sm:px-6 py-4 sm:py-4.5 flex items-center">
                  <span className="font-roboto text-sm sm:text-[15px] font-medium text-[#222222] group-hover:text-[#B81446] transition-colors">
                    {request.title}
                  </span>
                </div>

                {/* Arrow Cell with Vertical Border */}
                <div className="w-14 sm:w-16 border-l border-[#E7DFD4] flex items-center justify-center text-gray-400 group-hover:text-[#B81446] group-hover:bg-[#F5EFE8]/50 transition-colors flex-shrink-0">
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Column: Call for Private Banking Banner (Slides in from Right) */}
          <div
            className={`relative bg-[#16161D] rounded-none shadow-sm border border-[#E5DDD3] overflow-hidden flex flex-col sm:flex-row min-h-[220px] sm:min-h-[240px] transition-all duration-800 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Left Portion: Dark Support Box */}
            <div className="w-full sm:w-[50%] bg-[#16161D] p-6 sm:p-7 flex flex-col items-center justify-center text-center relative z-20">
              {/* Headset / Support Icon */}
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white mb-2.5">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h1a2 2 0 002-2v-4a2 2 0 00-2-2H4M21 18a3 3 0 01-3 3h-1a2 2 0 01-2-2v-4a2 2 0 012-2h2M12 19v2m0 0a2 2 0 01-2-2h-1"
                  />
                </svg>
              </div>

              {/* Tag & Title */}
              <span className="font-roboto text-xs text-gray-400 font-normal tracking-wide">
                {calloutBanner.tag}
              </span>
              <h3 className="font-poppins text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                {calloutBanner.title}
              </h3>

              {/* Phone Link */}
              <a
                href={calloutBanner.phoneHref}
                className="font-poppins text-sm sm:text-base font-bold text-[#E52E5E] hover:text-[#FF4A7A] mt-2 transition-colors tracking-wide block"
              >
                {calloutBanner.phone}
              </a>
            </div>

            {/* Geometric Angled Chevron Divider (Brand Red & White Notch) */}
            <div
              className={`hidden sm:block absolute inset-y-0 left-[48%] w-10 z-30 pointer-events-none transition-all duration-700 delay-500 ease-out ${
                isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 40 100"
                preserveAspectRatio="none"
              >
                {/* Red upper triangle */}
                <polygon points="0,0 20,0 0,50" fill="#B81446" />
                {/* Red lower triangle */}
                <polygon points="0,50 20,100 0,100" fill="#B81446" />
                {/* Center angled chevron divider */}
                <polyline
                  points="0,0 16,50 0,100"
                  fill="none"
                  stroke="#FAF7F2"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Right Portion: Customer Representative Image with Cinematic Zoom */}
            <div className="relative w-full sm:w-[50%] min-h-[190px] sm:min-h-full bg-[#181822] overflow-hidden">
              <Image
                src={ASSETS.images.customerRep}
                alt={calloutBanner.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 30vw"
                className={`object-cover object-[68%_20%] transition-transform duration-1000 delay-300 ease-out ${
                  isInView ? 'scale-100' : 'scale-110'
                }`}
                priority
              />
              {/* Subtle gradient vignette to blend with the dark left side on small screens */}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
