'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SITE_CONFIG, ASSETS } from '@/core';

export const PersonalizeCardSection: React.FC = () => {
  const { personalizeCardSection } = SITE_CONFIG;
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
    }, 3500);
  };

  return (
    <section className="w-full py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white text-[#1A1818] overflow-hidden select-none">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Credit Card Visual with 3 Overlay Badges */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[420px] sm:max-w-[450px] aspect-[4/4.5] flex items-center justify-center">
              {/* Warm Ivory Background Frame */}
              <div className="absolute inset-4 sm:inset-6 bg-[#F7F1EB] rounded-none shadow-sm z-0" />

              {/* Credit Card-1 Image Display */}
              <div className="relative z-10 w-[80%] h-[80%] overflow-hidden rounded-none shadow-2xl border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
                <Image
                  src={ASSETS.images.creditCard1}
                  alt="Personalized Credit Card Showcase"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover object-center"
                  priority
                />
                {/* Subtle sheen gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15 pointer-events-none" />
              </div>

              {/* Overlay Badge 1: Top-Left (buy-home.png) */}
              <div className="absolute top-2 left-2 sm:top-5 sm:left-5 z-20">
                <div className="animate-badge-bounce-1 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-xl flex items-center justify-center border border-[#EDE4D9] hover:scale-110 transition-transform duration-300">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                    <Image
                      src={ASSETS.icons.buyHome}
                      alt="Buy Home Icon"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Overlay Badge 2: Middle-Right (online-shopping.png) */}
              <div className="absolute top-1/2 -right-3 sm:-right-5 -translate-y-1/2 z-20">
                <div className="animate-badge-bounce-2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-xl flex items-center justify-center border border-[#EDE4D9] hover:scale-110 transition-transform duration-300">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                    <Image
                      src={ASSETS.icons.onlineShopping}
                      alt="Online Shopping Icon"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Overlay Badge 3: Bottom-Right (watching-a-movie.png) */}
              <div className="absolute -bottom-2 right-12 sm:-bottom-4 sm:right-16 z-20">
                <div className="animate-badge-bounce-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-xl flex items-center justify-center border border-[#EDE4D9] hover:scale-110 transition-transform duration-300">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                    <Image
                      src={ASSETS.icons.watchingAMovie}
                      alt="Watching a Movie Icon"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy, Checklist, and Apply Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Title */}
            <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1A1818] leading-[1.2] tracking-tight">
              {personalizeCardSection.title}
            </h2>

            {/* Description */}
            <p className="font-roboto text-sm sm:text-base text-gray-500 mt-4 leading-relaxed max-w-lg font-normal">
              {personalizeCardSection.description}
            </p>

            {/* Red Checkmark List */}
            <ul className="mt-6 space-y-3">
              {personalizeCardSection.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-[#B81446] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-roboto text-sm sm:text-[15px] text-gray-700 font-normal">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="mt-8 max-w-md">
              <label
                htmlFor="applicant-name"
                className="block font-roboto text-xs sm:text-sm font-semibold text-[#1A1818] mb-2"
              >
                {personalizeCardSection.form.label}
              </label>
              <div className="flex flex-col gap-3.5">
                <input
                  id="applicant-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={personalizeCardSection.form.placeholder}
                  required
                  className="w-full bg-white border border-[#E0D8CE] px-4 py-3 text-sm text-[#1A1818] placeholder-gray-400 rounded-none focus:outline-none focus:border-[#B81446] transition-colors"
                />
                <div>
                  <button
                    type="submit"
                    className="bg-white hover:bg-[#B81446] hover:text-white border border-[#E0D8CE] hover:border-[#B81446] text-[#1A1818] font-roboto font-medium text-xs sm:text-sm px-7 py-3 rounded-none shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {submitted ? 'Application Sent ✓' : personalizeCardSection.form.buttonText}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
