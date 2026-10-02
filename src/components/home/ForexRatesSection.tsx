'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

// Vector Flag Circular Badges
const FlagCircle: React.FC<{ code: string }> = ({ code }) => {
  switch (code) {
    case 'US':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#B22234" />
          <g fill="#FFFFFF">
            <path d="M0 4.9h32v2.5H0zM0 9.8h32v2.5H0zM0 14.8h32v2.5H0zM0 19.7h32v2.5H0zM0 24.6h32v2.5H0z" />
          </g>
          <path d="M0 0h16v14.8H0z" fill="#3C3B6E" />
          {/* Star cluster dots */}
          <g fill="#FFFFFF">
            <circle cx="4" cy="3.5" r="0.9" />
            <circle cx="8" cy="3.5" r="0.9" />
            <circle cx="12" cy="3.5" r="0.9" />
            <circle cx="6" cy="6.5" r="0.9" />
            <circle cx="10" cy="6.5" r="0.9" />
            <circle cx="4" cy="9.5" r="0.9" />
            <circle cx="8" cy="9.5" r="0.9" />
            <circle cx="12" cy="9.5" r="0.9" />
          </g>
        </svg>
      );

    case 'SE':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#006AA7" />
          <path d="M10 0h4v32h-4zM0 14h32v4H0z" fill="#FECC00" />
        </svg>
      );

    case 'GB':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#012169" />
          {/* White diagonals */}
          <path d="M0 0l32 32m0-32L0 32" stroke="#FFFFFF" strokeWidth="5.5" />
          {/* Red diagonals */}
          <path d="M0 0l32 32m0-32L0 32" stroke="#C8102E" strokeWidth="2.5" />
          {/* White cross */}
          <path d="M16 0v32M0 16h32" stroke="#FFFFFF" strokeWidth="8" />
          {/* Red cross */}
          <path d="M16 0v32M0 16h32" stroke="#C8102E" strokeWidth="4.5" />
        </svg>
      );

    case 'JP':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#FFFFFF" />
          <circle cx="16" cy="16" r="7.5" fill="#BC002D" />
        </svg>
      );

    case 'AU':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#00008B" />
          {/* Union Jack canton */}
          <path d="M0 0h16v16H0z" fill="#012169" />
          <path d="M0 0l16 16m0-16L0 16" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M0 0l16 16m0-16L0 16" stroke="#C8102E" strokeWidth="1.2" />
          <path d="M8 0v16M0 8h16" stroke="#FFFFFF" strokeWidth="3.5" />
          <path d="M8 0v16M0 8h16" stroke="#C8102E" strokeWidth="1.8" />
          {/* Southern cross stars */}
          <g fill="#FFFFFF">
            <polygon points="24,6 24.8,7.5 26.5,7.8 25.2,9 25.5,10.7 24,9.9 22.5,10.7 22.8,9 21.5,7.8 23.2,7.5" transform="scale(0.8) translate(6, 1)" />
            <polygon points="24,20 24.8,21.5 26.5,21.8 25.2,23 25.5,24.7 24,23.9 22.5,24.7 22.8,23 21.5,21.8 23.2,21.5" transform="scale(0.7) translate(10, 5)" />
            <polygon points="20,14 20.8,15.5 22.5,15.8 21.2,17 21.5,18.7 20,17.9 18.5,18.7 18.8,17 17.5,15.8 19.2,15.5" transform="scale(0.7) translate(8, 6)" />
          </g>
        </svg>
      );

    case 'CA':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#D80027" />
          <path d="M8 0h16v32H8z" fill="#FFFFFF" />
          {/* Stylized Canadian Maple Leaf */}
          <path
            d="M16 8l1.2 3.2 2.6-.8-.8 2.6 3 1.2-2.5 1.5 1.5 2.5-3.2-.2-.8 3.5-1-3.5-3.2.2 1.5-2.5-2.5-1.5 3-1.2-.8-2.6 2.6.8L16 8z"
            fill="#D80027"
          />
        </svg>
      );

    case 'EU':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#003399" />
          <g fill="#FFCC00">
            <circle cx="16" cy="6" r="1" />
            <circle cx="21" cy="7.5" r="1" />
            <circle cx="25" cy="11.5" r="1" />
            <circle cx="26" cy="16" r="1" />
            <circle cx="25" cy="20.5" r="1" />
            <circle cx="21" cy="24.5" r="1" />
            <circle cx="16" cy="26" r="1" />
            <circle cx="11" cy="24.5" r="1" />
            <circle cx="7" cy="20.5" r="1" />
            <circle cx="6" cy="16" r="1" />
            <circle cx="7" cy="11.5" r="1" />
            <circle cx="11" cy="7.5" r="1" />
          </g>
        </svg>
      );

    case 'CH':
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#D52B1E" />
          <path d="M13 7h6v18h-6zM7 13h18v6H7z" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
          {code}
        </div>
      );
  }
};

