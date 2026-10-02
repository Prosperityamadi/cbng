'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface TickerItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: 'SPX', name: 'S&P 500', value: '5,864.20', change: '+0.42%', isPositive: true },
  { symbol: 'US10Y', name: '10-Yr Treasury', value: '3.78%', change: '-3.2 bps', isPositive: false },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', value: '1.1162', change: '+0.18%', isPositive: true },
  { symbol: 'XAU', name: 'Gold (Oz)', value: '$2,624.50', change: '+0.65%', isPositive: true },
  { symbol: 'WTI', name: 'Crude Oil', value: '$71.40', change: '-0.85%', isPositive: false },
  { symbol: 'FEDFUNDS', name: 'Fed Target Rate', value: '4.75% - 5.00%', change: '+0.00%', isPositive: true },
];

export const MarketTickerStrip: React.FC = () => {
  return (
    <div className="w-full bg-[#141212] border-y border-stone-800 text-white overflow-hidden py-3 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Label Badge */}
        <div className="hidden md:flex items-center gap-2 pr-6 border-r border-stone-800 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#B81446] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-poppins font-bold text-[11px] uppercase tracking-[0.2em] text-[#B81446]">
            Live Benchmarks
          </span>
        </div>

        {/* Ticker Items Container with Smooth Horizontal Flow */}
        <div className="flex-1 flex items-center justify-around overflow-x-auto no-scrollbar gap-6 sm:gap-8 px-2">
          {TICKER_DATA.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 cursor-default group transition-transform duration-200 hover:scale-105"
            >
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 group-hover:text-white transition-colors">
                  {item.name}
                </span>
                <span className="font-poppins font-bold text-xs sm:text-sm text-white">
                  {item.value}
                </span>
              </div>

              {/* Trend Pill with User's Custom uptrend.png and downtrend.png Icons */}
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 relative flex-shrink-0">
                  <Image
                    src={item.isPositive ? ASSETS.icons.uptrend : ASSETS.icons.downtrend}
                    alt={item.isPositive ? 'Uptrend' : 'Downtrend'}
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-xs ${
                    item.isPositive
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                      : 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
