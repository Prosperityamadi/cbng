'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG, ASSETS } from '@/core';

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: unknown;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const GOOGLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const TopUtilityBar: React.FC = () => {
  const { looking, branchLocator, utilityLinks } = SITE_CONFIG.topUtilityNav;
  const [selectedLooking, setSelectedLooking] = useState<string>(looking.current);
  const [lookingDropdownOpen, setLookingDropdownOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedLangCode, setSelectedLangCode] = useState<string>('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const lookingRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate script and detect current cookie
  useEffect(() => {
    // Check if google translation cookie already exists
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      const active = GOOGLE_LANGUAGES.find(l => l.code.toLowerCase() === match[1].toLowerCase());
      if (active) {
        setSelectedLanguage(active.nativeName);
        setSelectedLangCode(active.code);
      }
    }

    // Define the global callback for Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Dynamically inject script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

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

  // Handle Google Translation Language Selection
  const changeLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang.nativeName);
    setSelectedLangCode(lang.code);
    setLangDropdownOpen(false);

    // Set cookie for Google Translate
    if (lang.code === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
      document.cookie = 'googtrans=/en/en; path=/;';
      document.cookie = `googtrans=/en/en; domain=${window.location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${lang.code}; path=/;`;
      document.cookie = `googtrans=/en/${lang.code}; domain=${window.location.hostname}; path=/;`;
    }

    // Trigger Google Translate select element if it's already initialized
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = lang.code;
      combo.dispatchEvent(new Event('change'));
    } else {
      // Reload page to let Google Translate initialize with the new cookie
      window.location.reload();
    }
  };

  return (
    <div className="w-full bg-white border-b border-[#EDE3D7] text-[#5C5652] text-xs font-roboto relative z-[60]">
      {/* Hidden Google Translate container */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />

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

            {/* Looking Dropdown Options */}
            {lookingDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#EDE3D7] shadow-xl rounded-none py-1 z-[70] animate-in fade-in duration-100">
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

          {/* Google Translate Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 text-[#5C5652] hover:text-[#B81446] transition-colors focus:outline-none"
              aria-expanded={langDropdownOpen}
            >
              {/* Globe / Translate Icon */}
              <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="font-medium text-[#1A1818]">{selectedLanguage}</span>
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-[#B81446]' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Google Translate Dropdown Menu */}
            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 sm:w-52 bg-white border border-[#EDE3D7] shadow-2xl rounded-none py-1 z-[70] animate-in fade-in duration-100">
                {/* Header with Google Translate Branding */}
                <div className="px-3 py-1.5 border-b border-[#EDE3D7] bg-[#FAF7F3] flex items-center justify-between">
                  <span className="text-[10px] font-poppins font-bold uppercase tracking-wider text-gray-500">
                    Google Translate
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#B81446]/10 text-[#B81446] font-semibold">
                    Live
                  </span>
                </div>

                {/* Languages List */}
                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
                  {GOOGLE_LANGUAGES.map(lang => {
                    const isSelected = selectedLangCode === lang.code;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => changeLanguage(lang)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#F7F1EB] text-[#B81446] font-semibold'
                            : 'text-[#1A1818] hover:bg-[#FAF7F3] hover:text-[#B81446]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-[13px]">{lang.nativeName}</span>
                          {lang.name !== lang.nativeName && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              {lang.name}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-[#B81446]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Note */}
                <div className="px-3 py-1.5 border-t border-[#EDE3D7] bg-[#FAF7F3] text-[9.5px] text-gray-400 text-center font-roboto">
                  Translates all page content in real-time
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

