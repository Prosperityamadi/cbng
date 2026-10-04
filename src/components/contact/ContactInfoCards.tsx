'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface ContactChannel {
  title: string;
  badge: string;
  primaryInfo: string;
  secondaryInfo: string;
  linkText: string;
  href: string;
  icon: any;
}

const CHANNELS: ContactChannel[] = [
  {
    title: 'Client Service Hotline',
    badge: 'Toll-Free 24/7',
    primaryInfo: '+1 (800) 492-NEMI',
    secondaryInfo: 'International: +41 44 218 8000',
    linkText: 'Call Private Desk',
    href: 'tel:+18004926364',
    icon: ASSETS.icons.costumer,
  },
  {
    title: 'Concierge Email Desk',
    badge: 'Direct Response',
    primaryInfo: 'info@nemicapbank.com',
    secondaryInfo: 'Typical response within 2 hours',
    linkText: 'Send Direct Email',
    href: 'mailto:info@nemicapbank.com',
    icon: ASSETS.icons.mail,
  },
  {
    title: 'Zurich World Headquarters',
    badge: 'Global Flagship',
    primaryInfo: 'Bahnhofstrasse 45',
    secondaryInfo: '8001 Zurich, Switzerland',
    linkText: 'Schedule Visit',
    href: '#office-locations',
    icon: ASSETS.icons.bank,
  },
  {
    title: 'Institutional Advisory',
    badge: 'Private Salons',
    primaryInfo: 'New York • London • Singapore',
    secondaryInfo: 'Mon - Fri: 08:00 - 18:00 Local',
    linkText: 'Explore Hubs',
    href: '#office-locations',
    icon: ASSETS.icons.guidance,
  },
];

export const ContactInfoCards: React.FC = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CHANNELS.map((channel, idx) => (
          <div
            key={idx}
            className="group relative bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B81446]/20 group-hover:via-[#B81446] to-transparent rounded-t-xl transition-colors duration-300" />

            <div>
              {/* Icon & Badge Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-[#F2EAE0] flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={channel.icon}
                    alt={channel.title}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B81446] bg-[#B81446]/5 px-2.5 py-1 rounded-full border border-[#B81446]/10">
                  {channel.badge}
                </span>
              </div>

              {/* Title & Info */}
              <h3 className="font-poppins font-bold text-base text-[#1A1818] mb-1.5">
                {channel.title}
              </h3>
              <p className="font-poppins text-sm font-semibold text-[#1A1818] mb-0.5">
                {channel.primaryInfo}
              </p>
              <p className="font-roboto text-xs text-gray-500 leading-relaxed mb-5">
                {channel.secondaryInfo}
              </p>
            </div>

            {/* Action Link */}
            <div className="pt-3 border-t border-gray-50">
              <a
                href={channel.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B81446] hover:text-[#8A0E34] transition-colors"
              >
                <span>{channel.linkText}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
