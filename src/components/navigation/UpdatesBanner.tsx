'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/core';

interface UpdatesBannerProps {
  className?: string;
}

export const UpdatesBanner: React.FC<UpdatesBannerProps> = ({ className = '' }) => {
  const { badge, message, actionText, actionHref } = SITE_CONFIG.updatesBanner;

  return (
    <div
      className={`relative w-full bg-primary-horizontal text-white py-2.5 px-4 sm:px-6 shadow-inner border-t border-white/10 ${className}`}
      role="region"
      aria-label="Important Updates"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium">
        {/* Megaphone / Horn Icon */}
        <div className="flex-shrink-0 flex items-center justify-center text-[#F7F1EB]">
          <svg
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        {/* Updates Badge & Announcement Text */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 leading-relaxed text-center sm:text-left">
          <span className="font-bold tracking-wide text-white uppercase text-[11px] sm:text-xs">
            {badge}
          </span>
          <span className="text-[#F7F1EB]/95 text-xs sm:text-sm">
            {message}
          </span>
          
          {/* Action Link */}
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 decoration-white/50 hover:decoration-white hover:text-amber-200 transition-colors ml-1"
          >
            <span>{actionText}</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              &rsaquo;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
