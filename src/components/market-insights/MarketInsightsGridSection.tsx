'use client';

import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';

interface InsightArticle {
  id: string;
  category: 'Global Macro' | 'Equities & FX' | 'Fixed Income' | 'AI & Digital Assets' | 'Commodities & Energy';
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: StaticImageData | string;
  author: {
    name: string;
    avatar: StaticImageData | string;
  };
}

const INSIGHTS_CATALOG: InsightArticle[] = [
  {
    id: 'central-bank-liquidity',
    category: 'Global Macro',
    title: 'Sovereign Reserve Architecture & Cross-Border Capital Flows',
    excerpt: 'Examining global central bank reserve diversification and the macroeconomic trajectory of tier-1 reserve currencies.',
    date: 'Sep 22, 2026',
    readTime: '5 min read',
    image: ASSETS.images.marketCentralBankMacro,
    author: {
      name: 'Paul Anderson',
      avatar: ASSETS.images.authorPaulAnderson,
    },
  },
  {
    id: 'commodities-energy-transition',
    category: 'Commodities & Energy',
    title: 'Energy Grid Modernization: Critical Mineral Supply Chains in 2026',
    excerpt: 'How global logistics bottlenecks and sovereign transition mandates impact institutional industrial commodity pricing.',
    date: 'Sep 20, 2026',
    readTime: '4 min read',
    image: ASSETS.images.marketEnergyCommodities,
    author: {
      name: 'Elena Rostova',
      avatar: ASSETS.images.team6Markets,
    },
  },
  {
    id: 'ai-high-frequency-banking',
    category: 'AI & Digital Assets',
    title: 'Algorithmic Risk Models: Neural Networks in Modern Capital Adequacy',
    excerpt: 'Deploying real-time machine learning inference for enterprise balance sheet optimization and automated liquidity hedging.',
    date: 'Sep 19, 2026',
    readTime: '6 min read',
    image: ASSETS.images.marketTechAiBanking,
    author: {
      name: 'David Chen',
      avatar: ASSETS.images.team7Cto,
    },
  },
  {
    id: 'equity-volatility-fx',
    category: 'Equities & FX',
    title: 'Corporate Earnings Breadth & Multi-Asset Valuation Compression',
    excerpt: 'A quantitative deep dive into multinational corporate balance sheets, margin durability, and G10 currency syndication.',
    date: 'Sep 17, 2026',
    readTime: '5 min read',
    image: ASSETS.images.newsTradingCharts,
    author: {
      name: 'Arthur Sterling',
      avatar: ASSETS.images.team4Cro,
    },
  },
  {
    id: 'digital-retail-payments',
    category: 'AI & Digital Assets',
    title: 'Next-Gen Instant Settlement: Real-Time Gross Settlement (RTGS) Networks',
    excerpt: 'Cross-border merchant adoption and zero-latency retail payment rails driving sovereign banking innovation.',
    date: 'Sep 15, 2026',
    readTime: '4 min read',
    image: ASSETS.images.newsQrScanner,
    author: {
      name: 'Claire Vance',
      avatar: ASSETS.images.commenterClaireVance,
    },
  },
  {
    id: 'fixed-income-yield-curve',
    category: 'Fixed Income',
    title: 'The Inversion Unwind: Allocating Along the Front-End Yield Curve',
    excerpt: 'Strategic tactical opportunities in ultra-short duration corporate paper as central bank policy horizons normalize.',
    date: 'Sep 14, 2026',
    readTime: '7 min read',
    image: ASSETS.images.pressAtmCard,
    author: {
      name: 'Steven Rich',
      avatar: ASSETS.images.commenterStevenRich,
    },
  },
];

const CATEGORIES = [
  'All Insights',
  'Global Macro',
  'Equities & FX',
  'Fixed Income',
  'AI & Digital Assets',
  'Commodities & Energy',
] as const;

export const MarketInsightsGridSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Insights');

  const filteredArticles = selectedCategory === 'All Insights'
    ? INSIGHTS_CATALOG
    : INSIGHTS_CATALOG.filter((item) => item.category === selectedCategory);

  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Category Filter Tabs */}
        <div className="space-y-6 sm:space-y-8 mb-10 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2.5 mb-2">
                <span className="w-5 sm:w-6 h-[2.5px] bg-[#B81446] inline-block flex-shrink-0" />
                <span className="font-poppins font-semibold text-xs uppercase tracking-[0.2em] text-[#B81446]">
                  Research Library
                </span>
              </div>
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1818] tracking-tight">
                Sector Intelligence &amp; Briefs
              </h2>
            </div>

            <span className="text-xs text-stone-500 font-medium">
              Showing {filteredArticles.length} publications
            </span>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-poppins font-semibold rounded-xs transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#B81446] text-white shadow-md scale-105'
                      : 'bg-[#FAF7F2] text-stone-600 border border-stone-200/80 hover:bg-stone-200/60 hover:text-[#1A1818]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-500 group flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
            >
              <div>
                {/* Image Container with Zoom on Hover */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-stone-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover grayscale contrast-[110%] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#1A1818]/90 backdrop-blur-sm text-stone-100 font-poppins text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] leading-snug tracking-tight group-hover:text-[#B81446] transition-colors duration-300">
                    <Link href="/news/press-releases" className="focus:outline-none">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="font-roboto text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-stone-200">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      className="object-cover grayscale"
                    />
                  </div>
                  <span className="font-poppins text-xs font-semibold text-stone-700">
                    {article.author.name}
                  </span>
                </div>

                <Link
                  href="/news/press-releases"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#B81446] group-hover:underline transition-all"
                >
                  <span>Read Brief</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
