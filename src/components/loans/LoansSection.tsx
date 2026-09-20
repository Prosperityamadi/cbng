'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export type LoanType = 
  | 'Home Loan' 
  | 'Vehicles Loan' 
  | 'Personal Loan' 
  | 'Business Loan' 
  | 'Gold Loan';

interface LoanCategoryConfig {
  name: LoanType;
  icon: any;
  tagline: string;
  interestRate: string;
  maxTenure: string;
  maxAmount: string;
  perks: string[];
}

const LOAN_CATEGORIES: LoanCategoryConfig[] = [
  {
    name: 'Home Loan',
    icon: ASSETS.icons.buyHome,
    tagline: 'Competitive mortgage financing for purchasing, building, or renovating your dream home.',
    interestRate: '5.49% APR',
    maxTenure: 'Up to 30 Years',
    maxAmount: 'Up to $2,500,000',
    perks: [
      'Zero prepayment or foreclosure penalties',
      'Up to 90% property value financing',
      'Instant digital pre-approval in 24 hours',
      'Special discounted rates for green & solar homes',
    ],
  },
  {
    name: 'Vehicles Loan',
    icon: ASSETS.icons.carLoan,
    tagline: 'Drive home your dream car, commercial truck, or electric vehicle with tailored auto financing.',
    interestRate: '4.89% APR',
    maxTenure: 'Up to 7 Years',
    maxAmount: 'Up to $150,000',
    perks: [
      'Up to 100% on-road financing available',
      'Special concession rates for Electric Vehicles (EVs)',
      'Minimal documentation with instant showroom approval',
      'Flexible step-up and balloon repayment options',
    ],
  },
  {
    name: 'Personal Loan',
    icon: ASSETS.icons.costumer,
    tagline: 'Instant, collateral-free funds for emergency medical care, weddings, travel, or debt consolidation.',
    interestRate: '8.99% APR',
    maxTenure: 'Up to 5 Years',
    maxAmount: 'Up to $75,000',
    perks: [
      '100% collateral-free with zero security required',
      'Instant disbursal within 2 hours of online verification',
      'Paperless e-KYC and digital income verification',
      'Transparent terms with no hidden administrative fees',
    ],
  },
  {
    name: 'Business Loan',
    icon: ASSETS.icons.savingFinancial,
    tagline: 'Empower enterprise expansion, inventory acquisition, equipment upgrades, and working capital.',
    interestRate: '6.75% APR',
    maxTenure: 'Up to 10 Years',
    maxAmount: 'Up to $1,000,000',
    perks: [
      'Unsecured credit lines and structured business term loans',
      'Tax-deductible interest payments for registered companies',
      'Dedicated commercial relationship manager',
      'Seasonal flexible repayment aligned with revenue cycles',
    ],
  },
  {
    name: 'Gold Loan',
    icon: ASSETS.icons.gold,
    tagline: 'Unlock immediate cash liquidity against gold jewelry with high valuation and vault security.',
    interestRate: '7.25% APR',
    maxTenure: 'Up to 3 Years',
    maxAmount: 'Up to $100,000',
    perks: [
      'Instant cash counter disbursal in under 30 minutes',
      'Industry-highest loan-to-value (LTV) per gram',
      'Zero locker storage charges in 100% insured bank vaults',
      'Pay interest only as you go, principal at maturity',
    ],
  },
];

const CORPORATE_PARTNERS = [
  { name: 'MAKERS', font: 'font-black tracking-widest text-lg sm:text-xl uppercase' },
  { name: 'xfinity', font: 'font-semibold tracking-tight text-xl sm:text-2xl lowercase' },
  { name: 'Sysco', font: 'font-serif font-bold tracking-normal text-xl sm:text-2xl' },
  { name: 'PROGRESS', font: 'font-mono font-bold tracking-widest text-lg sm:text-xl uppercase' },
  { name: 'laren', font: 'font-sans font-light italic tracking-wider text-xl sm:text-2xl lowercase' },
];

