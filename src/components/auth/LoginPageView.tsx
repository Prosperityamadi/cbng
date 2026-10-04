'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { BrandLogo } from '@/components/navigation/BrandLogo';

export const LoginPageView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // 3 Matte 3D Showcase Slides with custom quotes, tags, and animations
  const slides = [
    {
      id: 0,
      image: ASSETS.images.login3dCardPayment,
      alt: 'NemiCapital Solid 3D Premium Card & Instant Tap-to-Pay Terminal',
      quote:
        '“Choosing NemiCapital was a no-brainer. It’s easy to set up and the support experience is unparalleled.”',
      author: 'Rudra Ghosh',
      role: 'Design Lead at Superflow',
      pillTop: {
        avatarText: 'RG',
        title: 'Rudra Ghosh',
        subtitle: 'Payment Sent',
        tag: 'Confirmed',
        tagColor: 'text-emerald-600 bg-emerald-50',
      },
      pillBottom: {
        amount: '$68.00',
        currency: 'USD',
        vendor: 'Uber Eats | Today 9:20 pm',
        btnText: 'Next Step',
        status: 'Receipt Confirmed',
      },
    },
    {
      id: 1,
      image: ASSETS.images.login3dVaultSecurity,
      alt: 'NemiCapital Solid 3D High Security Bank Vault with Pure Gold Bullion',
      quote:
        '“The institutional security standards and gold-backed custody give our family office total peace of mind.”',
      author: 'Marcus Sterling',
      role: 'Managing Partner, Sterling Capital Group',
      pillTop: {
        avatarText: 'LVC',
        title: 'Vault Security',
        subtitle: 'Multi-Sig Shield',
        tag: 'Protected',
        tagColor: 'text-amber-700 bg-amber-50',
      },
      pillBottom: {
        amount: '$250,000',
        currency: 'USD',
        vendor: 'Allocated Gold Bullion | Depository',
        btnText: 'Audit Log',
        status: '100% Insured',
      },
    },
    {
      id: 2,
      image: ASSETS.images.login3dGrowthAnalytics,
      alt: 'NemiCapital Solid 3D Financial Growth Chart and Compounding Portfolio',
      quote:
        '“Their private wealth portfolio compounding transformed how our enterprise optimizes global liquidity.”',
      author: 'Elena Rostova',
      role: 'Chief Financial Officer, Apex International',
      pillTop: {
        avatarText: 'ER',
        title: 'Elena Rostova',
        subtitle: 'Yield Compounded',
        tag: '+24.8%',
        tagColor: 'text-emerald-700 bg-emerald-50',
      },
      pillBottom: {
        amount: '+24.8%',
        currency: 'APY',
        vendor: 'Institutional Growth Benchmark',
        btnText: 'View Report',
        status: 'Outperforming',
      },
    },
  ];

  // Automatic slide transition every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/py/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        } else if (data.onboarding_token) {
          localStorage.setItem('onboarding_token', data.onboarding_token);
        }

        if (data.next_step === 'dashboard' || data.status === 'active') {
          window.location.href = '/dashboard';
        } else {
          // Send to register to continue onboarding
          window.location.href = '/register';
        }
      } else {
        setIsLoading(false);
        const errorMessage = data.detail 
          ? (Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail) 
          : data.message;
        alert(errorMessage || 'Login failed. Please check your credentials.');
      }
    } catch {
      setIsLoading(false);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  const currentSlide = slides[activeSlide];

  return (
    <main className="h-screen max-h-screen w-full bg-white flex flex-col lg:flex-row antialiased font-roboto selection:bg-[#B81446]/10 selection:text-[#B81446] overflow-x-hidden overflow-y-auto">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Modern Login Form (Fit in 100vh, scrollable only on zoom in) */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-full lg:h-full flex flex-col justify-between px-6 sm:px-10 md:px-14 lg:px-10 xl:px-16 py-4 sm:py-6 bg-white z-10 overflow-y-auto">
        {/* Top Header: Brand Logo */}
        <div className="w-full flex items-center justify-between">
          <BrandLogo variant="dark" compact={true} />

          <Link
            href="/"
            className="text-xs font-semibold text-[#1A1818] hover:text-[#B81446] transition-all flex items-center gap-1.5 group py-1.5 px-3 rounded-xl hover:bg-gray-50 border border-gray-100 shadow-2xs"
            aria-label="Return to Home"
          >
            <div className="relative w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Image
                src={ASSETS.icons.home}
                alt="Home"
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span className="font-poppins font-medium tracking-tight">Home</span>
          </Link>
        </div>

        {/* Center: Direct Form Container (Google Button & Divider Removed) */}
        <div className="max-w-[380px] w-full mx-auto my-auto py-2">
          {/* Headings */}
          <div className="mb-5 sm:mb-6">
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
              Log in
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 font-normal leading-relaxed">
              Discover a better way of banking with NemiCapital.
            </p>
          </div>

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                {/* Left Envelope Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-800">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your e-mail"
                  className="w-full bg-[#F8F9FA] hover:bg-[#F3F4F6] focus:bg-white border border-gray-200/60 focus:border-[#B81446] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                {/* Left Lock Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-800">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#F8F9FA] hover:bg-[#F3F4F6] focus:bg-white border border-gray-200/60 focus:border-[#B81446] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 transition-all duration-200"
                />
                {/* Right Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-0.5 pb-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#B81446] focus:ring-[#B81446] cursor-pointer accent-[#B81446]"
                />
                <span className="text-gray-700 font-medium">Remember Me</span>
              </label>

              <Link
                href="/forgot-password"
                className="font-semibold text-[#1A1818] hover:text-[#B81446] transition-colors underline-offset-4 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Primary Submit Button: Crimson #B81446 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-2.5 sm:py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          {/* Not Member Yet? Create Account */}
          <div className="mt-4 sm:mt-5 text-center">
            <p className="text-xs text-gray-600">
              Not member yet?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#1A1818] hover:text-[#B81446] underline underline-offset-4 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="w-full pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <p>© All rights reserved by NemiCapital International Bank.</p>
          <div className="flex gap-3">
            <Link href="/about" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-gray-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: 3D Matte Solid Showcase with 3s Unique Auto-Slide Animation */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 h-full max-h-screen relative overflow-hidden flex-col justify-between p-6 xl:p-10 bg-gradient-to-br from-[#800A2C] via-[#5A0620] to-[#2B030E] text-white">
        {/* Background Geometric Vector Accents */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Dot Grid Top Right */}
          <div
            className="absolute top-8 right-8 w-36 h-36 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Subtle Dot Grid Bottom Left */}
          <div
            className="absolute bottom-8 left-8 w-36 h-36 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Geometric Quarter-Circles */}
          <div className="absolute top-12 left-10 w-12 h-12 bg-white/10 rounded-tl-full border-t border-l border-white/20" />
          <div className="absolute top-20 left-16 w-8 h-8 bg-[#B81446]/40 rounded-br-full" />

          {/* Vertical Zigzag Graphic Lines */}
          <svg className="absolute top-16 right-10 w-5 h-24 text-white/20" fill="none" viewBox="0 0 24 100">
            <path
              d="M12 0 L20 10 L4 20 L20 30 L4 40 L20 50 L4 60 L20 70 L4 80 L20 90 L12 100"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg className="absolute bottom-24 left-10 w-5 h-20 text-white/15" fill="none" viewBox="0 0 24 100">
            <path
              d="M12 0 L20 10 L4 20 L20 30 L4 40 L20 50 L4 60 L12 70"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Ambient Crimson Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] bg-[#B81446]/25 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Top spacer (SSL badge removed per mandate) */}
        <div className="relative z-10 h-4" />

        {/* Center: Matte 3D Solid Visual Card with 3s Unique Animation */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center max-w-[320px] xl:max-w-[360px] mx-auto w-full">
          {/* Main 3D Matte Image Slider Container */}
          <div className="relative w-full aspect-square rounded-[26px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 bg-[#1F040C] group">
            {/* 3D Images with Animated Transitions */}
            {slides.map((slide, idx) => {
              const isActive = activeSlide === idx;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive
                      ? 'opacity-100 scale-100 rotate-0 z-10'
                      : 'opacity-0 scale-95 -rotate-1 pointer-events-none z-0'
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={idx === 0}
                    className={`object-cover transition-transform duration-[3000ms] ease-out ${
                      isActive ? 'scale-105' : 'scale-100'
                    }`}
                  />
                  {/* Soft Solid Shadow Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                </div>
              );
            })}

            {/* Floating Overlay Badge: Bottom Left Pill (Synchronized with 3D Slide) */}
            <div
              key={`pill-bottom-${currentSlide.id}`}
              className="absolute bottom-3.5 left-3.5 bg-white text-[#1A1818] p-2.5 rounded-2xl shadow-xl border border-gray-100 z-20 min-w-[155px] transition-all duration-700 animate-fadeIn"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818]">
                  {currentSlide.pillBottom.amount}
                </span>
                <span className="text-[9.5px] font-semibold text-gray-400">
                  {currentSlide.pillBottom.currency}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 font-medium mt-0.5 leading-tight">
                {currentSlide.pillBottom.vendor}
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-block px-2 py-0.5 bg-[#B81446] text-white rounded-md text-[9px] font-semibold tracking-wide">
                  {currentSlide.pillBottom.btnText}
                </span>
                <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5">
                  ✓ {currentSlide.pillBottom.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Testimonial Carousel */}
        <div className="relative z-10 pt-3 pb-1 text-center max-w-md mx-auto">
          {/* Quote Text */}
          <p
            key={`quote-${currentSlide.id}`}
            className="font-poppins text-xs sm:text-sm xl:text-base font-medium text-white/95 leading-relaxed tracking-tight min-h-[46px] flex items-center justify-center transition-opacity duration-500"
          >
            {currentSlide.quote}
          </p>

          {/* Carousel Pagination Dots (Clickable or Auto-Advancing) */}
          <div className="flex items-center justify-center gap-2 mt-3 mb-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-6 h-1.5 bg-[#B81446]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Author & Designation */}
          <div key={`author-${currentSlide.id}`} className="space-y-0.5 transition-all duration-500">
            <h4 className="font-poppins font-semibold text-white text-xs sm:text-sm tracking-tight">
              {currentSlide.author}
            </h4>
            <p className="text-[11px] text-[#F7F1EB]/75 font-normal tracking-wide">
              {currentSlide.role}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
