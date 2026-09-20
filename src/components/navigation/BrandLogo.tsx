'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS, SITE_CONFIG } from '@/core';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  collapsed?: boolean;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'brand',
  collapsed = false,
  compact = false,
}) => {
  return (
    <Link
      href="/"
      className={`group flex items-center ${compact ? 'gap-2.5' : 'gap-3.5'} transition-opacity hover:opacity-95 ${className}`}
      aria-label={SITE_CONFIG.brand.name}
    >
      {/* Emblem Logo Badge */}
      <div
        className={`relative flex-shrink-0 ${
          compact
            ? 'w-8 h-8 sm:w-9 sm:h-9 ring-1'
            : 'w-12 h-12 md:w-14 md:h-14 ring-2'
        } rounded-full bg-white/95 p-1 shadow-md ring-white/30 transition-all duration-300 group-hover:scale-105`}
      >
        <Image
          src={ASSETS.logos.main}
          alt={ASSETS.logos.altText}
          fill
          sizes={compact ? '36px' : '(max-width: 768px) 48px, 56px'}
          className="object-contain p-0.5"
          priority
        />
      </div>

      {/* Brand Typography */}
      {!collapsed && (
        <div className="flex flex-col tracking-tight">
          <div className="flex items-center gap-1">
            <span
              className={`font-poppins ${
                compact ? 'text-base sm:text-lg' : 'text-xl md:text-2xl'
              } font-bold tracking-normal text-white leading-tight transition-all duration-300`}
            >
              {SITE_CONFIG.brand.shortName}
            </span>
          </div>
          <span
            className={`${
              compact ? 'text-[8.5px] sm:text-[9px]' : 'text-[10px] md:text-[11px]'
            } font-semibold tracking-wider text-[#F7F1EB]/90 uppercase leading-none mt-0.5 transition-all duration-300`}
          >
            {compact ? SITE_CONFIG.brand.tagline : 'International Bank'}
          </span>
          {!compact && (
            <span className="text-[8px] md:text-[9px] font-medium tracking-widest text-[#F7F1EB]/60 uppercase leading-none mt-1">
              {SITE_CONFIG.brand.tagline}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