export const LoansSection: React.FC = () => {
  const [activeLoan, setActiveLoan] = useState<LoanType>('Home Loan');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    loanType: 'Home Loan' as LoanType,
    date: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Unique IntersectionObserver hooks for scroll animations across sections
  const { ref: categoriesRef, isInView: isCategoriesInView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const { ref: spotlightRef, isInView: isSpotlightInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: stepsRef, isInView: isStepsInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: callbackRef, isInView: isCallbackInView } = useInView<HTMLElement>({ threshold: 0.15 });
  const { ref: partnersRef, isInView: isPartnersInView } = useInView<HTMLElement>({ threshold: 0.15 });

  // Sync loan selection with form
  const handleSelectLoan = (loan: LoanType) => {
    setActiveLoan(loan);
    setFormData((prev) => ({ ...prev, loanType: loan }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        state: '',
        city: '',
        loanType: activeLoan,
        date: '',
      });
    }, 4500);
  };

  const currentLoanConfig = LOAN_CATEGORIES.find((l) => l.name === activeLoan) || LOAN_CATEGORIES[0];

  return (
    <div className="w-full bg-white select-none">
      
      {/* =======================================================================
          1. 5 LOAN TYPES INTERACTIVE SELECTOR (Tabs Container)
             - Scroll animation: Fan-out entrance with staggered lift
          ======================================================================= */}
      <div ref={categoriesRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6 sm:pb-8 overflow-hidden">
        {/* Loan Categories Tab Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {LOAN_CATEGORIES.map((cat, idx) => {
            const isSelected = activeLoan === cat.name;
            const delays = ['delay-100', 'delay-150', 'delay-200', 'delay-250', 'delay-300'];

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleSelectLoan(cat.name)}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 transition-all duration-600 ease-out border text-center shadow-xs cursor-pointer group ${delays[idx]} ${
                  isCategoriesInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                } ${
                  isSelected
                    ? 'bg-white border-[#B81446] ring-2 ring-[#B81446]/20 shadow-md -translate-y-1'
                    : 'bg-[#FAF7F3] border-[#EDE5DB] hover:bg-white hover:border-[#C4B9AD] hover:shadow-sm'
                }`}
              >
                {/* Custom Brand Icon */}
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 mb-2.5 transition-transform duration-200 group-hover:scale-110">
                  <Image
                    src={cat.icon}
                    alt={cat.name}
                    fill
                    sizes="44px"
                    className="object-contain"
                  />
                </div>

                <span
                  className={`font-poppins text-xs sm:text-sm font-semibold tracking-tight ${
                    isSelected ? 'text-[#B81446]' : 'text-[#2D2A29]'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#857C74] mt-0.5">
                  From {cat.interestRate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          2. FULL-WIDTH END-TO-END CINEMATIC DARK SPOTLIGHT SECTION
             - Scroll animation: Couple photo zoom-in reveal, right content slide-in
          ======================================================================= */}
      <section ref={spotlightRef} className="relative w-full bg-[#121316] text-white overflow-hidden border-y border-[#27272A] min-h-[460px] sm:min-h-[500px] flex flex-col justify-center my-2 sm:my-4">
        
        {/* Background Photo on Left Pinned to Edge of Screen with Seamless Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-full lg:w-[50%] xl:w-[48%] h-full z-0 pointer-events-none overflow-hidden">
          <Image
            src={ASSETS.images.loanCouplePlanning}
            alt="Couple planning their loan with NemiCapital"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover object-[center_35%] grayscale contrast-[115%] brightness-85 transition-all duration-1000 ease-out ${
              isSpotlightInView ? 'scale-100 opacity-100' : 'scale-110 opacity-40'
            }`}
            priority
          />
          {/* Desktop Horizontal Gradient Fade from transparent to dark background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#121316]/75 to-[#121316] hidden lg:block" />
          {/* Mobile Vertical Gradient Fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/85 to-transparent lg:hidden" />
        </div>

        {/* Content Layer Constrained to max-w-7xl for Crisp Reading */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Spacer on Desktop to let the couple photo shine */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 pointer-events-none" />

          {/* Right Column: Loan Spotlight Information (Slides in from right) */}
          <div
            className={`lg:col-span-7 xl:col-span-7 flex flex-col justify-center transition-all duration-800 ease-out ${
              isSpotlightInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            
            {/* Badge & Title */}
            <div className="flex items-center gap-3 mb-2.5">
              <span className="px-2.5 py-0.5 bg-[#B81446] text-white text-[10px] font-poppins font-semibold uppercase tracking-wider shadow-sm">
                Featured Rate
              </span>
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-sm">
                {currentLoanConfig.name}
              </h3>
            </div>

            {/* Tagline */}
            <p className="font-roboto text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5 max-w-xl drop-shadow-xs">
              {currentLoanConfig.tagline}
            </p>

            {/* Quick Metrics Bar (Pop & expand) */}
            <div
              className={`grid grid-cols-3 gap-3 sm:gap-6 py-3.5 px-4 sm:px-5 bg-white/5 border border-white/10 backdrop-blur-xs mb-5 shadow-inner transition-all duration-700 delay-300 ease-out ${
                isSpotlightInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div>
                <span className="block text-[10px] sm:text-[11px] text-zinc-400 uppercase font-medium tracking-wide">
                  Interest Rate
                </span>
                <p className="font-poppins font-bold text-sm sm:text-lg text-[#FB7185] drop-shadow-xs">
                  {currentLoanConfig.interestRate}
                </p>
              </div>
              <div>
                <span className="block text-[10px] sm:text-[11px] text-zinc-400 uppercase font-medium tracking-wide">
                  Max Tenure
                </span>
                <p className="font-poppins font-bold text-sm sm:text-base text-white">
                  {currentLoanConfig.maxTenure}
                </p>
              </div>
              <div>
                <span className="block text-[10px] sm:text-[11px] text-zinc-400 uppercase font-medium tracking-wide">
                  Max Loan Amount
                </span>
                <p className="font-poppins font-bold text-sm sm:text-base text-white">
                  {currentLoanConfig.maxAmount}
                </p>
              </div>
            </div>

            {/* Perks & Action Button Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* 4 Bullet Perks */}
              <div className="sm:col-span-7 space-y-2">
                {currentLoanConfig.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-200">
                    <span className="w-1.5 h-1.5 bg-[#E11D48] mt-1.5 flex-shrink-0" />
                    <span className="leading-snug">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Call to Action Button */}
              <div className="sm:col-span-5 flex flex-col items-start sm:items-end justify-center pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4">
                <p className="text-[11px] text-zinc-400 mb-2 font-medium">
                  Ready to calculate repayments or apply?
                </p>
                <a
                  href="#callback-form"
                  className="w-full sm:w-auto px-6 py-3 bg-[#B81446] hover:bg-[#D41B54] text-white font-poppins font-semibold text-xs uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105"
                >
                  Get Call Back Now
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================================
          3. EXPLORE AND APPLY NOW (3-Step Process matching user screenshot)
             - Scroll animation: Domino arch step connection (Step 1 slides from left,
               Step 2 pops up with scale from center, Step 3 slides from right)
          ======================================================================= */}
      <section ref={stepsRef} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-10 sm:mb-12 transition-all duration-700 ease-out ${
            isStepsInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
          }`}
        >
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#1A1818] tracking-tight">
            Explore And Apply Now
          </h2>
          <p className="font-roboto text-xs sm:text-sm text-[#736B65] mt-2 leading-relaxed">
            Customized solutions for all your banking needs.
          </p>
        </div>

        {/* 3 Step Process Grid with unique arch animations */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 01 (Slides from left-bottom) */}
          <div
            className={`relative bg-white border border-[#E8E1D9] p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-700 delay-100 ease-out hover:-translate-y-1.5 group ${
              isStepsInView ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-8 translate-y-6'
            }`}
          >
            {/* Step Number Circle Badge */}
            <div className="w-11 h-11 mx-auto -mt-11 mb-5 rounded-full bg-white border-2 border-[#E8E1D9] group-hover:border-[#B81446] flex items-center justify-center font-poppins font-semibold text-xs text-[#554F4B] group-hover:text-[#B81446] shadow-xs transition-colors">
              01
            </div>
            <h4 className="font-poppins font-bold text-sm sm:text-base text-[#1A1818] mb-2.5">
              Apply Now
            </h4>
            <p className="font-roboto text-xs text-[#736B65] leading-relaxed">
              Perfectly simple to apply for distinguish all choices and requirements.
            </p>
          </div>

          {/* Step 02 (Pops from center with scale) */}
          <div
            className={`relative bg-white border border-[#E8E1D9] p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-700 delay-250 ease-out hover:-translate-y-1.5 group ${
              isStepsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'
            }`}
          >
            <div className="w-11 h-11 mx-auto -mt-11 mb-5 rounded-full bg-white border-2 border-[#E8E1D9] group-hover:border-[#B81446] flex items-center justify-center font-poppins font-semibold text-xs text-[#554F4B] group-hover:text-[#B81446] shadow-xs transition-colors">
              02
            </div>
            <h4 className="font-poppins font-bold text-sm sm:text-base text-[#1A1818] mb-2.5">
              Get Call Back
            </h4>
            <p className="font-roboto text-xs text-[#736B65] leading-relaxed">
              Causes call duty or the obligations that will always be so reputed.
            </p>
          </div>

          {/* Step 03 (Slides from right-bottom) */}
          <div
            className={`relative bg-white border border-[#E8E1D9] p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-700 delay-400 ease-out hover:-translate-y-1.5 group ${
              isStepsInView ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-8 translate-y-6'
            }`}
          >
            <div className="w-11 h-11 mx-auto -mt-11 mb-5 rounded-full bg-white border-2 border-[#E8E1D9] group-hover:border-[#B81446] flex items-center justify-center font-poppins font-semibold text-xs text-[#554F4B] group-hover:text-[#B81446] shadow-xs transition-colors">
              03
            </div>
            <h4 className="font-poppins font-bold text-sm sm:text-base text-[#1A1818] mb-2.5">
              Process Your Request
            </h4>
            <p className="font-roboto text-xs text-[#736B65] leading-relaxed">
              Demoralized by the charms pain with the new standard and trouble.
            </p>
          </div>

        </div>

      </section>

      {/* =======================================================================
          4. SEND YOUR REQUEST & GET CALL BACK (Matches user screenshot)
             - Scroll animation: Split slide collision (Man slides from left, Form slides from right)
          ======================================================================= */}
      <section id="callback-form" ref={callbackRef} className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
        <div className="bg-[#FAF7F3] border border-[#EDE5DB] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Black & White Photo of Smiling Man (Slides from left) */}
          <div
            className={`md:col-span-5 relative min-h-[340px] md:min-h-full bg-[#1A1818] transition-all duration-800 ease-out ${
              isCallbackInView ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-12 scale-95'
            }`}
          >
            <Image
              src={ASSETS.images.loanCallbackMan}
              alt="NemiCapital Loan Advisory Expert"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-[center_20%] grayscale contrast-110"
              priority
            />
            {/* Subtle atmospheric vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Column: Callback Request Form (Slides from right) */}
          <div
            className={`md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FAF7F3] transition-all duration-800 delay-150 ease-out ${
              isCallbackInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            
            <h3 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight leading-snug">
              Send Your Request &<br className="hidden sm:inline" />
              Get Call Back
            </h3>
            <p className="font-roboto text-[11px] sm:text-xs text-[#736B65] mt-1.5 mb-6 uppercase tracking-wider">
              Fill out the necessary details and our team will contact you.
            </p>

            {submitted ? (
              <div className="p-6 bg-white border border-[#B81446] text-center shadow-sm animate-fadeIn">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#B81446] text-white flex items-center justify-center font-bold text-lg mb-2">
                  ✓
                </div>
                <h4 className="font-poppins font-bold text-base text-[#1A1818]">
                  Request Submitted!
                </h4>
                <p className="text-xs text-[#736B65] mt-1">
                  Our loan specialist will call you shortly regarding your <strong>{formData.loanType}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] placeholder-[#9E958C] focus:outline-none focus:border-[#B81446] shadow-xs"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#554F4B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] placeholder-[#9E958C] focus:outline-none focus:border-[#B81446] shadow-xs"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#554F4B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] placeholder-[#9E958C] focus:outline-none focus:border-[#B81446] shadow-xs"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#554F4B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] placeholder-[#9E958C] focus:outline-none focus:border-[#B81446] shadow-xs"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#554F4B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 3: City & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] focus:outline-none focus:border-[#B81446] shadow-xs appearance-none cursor-pointer"
                    >
                      <option value="">City</option>
                      <option value="New York">New York</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Houston">Houston</option>
                      <option value="Miami">Miami</option>
                      <option value="London">London</option>
                      <option value="Other">Other Metro</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#554F4B]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] focus:outline-none focus:border-[#B81446] shadow-xs cursor-pointer"
                    />
                  </div>
                </div>

                {/* Row 4: 5 Loans Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#736B65] mb-1">
                    Select Loan Category
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => {
                      const val = e.target.value as LoanType;
                      setFormData({ ...formData, loanType: val });
                      setActiveLoan(val);
                    }}
                    className="w-full bg-white border border-[#DDD5CA] text-xs px-3.5 py-2.5 text-[#1A1818] font-medium focus:outline-none focus:border-[#B81446] shadow-xs cursor-pointer"
                  >
                    {LOAN_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} (from {cat.interestRate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#B81446] hover:bg-[#9E0C34] text-white font-poppins font-semibold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Send Request
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* =======================================================================
          5. CORPORATE PARTNERSHIP WITH SECTION (Matches user screenshot)
             - Scroll animation: Logos float up smoothly on entrance
          ======================================================================= */}
      <section ref={partnersRef} className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EDE5DB] mt-6 overflow-hidden">
        <div
          className={`text-center mb-8 transition-all duration-700 ease-out ${
            isPartnersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs font-semibold tracking-wider uppercase text-[#8C847E]">
            Corporate Partnership With
          </p>
        </div>

        <div
          className={`flex flex-wrap items-center justify-center gap-8 sm:gap-14 lg:gap-20 transition-all duration-800 ease-out ${
            isPartnersInView ? 'opacity-60 translate-y-0 grayscale' : 'opacity-0 translate-y-6 grayscale'
          } hover:opacity-90 hover:grayscale-0`}
        >
          {CORPORATE_PARTNERS.map((partner, idx) => (
            <span
              key={partner.name}
              style={{ transitionDelay: `${(idx + 1) * 75}ms` }}
              className={`${partner.font} text-[#554F4B] hover:text-[#1A1818] transition-colors cursor-default`}
            >
              {partner.name}
            </span>
          ))}
        </div>
      </section>

    </div>
  );
};
