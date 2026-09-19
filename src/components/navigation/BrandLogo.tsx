'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS, SITE_CONFIG } from '@/core';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  collapsed?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'brand',
  collapsed = false,
}) => {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-3.5 transition-opacity hover:opacity-95 ${className}`}
      aria-label={SITE_CONFIG.brand.name}
    >
      {/* Emblem Logo Badge */}
      <div className="relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/95 p-1 shadow-md ring-2 ring-white/30 transition-transform group-hover:scale-105">
        <Image
          src={ASSETS.logos.main}
          alt={ASSETS.logos.altText}
          fill
          sizes="(max-width: 768px) 48px, 56px"
          className="object-contain p-0.5"
          priority
        />
      </div>

      {/* Brand Typography */}
      {!collapsed && (
        <div className="flex flex-col tracking-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-poppins text-xl md:text-2xl font-bold tracking-normal text-white leading-tight">
              {SITE_CONFIG.brand.shortName}
            </span>
          </div>
          <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-[#F7F1EB]/85 uppercase leading-none mt-0.5">
            International Bank
          </span>
          <span className="text-[8px] md:text-[9px] font-medium tracking-widest text-[#F7F1EB]/60 uppercase leading-none mt-1">
            {SITE_CONFIG.brand.tagline}
          </span>
        </div>
      )}
    </Link>
  );
};
