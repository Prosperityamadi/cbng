'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SITE_CONFIG, ASSETS, NavItem } from '@/core';
import { BrandLogo } from './BrandLogo';

export const TopNavbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleMobileExpanded = (label: string) => {
    setMobileExpandedItem(prev => (prev === label ? null : label));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F1EB] shadow-sm" ref={navContainerRef}>
      {/* Top Navbar Row */}
      <div className="w-full flex items-stretch">
        
        {/* Left Brand Block with Vertical Two-Tone Primary Gradient (Crimson to Burgundy) */}
        <div className="flex-shrink-0 bg-primary-vertical px-5 sm:px-8 md:px-10 py-3.5 sm:py-4 flex items-center justify-center shadow-md border-r border-[#5A0620]/30 z-20">
          <BrandLogo />
        </div>

        {/* Right Navigation & Announcements Column */}
        <div className="flex-1 flex flex-col justify-between bg-[#F7F1EB] relative min-w-0">
          
          {/* Main Desktop Navigation Items & Action Buttons Row */}
          <div className="flex items-center justify-between h-16 sm:h-[72px] px-2 sm:px-6 relative">
            
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-stretch h-full" aria-label="Main Navigation">
              {NAV_ITEMS.map((item: NavItem) => {
                const isDropdownOpen = activeDropdown === item.label;

                if (!item.hasDropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="h-full flex items-center px-4 xl:px-5 font-poppins font-medium text-[14px] xl:text-[15px] text-[#2D2825] hover:text-[#B81446] hover:bg-white/80 transition-all duration-150 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="relative h-full flex items-stretch"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {/* Nav Item Tab Button */}
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : item.label)}
                      className={`h-full flex items-center gap-1.5 px-4 xl:px-5 font-poppins font-medium text-[14px] xl:text-[15px] transition-all duration-150 focus:outline-none whitespace-nowrap ${
                        isDropdownOpen
                          ? 'bg-white text-[#B81446] shadow-sm'
                          : 'text-[#2D2825] hover:text-[#B81446] hover:bg-white/70'
                      }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-[#B81446]' : 'text-gray-500'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu (Seamless White Card overflowing the updates banner) */}
                    {item.hasDropdown && item.subItems && isDropdownOpen && (
                      <div className="absolute top-full left-0 min-w-[210px] bg-white shadow-xl z-50 border-t-0 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex flex-col py-1">
                          {item.subItems.map((subItem, idx) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className={`px-6 py-3.5 font-roboto text-sm text-[#666666] hover:text-[#B81446] hover:bg-[#FAF7F3] transition-colors ${
                                idx !== item.subItems!.length - 1 ? 'border-b border-[#F4EFEA]' : ''
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Top Right Header Action Buttons (Login & Open an Account) */}
            <div className="hidden lg:flex items-center gap-3 ml-4">
              <Link
                href={SITE_CONFIG.headerActions.login.href}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#1A1818] hover:bg-black text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{SITE_CONFIG.headerActions.login.label}</span>
              </Link>

              <Link
                href={SITE_CONFIG.headerActions.openAccount.href}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-white hover:bg-[#FAF7F3] text-[#1A1818] border border-[#DDD6CE] text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5 text-[#B81446]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>{SITE_CONFIG.headerActions.openAccount.label}</span>
              </Link>
            </div>

            {/* Mobile / Tablet Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2 ml-auto">
              <Link
                href={SITE_CONFIG.headerActions.openAccount.href}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-none text-xs font-semibold text-white bg-gradient-to-r from-[#B81446] to-[#5A0620] transition-all"
              >
                {SITE_CONFIG.headerActions.openAccount.label}
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-none text-[#1A1818] hover:text-[#B81446] hover:bg-[#EDE3D7]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B81446]"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

          </div>

          {/* Bottom Updates Banner (Horizontal Two-Tone Primary Gradient) */}
          <div className="w-full bg-primary-horizontal text-white py-2.5 px-4 sm:px-6 flex items-center justify-between text-xs sm:text-sm shadow-inner relative z-10 border-t border-white/10">
            <div className="flex items-center gap-2.5 flex-wrap overflow-hidden text-ellipsis">
              {/* Updates Microphone/Megaphone Icon */}
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image
                  src={ASSETS.icons.microphone}
                  alt="Updates"
                  fill
                  sizes="16px"
                  className="object-contain brightness-0 invert"
                />
              </div>
              <span className="font-bold tracking-wide uppercase text-[11px] sm:text-xs text-white">
                {SITE_CONFIG.updatesBanner.badge}
              </span>
              <span className="text-[#F7F1EB]/95 text-xs sm:text-sm font-medium">
                {SITE_CONFIG.updatesBanner.message}
              </span>
              <Link
                href={SITE_CONFIG.updatesBanner.actionHref}
                className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white hover:text-amber-100 transition-colors ml-1 whitespace-nowrap"
              >
                <span>&rsaquo; {SITE_CONFIG.updatesBanner.actionText}</span>
              </Link>

              {SITE_CONFIG.updatesBanner.announcement && (
                <>
                  <span className="hidden xl:inline text-white/40 mx-1">|</span>
                  <span className="hidden xl:inline text-[#F7F1EB]/80 text-xs font-normal">
                    {SITE_CONFIG.updatesBanner.announcement}
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Collapsible) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EDE3D7] bg-[#F7F1EB] px-4 py-5 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Top Actions in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#EDE3D7]">
            <Link
              href={SITE_CONFIG.headerActions.login.href}
              className="flex items-center justify-center gap-2 py-2.5 rounded-none bg-[#1A1818] text-white text-xs font-semibold shadow-sm"
            >
              <span>{SITE_CONFIG.headerActions.login.label}</span>
            </Link>
            <Link
              href={SITE_CONFIG.headerActions.openAccount.href}
              className="flex items-center justify-center gap-2 py-2.5 rounded-none bg-white text-[#1A1818] border border-[#DDD6CE] text-xs font-semibold shadow-sm"
            >
              <span>{SITE_CONFIG.headerActions.openAccount.label}</span>
            </Link>
          </div>

          {NAV_ITEMS.map(item => {
            const isExpanded = mobileExpandedItem === item.label;

            if (!item.hasDropdown) {
              return (
                <div key={item.label} className="border-b border-[#EDE3D7]/60 pb-2">
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-[#1A1818] hover:text-[#B81446] transition-colors"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            }

            return (
              <div key={item.label} className="border-b border-[#EDE3D7]/60 pb-2">
                <button
                  type="button"
                  onClick={() => toggleMobileExpanded(item.label)}
                  className="w-full flex items-center justify-between py-2 text-base font-medium text-[#1A1818] hover:text-[#B81446] transition-colors"
                >
                  <span>{item.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#B81446]' : 'opacity-60'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Submenu Accordion */}
                {item.subItems && isExpanded && (
                  <div className="pl-4 pr-2 py-2 space-y-1 bg-white/70 rounded-md mt-1 border border-[#EDE3D7]/60">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block py-2 px-2 text-sm text-[#666666] hover:text-[#B81446] hover:bg-[#F7F1EB] rounded transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};
