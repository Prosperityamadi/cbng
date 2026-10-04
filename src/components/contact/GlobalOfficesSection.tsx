'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface OfficeLocation {
  city: string;
  country: string;
  role: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const GLOBAL_OFFICES: OfficeLocation[] = [
  {
    city: 'Zurich',
    country: 'Switzerland',
    role: 'Global Headquarters & Private Wealth',
    address: 'Bahnhofstrasse 45, 8001 Zurich',
    phone: '+41 44 218 8000',
    email: 'zurich.desk@nemicapbank.com',
    hours: 'Mon – Fri: 08:30 – 17:30 CET',
  },
  {
    city: 'New York',
    country: 'United States',
    role: 'Americas Institutional Hub',
    address: '250 Park Avenue, 18th Floor, New York, NY 10177',
    phone: '+1 (212) 555-0199',
    email: 'newyork.desk@nemicapbank.com',
    hours: 'Mon – Fri: 08:30 – 18:00 EST',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    role: 'European Treasury & Clearing',
    address: '1 Undershaft, City of London, EC3P 3DQ',
    phone: '+44 20 7946 0920',
    email: 'london.desk@nemicapbank.com',
    hours: 'Mon – Fri: 08:00 – 17:30 GMT',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    role: 'Asia-Pacific Wealth Salon',
    address: 'Marina Bay Financial Centre, Tower 1, Singapore 018981',
    phone: '+65 6789 0123',
    email: 'singapore.desk@nemicapbank.com',
    hours: 'Mon – Fri: 09:00 – 18:00 SGT',
  },
];

export const GlobalOfficesSection: React.FC = () => {
  return (
    <section id="office-locations" className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 border-t border-[#E8DCCF]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-white border border-[#E8DCCF] flex items-center justify-center p-1">
              <Image
                src={ASSETS.icons.branch}
                alt="Offices"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#B81446]">
              Global Presence
            </span>
          </div>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1818] tracking-tight">
            Institutional Hubs & Private Salons
          </h2>
          <p className="font-roboto text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            NemiCapital serves institutional clients, sovereign funds, and accredited private clients through discreet, private offices situated across global financial centers.
          </p>
        </div>

        {/* Global Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GLOBAL_OFFICES.map((office, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E8DCCF] rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-poppins font-bold text-lg text-[#1A1818]">
                    {office.city}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 font-roboto">
                    {office.country}
                  </span>
                </div>
                <div className="inline-block text-[11px] font-semibold text-[#B81446] bg-[#B81446]/5 px-2 py-0.5 rounded border border-[#B81446]/10 mb-4">
                  {office.role}
                </div>

                <div className="space-y-2.5 text-xs text-gray-600 font-roboto">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#1A1818] shrink-0">Address:</span>
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1818] shrink-0">Tel:</span>
                    <a
                      href={`tel:${office.phone.replace(/[^+\d]/g, '')}`}
                      className="text-[#B81446] hover:underline"
                    >
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1818] shrink-0">Email:</span>
                    <a
                      href={`mailto:${office.email}`}
                      className="text-[#B81446] hover:underline"
                    >
                      {office.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <span className="font-semibold text-[#1A1818] shrink-0">Hours:</span>
                    <span className="text-gray-500">{office.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
