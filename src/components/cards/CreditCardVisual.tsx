'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

export type CardTheme = 
  | 'platinum' 
  | 'millennia' 
  | 'moneyback' 
  | 'easyemi' 
  | 'business' 
  | 'travel';

interface CreditCardVisualProps {
  theme?: CardTheme;
  title?: string;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  className?: string;
}

export const CreditCardVisual: React.FC<CreditCardVisualProps> = ({
  theme = 'platinum',
  title = 'NemiCapital',
  cardNumber,
  holderName,
  expiry,
  className = '',
}) => {
  // Theme specific defaults matching user's design reference
  const getThemeConfig = () => {
    switch (theme) {
      case 'platinum':
        return {
          defaultNumber: cardNumber || '1234  5566  7788  9900',
          defaultHolder: holderName || 'CARD HOLDER',
          defaultExpiry: expiry || '12/28',
          bgClass: 'bg-gradient-to-br from-[#0D3B52] via-[#092B3E] to-[#051C29]',
          accentText: 'text-cyan-200/90',
          chipType: 'gold',
          badgeText: 'PLATINUM',
          showPattern: 'origami',
        };
      case 'millennia':
        return {
          defaultNumber: cardNumber || '1234  4556  1234  4566',
          defaultHolder: holderName || 'CARDHOLDER NAME',
          defaultExpiry: expiry || '08/29',
          bgClass: 'bg-gradient-to-br from-[#E06D53] via-[#854D5D] to-[#0A485A]',
          accentText: 'text-amber-100',
          chipType: 'gold',
          badgeText: 'MILLENNIA',
          showPattern: 'mountains',
        };
      case 'moneyback':
        return {
          defaultNumber: cardNumber || '2378  3489  4421  5298',
          defaultHolder: holderName || 'VALUED CUSTOMER',
          defaultExpiry: expiry || '10/28',
          bgClass: 'bg-gradient-to-br from-[#EE4E5E] via-[#D82643] to-[#A30D29]',
          accentText: 'text-rose-100',
          chipType: 'gold',
          badgeText: 'MONEY BACK',
          showPattern: 'worldmap',
        };
      case 'easyemi':
        return {
          defaultNumber: cardNumber || '0000  0017  0066  0028',
          defaultHolder: holderName || 'NAME SURNAME',
          defaultExpiry: expiry || '03/29',
          bgClass: 'bg-gradient-to-br from-[#272B33] via-[#1A1D23] to-[#0D0F12]',
          accentText: 'text-zinc-300',
          chipType: 'silver',
          badgeText: 'EASY EMI',
          showPattern: 'curves',
        };
      case 'business':
        return {
          defaultNumber: cardNumber || '5412  7534  8901  4321',
          defaultHolder: holderName || 'CORPORATE EXEC',
          defaultExpiry: expiry || '06/29',
          bgClass: 'bg-gradient-to-br from-[#2D0A1E] via-[#1C0D2E] to-[#090D26]',
          accentText: 'text-amber-200',
          chipType: 'gold',
          badgeText: 'BUSINESS',
          showPattern: 'origami',
        };
      case 'travel':
      default:
        return {
          defaultNumber: cardNumber || '4532  8901  2345  6789',
          defaultHolder: holderName || 'GLOBAL EXPLORER',
          defaultExpiry: expiry || '11/29',
          bgClass: 'bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#115E59]',
          accentText: 'text-emerald-100',
          chipType: 'gold',
          badgeText: 'TRAVEL & HOTEL',
          showPattern: 'worldmap',
        };
    }
  };

  const config = getThemeConfig();

  return (
    <div
      className={`group relative w-full aspect-[1.586/1] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_35px_rgba(0,0,0,0.35)] select-none border border-white/20 ${config.bgClass} ${className}`}
    >
      {/* Specular sheen gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/25 pointer-events-none z-10" />

      {/* Dynamic Background Pattern Overlays */}
      {config.showPattern === 'origami' && (
        <svg
          className="absolute right-0 top-0 bottom-0 w-3/4 h-full opacity-20 pointer-events-none"
          viewBox="0 0 200 130"
          preserveAspectRatio="none"
        >
          <polygon points="40,0 120,40 80,100" fill="#FFF" />
          <polygon points="120,40 200,10 160,80" fill="#FFF" />
          <polygon points="80,100 160,80 180,130" fill="#FFF" />
          <polygon points="0,60 40,0 80,100" fill="#FFF" />
        </svg>
      )}

      {config.showPattern === 'mountains' && (
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-3/5 opacity-30 pointer-events-none"
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
        >
          <polygon points="0,100 60,30 140,100" fill="#FFF" />
          <polygon points="100,100 190,15 280,100" fill="#FFF" opacity="0.6" />
          <polygon points="210,100 270,40 300,100" fill="#FFF" />
          <line x1="0" y1="20" x2="300" y2="20" stroke="#FFF" strokeDasharray="4 4" opacity="0.4" />
        </svg>
      )}

      {config.showPattern === 'worldmap' && (
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          viewBox="0 0 320 200"
          preserveAspectRatio="none"
        >
          <circle cx="80" cy="70" r="35" fill="#FFF" />
          <circle cx="120" cy="110" r="28" fill="#FFF" />
          <circle cx="210" cy="65" r="45" fill="#FFF" />
          <circle cx="250" cy="120" r="30" fill="#FFF" />
          <line x1="0" y1="100" x2="320" y2="100" stroke="#FFF" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="160" y1="0" x2="160" y2="200" stroke="#FFF" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      )}

      {config.showPattern === 'curves' && (
        <svg
          className="absolute -right-8 -top-8 w-48 h-48 opacity-25 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke="#FFF" strokeWidth="6" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#FFF" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )}

      {/* Top Header Row: Bank Logo & Card Tier */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Official Bank Monogram */}
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-white/30 flex-shrink-0">
            <Image
              src={ASSETS.logos.main}
              alt="NemiCapital Logo"
              fill
              sizes="28px"
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-poppins font-bold text-[11px] sm:text-xs tracking-wider uppercase text-white/95 drop-shadow-sm">
            NemiCapital
          </span>
        </div>

        {/* Card Tier Badge */}
        <div className="flex items-center gap-1.5">
          <span className="font-poppins font-semibold text-[9px] sm:text-[10px] tracking-widest uppercase bg-white/15 px-2 py-0.5 rounded-sm border border-white/20 backdrop-blur-sm shadow-sm">
            {config.badgeText}
          </span>
        </div>
      </div>

      {/* Center Row: EMV Chip & Contactless NFC Symbol */}
      <div className="relative z-20 flex items-center justify-between mt-3 sm:mt-4">
        {/* EMV Microchip SVG */}
        <div
          className={`w-9 h-7 sm:w-11 sm:h-8 rounded-md p-1 shadow-md border ${
            config.chipType === 'gold'
              ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] border-[#8C6D1F]'
              : 'bg-gradient-to-tr from-[#D1D5DB] via-[#F9FAFB] to-[#9CA3AF] border-[#6B7280]'
          }`}
        >
          <div className="w-full h-full border border-black/25 rounded-sm grid grid-cols-3 grid-rows-2 gap-[2px] p-[1px]">
            <div className="border border-black/20 rounded-[1px] bg-black/10" />
            <div className="border border-black/20 rounded-[1px] bg-black/10 col-span-2" />
            <div className="border border-black/20 rounded-[1px] bg-black/10 col-span-2" />
            <div className="border border-black/20 rounded-[1px] bg-black/10" />
          </div>
        </div>

        {/* Contactless Wave Icon */}
        <div className="opacity-80">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M8.5 16.5a5 5 0 0 1 0-9" />
            <path d="M12 19a8.5 8.5 0 0 0 0-14" />
            <path d="M15.5 21.5a12 12 0 0 0 0-19" />
          </svg>
        </div>
      </div>

      {/* Card Number Display with Embossed Look */}
      <div className="relative z-20 mt-3 sm:mt-4">
        <p className="font-mono text-xs sm:text-sm md:text-base tracking-[0.18em] font-semibold text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">
          {config.defaultNumber}
        </p>
      </div>

      {/* Bottom Row: Cardholder Name, Expiry & Network Hologram */}
      <div className="relative z-20 flex items-end justify-between mt-2.5 sm:mt-3 pt-1">
        <div>
          <span className="block text-[7px] sm:text-[8px] font-medium tracking-wider uppercase text-white/70">
            Cardholder
          </span>
          <p className="font-poppins font-semibold text-[9px] sm:text-[11px] tracking-wider uppercase text-white/95 drop-shadow-sm truncate max-w-[150px]">
            {config.defaultHolder}
          </p>
        </div>

        <div className="text-center">
          <span className="block text-[7px] sm:text-[8px] font-medium tracking-wider uppercase text-white/70">
            Valid Thru
          </span>
          <p className="font-mono font-semibold text-[9px] sm:text-[11px] text-white/95 drop-shadow-sm">
            {config.defaultExpiry}
          </p>
        </div>

        {/* Payment Network Interlocking Circles (Mastercard / Visa Style) */}
        <div className="relative flex items-center -space-x-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#EB001B]/90 shadow-sm" />
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F79E1B]/90 shadow-sm" />
        </div>
      </div>
    </div>
  );
};
