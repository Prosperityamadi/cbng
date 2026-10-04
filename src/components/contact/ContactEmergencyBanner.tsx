'use client';

import React from 'react';
import Link from 'next/link';

export const ContactEmergencyBanner: React.FC = () => {
  return (
    <div className="w-full bg-[#1A1818] text-white rounded-2xl p-8 sm:p-10 relative overflow-hidden shadow-xl">
      {/* Background Subtle Gradient Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B81446]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-rose-300 uppercase tracking-wider mb-3">
            <span>Critical Security Notice</span>
          </div>
          <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white tracking-tight">
            Urgent Card Freeze or Fraud Support
          </h3>
          <p className="font-roboto text-sm text-gray-300 mt-2 leading-relaxed">
            If you suspect unauthorized transactions or your card has been misplaced, you can instantly lock your card from the client dashboard or speak directly with our Fraud Intervention Unit immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <a
            href="tel:+18004926364"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#B81446] hover:bg-[#8A0E34] text-white font-poppins text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>Call 24/7 Hotline: +1 (800) 492-NEMI</span>
          </a>

          <Link
            href="/dashboard/cards"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-poppins text-xs font-semibold tracking-wide transition-all active:scale-95"
          >
            Lock Card in Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
