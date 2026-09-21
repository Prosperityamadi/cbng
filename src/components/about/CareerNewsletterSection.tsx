'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { useInView } from '@/components/home';

export const CareerNewsletterSection: React.FC = () => {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsSubscribed(true);
  };

  return (
    <section
      id="career-newsletter"
      ref={ref}
      className="w-full bg-white py-16 sm:py-20 lg:py-24 relative overflow-hidden select-none"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Centered Container */}
        <div className="flex flex-col items-center text-center">
          
          {/* 1. Custom Newsletter Email Illustration with Slow Floating Bounce Effect */}
          <div
            className={`relative mb-6 sm:mb-8 transition-all duration-800 ease-out ${
              isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 animate-slow-float cursor-pointer">
              <Image
                src={ASSETS.icons.newsletterEmail}
                alt="Career Updates Newsletter"
                fill
                priority
                unoptimized
                className="object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* 2. Section Heading (Matches user screenshot) */}
          <div
            className={`max-w-xl mx-auto mb-7 sm:mb-8 transition-all duration-800 delay-150 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h2 className="font-poppins font-semibold text-2xl sm:text-3xl md:text-[32px] text-[#1A1818] tracking-tight leading-tight">
              <span className="block">Subscribe us to</span>
              <span className="block mt-1">Recieve Career Updates</span>
            </h2>
          </div>

          {/* 3. Subscription Form */}
          <div
            className={`w-full max-w-md mx-auto transition-all duration-800 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {isSubscribed ? (
              <div className="bg-white border border-[#B81446]/30 p-6 shadow-sm animate-fadeIn">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#B81446]/10 text-[#B81446] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-poppins font-bold text-base text-[#1A1818]">
                  Subscription Confirmed!
                </h3>
                <p className="font-roboto text-xs sm:text-sm text-gray-600 mt-1">
                  Thank you for subscribing. You will be the first to receive updates on exciting career opportunities at NemiCapital.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubscribed(false);
                    setEmail('');
                  }}
                  className="mt-4 text-xs font-semibold text-[#B81446] hover:underline cursor-pointer"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 w-full">
                {/* Input Container */}
                <div className="relative w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Email address"
                    className={`w-full px-4 py-3 sm:py-3.5 pr-11 bg-white border ${
                      error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                    } rounded-none text-xs sm:text-sm text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#1A1818] transition-colors shadow-xs`}
                  />
                  {/* Subtle Envelope Icon on the Right */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 self-start text-left font-roboto -mt-2">
                    {error}
                  </p>
                )}

                {/* Centered Subscribe Button (Matches user screenshot) */}
                <button
                  type="submit"
                  className="bg-[#1A1818] hover:bg-[#B81446] text-white font-poppins font-medium text-xs sm:text-sm px-8 sm:px-10 py-2.5 sm:py-3 rounded-none shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