export const ForexRatesSection: React.FC = () => {
  const { forexRatesSection } = SITE_CONFIG;
  const [activeTab, setActiveTab] = useState<'send-receive' | 'forex-card'>('send-receive');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [startIndex, setStartIndex] = useState<number>(0);
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Live feed');
  const [liveMultipliers, setLiveMultipliers] = useState<Record<string, number>>({});
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  // Fetch real-time exchange rates from public reliable exchange rate endpoint
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.result === 'success' && data.rates && isMounted) {
          const inrPerUsd = data.rates['INR'] || 83.5;
          const multipliers: Record<string, number> = {};

          // Compute relative strength
          forexRatesSection.currencies.forEach(curr => {
            const rateVsUsd = data.rates[curr.code];
            if (rateVsUsd) {
              multipliers[curr.code] = inrPerUsd / rateVsUsd;
            }
          });

          setLiveMultipliers(multipliers);
          setIsLiveRates(true);
          const now = new Date();
          setLastUpdated(
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        }
      } catch {
        // Graceful fallback to static bank rates from config
        setIsLiveRates(false);
      }
    }

    fetchLiveRates();

    // Refresh every 5 minutes
    const interval = setInterval(fetchLiveRates, 300000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [forexRatesSection.currencies]);

  // Compute displayed rates based on tab (spread differences) & live status
  const getComputedRates = (curr: (typeof forexRatesSection.currencies)[number]) => {
    const isCard = activeTab === 'forex-card';
    const liveVal = liveMultipliers[curr.code];

    let baseSend: number = curr.baseSend;
    let baseReceive: number = curr.baseReceive;

    if (liveVal && isLiveRates) {
      baseSend = Number((liveVal * 1.018).toFixed(2));
      baseReceive = Number((liveVal * 0.982).toFixed(2));
    }

    // Forex card offers preferred tighter margins
    if (isCard) {
      const sendDiscount = baseSend * 0.992;
      const receiveBoost = baseReceive * 1.008;
      return {
        send: sendDiscount.toFixed(2),
        receive: receiveBoost.toFixed(2),
      };
    }

    return {
      send: baseSend.toFixed(2),
      receive: baseReceive.toFixed(2),
    };
  };

  const visibleCardsCount = 6;
  const totalCurrencies = forexRatesSection.currencies.length;

  const handleNext = () => {
    setStartIndex(prev => (prev + 1) % (totalCurrencies - visibleCardsCount + 1));
  };

  const handlePrev = () => {
    setStartIndex(prev => (prev === 0 ? totalCurrencies - visibleCardsCount : prev - 1));
  };

  const visibleCurrencies = forexRatesSection.currencies.slice(
    startIndex,
    startIndex + visibleCardsCount
  );

  const activeCurrencyData =
    forexRatesSection.currencies.find(c => c.code === selectedCurrency) ||
    forexRatesSection.currencies[0];
  const activeRates = getComputedRates(activeCurrencyData);

  return (
    <section
      ref={ref}
      className="relative w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0C0C10] text-white overflow-hidden select-none"
    >
      {/* Background Image with Dark Vignette Overlays & Subtle Zoom */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={ASSETS.backgrounds.forex}
          alt="Forex Trading Candlestick Background"
          fill
          className={`object-cover object-center grayscale contrast-125 opacity-20 transition-transform duration-1000 ease-out ${
            isInView ? 'scale-100' : 'scale-105'
          }`}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C10]/95 via-[#0C0C10]/80 to-[#0C0C10]/95" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header - Digital Dropdown Reveal */}
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-700 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight">
            {forexRatesSection.title}
          </h2>
          <p className="font-roboto text-sm sm:text-base text-gray-400 mt-2 font-normal">
            {forexRatesSection.subtitle}
          </p>

          {/* Live Rate Status Indicator */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 mt-3.5 bg-white/5 border border-white/10 rounded-none transition-all duration-700 delay-200 ease-out ${
              isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            {isLiveRates && (
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-roboto text-xs text-gray-300 font-normal">
              {isLiveRates ? `Live Market Rates | Updated ${lastUpdated}` : 'Bank Spot Exchange Rates'}
            </span>
          </div>
        </div>

        {/* Top Control Bar: Mode Tabs (Left) & Assistant Action (Right) */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 mb-8 transition-all duration-700 delay-300 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Left Tabs: Money Send & Receive vs Load & Redeem Forex Card */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('send-receive')}
              className={`px-5 sm:px-6 py-2.5 font-roboto text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer rounded-none border ${
                activeTab === 'send-receive'
                  ? 'border-[#B81446] text-[#B81446] bg-[#B81446]/10'
                  : 'border-white/15 text-gray-400 hover:border-white/30 hover:text-white bg-white/[0.02]'
              }`}
            >
              {forexRatesSection.tabs[0].label}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('forex-card')}
              className={`px-5 sm:px-6 py-2.5 font-roboto text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer rounded-none border ${
                activeTab === 'forex-card'
                  ? 'border-[#B81446] text-[#B81446] bg-[#B81446]/10'
                  : 'border-white/15 text-gray-400 hover:border-white/30 hover:text-white bg-white/[0.02]'
              }`}
            >
              {forexRatesSection.tabs[1].label}
            </button>
          </div>

          {/* Right Action: Click to Get Assistant */}
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="group flex items-center gap-2 text-xs sm:text-sm font-roboto font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {/* Red Triple-Bar / Assistant Icon */}
            <span className="flex flex-col gap-1 w-3.5">
              <span className="block h-[2px] w-full bg-[#B81446] group-hover:bg-[#E52E5E] transition-colors" />
              <span className="block h-[2px] w-full bg-[#B81446] group-hover:bg-[#E52E5E] transition-colors" />
              <span className="block h-[2px] w-full bg-[#B81446] group-hover:bg-[#E52E5E] transition-colors" />
            </span>
            <span>{forexRatesSection.assistantText}</span>
          </button>
        </div>

        {/* Currency Cards Row (6 Cards as shown in template) - Staggered Wave Flip Cascade */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {visibleCurrencies.map((curr, idx) => {
            const rates = getComputedRates(curr);
            const isLastCard = idx === visibleCurrencies.length - 1;
            const cardDelays = [
              'delay-150',
              'delay-[250ms]',
              'delay-[350ms]',
              'delay-[450ms]',
              'delay-[550ms]',
              'delay-[650ms]',
            ];

            return (
              <div
                key={curr.code}
                onClick={() => {
                  setSelectedCurrency(curr.code);
                  setIsAssistantOpen(true);
                }}
                className={`group relative bg-black/60 backdrop-blur-md border p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-700 ease-out rounded-none cursor-pointer transform ${
                  cardDelays[idx % cardDelays.length]
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-12 scale-90'
                } ${
                  selectedCurrency === curr.code
                    ? 'border-[#B81446] shadow-xl shadow-[#B81446]/15'
                    : 'border-white/10 hover:border-white/30 hover:bg-black/75'
                }`}
              >
                {/* Circular Flag Icon */}
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md group-hover:scale-105 transition-all duration-500 ease-out ${
                    isInView ? 'scale-100 rotate-0' : 'scale-75 -rotate-12'
                  }`}
                >
                  <FlagCircle code={curr.flag} />
                </div>

                {/* Currency Code */}
                <h3 className="font-poppins font-bold text-white text-sm sm:text-base tracking-wider mt-3 mb-3.5">
                  {curr.code}
                </h3>

                {/* Send & Receive Rates */}
                <div className="w-full space-y-1.5 font-roboto text-xs sm:text-[13px] border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Send</span>
                    <span className="text-gray-500">:</span>
                    <span className="font-medium text-white group-hover:text-[#FF4A7A] transition-colors">
                      {rates.send}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Receive</span>
                    <span className="text-gray-500">:</span>
                    <span className="font-medium text-white group-hover:text-[#FF4A7A] transition-colors">
                      {rates.receive}
                    </span>
                  </div>
                </div>

                {/* Carousel Navigation Arrows on the Last Card as in template */}
                {isLastCard && totalCurrencies > visibleCardsCount && (
                  <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white/10 w-full">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-none transition-colors"
                      aria-label="Previous Currencies"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-none transition-colors"
                      aria-label="Next Currencies"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Live Forex Converter / Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#14141A] border border-white/20 p-6 sm:p-8 rounded-none shadow-2xl text-white">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAssistantOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                <FlagCircle code={activeCurrencyData.flag} />
              </div>
              <div>
                <h3 className="font-poppins text-lg font-bold text-white">
                  Forex Assistant & Live Calculator
                </h3>
                <p className="font-roboto text-xs text-gray-400">
                  {activeCurrencyData.name} ({activeCurrencyData.code})
                </p>
              </div>
            </div>

            {/* Live Calculation Inputs */}
            <div className="mt-6 space-y-4">
              {/* Currency Selector */}
              <div>
                <label className="block font-roboto text-xs text-gray-400 mb-1">
                  Select Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={e => setSelectedCurrency(e.target.value)}
                  className="w-full bg-[#1C1C24] border border-white/15 px-3 py-2.5 text-sm text-white rounded-none focus:outline-none focus:border-[#B81446]"
                >
                  {forexRatesSection.currencies.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#1C1C24]">
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-roboto text-xs text-gray-400 mb-1">
                  Amount to Send ({selectedCurrency})
                </label>
                <input
                  type="number"
                  min="1"
                  value={calcAmount}
                  onChange={e => setCalcAmount(Number(e.target.value) || 0)}
                  className="w-full bg-[#1C1C24] border border-white/15 px-3 py-2.5 text-sm text-white rounded-none focus:outline-none focus:border-[#B81446]"
                />
              </div>

              {/* Live Conversion Summary */}
              <div className="bg-[#1A1822] p-4 border border-[#B81446]/30 rounded-none space-y-2 mt-4">
                <div className="flex justify-between text-xs text-gray-400 font-roboto">
                  <span>Current Bank Send Rate</span>
                  <span className="text-white font-medium">1 {selectedCurrency} = {activeRates.send}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-roboto">
                  <span>Mode Applied</span>
                  <span className="text-[#E52E5E]">
                    {activeTab === 'send-receive' ? 'Standard Remittance' : 'Zero-Fee Forex Card'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="font-poppins text-sm font-semibold text-white">Estimated Total:</span>
                  <span className="font-poppins text-lg font-bold text-[#E52E5E]">
                    {(calcAmount * Number(activeRates.send)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAssistantOpen(false)}
                className="flex-1 bg-[#B81446] hover:bg-[#9C113D] text-white py-3 font-roboto text-sm font-semibold rounded-none transition-colors cursor-pointer"
              >
                Lock In This Rate
              </button>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(false)}
                className="px-5 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white py-3 font-roboto text-sm rounded-none transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
