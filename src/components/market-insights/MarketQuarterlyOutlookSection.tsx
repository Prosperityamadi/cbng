'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface ForecastMetric {
  label: string;
  metric: string;
  direction: 'up' | 'down' | 'neutral';
  subtext: string;
  insight: string;
}

const FORECASTS: ForecastMetric[] = [
  {
    label: 'Global GDP Growth',
    metric: '3.1%',
    direction: 'up',
    subtext: 'Forecast Baseline 2026/2027',
    insight: 'Resilient consumer balance sheets and private fixed investment sustaining baseline expansion across G10 economies.',
  },
  {
    label: 'Core Inflation Trend',
    metric: '2.3%',
    direction: 'down',
    subtext: 'Central Bank Convergence',
    insight: 'Supply-side normalization and moderated wage pressure bringing core indicators within target policy bands.',
  },
  {
    label: 'US Dollar Index (DXY)',
    metric: '100.4',
    direction: 'neutral',
    subtext: 'Consolidation Corridor',
    insight: 'Counter-cyclical dollar demand mitigating downward pressure from interest rate differential convergence.',
  },
  {
    label: 'Investment Grade Spread',
    metric: '115 bps',
    direction: 'down',
    subtext: 'Corporate Credit Health',
    insight: 'Tight corporate spreads underpinned by high interest coverage ratios and prudent treasury liquidity buffers.',
  },
];

export const MarketQuarterlyOutlookSection: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    }, 1500);
  };

  return (
    <section className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 border-y border-stone-200/60 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Custom Binoculars Icon */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-5 h-5 relative">
              <Image
                src={ASSETS.icons.binoculars}
                alt="Macro Outlook"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-[#B81446]">
              Macroeconomic Benchmarks
            </span>
          </div>

          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-[#1A1818] tracking-tight leading-tight">
            Institutional Economic Scorecard &amp; Projections
          </h2>
          <p className="font-roboto text-stone-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Our quantitative research team synthesizes sovereign yield curves, credit risk spreads, and global liquidity indicators to guide enterprise capital allocation.
          </p>
        </div>

        {/* 4 Forecast Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {FORECASTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200/80 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  {item.label}
                </span>

                <div className="flex items-baseline justify-between">
                  <span className="font-poppins font-bold text-3xl sm:text-4xl text-[#1A1818] tracking-tight group-hover:text-[#B81446] transition-colors">
                    {item.metric}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xs ${
                      item.direction === 'up'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                        : item.direction === 'down'
                        ? 'text-[#B81446] bg-rose-50 border border-rose-200/60'
                        : 'text-stone-600 bg-stone-100 border border-stone-200/60'
                    }`}
                  >
                    {item.direction === 'up' && (
                      <div className="w-3.5 h-3.5 relative flex-shrink-0">
                        <Image
                          src={ASSETS.icons.uptrend}
                          alt="Uptrend"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {item.direction === 'down' && (
                      <div className="w-3.5 h-3.5 relative flex-shrink-0">
                        <Image
                          src={ASSETS.icons.downtrend}
                          alt="Downtrend"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {item.direction === 'neutral' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    )}
                    <span>{item.direction === 'up' ? 'Trend' : item.direction === 'down' ? 'Easing' : 'Stable'}</span>
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-[#B81446] tracking-wide">
                  {item.subtext}
                </div>

                <p className="font-roboto text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                  {item.insight}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Confidence: High</span>
                <span className="font-semibold text-stone-600">Q4 Horizon</span>
              </div>
            </div>
          ))}
        </div>

        {/* Report Download Banner Card */}
        <div className="bg-[#141212] text-white p-8 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#B81446]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#B81446] font-semibold">
              Quarterly Briefing Report
            </span>
            <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white">
              Download the 2026/2027 Institutional Global Outlook
            </h3>
            <p className="font-roboto text-xs sm:text-sm text-stone-300 max-w-xl">
              Access the complete 48-page research compendium including sovereign risk matrices, foreign exchange sensitivity forecasts, and private credit stress-test models.
            </p>
          </div>

          <div className="flex-shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-white hover:bg-[#FAF7F2] text-[#1A1818] hover:text-[#B81446] font-poppins font-semibold text-xs sm:text-sm px-7 py-3.5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#B81446] border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Report...</span>
                </>
              ) : downloaded ? (
                <>
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Report Downloaded</span>
                </>
              ) : (
                <>
                  <span>Download Full Report (PDF)</span>
                  <span className="text-xs">&darr;</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
