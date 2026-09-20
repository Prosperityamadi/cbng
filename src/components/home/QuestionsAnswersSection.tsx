'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { useInView } from './useInView';

export const QuestionsAnswersSection: React.FC = () => {
  const { faqSection } = SITE_CONFIG;
  const [expandedId, setExpandedId] = useState<string>('faq-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const toggleItem = (id: string) => {
    setExpandedId(prev => (prev === id ? '' : id));
  };

  const filteredItems = faqSection.items.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section
      ref={ref}
      className="w-full py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F3] border-t border-[#EDE5DB] text-[#1A1818] select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Header Row: Title & Subtitle (Left) + Search Filter (Right) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-14 border-b border-[#E7DFD4]">
          {/* Header Title & Subtitle with Smooth Slide-Down */}
          <div
            className={`transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1A1818] tracking-tight leading-tight">
              {faqSection.title}
            </h2>
            <p className="font-roboto text-sm sm:text-base text-gray-500 mt-2 font-normal">
              {faqSection.subtitle}
            </p>
          </div>

          {/* Search Box: "Help You to Find" */}
          <div
            className={`w-full md:w-72 lg:w-80 flex flex-col items-start md:items-end transition-all duration-700 delay-150 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            <span className="font-roboto text-xs text-gray-500 font-medium mb-1.5 self-start md:self-auto">
              {faqSection.searchLabel}
            </span>
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={faqSection.searchPlaceholder}
                className="w-full bg-white border border-[#DDD3C7] focus:border-[#B81446] text-xs sm:text-sm text-[#1A1818] placeholder-gray-400 py-2.5 pl-3.5 pr-10 rounded-none shadow-sm outline-none transition-colors"
              />
              {/* Search Magnifying Glass Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Two Columns Layout (Question Image Left + Accordion Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 sm:mt-14 items-stretch">
          {/* Left Column: Question Thematic Image with Lateral Slide-In */}
          <div
            className={`lg:col-span-5 flex flex-col justify-center transition-all duration-800 delay-200 ease-out ${
              isInView ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-12 scale-95'
            }`}
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:h-full min-h-[340px] sm:min-h-[400px] rounded-none overflow-hidden shadow-xl border border-[#E7DFD4] bg-neutral-900 group">
              <Image
                src={ASSETS.images.question}
                alt="Questions and Answers Concept"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center grayscale contrast-[110%] group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              {/* Subtle ambient gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Accordion Questions List */}
          <div
            className={`lg:col-span-7 flex flex-col justify-center transition-all duration-800 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="space-y-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isOpen = expandedId === item.id;
                  const delays = ['delay-100', 'delay-150', 'delay-200', 'delay-[250ms]', 'delay-[300ms]'];

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-none shadow-sm transition-all duration-300 ${
                        isOpen
                          ? 'border-[#B81446]/60 shadow-md'
                          : 'border-[#E7DFD4] hover:border-gray-400'
                      } ${delays[idx % delays.length]}`}
                    >
                      {/* Accordion Header Row */}
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="w-full px-5 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between text-left cursor-pointer focus:outline-none transition-colors"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3.5 pr-4">
                          {/* Arrow Indicator: Down arrow in brand red if open; Right arrow if closed */}
                          <span
                            className={`flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'text-[#B81446]' : 'text-gray-400'
                            }`}
                          >
                            {isOpen ? (
                              <svg
                                className="w-4 h-4 text-[#B81446]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            )}
                          </span>

                          {/* Question Text */}
                          <span
                            className={`font-poppins text-sm sm:text-[15px] font-semibold transition-colors ${
                              isOpen ? 'text-[#B81446]' : 'text-[#1A1818]'
                            }`}
                          >
                            {item.question}
                          </span>
                        </div>
                      </button>

                      {/* Accordion Body: Expandable Answer */}
                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-gray-100 animate-fadeIn">
                          <p className="font-roboto text-xs sm:text-[13.5px] text-[#635C56] leading-relaxed pl-7">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white border border-[#E7DFD4] rounded-none">
                  <p className="font-roboto text-sm text-gray-500">
                    No answers match your search for &quot;{searchQuery}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-semibold text-[#B81446] hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Helper Text & Call to Action Button */}
        <div
          className={`mt-14 sm:mt-16 text-center transition-all duration-700 delay-500 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="font-roboto text-xs sm:text-sm text-gray-500">
            {faqSection.helperText}{' '}
            <Link
              href={faqSection.contactHref}
              className="text-[#B81446] hover:text-[#8C0E35] font-semibold underline underline-offset-2 transition-colors"
            >
              {faqSection.contactText}
            </Link>
          </p>

          <div className="mt-5">
            <Link
              href={faqSection.ctaHref}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white hover:bg-[#B81446] hover:text-white text-[#1A1818] border border-[#DDD3C7] hover:border-[#B81446] font-poppins font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-none"
            >
              <span>{faqSection.ctaText}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsAnswersSection;
