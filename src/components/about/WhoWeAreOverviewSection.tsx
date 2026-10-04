'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

interface PillarItem {
  id: string;
  number: string;
  icon: any;
  title: string;
  description: string;
}

const PILLARS: PillarItem[] = [
  {
    id: 'community',
    number: '01',
    icon: ASSETS.icons.communities,
    title: 'Community',
    description: 'Must explain to you how work mistaken give you complete guide they cannot foresee pain.',
  },
  {
    id: 'commitment',
    number: '02',
    icon: ASSETS.icons.commitment,
    title: 'Commitment',
    description: 'Business it will frequently occur that pleasures have to be repudiated and annoyances accepted.',
  },
  {
    id: 'consistency',
    number: '03',
    icon: ASSETS.icons.consistency,
    title: 'Consistency',
    description: 'Being able to do what we like best every pleasure is to be welcomed and pain avoided but in certain.',
  },
];

export const WhoWeAreOverviewSection: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { ref: topRowRef, isInView: isTopRowInView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const { ref: pillarsRef, isInView: isPillarsInView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
      }
    };
    if (isVideoModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVideoModalOpen]);

  return (
    <section className="w-full bg-white text-[#1A1818] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            TOP ROW: Bank Building with Play Button (Left) & Overview + Sub-Cards (Right)
            ========================================================================= */}
        <div ref={topRowRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          
          {/* LEFT: Bank Building Photography with Play Button Overlay */}
          <div
            className={`lg:col-span-5 w-full transition-all duration-1000 ease-out ${
              isTopRowInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.97]'
            }`}
          >
            <div className="relative w-full h-[460px] sm:h-[540px] lg:h-full min-h-[480px] bg-gray-100 overflow-hidden shadow-sm group">
              <Image
                src={ASSETS.images.bankBuilding}
                alt="NemiCapital Bank Headquarters"
                fill
                priority
                unoptimized
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Centered Square Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Play Corporate Overview Video"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 group/btn focus:outline-none focus:ring-2 focus:ring-[#B81446]"
                >
                  {/* Play Triangle Icon */}
                  <svg
                    className="w-5 h-5 text-[#1A1818] ml-1 transition-colors group-hover/btn:text-[#B81446]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Heading, Descriptive Paragraphs, and Two Sub-Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div
              className={`transition-all duration-800 delay-150 ease-out ${
                isTopRowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[38px] leading-[1.25] text-[#1A1818] tracking-tight">
                Known For Trust,
                <br />
                Honesty &amp; Customer Support
              </h2>

              <p className="mt-5 sm:mt-6 text-gray-500 text-xs sm:text-sm leading-relaxed">
                Belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish.
              </p>

              <p className="mt-3.5 sm:mt-4 text-gray-500 text-xs sm:text-sm leading-relaxed">
                Choice is untrammelled and when nothing prevents our being able to do what we like best every pleasure is to be welcomed.
              </p>
            </div>

            {/* Two Sub-Cards Side by Side */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Card 1: Our Journey */}
              <div
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                className={`group cursor-pointer transition-all duration-700 delay-300 ease-out select-none ${
                  isTopRowInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden shadow-sm">
                  <Image
                    src={ASSETS.images.ladyStanding}
                    alt="For Over Four Decades Our Bank - Our Journey"
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Floating White Tag on the Bottom Right overlapping edge */}
                  <div className="absolute bottom-3 right-3 bg-white px-4 py-1.5 shadow-lg border border-gray-100/60 z-10">
                    <span className="text-[#B81446] font-semibold text-xs tracking-wide">
                      Our Journey
                    </span>
                  </div>
                </div>
                <h3 className="font-poppins font-semibold text-sm sm:text-base text-[#1A1818] mt-4 leading-snug group-hover:text-[#B81446] transition-colors">
                  For Over Four Decades
                  <br />
                  Our Bank
                </h3>
              </div>

              {/* Card 2: Our Team */}
              <div
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                className={`group cursor-pointer transition-all duration-700 delay-450 ease-out select-none ${
                  isTopRowInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden shadow-sm">
                  <Image
                    src={ASSETS.images.bankTeam}
                    alt="Passion & Professional Management - Our Team"
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Floating White Tag on the Bottom Right overlapping edge */}
                  <div className="absolute bottom-3 right-3 bg-white px-4 py-1.5 shadow-lg border border-gray-100/60 z-10">
                    <span className="text-[#B81446] font-semibold text-xs tracking-wide">
                      Our Team
                    </span>
                  </div>
                </div>
                <h3 className="font-poppins font-semibold text-sm sm:text-base text-[#1A1818] mt-4 leading-snug group-hover:text-[#B81446] transition-colors">
                  Passion &amp; Professional
                  <br />
                  Management
                </h3>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            BOTTOM ROW: 3 Pillars Grid (Community, Commitment, Consistency)
            Matches user design screenshot:
            - Pure white background
            - Subtle vertical divider lines between columns
            - Leaf/pill number badges (01, 02, 03) overlapping the top-left of the icon card
            - Soft shadowed white rounded squircle holding custom PNG icons
            ========================================================================= */}
        <div ref={pillarsRef} className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 relative">
            {PILLARS.map((pillar, idx) => (
              <div
                key={pillar.id}
                style={{
                  transitionDelay: isPillarsInView ? `${idx * 160 + 100}ms` : '0ms',
                }}
                className={`relative flex flex-col items-center text-center px-6 sm:px-10 py-8 md:py-4 group transition-all duration-700 ease-out ${
                  isPillarsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'
                } ${
                  idx !== PILLARS.length - 1 ? 'md:border-r md:border-gray-200/70' : ''
                }`}
              >
                {/* Icon Container with Overlapping Number Badge */}
                <div className="relative mb-6">
                  {/* Number Badge (Soft warm sand/cream tab overlapping top-left, leaf shape) */}
                  <div className="absolute -top-3.5 -left-3.5 z-10 w-11 h-11 bg-[#F4EFEA] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm flex items-center justify-center shadow-xs">
                    <span className="font-poppins text-xs font-semibold text-[#8C847C] tracking-wide">
                      {pillar.number}
                    </span>
                  </div>

                  {/* White Card with Soft Shadow and Rounded Corners */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[22px] shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-gray-50/80 flex items-center justify-center p-5 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] transition-all duration-300">
                    <Image
                      src={pillar.icon}
                      alt={pillar.title}
                      width={52}
                      height={52}
                      className="object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-poppins font-bold text-xl sm:text-[22px] text-[#1A1818] mb-3 tracking-tight">
                  {pillar.title}
                </h4>

                {/* Description */}
                <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed max-w-[280px] mx-auto font-normal">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIDEO MODAL OVERLAY (Interactive Play Feature)
          ========================================================================= */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#B81446] transition-colors focus:outline-none cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Iframe / Embed */}
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="NemiCapital Bank Documentary"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
