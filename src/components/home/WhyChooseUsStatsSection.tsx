'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

/**
 * Animated Counter Component
 * Eased numerical count-up triggered upon scroll into viewport.
 */
const AnimatedStatValue: React.FC<{
  targetValue: number;
  suffix?: string;
  isTriggered: boolean;
  duration?: number;
}> = ({ targetValue, suffix = '', isTriggered, duration = 2000 }) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (!isTriggered) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    // Smooth exponential deceleration for financial tickers
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplayCount(Math.floor(eased * targetValue));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayCount(targetValue);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, isTriggered, duration]);

  return (
    <span className="tabular-nums font-poppins font-bold">
      {displayCount.toLocaleString()}
      {suffix}
    </span>
  );
};

export const WhyChooseUsStatsSection: React.FC = () => {
  const { whyChooseUsSection } = SITE_CONFIG;
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const iconMap = {
    costumer: ASSETS.icons.costumer,
    calendar: ASSETS.icons.calendar,
    branch: ASSETS.icons.branch,
    goal: ASSETS.icons.goal,
  };

  return (
    <section
      ref={ref}
      className="relative w-full bg-[#FAF7F3] border-b border-[#EDE5DB] overflow-hidden select-none"
    >
      {/* Top Banner: Rich Burgundy / Brand Red with Luxury Topographic Wave Contours */}
      <div className="relative w-full bg-gradient-to-r from-[#8C0E35] via-[#B81446] to-[#7A0B2E] pt-16 sm:pt-20 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 text-white overflow-hidden shadow-inner">
        {/* Subtle Luxury Topographic Contour SVG Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay">
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 480" fill="none">
            <path
              d="M-100 240 C 200 100, 400 380, 720 200 C 1040 20, 1240 320, 1540 180"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <path
              d="M-100 180 C 220 300, 520 80, 840 260 C 1160 440, 1380 120, 1600 220"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <path
              d="M-100 300 C 300 420, 620 180, 960 320 C 1280 460, 1480 200, 1700 280"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />
            <path
              d="M-100 100 C 180 220, 480 40, 780 180 C 1080 320, 1320 80, 1560 160"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Ambient Radial Lighting Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header Content with Smooth Dropdown Entrance */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Eyebrow Tag */}
          <div
            className={`transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4'
            }`}
          >
            <span className="inline-block px-4 py-1.5 rounded-none bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs font-poppins font-semibold uppercase tracking-widest shadow-sm">
              {whyChooseUsSection.tag}
            </span>
          </div>

          {/* Main Title */}
          <h2
            className={`font-poppins text-2xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-tight mt-4 transition-all duration-700 delay-100 ease-out max-w-3xl mx-auto ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            {whyChooseUsSection.title}
          </h2>

          {/* Subtitle */}
          <p
            className={`font-roboto text-sm sm:text-base text-white/85 mt-3 max-w-2xl mx-auto font-normal leading-relaxed transition-all duration-700 delay-200 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {whyChooseUsSection.subtitle}
          </p>
        </div>
      </div>

      {/* Floating Overlapping Stats Row - Staggered 3D Elevation Entrance */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {whyChooseUsSection.stats.map((stat, idx) => {
            const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-[400ms]'];
            const iconSrc = iconMap[stat.icon as keyof typeof iconMap];

            return (
              <div
                key={stat.id}
                className={`group relative bg-white border border-[#E7DFD4] hover:border-[#B81446]/50 shadow-xl shadow-black/[0.04] hover:shadow-2xl hover:shadow-[#B81446]/10 p-6 sm:p-7 flex flex-col items-center text-center justify-between rounded-none transition-all duration-700 ease-out transform ${
                  delays[idx]
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-16 scale-95'
                }`}
              >
                {/* Top Circular Icon Container with Soft Brand Glow */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#FAF7F3] border-2 border-[#EDE5DB] group-hover:border-[#B81446] group-hover:bg-[#B81446]/5 transition-all duration-300 flex items-center justify-center shadow-sm">
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={iconSrc}
                        alt={stat.label}
                        fill
                        sizes="36px"
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Soft circular accent backdrop on hover */}
                  <div className="absolute inset-0 bg-[#B81446]/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Big Animated Milestone Metric */}
                <div className="text-3xl sm:text-4xl lg:text-[38px] font-bold text-[#B81446] group-hover:text-[#910E36] transition-colors leading-none tracking-tight">
                  <AnimatedStatValue
                    targetValue={stat.value}
                    suffix={stat.suffix}
                    isTriggered={isInView}
                    duration={2200}
                  />
                </div>

                {/* Stat Label */}
                <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] mt-3 leading-snug">
                  {stat.label}
                </h3>

                {/* Short Supporting Description */}
                <p className="font-roboto text-xs sm:text-[13px] text-[#756D67] mt-1.5 leading-relaxed font-normal">
                  {stat.description}
                </p>

                {/* Bottom Expanding Brand Red Micro-Bar */}
                <div className="w-full h-[2px] bg-[#EFE8DF] mt-5 relative overflow-hidden rounded-none">
                  <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-full bg-[#B81446] transition-all duration-500 ease-out" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsStatsSection;
