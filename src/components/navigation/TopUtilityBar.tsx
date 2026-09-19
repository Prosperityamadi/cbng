'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG, ASSETS } from '@/core';

export const TopUtilityBar: React.FC = () => {
  const { looking, branchLocator, utilityLinks, languages } = SITE_CONFIG.topUtilityNav;
  const [selectedLooking, setSelectedLooking] = useState<string>(looking.current);
  const [lookingDropdownOpen, setLookingDropdownOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages.current);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const lookingRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (lookingRef.current && !lookingRef.current.contains(e.target as Node)) {
        setLookingDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white border-b border-[#EDE3D7] text-[#5C5652] text-xs font-roboto relative z-50">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        
        {/* Left Utility Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* "Looking" Selector */}
          <div className="relative flex items-center gap-2" ref={lookingRef}>
            {/* Binoculars Image Icon */}
            <div className="relative w-4 h-4 flex-shrink-0">
              <Image
                src={ASSETS.icons.binoculars}
                alt="Looking"
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span className="text-[#1A1818] font-medium hidden sm:inline">{looking.label}</span>

            <button
              type="button"
              onClick={() => setLookingDropdownOpen(!lookingDropdownOpen)}
              className="flex items-center gap-1 font-semibold text-[#1A1818] hover:text-[#B81446] transition-colors focus:outline-none"
              aria-expanded={lookingDropdownOpen}
            >
              <span>{selectedLooking}</span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform ${lookingDropdownOpen ? 'rotate-180 text-[#B81446]' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Options */}
            {lookingDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#EDE3D7] shadow-lg rounded-none py-1 z-50 animate-in fade-in duration-100">
                {looking.options.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedLooking(option);
                      setLookingDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      selectedLooking === option
                        ? 'bg-[#F7F1EB] text-[#B81446] font-semibold'
                        : 'text-[#1A1818] hover:bg-[#FAF7F3] hover:text-[#B81446]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="text-[#DDD6CE] hidden sm:inline">|</span>

          {/* Find Nearest Branch */}
          <Link
            href={branchLocator.href}
            className="flex items-center gap-1.5 text-[#5C5652] hover:text-[#B81446] transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5 text-[#8C0E35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden md:inline">{branchLocator.label}</span>
          </Link>
        </div>

        {/* Right Utility Area */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick Utility Links (Careers, Faq's, Offers, Calendar) */}
          <div className="hidden lg:flex items-center gap-4 sm:gap-5">
            {utilityLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[#5C5652] hover:text-[#B81446] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center bg-[#F7F1EB] border border-[#DDD6CE] rounded-none px-2 py-1 gap-1 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#1A1818] outline-none w-28 sm:w-40"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-400 hover:text-[#B81446]"
                  aria-label="Close Search"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 text-[#5C5652] hover:text-[#B81446] transition-colors"
                aria-label="Open Search"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 text-[#5C5652] hover:text-[#B81446] transition-colors focus:outline-none"
              aria-expanded={langDropdownOpen}
            >
              <span>{selectedLanguage}</span>
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-[#B81446]' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-[#EDE3D7] shadow-lg rounded-none py-1 z-50 animate-in fade-in duration-100">
                {languages.options.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-[#F7F1EB] text-[#B81446] font-semibold'
                        : 'text-[#1A1818] hover:bg-[#FAF7F3] hover:text-[#B81446]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
