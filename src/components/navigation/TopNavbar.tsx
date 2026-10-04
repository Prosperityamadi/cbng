'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SITE_CONFIG, ASSETS, NavItem } from '@/core';
import { BrandLogo } from './BrandLogo';
import { MobileDrawer } from './MobileDrawer';

export const TopNavbar: React.FC = () => {
  const pathname = usePathname();
  
  // State for Primary (Static) Top Navbar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const primaryNavRef = useRef<HTMLDivElement>(null);

  // State for Secondary (Sticky Pop-Down) Navbar
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [stickyDropdown, setStickyDropdown] = useState<string | null>(null);
  const stickyNavRef = useRef<HTMLDivElement>(null);

  // Scroll listener: activates the secondary pop-down navbar when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      // Pop down the secondary navbar once user has scrolled past the main header area (200px)
      if (window.scrollY > 200) {
        setShowStickyNav(true);
      } else {
        setShowStickyNav(false);
        setStickyDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (primaryNavRef.current && !primaryNavRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (stickyNavRef.current && !stickyNavRef.current.contains(e.target as Node)) {
        setStickyDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setStickyDropdown(null);
  }, [pathname]);

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/console-ops')
  ) {
    return null;
  }

  return (
    <>
      {/* =========================================================================
          1. PRIMARY STATIC TOP NAVBAR (Always at the very top, scrolls with page)
          ========================================================================= */}
      <header
        ref={primaryNavRef}
        className="relative z-30 w-full bg-[#F7F1EB] shadow-sm"
      >
        <div className="w-full flex items-stretch">
          
          {/* Left Brand Block with Vertical Two-Tone Primary Gradient */}
          <div className="flex-shrink-0 bg-primary-vertical flex items-center justify-center border-r border-[#5A0620]/30 z-20 px-5 sm:px-8 md:px-10 py-3.5 sm:py-4 shadow-md">
            <BrandLogo compact={false} />
          </div>

          {/* Right Navigation & Announcements Column */}
          <div className="flex-1 flex flex-col justify-between relative min-w-0 bg-[#F7F1EB]">
            
            {/* Desktop Navigation Links & Action Buttons Row */}
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
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(isDropdownOpen ? null : item.label)}
                        className={`h-full flex items-center gap-1.5 px-4 xl:px-5 font-poppins font-medium text-[14px] xl:text-[15px] transition-all duration-150 focus:outline-none whitespace-nowrap ${
                          isDropdownOpen || (item.label === 'Services' && pathname.includes('/services'))
                            ? 'bg-white text-[#B81446] shadow-sm font-semibold'
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

                      {/* Dropdown Menu */}
                      {item.hasDropdown && item.subItems && isDropdownOpen && (
                        <div className="absolute top-full left-0 min-w-[210px] bg-white shadow-xl z-50 border-t-0 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="flex flex-col py-1">
                            {item.subItems.map((subItem, idx) => {
                              const isActiveSub =
                                pathname === subItem.href ||
                                (subItem.href === '/services/accounts' && pathname.includes('/accounts')) ||
                                (subItem.href === '/services/cards' && pathname.includes('/cards'));
                              return (
                                <Link
                                  key={subItem.label}
                                  href={subItem.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className={`px-6 py-3.5 font-roboto text-sm transition-colors ${
                                    isActiveSub
                                      ? 'text-[#B81446] font-semibold bg-[#FAF7F3]'
                                      : 'text-[#666666] hover:text-[#B81446] hover:bg-[#FAF7F3]'
                                  } ${
                                    idx !== item.subItems!.length - 1 ? 'border-b border-[#F4EFEA]' : ''
                                  }`}
                                >
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Action Buttons (Login & Open an Account) */}
              <div className="hidden lg:flex items-center gap-3 ml-4">
                <Link
                  href={SITE_CONFIG.headerActions.login.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#1A1818] hover:bg-black text-white text-xs font-semibold tracking-wide transition-all shadow-sm whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{SITE_CONFIG.headerActions.login.label}</span>
                </Link>

                <Link
                  href={SITE_CONFIG.headerActions.openAccount.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-none bg-white hover:bg-[#FAF7F3] text-[#1A1818] border border-[#DDD6CE] text-xs font-semibold tracking-wide transition-all shadow-sm whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5 text-[#B81446]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>{SITE_CONFIG.headerActions.openAccount.label}</span>
                </Link>
              </div>

              {/* Mobile Hamburger Button (Right aligned, matching Screenshot 1) */}
              <div className="flex lg:hidden items-center ml-auto pr-2 sm:pr-4">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 text-[#B81446] hover:opacity-80 transition-opacity focus:outline-none flex flex-col items-end justify-center gap-1.5 cursor-pointer"
                  aria-label="Open Navigation Menu"
                >
                  <span className="w-6 h-[2.5px] bg-[#B81446] rounded-full" />
                  <span className="w-4.5 h-[2.5px] bg-[#B81446] rounded-full" />
                  <span className="w-3.5 h-[2.5px] bg-[#B81446] rounded-full" />
                </button>
              </div>

            </div>

            {/* Updates Banner (Horizontal Two-Tone Gradient - Desktop only) */}
            <div className="hidden lg:flex w-full bg-primary-horizontal text-white items-center justify-between text-xs sm:text-sm shadow-inner relative z-10 border-t border-white/10 py-2.5 px-4 sm:px-6">
              <div className="flex items-center gap-2.5 flex-wrap overflow-hidden text-ellipsis">
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
      </header>

      {/* =========================================================================
          2. SECONDARY POP-DOWN STICKY NAVBAR (Pops down automatically on scroll)
             - Brand Logo Box & Navigation Links are CENTERED in the bar
             - Pure white background with subtle shadow
          ========================================================================= */}
      <div
        ref={stickyNavRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-md h-14 sm:h-16 transition-transform duration-300 ease-out transform ${
          showStickyNav
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full h-full relative flex items-center justify-center px-4">
          
          {/* Centered Group: [ Red Brand Logo Block ] + [ Desktop Nav Items ] */}
          <div className="flex items-center h-full">
            
            {/* Red Brand Block */}
            <div className="h-full bg-primary-vertical flex items-center px-4 sm:px-6 border-r border-[#5A0620]/30 shadow-sm flex-shrink-0">
              <BrandLogo compact={true} />
            </div>

            {/* Navigation Links directly adjacent, grouped together in the center */}
            <nav className="hidden lg:flex items-stretch h-full" aria-label="Sticky Popdown Navigation">
              {NAV_ITEMS.map((item: NavItem) => {
                const isDropdownOpen = stickyDropdown === item.label;

                if (!item.hasDropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="h-full flex items-center px-4 xl:px-5 font-poppins font-medium text-[14px] xl:text-[15px] text-[#2D2825] hover:text-[#B81446] hover:bg-gray-50/80 transition-all duration-150 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="relative h-full flex items-stretch"
                    onMouseEnter={() => setStickyDropdown(item.label)}
                    onMouseLeave={() => setStickyDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setStickyDropdown(isDropdownOpen ? null : item.label)}
                      className={`h-full flex items-center gap-1.5 px-4 xl:px-5 font-poppins font-medium text-[14px] xl:text-[15px] transition-all duration-150 focus:outline-none whitespace-nowrap ${
                        isDropdownOpen
                          ? 'text-[#B81446] bg-gray-50'
                          : 'text-[#2D2825] hover:text-[#B81446] hover:bg-gray-50/80'
                      }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-[#B81446]' : 'text-gray-400'
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

                    {/* Dropdown Menu */}
                    {item.hasDropdown && item.subItems && isDropdownOpen && (
                      <div className="absolute top-full left-0 min-w-[210px] bg-white shadow-xl z-50 border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex flex-col py-1">
                          {item.subItems.map((subItem, idx) => {
                            const isActiveSub =
                              pathname === subItem.href ||
                              (subItem.href === '/services/accounts' && pathname.includes('/accounts')) ||
                              (subItem.href === '/services/cards' && pathname.includes('/cards'));
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => setStickyDropdown(null)}
                                className={`px-6 py-3.5 font-roboto text-sm transition-colors ${
                                  isActiveSub
                                    ? 'text-[#B81446] font-semibold bg-[#FAF7F3]'
                                    : 'text-[#666666] hover:text-[#B81446] hover:bg-[#FAF7F3]'
                                } ${
                                  idx !== item.subItems!.length - 1 ? 'border-b border-[#F4EFEA]' : ''
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

          </div>

          {/* Mobile Hamburger Button for Sticky Navbar */}
          <div className="lg:hidden absolute right-4 flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#B81446] hover:opacity-80 transition-opacity focus:outline-none flex flex-col items-end justify-center gap-1.5 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <span className="w-6 h-[2.5px] bg-[#B81446] rounded-full" />
              <span className="w-4.5 h-[2.5px] bg-[#B81446] rounded-full" />
              <span className="w-3.5 h-[2.5px] bg-[#B81446] rounded-full" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer with Layered Swipe Animation */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
