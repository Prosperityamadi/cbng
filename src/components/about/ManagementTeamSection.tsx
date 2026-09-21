'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export interface ManagementMember {
  id: string;
  name: string;
  role: string;
  image: any;
  tier: 'executive' | 'management';
  bio: string;
}

export const MANAGEMENT_MEMBERS: ManagementMember[] = [
  // ROW 1: Senior Executives (Senior age, C-Suite & Board leadership)
  {
    id: 'bret-danielle',
    name: 'Bret Ke Danielle',
    role: 'FOUNDER & GROUP CEO',
    image: ASSETS.images.team1Ceo,
    tier: 'executive',
    bio: 'Over 30 years of global institutional banking experience leading capital markets, regulatory strategy, and customer-first banking innovation.',
  },
  {
    id: 'ian-hudson',
    name: 'Ian Hudson',
    role: 'CHIEF OPERATING OFFICER',
    image: ASSETS.images.team2Coo,
    tier: 'executive',
    bio: 'Oversees worldwide banking infrastructure, operational risk governance, and branch transformation across all continental divisions.',
  },
  {
    id: 'lillian-stella',
    name: 'Lillian Stella',
    role: 'CHIEF FINANCIAL OFFICER',
    image: ASSETS.images.team3Cfo,
    tier: 'executive',
    bio: 'Spearheads fiscal stewardship, enterprise balance sheet allocation, capital adequacy standards, and international investor relations.',
  },
  {
    id: 'arthur-sterling',
    name: 'Arthur Sterling',
    role: 'CHIEF RISK & COMPLIANCE OFFICER',
    image: ASSETS.images.team4Cro,
    tier: 'executive',
    bio: 'Directs global compliance frameworks, cybersecurity risk mitigation, and prudent credit evaluation protocols.',
  },

  // ROW 2: Mid-Career Leaders (40s, Departmental / Divisional Leadership with Unique Titles)
  {
    id: 'marcus-adebayo',
    name: 'Marcus Adebayo',
    role: 'HEAD OF WEALTH MANAGEMENT',
    image: ASSETS.images.team5Wealth,
    tier: 'management',
    bio: 'Directs private client advisory, high-net-worth portfolio management, and multi-asset wealth preservation solutions.',
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'VP OF GLOBAL MARKETS',
    image: ASSETS.images.team6Markets,
    tier: 'management',
    bio: 'Leads international foreign exchange operations, liquidity syndication, and cross-border treasury management.',
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    role: 'HEAD OF DIGITAL INNOVATION & TECH',
    image: ASSETS.images.team7Cto,
    tier: 'management',
    bio: 'Champions cloud core modernization, AI security systems, and high-frequency digital banking architecture.',
  },
  {
    id: 'amara-laurent',
    name: 'Amara Laurent',
    role: 'DIRECTOR OF RETAIL & CARDS',
    image: ASSETS.images.team8Digital,
    tier: 'management',
    bio: 'Spearheads retail banking expansion, premium credit card rewards programs, and customer experience excellence.',
  },
];

export const ManagementTeamSection: React.FC = () => {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.05 });
  const [selectedMember, setSelectedMember] = useState<ManagementMember | null>(null);

  // Close modal on Escape key press and manage body scroll
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedMember]);

  return (
    <section ref={ref} className="w-full bg-white py-16 sm:py-20 lg:py-24 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          {/* Eyebrow Pill */}
          <div
            className={`inline-flex items-center justify-center gap-2 mb-3 transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B81446] animate-pulse" />
            <span className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-[#B81446]">
              Executive Leadership
            </span>
          </div>

          <h2
            className={`font-poppins font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#1A1818] tracking-tight leading-tight transition-all duration-800 delay-100 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            Our Management Team
          </h2>
          <p
            className={`font-roboto text-sm sm:text-base text-gray-500 mt-2.5 sm:mt-3 font-normal transition-all duration-800 delay-200 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            Team of diverse and talented leaders.
          </p>
        </div>

        {/* 8 Management Cards (4 Columns x 2 Rows with Wave Staggered Entrance) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 items-start">
          {MANAGEMENT_MEMBERS.map((member, idx) => {
            const row = Math.floor(idx / 4);
            const col = idx % 4;
            const delay = row === 0 ? col * 120 + 100 : col * 120 + 320;

            return (
              <div
                key={member.id}
                style={{
                  transitionDelay: isInView ? `${delay}ms` : '0ms',
                }}
                className={`group flex flex-col cursor-pointer transition-all duration-800 ease-out ${
                  isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-[0.93]'
                }`}
                onClick={() => setSelectedMember(member)}
              >
                {/* Photo Container */}
                <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-gray-100 overflow-hidden shadow-xs">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    priority={idx < 4}
                    unoptimized
                    className="object-cover object-top grayscale contrast-[115%] brightness-[92%] transition-all duration-700 ease-out group-hover:scale-105 group-hover:contrast-[120%] group-hover:brightness-[100%]"
                  />

                  {/* Subtle bottom gradient shadow */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Floating Plus (+) Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(member);
                    }}
                    aria-label={`View biography of ${member.name}`}
                    className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#1A1818] group-hover:bg-[#B81446] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(184,20,70,0.35)] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B81446]"
                  >
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-500 ease-out group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Name & Title */}
                <div className="pt-4 text-center sm:text-left">
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] leading-tight group-hover:text-[#B81446] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="font-poppins font-semibold text-[11px] sm:text-xs text-[#B81446] tracking-wider uppercase mt-1 transition-transform duration-300 group-hover:translate-x-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Leader Biography Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white shadow-2xl border border-gray-100 overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Crimson Top Accent Strip */}
            <div className="w-full h-1.5 bg-[#B81446]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-[#B81446] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Thumbnail */}
              <div className="relative w-28 h-36 flex-shrink-0 bg-gray-100 overflow-hidden shadow-sm">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  unoptimized
                  className="object-cover object-top grayscale contrast-[115%]"
                />
              </div>

              {/* Bio Details */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-poppins font-bold text-xl text-[#1A1818]">
                  {selectedMember.name}
                </h3>
                <p className="font-poppins font-semibold text-xs text-[#B81446] tracking-wider uppercase mt-0.5">
                  {selectedMember.role}
                </p>
                <p className="font-roboto text-xs sm:text-sm text-gray-600 mt-4 leading-relaxed">
                  {selectedMember.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
