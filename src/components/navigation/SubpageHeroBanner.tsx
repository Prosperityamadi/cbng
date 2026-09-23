'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SubpageHeroBannerProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  image?: StaticImageData | string;
  imageAlt?: string;
}

export const SubpageHeroBanner: React.FC<SubpageHeroBannerProps> = ({
  title,
  breadcrumbs,
  image = ASSETS.images.customerRep,
  imageAlt,
}) => {
  return (
    <section className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#1A1818] z-20">
      {/* Background Photography with Grayscale & Contrast (clipped to section) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={image}
          alt={imageAlt || `NemiCapital Bank - ${title}`}
          fill
          priority
          unoptimized
          className="object-cover object-[center_35%] grayscale contrast-[115%] brightness-[85%]"
        />
        {/* Dark Atmospheric Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/75" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content Container aligned at the bottom */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end justify-between">
        
        {/* Overlapping White Box with Crimson Top Border */}
        <div className="bg-white border-t-4 border-[#B81446] px-6 sm:px-10 md:px-12 pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-6 md:pb-6 shadow-2xl relative -mb-5 sm:-mb-6 z-30 animate-fadeInUp transition-all">
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1A1818] tracking-tight leading-snug pb-1 whitespace-nowrap block">
            {title}
          </h1>
        </div>

        {/* Breadcrumbs on the bottom right */}
        <div className="hidden sm:flex items-center gap-2 pb-4 text-xs sm:text-sm font-medium text-white/90 animate-fadeIn delay-200">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            Home
          </Link>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-white/40">&gt;</span>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
              <span className="text-white/40">&gt;</span>
              <span className="text-white font-semibold">{title}</span>
            </>
          )}
        </div>

      </div>
    </section>
  );
};
