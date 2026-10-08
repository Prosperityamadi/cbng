'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { FooterSection, useInView } from '@/components/home';

const FAQS = [
  {
    question: 'What documents do I need to open a bank account online?',
    answer:
      'To open an account online, you will need a valid government-issued photo ID (passport, national ID card, or driving license), proof of address (utility bill or bank statement issued within the last 3 months), and a phone capable of completing our quick 3-minute Video KYC verification.',
  },
  {
    question: 'Can non-residents or expatriates open an account with NemiCapital?',
    answer:
      'Yes, NemiCapital International Bank specializes in cross-border wealth management. Non-residents can open Multi-Currency Global Accounts and Private Wealth Suites online with valid international passport verification and tax residency documentation.',
  },
  {
    question: 'How long does the digital account opening and approval take?',
    answer:
      'The entire digital application typically takes under 5 minutes. Following automated identity verification and Video KYC, your account is activated instantaneously with immediate digital banking access and instant virtual debit card issuance.',
  },
  {
    question: 'Are my deposits protected and insured?',
    answer:
      'All deposits placed with NemiCapital International Bank are strictly secured under regulatory banking reserve guidelines, with deposit insurance coverage up to the maximum statutory limit per depositor. Additionally, all accounts are shielded by zero-trust institutional encryption.',
  },
  {
    question: 'What are the fees for international wire transfers?',
    answer:
      'NemiCapital Multi-Currency and Premier account holders enjoy zero incoming wire fees. Outgoing international transfers via SWIFT and SEPA are executed at direct interbank wholesale rates with complete upfront transparency and zero hidden exchange markups.',
  },
];

interface ShowcaseCard {
  id: string;
  title: string;
  description: string;
  image: any;
  href: string;
}

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    id: 'savings',
    title: 'Savings Account',
    description: 'Open account now and earn upto 8%',
    image: ASSETS.images.piggyvest,
    href: '#',
  },
  {
    id: 'current',
    title: 'Current Account',
    description: 'Open account now and earn upto 5%',
    image: ASSETS.images.manTypingOnLaptop,
    href: '#',
  },
  {
    id: 'fixed',
    title: 'Fixed Deposit Account',
    description: 'Open account now and earn upto 10%',
    image: ASSETS.images.money,
    href: '#',
  },
];

interface SpecialtyTab {
  id: 'trading' | 'tax' | 'gold';
  tag: string;
  title: string;
  brand: string;
  icon: any;
  eyebrow: string;
  description: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
  bgTabClass: string;
}

const SPECIALTY_TABS: SpecialtyTab[] = [
  {
    id: 'trading',
    tag: 'Trading & Demat a/c',
    title: 'Trading & Demat a/c',
    brand: 'NemiCapital Bank',
    icon: ASSETS.icons.trading,
    eyebrow: 'Trading & Demat a/c',
    description:
      'The claims of duty or the obligations business it will frequently pleasures repudiated fruitions in nothing.',
    bullets: [
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
    ],
    ctaText: 'Open Trading Account',
    ctaHref: '/register',
    bgTabClass: 'bg-[#009FB7]',
  },
  {
    id: 'tax',
    tag: 'Tax Savings a/c',
    title: 'Tax Savings a/c',
    brand: 'NemiCapital Bank',
    icon: ASSETS.icons.savingFinancial,
    eyebrow: 'Tax Savings a/c',
    description:
      'The claims of duty or the obligations business it will frequently pleasures repudiated fruitions in nothing.',
    bullets: [
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
    ],
    ctaText: 'Open Tax Savings Account',
    ctaHref: '/register',
    bgTabClass: 'bg-[#008A9B]',
  },
  {
    id: 'gold',
    tag: 'Gold Savings a/c',
    title: 'Gold Savings a/c',
    brand: 'NemiCapital Bank',
    icon: ASSETS.icons.gold,
    eyebrow: 'Gold Savings a/c',
    description:
      'The claims of duty or the obligations business it will frequently pleasures repudiated fruitions in nothing.',
    bullets: [
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
      'Explore of the master-builder',
      'On the other hand',
      'Perfectly simple & easy',
    ],
    ctaText: 'Open Gold Account',
    ctaHref: '/register',
    bgTabClass: 'bg-[#181818]',
  },
];

