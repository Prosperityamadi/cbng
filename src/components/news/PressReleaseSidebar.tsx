'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { BrandLogo } from '@/components/navigation';

interface PopularPostItem {
  id: string;
  title: string;
  date: string;
  image: typeof ASSETS.images.newsQrScanner;
  href: string;
}

const POPULAR_POSTS: PopularPostItem[] = [
  {
    id: 'non-us-citizens-account',
    title: 'How Non-US Citizens can Open a Bank Account',
    date: 'Sep 20, 2026',
    image: ASSETS.images.newsQrScanner,
    href: '/news/press-releases',
  },
  {
    id: 'capital-raise-250m',
    title: 'Board Approves Capital Raise of $250 Million',
    date: 'Sep 18, 2026',
    image: ASSETS.images.newsTradingCharts,
    href: '/news/press-releases',
  },
];

const CATEGORIES = [
  { name: 'Announcements', count: 12, href: '/news/press-releases' },
  { name: 'Banking', count: 28, href: '/news/press-releases' },
  { name: 'Finance', count: 34, href: '/news/press-releases' },
  { name: 'Investment', count: 19, href: '/news/press-releases' },
  { name: 'Press Release', count: 15, href: '/news/press-releases', active: true },
  { name: 'Technology', count: 22, href: '/news/press-releases' },
];

const POPULAR_TAGS = [
  'Cards',
  'Careers',
  'Deposit',
  'Fees',
  'Forms',
  'Insurance',
  'Investor',
  'Loans',
  'Payment',
  'Security',
  'Tenders',
  'Womens Accounts',
];

export const PressReleaseSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    alert(`Searching news for: "${searchQuery}"`);
  };

  return (
    <aside className="w-full space-y-10 sm:space-y-12">
      {/* =========================================================================
          1. SEARCH WIDGET
          ========================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#B81446] text-xs">▶</span>
          <h3 className="font-poppins font-semibold text-lg text-[#1A1818] tracking-tight">
            Search
          </h3>
        </div>
        <form onSubmit={handleSearch} className="relative flex items-center group">
          <input
            type="text"
            placeholder="Keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] text-[#1A1818] placeholder-gray-400 text-sm px-4 py-3 pr-12 border border-stone-200/80 focus:outline-none focus:border-[#B81446] focus:bg-white transition-all duration-300"
          />
          <button
            type="submit"
            aria-label="Submit Search"
            className="absolute right-0 top-0 bottom-0 px-3.5 bg-transparent text-gray-500 hover:text-[#B81446] flex items-center justify-center transition-colors duration-200"
          >
            <div className="w-4 h-4 relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src={ASSETS.icons.search}
                alt="Search"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </form>
      </div>

      {/* =========================================================================
          2. CATEGORIES WIDGET
          ========================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#B81446] text-xs">▶</span>
          <h3 className="font-poppins font-semibold text-lg text-[#1A1818] tracking-tight">
            Categories
          </h3>
        </div>
        <div className="bg-white border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] divide-y divide-stone-100">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group flex items-center justify-between px-5 py-3.5 text-xs sm:text-sm font-medium transition-all duration-300 ${
                cat.active
                  ? 'text-[#B81446] bg-[#FAF7F2]/60 font-semibold'
                  : 'text-[#555555] hover:text-[#B81446] hover:bg-[#FAF7F2]/40 hover:pl-6'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${
                    cat.active
                      ? 'border-[#B81446] bg-[#B81446]'
                      : 'border-stone-400 group-hover:border-[#B81446] group-hover:bg-[#B81446]'
                  }`}
                />
                <span>{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. POPULAR POST WIDGET
          ========================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#B81446] text-xs">▶</span>
          <h3 className="font-poppins font-semibold text-lg text-[#1A1818] tracking-tight">
            Popular Post
          </h3>
        </div>
        <div className="space-y-5">
          {POPULAR_POSTS.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              className="group block space-y-2.5"
            >
              {/* Thumbnail with smooth zoom hover */}
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-stone-100 border border-stone-200/50">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover grayscale contrast-[110%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
              </div>

              {/* Meta */}
              <div className="space-y-1">
                <span className="text-[11px] sm:text-xs text-stone-400 font-medium tracking-wide">
                  {post.date}
                </span>
                <h4 className="font-poppins font-semibold text-xs sm:text-sm text-[#1A1818] leading-snug group-hover:text-[#B81446] transition-colors duration-300">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. POPULAR TAGS WIDGET
          ========================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#B81446] text-xs">▶</span>
          <h3 className="font-poppins font-semibold text-lg text-[#1A1818] tracking-tight">
            Popular Tags
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(isSelected ? null : tag)}
                className={`text-xs px-3.5 py-1.5 border transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#B81446] text-white border-[#B81446] shadow-sm'
                    : 'bg-[#FAF7F2] text-stone-600 border-stone-200/80 hover:bg-[#B81446] hover:text-white hover:border-[#B81446] hover:-translate-y-0.5 hover:shadow-sm'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. PROMOTIONAL SUPPORT CARD (Matches user design with Nano BG & Company Logo)
          ========================================================================= */}
      <div className="relative overflow-hidden bg-[#141212] text-white p-7 sm:p-8 text-center sm:text-left border border-stone-800 shadow-xl group">
        {/* Background Nano Photography / Geometric Texture (Matches user design) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={ASSETS.images.supportPromoBg}
            alt="Support Promo Background"
            fill
            className="object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Contrast Overlay for Crisp Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
        </div>

        {/* Content Container (z-10 above background) */}
        <div className="relative z-10">
          {/* Official Company Logo */}
          <div className="mb-6 flex justify-center sm:justify-start">
            <BrandLogo compact />
          </div>

          <h4 className="font-poppins font-bold text-lg sm:text-xl text-white mb-4 leading-snug">
            Small Steps to Your Better Future.
          </h4>

          {/* Feature List with Crimson Checkmarks */}
          <ul className="space-y-2.5 text-xs text-stone-200 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-[#B81446] font-bold text-sm">✓</span>
              <span>The well master-builder</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#B81446] font-bold text-sm">✓</span>
              <span>On the other hand</span>
            </li>
          </ul>

          {/* CTA Button with Hover Sheen */}
          <Link
            href="/contact"
            className="inline-block w-full text-center bg-white text-[#1A1818] font-poppins font-semibold text-xs sm:text-sm py-3 px-6 shadow-md transition-all duration-300 hover:bg-[#FAF7F2] hover:text-[#B81446] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Support
          </Link>
        </div>
      </div>
    </aside>
  );
};
