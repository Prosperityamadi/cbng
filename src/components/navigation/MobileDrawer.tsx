'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ASSETS, NAV_ITEMS, NavItem, SITE_CONFIG } from '@/core';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  // Track which accordion item is expanded (default: none or 'Services')
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Toggle item expansion
  const toggleItem = (label: string) => {
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-visibility ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* =========================================================================
          1. DARK BACKDROP OVERLAY
          ========================================================================= */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* =========================================================================
          2. BLACK SHADOW SWIPE CURTAIN (Leads the sweep from left to right)
          ========================================================================= */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[86%] max-w-[340px] bg-[#120F10] z-[105] shadow-[20px_0_50px_rgba(0,0,0,0.8)] pointer-events-none ${
          isOpen
            ? 'translate-x-0 transition-transform duration-500 ease-out'
            : '-translate-x-full transition-transform duration-300 ease-in delay-75'
        }`}
      />

      {/* =========================================================================
          3. CRIMSON RED DRAWER (Follows immediately right after the black shadow)
          ========================================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[82%] max-w-[320px] bg-gradient-to-b from-[#B81446] via-[#A0103C] to-[#5A0620] z-[110] flex flex-col shadow-[12px_0_36px_rgba(0,0,0,0.5)] ${
          isOpen
            ? 'translate-x-0 transition-transform duration-500 ease-out delay-100'
            : '-translate-x-full transition-transform duration-300 ease-in delay-0'
        }`}
      >
        {/* Drawer Header (Logo + Square Close Button) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/15 flex-shrink-0 bg-black/10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative w-8 h-8 rounded-full bg-white p-1 shadow-sm flex-shrink-0">
              <Image
                src={ASSETS.logos.main}
                alt={SITE_CONFIG.brand.name}
                fill
                sizes="32px"
                className="object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-bold text-white text-base leading-tight tracking-tight">
                {SITE_CONFIG.brand.shortName}
              </span>
              <span className="font-poppins text-[9px] uppercase tracking-wider text-white/80 font-medium">
                {SITE_CONFIG.brand.tagline}
              </span>
            </div>
          </Link>

          {/* Square Close Button with subtle contrast */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer rounded-none"
            aria-label="Close Mobile Navigation"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/15 scrollbar-thin scrollbar-thumb-white/20">
          {/* Main Navigation Items */}
          <nav aria-label="Mobile Navigation Menu" className="py-1">
            {NAV_ITEMS.map((item: NavItem) => {
              const hasSubs = item.hasDropdown && item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItem === item.label;

              return (
                <div key={item.label} className="border-b border-white/15 last:border-b-0">
                  <div className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                    {/* Item Link or Label */}
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!hasSubs) onClose();
                      }}
                      className="font-poppins font-semibold text-white text-sm tracking-wide flex-1 pr-2 py-0.5"
                    >
                      {item.label}
                    </Link>

                    {/* Dark Square Toggle Button for Dropdowns */}
                    {hasSubs && (
                      <button
                        type="button"
                        onClick={() => toggleItem(item.label)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1A1818] hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer rounded-none shadow-sm flex-shrink-0"
                        aria-label={`Toggle ${item.label} submenu`}
                        aria-expanded={isExpanded}
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Animated Accordion Sub-items */}
                  {hasSubs && (
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="bg-black/25 py-2 px-6 space-y-1">
                          {item.subItems!.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={onClose}
                              className="block py-2 text-xs sm:text-sm text-white/85 hover:text-white hover:translate-x-1.5 transition-all font-roboto border-b border-white/5 last:border-b-0"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Action Buttons (Login & Open an Account) */}
          <div className="p-5 space-y-2.5 bg-black/10">
            <Link
              href={SITE_CONFIG.headerActions.login.href}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{SITE_CONFIG.headerActions.login.label}</span>
            </Link>

            <Link
              href={SITE_CONFIG.headerActions.openAccount.href}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-[#FAF7F3] text-[#1A1818] text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-[#B81446]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{SITE_CONFIG.headerActions.openAccount.label}</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
};
