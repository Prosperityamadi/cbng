'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export const MissionVisionSection: React.FC = () => {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            MISSION, VISION, CORE VALUE & MISSION STATEMENT GRID
            Matches exact layout from the design:
            - Left: Vertical "Mission" card
            - Middle: Stacked "Vision" (top) and "Core Value" (bottom)
            - Right: Crimson "A Great Mission Statement" card with geometric accent
            ========================================================================= */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* COLUMN 1 (Left): Tall Vertical Mission Photo Card */}
          <div
            className={`lg:col-span-4 h-[360px] sm:h-[420px] lg:h-full min-h-[380px] lg:min-h-[460px] relative overflow-hidden group shadow-sm bg-gray-900 cursor-pointer transition-all duration-900 ease-out ${
              isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-14 scale-95'
            }`}
          >
            <Image
              src={ASSETS.images.aboutMission}
              alt="NemiCapital Bank - Mission"
              fill
              unoptimized
              className="object-cover object-center grayscale contrast-[115%] transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20 group-hover:from-black/85 transition-colors" />

            {/* Centered / Lower-Center Text: Mission */}
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl text-white tracking-wider drop-shadow-md group-hover:scale-105 transition-transform">
                Mission
              </h3>
            </div>
          </div>

          {/* COLUMN 2 (Middle): Two Stacked Horizontal Cards (Vision & Core Value) */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
            
            {/* Top: Vision */}
            <div
              className={`relative h-[200px] sm:h-[220px] lg:h-[220px] overflow-hidden group shadow-sm bg-gray-900 cursor-pointer transition-all duration-700 delay-150 ease-out ${
                isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'
              }`}
            >
              <Image
                src={ASSETS.images.aboutVision}
                alt="NemiCapital Bank - Vision"
                fill
                unoptimized
                className="object-cover object-[center_35%] grayscale contrast-[115%] transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent group-hover:from-black/80 transition-colors" />

              {/* Text: Vision (Bottom-Right / Centered) */}
              <div className="absolute bottom-5 right-6 sm:bottom-6 sm:right-8">
                <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white tracking-wider drop-shadow-md group-hover:scale-105 transition-transform">
                  Vision
                </h3>
              </div>
            </div>

            {/* Bottom: Core Value */}
            <div
              className={`relative h-[200px] sm:h-[220px] lg:h-[220px] overflow-hidden group shadow-sm bg-gray-900 cursor-pointer transition-all duration-700 delay-300 ease-out ${
                isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <Image
                src={ASSETS.images.aboutCoreValue}
                alt="NemiCapital Bank - Core Value"
                fill
                unoptimized
                className="object-cover object-[center_30%] grayscale contrast-[115%] transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent group-hover:from-black/85 transition-colors" />

              {/* Text: Core Value (Bottom-Right / Centered) */}
              <div className="absolute bottom-5 right-6 sm:bottom-6 sm:right-8">
                <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white tracking-wider drop-shadow-md group-hover:scale-105 transition-transform">
                  Core Value
                </h3>
              </div>
            </div>

          </div>

          {/* COLUMN 3 (Right): Crimson "A Great Mission Statement" Card */}
          <div
            className={`md:col-span-2 lg:col-span-4 bg-gradient-to-br from-[#B81446] via-[#A5113C] to-[#800A2C] text-white p-7 sm:p-9 lg:p-10 flex flex-col justify-between relative overflow-hidden shadow-lg min-h-[380px] lg:min-h-[460px] transition-all duration-900 delay-200 ease-out ${
              isInView ? 'opacity-100 translate-x-0 scale-100 shadow-2xl' : 'opacity-0 translate-x-12 scale-[0.96] shadow-none'
            }`}
          >
            
            <div className="relative z-10">
              {/* Heading */}
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[32px] leading-tight text-white mb-4 tracking-tight">
                A Great
                <br />
                Mission Statement
              </h3>

              {/* Accent Line Under Title */}
              <div className="w-12 h-0.5 bg-white/70 mb-5" />

              {/* Description Body Copy */}
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                Obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man always holds these matters to this principle of selection rejects pleasures to secure other greater pleasures.
              </p>

              {/* Read More Link */}
              <Link
                href="/about/who-we-are"
                className="inline-flex items-center gap-2 text-white font-semibold text-xs sm:text-sm tracking-wide group/link hover:text-white/90 transition-colors"
              >
                <span>&rarr;</span>
                <span className="underline-offset-4 group-hover/link:underline">Read More</span>
              </Link>
            </div>

            {/* Bottom-Right Origami Geometric Pattern (Matching design badge) */}
            <div
              className={`absolute bottom-0 right-0 w-28 h-28 pointer-events-none z-0 transition-all duration-1000 delay-500 ease-out ${
                isInView ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-45 scale-75'
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Large white corner triangle */}
                <polygon points="100,20 100,100 20,100" fill="white" fillOpacity="0.95" />
                {/* Darker accent maroon inner geometric facets */}
                <polygon points="100,45 100,100 45,100" fill="#6E0823" fillOpacity="0.85" />
                <polygon points="100,70 100,100 70,100" fill="#B81446" fillOpacity="0.9" />
                <polygon points="60,60 85,85 60,100" fill="#4B0517" fillOpacity="0.75" />
              </svg>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
