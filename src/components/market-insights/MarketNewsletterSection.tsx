'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export const MarketNewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Scroll View Observer for Dark Vault Reveal
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section ref={ref} className="w-full bg-[#141212] text-white py-16 sm:py-20 relative overflow-hidden select-none border-t border-stone-800">
      {/* Ambient Crimson Background Shimmer */}
      <div
        className={`absolute top-0 right-0 w-96 h-96 bg-[#B81446]/15 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isInView ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 w-96 h-96 bg-[#800A2C]/20 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out ${
          isInView ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`bg-[#1A1818]/90 backdrop-blur-md border border-stone-800 p-8 sm:p-12 lg:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10 transition-all duration-800 ease-out ${
            isInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
          }`}
        >
          
          {/* Left: Custom Newsletter Email Icon with 3D Pop & Floating Bounce */}
          <div className="flex-shrink-0 text-center md:text-left">
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 mx-auto md:mx-0 animate-bounce duration-1000 transition-all duration-700 ease-out delay-200 ${
                isInView ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
              }`}
            >
              <Image
                src={ASSETS.icons.newsletterEmail}
                alt="Institutional Market Newsletter"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right: Copy & Form with Slide Entrance */}
          <div
            className={`flex-1 text-center md:text-left space-y-4 transition-all duration-700 ease-out delay-300 ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#B81446] font-semibold block mb-1">
                Direct Institutional Intelligence
              </span>
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Receive the Weekly Macro Briefing
              </h3>
            </div>

            <p className="font-roboto text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed">
              Curated perspectives on global interest rates, currency volatility, and corporate bond spreads delivered every Monday morning to enterprise leaders and private wealth clients.
            </p>

            {submitted ? (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm animate-fadeIn">
                ✓ Thank you. You are now subscribed to NemiCapital Weekly Macro Intelligence.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter corporate email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-stone-900 border border-stone-700 text-white placeholder-stone-500 text-xs sm:text-sm px-4 py-3 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#B81446] hover:bg-[#800A2C] text-white font-poppins font-semibold text-xs sm:text-sm px-6 py-3 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-[10px] text-stone-500">
              Zero spam. Unsubscribe anytime. Strictly protected under institutional privacy standards.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
