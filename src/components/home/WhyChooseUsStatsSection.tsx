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

  const iconMap: Record<string, any> = {
    costumer: ASSETS.icons.costumer,
    customer: ASSETS.icons.costumer,
    calendar: ASSETS.icons.calendar,
    branch: ASSETS.icons.branch,
    goal: ASSETS.icons.goal,
  };

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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
          {/* Eyebrow Tag with Line Accent */}
          <div
            className={`transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="w-5 h-[2px] bg-white" />
              <span className="font-poppins font-bold text-xs uppercase tracking-[0.2em] text-white">
                {whyChooseUsSection.tag}
              </span>
            </div>
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
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                      {iconSrc && !imgErrors[stat.id] ? (
                        <Image
                          src={iconSrc}
                          alt={stat.label}
                          width={36}
                          height={36}
                          unoptimized
                          priority
                          onError={() => setImgErrors(prev => ({ ...prev, [stat.id]: true }))}
                          className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                        />
                      ) : (
                        // Guaranteed SVG Fallback if image load fails
                        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#1A1818] group-hover:text-[#B81446] transition-colors">
                          {stat.id === 'customers' && (
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          {stat.id === 'experience' && (
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          )}
                          {stat.id === 'branches' && (
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {stat.id === 'works' && (
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </div>
                      )}
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
