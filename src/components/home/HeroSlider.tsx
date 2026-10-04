'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, HeroSlide } from '@/core';

interface HeroSliderProps {
  autoPlayInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  autoPlayInterval = 5000,
}) => {
  const slides = SITE_CONFIG.heroSlides;
  const quickActions = SITE_CONFIG.heroQuickActions;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Reload back to home page when hero CTA button is clicked
  const handleCtaClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
      window.location.reload();
    }
  }, []);

  // Continuous autoplay transition every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval]);

  return (
    <div
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-[#1A1818] select-none"
      role="region"
      aria-label="Banking Hero Carousel"
    >
      {/* Slides Container */}
      {slides.map((slide: HeroSlide, index: number) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Ken Burns Zoom-In Effect */}
            <div
              className={`absolute inset-0 transition-transform duration-[5500ms] ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-[25%_center] grayscale-[25%] contrast-[105%] brightness-[85%]"
                sizes="100vw"
              />
            </div>

            {/* Cinematic Gradient Overlays for High Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Right-Wing Geometric Polygon Accent (Two-Tone Primary Red) */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 md:w-1/3 lg:w-1/4 pointer-events-none hidden sm:block opacity-90 overflow-hidden">
              <svg
                viewBox="0 0 400 700"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover translate-x-8"
              >
                {/* 3D Isometric Polygon Facets */}
                <polygon points="200,80 320,150 200,220 80,150" fill="#B81446" fillOpacity="0.9" />
                <polygon points="80,150 200,220 200,360 80,290" fill="#8A0E34" fillOpacity="0.95" />
                <polygon points="200,220 320,150 320,290 200,360" fill="#5A0620" fillOpacity="0.9" />

                <polygon points="320,290 440,360 320,430 200,360" fill="#B81446" fillOpacity="0.85" />
                <polygon points="200,360 320,430 320,570 200,500" fill="#8A0E34" fillOpacity="0.95" />
                <polygon points="320,430 440,360 440,500 320,570" fill="#5A0620" fillOpacity="0.95" />

                <polygon points="80,290 200,360 80,430 -40,360" fill="#5A0620" fillOpacity="0.8" />
                <polygon points="80,430 200,500 80,570 -40,500" fill="#B81446" fillOpacity="0.85" />
                <polygon points="-40,500 80,570 80,710 -40,640" fill="#3D0315" fillOpacity="0.95" />

                <polygon points="200,500 320,570 200,640 80,570" fill="#8A0E34" fillOpacity="0.9" />
                <polygon points="200,640 320,570 320,710 200,780" fill="#5A0620" fillOpacity="0.9" />
              </svg>
            </div>

            {/* Slide Content (Center-Aligned Hero Text & CTA with Slow "Appearing" Reveal) */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-center text-center">
              <div className="max-w-3xl flex flex-col items-center">
                {/* Hero Title - Slow Appearing Reveal */}
                <h1
                  className={`font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.18] drop-shadow-md transform transition-all duration-[1200ms] ease-out ${
                    isActive
                      ? 'opacity-100 scale-100 translate-y-0 delay-300'
                      : 'opacity-0 scale-[0.97] translate-y-2 duration-500 delay-0'
                  }`}
                >
                  {slide.title}
                </h1>

                {/* Hero Subtitle - Graceful Fade-In Appearing */}
                <p
                  className={`font-roboto text-sm sm:text-base md:text-lg text-gray-200/90 leading-relaxed max-w-2xl mx-auto mt-4 sm:mt-5 drop-shadow transform transition-all duration-[1200ms] ease-out ${
                    isActive
                      ? 'opacity-100 translate-y-0 delay-[600ms]'
                      : 'opacity-0 translate-y-2 duration-500 delay-0'
                  }`}
                >
                  {slide.subtitle}
                </p>

                {/* Hero Action Button - Soft Appearing CTA */}
                <div
                  className={`mt-7 sm:mt-8 transform transition-all duration-1000 ease-out ${
                    isActive
                      ? 'opacity-100 translate-y-0 delay-[900ms]'
                      : 'opacity-0 translate-y-2 duration-500 delay-0'
                  }`}
                >
                  <Link
                    href={slide.ctaHref || '/'}
                    onClick={handleCtaClick}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-none bg-white hover:bg-[#F7F1EB] text-[#1A1818] font-poppins font-semibold text-sm tracking-wide shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom-Left Quick Action Buttons & Slider Controls */}
      <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-end gap-3">
        {/* Quick Action Buttons (Sharp Edges) */}
        <div className="flex flex-col gap-2">
          {quickActions.map(action => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center justify-between gap-4 px-4 py-2.5 rounded-none bg-gradient-to-r from-[#B81446] to-[#5A0620] hover:brightness-110 text-white font-poppins text-xs sm:text-sm font-semibold shadow-lg transition-all transform hover:translate-x-1"
            >
              <span>{action.label}</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#B81446] transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Navigation Arrows (Sharp Edges) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-none bg-white/80 hover:bg-white text-[#1A1818] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-none bg-white/80 hover:bg-white text-[#1A1818] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide Indicators / Bars (Sharp Edges) */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-none ${
              idx === currentIndex
                ? 'w-7 h-1.5 bg-[#B81446]'
                : 'w-2.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