interface AccountStep {
  stepNumber: string;
  title: string;
  description: string;
  icon: any;
  bgGradient: string;
}

const ACCOUNT_STEPS: AccountStep[] = [
  {
    stepNumber: 'STEP 01',
    title: 'Consult With Our Experts',
    description: 'The claims off duty or the obligations business it will frequently occur.',
    icon: ASSETS.icons.guidance,
    bgGradient: 'bg-[#00A8B5]',
  },
  {
    stepNumber: 'STEP 02',
    title: 'Submit Required Documents',
    description: 'Toil and pain cases are perfectly simple and easy to all our distinguish.',
    icon: ASSETS.icons.document,
    bgGradient: 'bg-[#0288D1]',
  },
  {
    stepNumber: 'STEP 03',
    title: 'KYC Verification',
    description: 'The claims off duty or the obligations business it will frequently occur.',
    icon: ASSETS.icons.kyc,
    bgGradient: 'bg-[#1565C0]',
  },
  {
    stepNumber: 'STEP 04',
    title: 'Start Savings For Your Future',
    description: 'Toil and pain cases are perfectly simple and easy to all our distinguish.',
    icon: ASSETS.icons.retirementPlanning,
    bgGradient: 'bg-[#5C52A7]',
  },
];

export default function AccountsPage() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState<'trading' | 'tax' | 'gold'>('gold');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Unique IntersectionObserver hooks for scroll animations across sections
  const { ref: showcaseRef, isInView: isShowcaseInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: specialtyRef, isInView: isSpecialtyInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: stepsRef, isInView: isStepsInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: appRef, isInView: isAppInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: faqRef, isInView: isFaqInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const currentSpecialty = SPECIALTY_TABS.find(t => t.id === activeSpecialtyTab) || SPECIALTY_TABS[2];

  return (
    <main className="w-full min-h-screen bg-[#FAF7F3] flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Matches user screenshot)
             - Customer support team image in grayscale
             - Dark atmospheric cinematic overlay
             - Overlapping white card with red top border: "All Accounts"
             - Breadcrumbs on the right: "Home > All Accounts"
          ========================================================================= */}
      <section className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#1A1818] z-20">
        {/* Background Photography with Grayscale & Contrast (clipped to section) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={ASSETS.images.customerRep}
            alt="NemiCapital Bank Customer Support"
            fill
            priority
            unoptimized
            className="object-cover object-[center_35%] grayscale contrast-[115%] brightness-[85%]"
          />
          {/* Dark Atmospheric Gradient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/75" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Content Container aligned at the bottom */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end justify-between">
          
          {/* Overlapping White Box with Crimson Top Border: "All Accounts" */}
          <div className="bg-white border-t-4 border-[#B81446] px-6 sm:px-10 md:px-12 pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-6 md:pb-6 shadow-2xl relative -mb-5 sm:-mb-6 z-30 animate-fadeInUp transition-all">
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1A1818] tracking-tight leading-snug pb-1 whitespace-nowrap block">
              All Accounts
            </h1>
          </div>

          {/* Breadcrumbs on the bottom right */}
          <div className="hidden sm:flex items-center gap-2 pb-4 text-xs sm:text-sm font-medium text-white/90 animate-fadeIn delay-200">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-white/40">&gt;</span>
            <Link
              href="/services"
              className="text-white/80 hover:text-white transition-colors"
            >
              Services
            </Link>
            <span className="text-white/40">&gt;</span>
            <span className="text-white font-semibold">All Accounts</span>
          </div>

        </div>
      </section>

      {/* Sub-strip for mobile breadcrumbs if screen is small */}
      <div className="sm:hidden w-full bg-[#FAF7F3] border-b border-[#EFE8DF] px-4 pt-8 pb-3">
        <div className="flex items-center gap-2 text-xs text-[#756D67]">
          <Link href="/" className="hover:text-[#B81446]">Home</Link>
          <span>&gt;</span>
          <Link href="/services" className="hover:text-[#B81446]">Services</Link>
          <span>&gt;</span>
          <span className="text-[#1A1818] font-semibold">All Accounts</span>
        </div>
      </div>

      {/* =========================================================================
          2. SHOWCASE ACCOUNTS SECTION (Matches User Screenshot)
             - Scroll animation: Header drops down smoothly, cards rise with unique 3D tilt & pop
          ========================================================================= */}
      <section ref={showcaseRef} className="w-full bg-white pt-20 sm:pt-24 pb-20 sm:pb-24 border-b border-[#EDE5DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Header with downward slide & fade */}
          <div
            className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out ${
              isShowcaseInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            <div className="inline-flex items-center justify-center gap-2.5 mb-3">
              <span className="w-5 h-[2px] bg-[#B81446]" />
              <span className="font-poppins font-bold text-xs uppercase tracking-[0.2em] text-[#B81446]">
                Premier Banking Solutions
              </span>
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#1A1818] tracking-tight leading-tight">
              Accounts Engineered for Financial Excellence
            </h2>
            <p className="font-roboto text-sm sm:text-base text-[#666666] mt-3.5 max-w-2xl mx-auto leading-relaxed">
              Discover tailored personal, corporate, and foreign currency accounts designed with high yield, institutional security, and seamless international liquidity.
            </p>
          </div>

          {/* 3 Showcase Cards in a Row: Staggered 3D Tilt & Pop Rise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {SHOWCASE_CARDS.map((card, idx) => {
              const isHovered = hoveredCardId === card.id;

              // Unique animation styles for each card
              const animationClass = idx === 0
                ? (isShowcaseInView ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-16 -rotate-2')
                : idx === 1
                ? (isShowcaseInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95')
                : (isShowcaseInView ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-16 rotate-2');

              const delayClass = idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : 'delay-350';

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`group relative flex flex-col transition-all duration-700 ease-out hover:-translate-y-2 select-none ${animationClass} ${delayClass}`}
                >
                  {/* Top Image Container with Grayscale Effect */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100 shadow-md">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      unoptimized
                      priority
                      className={`object-cover transition-all duration-500 ${
                        isHovered
                          ? 'grayscale-0 contrast-100 scale-105 brightness-100'
                          : 'grayscale contrast-[110%] brightness-[92%]'
                      }`}
                    />
                    {/* Subtle Dark Gradient overlay at bottom for smooth contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Overlapping Content Box (Dark & Red arrow ONLY on hover, White on default) */}
                  <div
                    className={`relative -mt-10 sm:-mt-12 mx-3 sm:mx-4 p-5 sm:p-6 transition-all duration-300 shadow-xl ${
                      isHovered
                        ? 'bg-[#1A1818] text-white shadow-2xl ring-1 ring-white/10'
                        : 'bg-white text-[#1A1818] border border-[#EDE5DB] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isHovered ? (
                        <span className="text-[#B81446] font-bold text-base leading-none transition-transform duration-200">
                          &rarr;
                        </span>
                      ) : (
                        <span className="w-0 overflow-hidden" />
                      )}
                      <h3
                        className={`font-poppins font-bold text-base sm:text-lg transition-colors leading-snug ${
                          isHovered ? 'text-[#B81446]' : 'text-[#1A1818]'
                        }`}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`font-roboto text-xs sm:text-[13px] mt-1.5 transition-colors leading-relaxed ${
                        isHovered ? 'text-gray-300' : 'text-[#777777]'
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SPECIALTY ACCOUNTS SPLIT BANNER & TABS (Matches User Screenshot)
             - Scroll animation: Left image zooms in with cinematic unveil,
               right panel slides in with checkmark domino cascade,
               and bottom tabs rise with glow.
          ========================================================================= */}
      <section ref={specialtyRef} className="w-full bg-[#161616] text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[540px]">
          {/* Left Column: Image with cinematic zoom and gradient blend */}
          <div className="w-full lg:w-1/2 relative min-h-[340px] sm:min-h-[420px] lg:min-h-full overflow-hidden">
            <Image
              src={ASSETS.images.couplesSmiling}
              alt="Couples Smiling with Tablet"
              fill
              priority
              unoptimized
              className={`object-cover object-[center_35%] grayscale contrast-[112%] brightness-[85%] transition-transform duration-1000 ease-out ${
                isSpecialtyInView ? 'scale-100' : 'scale-110'
              }`}
            />
            {/* Smooth dark vignette fading to the right into the black content */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-black/40 to-[#161616]" />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          </div>

          {/* Right Column: Content with slide-in from right */}
          <div
            className={`w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-14 xl:p-16 relative z-10 bg-[#161616] transition-all duration-800 ease-out ${
              isSpecialtyInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div>
              {/* Active Tab Eyebrow in Crimson Red */}
              <div className="font-poppins font-bold text-xs uppercase tracking-[0.2em] text-[#B81446] mb-2">
                {currentSpecialty.eyebrow}
              </div>

              {/* Main Heading */}
              <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.15]">
                Step To Make<br />Your Dreams Possible
              </h2>

              {/* Description */}
              <p className="font-roboto text-xs sm:text-[13px] text-gray-400 mt-4 max-w-xl leading-relaxed">
                {currentSpecialty.description}
              </p>

              {/* 6 Bullet Points with Staggered Cascading Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-6 pt-5 border-t border-white/10 max-w-xl">
                {currentSpecialty.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    style={{ transitionDelay: `${(idx + 1) * 70}ms` }}
                    className={`flex items-center gap-2.5 text-xs text-gray-300 transition-all duration-500 ease-out ${
                      isSpecialtyInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                  >
                    <span className="text-[#B81446] font-bold text-sm flex-shrink-0">&#10003;</span>
                    <span className="truncate">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3 Interactive Tabs with slide-up reveal */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-0 mt-8 pt-6 border-t border-white/10 lg:border-t-0 transition-all duration-700 delay-300 ease-out ${
                isSpecialtyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {SPECIALTY_TABS.map(tab => {
                const isActive = activeSpecialtyTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSpecialtyTab(tab.id)}
                    className={`flex items-center gap-3.5 p-4 text-left transition-all duration-200 border-b-2 sm:border-b-0 sm:border-t-2 ${
                      isActive
                        ? `${tab.bgTabClass} sm:border-[#B81446] shadow-lg brightness-105`
                        : `${tab.bgTabClass} opacity-85 hover:opacity-100 sm:border-transparent hover:brightness-110`
                    }`}
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={tab.icon}
                        alt={tab.title}
                        width={32}
                        height={32}
                        unoptimized
                        priority
                        className="w-7 h-7 object-contain brightness-0 invert"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/75 block leading-tight">
                        {tab.brand}
                      </span>
                      <span className="font-poppins font-bold text-xs sm:text-[13px] text-white block leading-snug truncate">
                        {tab.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. YOUR ACCOUNT IN EASY STEPS (Matches User Screenshot)
             - Scroll animation: Sequential wave cascade where each step card
               pops up with a unique spring lift and diagonal ribbon shine.
          ========================================================================= */}
      <section ref={stepsRef} className="w-full bg-white py-20 sm:py-24 border-b border-[#EDE5DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Header with zoom pop */}
          <div
            className={`text-center max-w-2xl mx-auto mb-14 sm:mb-16 transition-all duration-700 ease-out ${
              isStepsInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1A1818] tracking-tight leading-tight">
              Your Account In Easy Steps
            </h2>
            <p className="font-roboto text-xs sm:text-sm text-[#777777] mt-2">
              We show our value by serving faithfully.
            </p>
          </div>

          {/* 4 Cards Grid with sequential domino wave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {ACCOUNT_STEPS.map((step, idx) => {
              const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
              return (
                <div
                  key={idx}
                  className={`relative overflow-hidden ${step.bgGradient} p-6 sm:p-7 pt-9 shadow-md hover:shadow-2xl transition-all duration-700 ease-out hover:-translate-y-2 flex flex-col justify-between min-h-[260px] group ${delays[idx]} ${
                    isStepsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
                  }`}
                >
                  {/* Top-Right Diagonal Ribbon for STEP 01 - 04 */}
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div className="absolute transform rotate-45 bg-white text-[#1A1818] text-[9px] font-poppins font-bold uppercase tracking-widest py-1 -right-8 top-4 w-32 text-center shadow-sm">
                      {step.stepNumber}
                    </div>
                  </div>

                  <div>
                    {/* Step Icon */}
                    <div className="w-12 h-12 flex items-center justify-start mb-6 transition-transform duration-300 group-hover:scale-110">
                      <Image
                        src={step.icon}
                        alt={step.title}
                        width={40}
                        height={40}
                        unoptimized
                        priority
                        className="w-10 h-10 object-contain brightness-0 invert"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-poppins font-bold text-base sm:text-[17px] text-white leading-snug mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="font-roboto text-xs text-white/85 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. OPEN YOUR ACCOUNT IN 5 MINS (Matches User Screenshot)
             - Scroll animation: 3D perspective floating rise of the smartphone,
               with Google Play & App Store buttons sliding in from opposite sides.
          ========================================================================= */}
      <section ref={appRef} className="w-full bg-[#FAF7F3] py-20 sm:py-24 border-b border-[#EDE5DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Centered Heading & Subtitle */}
          <div
            className={`max-w-2xl mx-auto mb-10 sm:mb-12 transition-all duration-700 ease-out ${
              isAppInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#1A1818] tracking-tight leading-tight">
              Open Your Account In 5 Mins
            </h2>
            <p className="font-roboto text-xs sm:text-sm text-[#777777] mt-2.5 max-w-lg mx-auto leading-relaxed">
              Imagine reaching your goals faster with the help of our banking tools.
            </p>
          </div>

          {/* 3D Centerpiece: Smartphone with Floating Levitation Entrance */}
          <div className="relative max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto mb-8 sm:mb-10 px-2 sm:px-4">
            <div
              className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-1000 ease-out hover:scale-[1.01] ${
                isAppInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'
              }`}
            >
              <Image
                src={ASSETS.images.nemicapitalAppHands}
                alt="Open NemiCapital Account in 5 Mins on Mobile App"
                fill
                priority
                unoptimized
                className="object-contain object-center"
              />
            </div>
          </div>

          {/* Footnote & Action Buttons sliding in from left and right */}
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="font-roboto text-xs sm:text-sm text-[#777777] font-medium">
              Available for Android and iOS.
            </p>

            <div className="flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
              {/* Google Play Store Badge: Slides in from left */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                className={`group flex items-center gap-3.5 px-6 py-3.5 bg-white hover:bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB] shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-0.5 min-w-[220px] cursor-pointer text-left ${
                  isAppInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
              >
                <div className="w-7 h-7 relative flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={ASSETS.icons.playstore}
                    alt="Google Play Store"
                    width={28}
                    height={28}
                    className="object-contain w-auto h-auto max-h-7"
                  />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#4B5563] uppercase">
                    GET IT ON
                  </span>
                  <span className="font-poppins font-bold text-sm sm:text-[15px] text-[#111827] tracking-tight whitespace-nowrap mt-0.5">
                    Download on playstore
                  </span>
                </div>
              </button>

              {/* Apple App Store Badge: Slides in from right */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
                className={`group flex items-center gap-3.5 px-6 py-3.5 bg-[#B81446] hover:bg-[#9E113B] text-white shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-0.5 min-w-[220px] cursor-pointer text-left ${
                  isAppInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
              >
                <div className="w-7 h-7 relative flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={ASSETS.icons.appstore}
                    alt="Apple App Store"
                    width={26}
                    height={26}
                    className="object-contain w-auto h-auto max-h-7 brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-white/85 uppercase">
                    DOWNLOAD ON THE
                  </span>
                  <span className="font-poppins font-bold text-sm sm:text-[15px] text-white tracking-tight whitespace-nowrap mt-0.5">
                    Download on App Store
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FREQUENTLY ASKED QUESTIONS ACCORDION
             - Scroll animation: Accordion items reveal in a cascading downward sequence.
          ========================================================================= */}
      <section ref={faqRef} className="w-full bg-white py-16 sm:py-20 border-t border-[#EDE5DB]/70 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-10 transition-all duration-700 ease-out ${
              isFaqInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            <span className="font-poppins font-bold text-xs uppercase tracking-[0.2em] text-[#B81446]">
              Frequently Asked Questions
            </span>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#1A1818] mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{ transitionDelay: `${(idx + 1) * 80}ms` }}
                  className={`bg-white border border-[#E7DFD4] shadow-sm hover:shadow-md transition-all duration-600 ease-out overflow-hidden ${
                    isFaqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <span className="font-poppins font-semibold text-base sm:text-lg text-[#1A1818]">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-none transition-transform duration-200 ${
                        isOpen ? 'bg-[#B81446] text-white rotate-180' : 'bg-gray-100 text-[#1A1818]'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 border-t border-[#F4EFEA] text-sm text-[#666666] font-roboto leading-relaxed animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
