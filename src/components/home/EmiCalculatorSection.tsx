'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

export const EmiCalculatorSection: React.FC = () => {
  const { emiCalculatorSection } = SITE_CONFIG;
  const [activeLoanId, setActiveLoanId] = useState<'home' | 'personal' | 'car'>('home');

  const activeLoanConfig = useMemo(
    () => emiCalculatorSection.loanTypes.find(l => l.id === activeLoanId) || emiCalculatorSection.loanTypes[0],
    [activeLoanId, emiCalculatorSection.loanTypes]
  );

  const [loanAmount, setLoanAmount] = useState<number>(activeLoanConfig.defaultAmount);
  const [loanTenure, setLoanTenure] = useState<number>(activeLoanConfig.defaultTenure);
  const [interestRate, setInterestRate] = useState<number>(activeLoanConfig.defaultRate);

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  // Handle switching loan types: smoothly update presets
  const handleLoanTypeSelect = (id: 'home' | 'personal' | 'car') => {
    setActiveLoanId(id);
    const newConfig = emiCalculatorSection.loanTypes.find(l => l.id === id) || emiCalculatorSection.loanTypes[0];
    setLoanAmount(newConfig.defaultAmount);
    setLoanTenure(newConfig.defaultTenure);
    setInterestRate(newConfig.defaultRate);
  };

  // Accurate Standard Financial Reducing-Balance EMI Calculation
  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = loanTenure * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalPayable: 0 };
    }

    const emiCalc = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emiCalc * n;
    const interest = totalAmount - P;

    return {
      emi: Math.round(emiCalc),
      totalInterest: Math.round(interest),
      totalPayable: Math.round(totalAmount),
    };
  }, [loanAmount, loanTenure, interestRate]);

  return (
    <section
      ref={ref}
      className="w-full py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#EDE5DB] text-[#1A1818] select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header: Centered Title & Subtitle */}
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-700 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
          }`}
        >
          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1A1818] tracking-tight leading-tight">
            {emiCalculatorSection.title}
          </h2>
          <p className="font-roboto text-sm sm:text-base text-gray-500 mt-2 font-normal">
            {emiCalculatorSection.subtitle}
          </p>
        </div>

        {/* Main Content Layout: Left House Visual & Badges + Right Calculator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 sm:mt-16 items-center">
          {/* Left Column: House Loan Model Photo with 3 Overlaid Category Badges */}
          <div
            className={`lg:col-span-5 relative flex justify-center transition-all duration-800 delay-150 ease-out ${
              isInView ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-10'
            }`}
          >
            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-none overflow-hidden shadow-2xl border-4 border-white bg-neutral-900 group">
              <Image
                src={ASSETS.images.houseLoan}
                alt="House Handover Mortgage Loan"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-center grayscale contrast-[105%] group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* 3 Circular Category Loan Selector Badges Overlaid along Right Edge */}
            <div className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
              {/* Badge 1: Home Loan */}
              <div className="relative flex items-center justify-end group/badge cursor-pointer">
                {activeLoanId === 'home' && (
                  <div className="hidden sm:flex items-center absolute right-16 px-3 py-1 bg-white text-[#1A1818] text-xs font-poppins font-semibold shadow-md rounded-none border border-gray-200 whitespace-nowrap animate-fadeIn">
                    <span>Home Loan</span>
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-t border-r border-gray-200" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('home')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                    activeLoanId === 'home'
                      ? 'bg-[#B81446] text-white scale-110 shadow-[#B81446]/30'
                      : 'bg-white hover:bg-[#FAF7F3] text-gray-700 border border-[#E5DDD3] hover:scale-105'
                  }`}
                  aria-label="Select Home Loan"
                >
                  <div className="relative w-6 h-6">
                    <Image
                      src={ASSETS.icons.buyHome}
                      alt="Home Loan Icon"
                      fill
                      sizes="24px"
                      className={`object-contain transition-all ${
                        activeLoanId === 'home' ? 'brightness-0 invert' : ''
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Badge 2: Personal Loan */}
              <div className="relative flex items-center justify-end group/badge cursor-pointer">
                {activeLoanId === 'personal' && (
                  <div className="hidden sm:flex items-center absolute right-16 px-3 py-1 bg-white text-[#1A1818] text-xs font-poppins font-semibold shadow-md rounded-none border border-gray-200 whitespace-nowrap animate-fadeIn">
                    <span>Personal Loan</span>
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-t border-r border-gray-200" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('personal')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                    activeLoanId === 'personal'
                      ? 'bg-[#B81446] text-white scale-110 shadow-[#B81446]/30'
                      : 'bg-white hover:bg-[#FAF7F3] text-gray-700 border border-[#E5DDD3] hover:scale-105'
                  }`}
                  aria-label="Select Personal Loan"
                >
                  <div className="relative w-6 h-6">
                    <Image
                      src={ASSETS.icons.debt}
                      alt="Personal Loan Icon"
                      fill
                      sizes="24px"
                      className={`object-contain transition-all ${
                        activeLoanId === 'personal' ? 'brightness-0 invert' : ''
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Badge 3: Vehicle Loan */}
              <div className="relative flex items-center justify-end group/badge cursor-pointer">
                {activeLoanId === 'car' && (
                  <div className="hidden sm:flex items-center absolute right-16 px-3 py-1 bg-white text-[#1A1818] text-xs font-poppins font-semibold shadow-md rounded-none border border-gray-200 whitespace-nowrap animate-fadeIn">
                    <span>Vehicle Loan</span>
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-t border-r border-gray-200" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('car')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                    activeLoanId === 'car'
                      ? 'bg-[#B81446] text-white scale-110 shadow-[#B81446]/30'
                      : 'bg-white hover:bg-[#FAF7F3] text-gray-700 border border-[#E5DDD3] hover:scale-105'
                  }`}
                  aria-label="Select Vehicle Loan"
                >
                  <div className="relative w-6 h-6">
                    <Image
                      src={ASSETS.icons.carLoan}
                      alt="Car Loan Icon"
                      fill
                      sizes="24px"
                      className={`object-contain transition-all ${
                        activeLoanId === 'car' ? 'brightness-0 invert' : ''
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Calculator Sliders & Floating Result Card */}
          <div
            className={`lg:col-span-7 transition-all duration-800 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {/* Cream / Warm Ivory Background Box */}
            <div className="bg-[#FAF7F3] border border-[#EDE5DB] p-6 sm:p-10 rounded-none shadow-sm relative">
              {/* Sliders Form Container */}
              <div className="space-y-7 sm:space-y-8">
                {/* 1. Loan Amount */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="font-roboto text-xs sm:text-sm font-semibold text-[#1A1818]">
                      Loan Amount
                    </label>
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818] bg-white border border-[#DDD3C7] px-3 py-1 rounded-none shadow-xs">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={activeLoanConfig.minAmount}
                    max={activeLoanConfig.maxAmount}
                    step={activeLoanConfig.stepAmount}
                    value={loanAmount}
                    onChange={e => setLoanAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2D8CC] rounded-none appearance-none cursor-pointer accent-[#B81446]"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-roboto mt-1">
                    <span>${activeLoanConfig.minAmount.toLocaleString()}</span>
                    <span>${activeLoanConfig.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 2. Loan Term (Years) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="font-roboto text-xs sm:text-sm font-semibold text-[#1A1818]">
                      Loan Term (Years)
                    </label>
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818] bg-white border border-[#DDD3C7] px-3 py-1 rounded-none shadow-xs">
                      {loanTenure} Yrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min={activeLoanConfig.minTenure}
                    max={activeLoanConfig.maxTenure}
                    step={activeLoanConfig.stepTenure}
                    value={loanTenure}
                    onChange={e => setLoanTenure(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2D8CC] rounded-none appearance-none cursor-pointer accent-[#B81446]"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-roboto mt-1">
                    <span>{activeLoanConfig.minTenure} Yr</span>
                    <span>{activeLoanConfig.maxTenure} Yrs</span>
                  </div>
                </div>

                {/* 3. Interest Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="font-roboto text-xs sm:text-sm font-semibold text-[#1A1818]">
                      Interest Rate
                    </label>
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818] bg-white border border-[#DDD3C7] px-3 py-1 rounded-none shadow-xs">
                      {interestRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={activeLoanConfig.minRate}
                    max={activeLoanConfig.maxRate}
                    step={activeLoanConfig.stepRate}
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E2D8CC] rounded-none appearance-none cursor-pointer accent-[#B81446]"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-roboto mt-1">
                    <span>{activeLoanConfig.minRate}%</span>
                    <span>{activeLoanConfig.maxRate}%</span>
                  </div>
                </div>
              </div>

              {/* Floating Elevated Result Card */}
              <div className="mt-10 sm:mt-12 bg-white border border-[#E2DAD0] shadow-xl p-6 sm:p-7 rounded-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  {/* Left Result Block: Monthly EMI & Apply Action */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#B81446]/10 text-[#B81446] flex items-center justify-center font-bold text-xs">
                        $
                      </div>
                      <span className="font-roboto text-xs text-gray-400 font-normal">
                        Your Monthly EMI
                      </span>
                    </div>

                    <div className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#1A1818] tracking-tight mt-2.5">
                      ${emi.toLocaleString()}
                    </div>

                    <Link
                      href={emiCalculatorSection.applyHref}
                      className="mt-4 px-6 py-2.5 bg-[#FAF7F3] hover:bg-[#B81446] hover:text-white border border-[#E0D5C7] hover:border-[#B81446] text-[#1A1818] font-poppins font-semibold text-xs tracking-wider uppercase transition-all duration-200 shadow-xs cursor-pointer rounded-none active:scale-95 inline-block"
                    >
                      Apply Online
                    </Link>
                  </div>

                  {/* Right Result Block: Interest Amount & Total Amount Payable */}
                  <div className="pt-5 sm:pt-0 sm:pl-8 space-y-4 font-roboto">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-normal">
                        <span className="text-[#B81446]">→</span>
                        <span>Interest Amount</span>
                      </div>
                      <div className="font-poppins font-semibold text-base sm:text-lg text-gray-800 mt-0.5">
                        ${totalInterest.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-normal">
                        <span className="text-[#B81446]">→</span>
                        <span>Total Amount Payable</span>
                      </div>
                      <div className="font-poppins font-semibold text-base sm:text-lg text-gray-800 mt-0.5">
                        ${totalPayable.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmiCalculatorSection;
