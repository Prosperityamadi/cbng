'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG, ASSETS } from '@/core';
import { BrandLogo } from '@/components/navigation';
import { useInView } from './useInView';

export const FooterSection: React.FC = () => {
  const { footerSection, social } = SITE_CONFIG;
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 });

  return (
    <footer
      ref={ref}
      id="main-footer"
      className="w-full bg-[#111116] text-white selection:bg-[#B81446] selection:text-white overflow-hidden border-t border-white/10"
    >
      {/* 1. Top App Promo Banner ("Experience a New Digital World") */}
      <div className="relative w-full border-b border-white/10 bg-[#161720] overflow-hidden">
        {/* Background Photography with Dark Fade */}
        <div className="absolute inset-0 z-0">
          <Image
            src={ASSETS.images.mobileAppBg}
            alt="Mobile Banking Application"
            fill
            sizes="100vw"
            className="object-cover object-right-top opacity-35 lg:opacity-40"
            priority
          />
          {/* Deep dark gradient fades so text remains effortlessly readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111116] via-[#111116]/95 via-45% to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent pointer-events-none" />

          {/* Luxury Geometric Origami Facet Accents on the Left */}
          <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none opacity-20">
            <svg
              className="w-full h-full text-white/40"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <polygon points="0,0 80,0 40,50 0,20" fill="currentColor" />
              <polygon points="0,50 60,60 0,100" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Heading & Subtitle */}
            <div
              className={`max-w-xl transition-all duration-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <h2 className="font-poppins text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-snug">
                {footerSection.appPromo.title}
              </h2>
              <p className="font-roboto text-sm sm:text-base text-gray-300 mt-2 font-normal leading-relaxed">
                {footerSection.appPromo.subtitle}
              </p>
            </div>

            {/* Right: App Store & Play Store Action Buttons */}
            <div
              className={`flex flex-wrap items-center gap-4 sm:gap-5 transition-all duration-700 delay-200 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {/* Play Store Button */}
              <div
                role="button"
                tabIndex={0}
                className="group inline-flex items-center gap-3.5 px-6 py-3.5 bg-white hover:bg-neutral-100 text-[#111116] rounded-none border border-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer select-none"
              >
                <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={ASSETS.icons.playstore}
                    alt="Google Play Store"
                    width={22}
                    height={22}
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-poppins font-medium tracking-wider text-gray-600 leading-none">
                    GET IT ON
                  </span>
                  <span className="text-sm font-poppins font-bold text-[#111116] tracking-tight leading-tight mt-0.5 group-hover:text-[#B81446] transition-colors">
                    {footerSection.appPromo.playstoreText}
                  </span>
                </div>
              </div>

              {/* App Store Button */}
              <div
                role="button"
                tabIndex={0}
                className="group inline-flex items-center gap-3.5 px-6 py-3.5 bg-[#B81446] hover:bg-[#8C0E35] text-white rounded-none border border-[#B81446] shadow-lg shadow-[#B81446]/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer select-none"
              >
                <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={ASSETS.icons.appstore}
                    alt="Apple App Store"
                    width={22}
                    height={22}
                    className="object-contain brightness-0 invert transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-poppins font-medium tracking-wider text-white/80 leading-none">
                    DOWNLOAD ON THE
                  </span>
                  <span className="text-sm font-poppins font-bold text-white tracking-tight leading-tight mt-0.5">
                    {footerSection.appPromo.appstoreText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Link Columns (Clickable with Arrow Hover Effect) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {footerSection.columns.map((column, colIdx) => {
            const delays = ['delay-150', 'delay-200', 'delay-300', 'delay-[400ms]', 'delay-[500ms]', 'delay-[600ms]'];

            return (
              <div
                key={column.title}
                className={`transition-all duration-700 ease-out ${delays[colIdx] || 'delay-150'} ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                {/* Column Heading */}
                <h3 className="font-poppins font-bold text-base sm:text-lg text-white mb-5 sm:mb-6 tracking-tight">
                  <Link
                    href={column.href}
                    className="hover:text-[#B81446] transition-colors"
                  >
                    {column.title}
                  </Link>
                </h3>

                {/* Column Links: Clickable with hover arrow micro-interaction as requested */}
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 select-none py-0.5"
                      >
                        <span className="text-gray-400 group-hover:text-white group-hover:font-medium transition-colors duration-200 text-xs sm:text-[13px] font-roboto tracking-normal">
                          {link.label}
                        </span>
                        {/* Slide-in Arrow Indicator matching design */}
                        <span className="inline-block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-[#B81446] font-bold text-xs transition-all duration-200 ease-out">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* 3. Middle Contact, Regulatory & Action Row */}
        <div
          className={`border-t border-white/10 pt-12 mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-700 delay-500 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Left: Brand Identity & Regulatory License */}
          <div className="md:col-span-4 flex flex-col items-start">
            <BrandLogo variant="light" />
            <p className="font-roboto text-xs text-gray-400 mt-4 leading-relaxed max-w-sm">
              {footerSection.contact.copyright}
            </p>
          </div>

          {/* Center: Customer Care Phone & Banking Hours */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-4 border-y md:border-y-0 md:border-x border-white/10 py-6 md:py-0 md:px-8">
            <div>
              <p className="font-poppins text-lg sm:text-xl font-bold text-white tracking-tight">
                {footerSection.contact.phone}
              </p>
              <p className="font-roboto text-xs text-gray-400 mt-0.5 uppercase tracking-wider">
                {footerSection.contact.phoneLabel}
              </p>
            </div>
            <div>
              <p className="font-poppins text-sm sm:text-base font-semibold text-white tracking-tight">
                {footerSection.contact.hours}
              </p>
              <p className="font-roboto text-xs text-gray-400 mt-0.5 uppercase tracking-wider">
                {footerSection.contact.hoursLabel}
              </p>
            </div>
          </div>

          {/* Right: Two Action Boxes (Download Forms & Register Complaint) */}
          <div className="md:col-span-4 flex flex-col space-y-3.5">
            {footerSection.actionBoxes.map((box) => (
              <div
                key={box.title}
                role="button"
                tabIndex={0}
                className="group p-3.5 sm:p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 hover:border-[#B81446] rounded-none flex items-center justify-between transition-all duration-300 cursor-pointer shadow-xs"
              >
                <span className="font-poppins font-medium text-xs sm:text-sm text-gray-200 group-hover:text-white transition-colors">
                  {box.title}
                </span>

                {box.type === 'forms' ? (
                  /* Download Forms Icon */
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#B81446] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ) : (
                  /* Register Complaint Icon */
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#B81446] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Sub-Footer Strip (Bottom Bar with Links & Social Channels) */}
      <div className="w-full bg-[#0A0B0E] border-t border-white/5 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Sub-Footer Links */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-gray-400 font-roboto">
            {footerSection.subFooterLinks.map((subLink) => (
              <Link
                key={subLink.label}
                href={subLink.href}
                className="hover:text-white transition-colors"
              >
                {subLink.label}
              </Link>
            ))}
          </div>

          {/* Social Media Icons */}
          {/* Social Media Icons - Solid Visible Charcoal Circles with Pure White Icons */}
          <div className="flex items-center gap-3">
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#272832] hover:bg-[#B81446] text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#272832] hover:bg-[#B81446] text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#272832] hover:bg-[#B81446] text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#272832] hover:bg-[#B81446] text-white flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
