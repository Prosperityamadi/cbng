'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface LocationData {
  city: string;
  name: string;
  type: 'BRANCH' | 'ATM';
  bic: string;
  address: string;
  phone: string;
  email: string;
  coords: { top: string; left: string };
}

const LOCATIONS: LocationData[] = [
  {
    city: 'San Francisco',
    name: 'NemiCapital, San Francisco',
    type: 'BRANCH',
    bic: 'NEMI0001234',
    address: '24/7, 1st Floor Global Str, 2nd Cross, SF 94112.',
    phone: '+1 415 678 9012',
    email: 'support@nemicapital.com',
    coords: { top: '48%', left: '56%' },
  },
  {
    city: 'New York',
    name: 'NemiCapital, New York',
    type: 'BRANCH',
    bic: 'NEMI0005678',
    address: '250 Park Avenue, 18th Floor, New York, NY 10177.',
    phone: '+1 (212) 555-0199',
    email: 'support@nemicapital.com',
    coords: { top: '42%', left: '64%' },
  },
  {
    city: 'Los Angeles',
    name: 'NemiCapital, Los Angeles',
    type: 'BRANCH',
    bic: 'NEMI0009012',
    address: '141, First Floor, 12 St RootsTerrace, Los Angeles, CA 90010.',
    phone: '+1 (800) 123 456 78',
    email: 'support@nemicapital.com',
    coords: { top: '55%', left: '50%' },
  },
  {
    city: 'Zurich',
    name: 'NemiCapital, Zurich HQ',
    type: 'BRANCH',
    bic: 'NEMI0004400',
    address: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland.',
    phone: '+41 44 218 8000',
    email: 'support@nemicapital.com',
    coords: { top: '38%', left: '60%' },
  },
  {
    city: 'San Francisco ATM',
    name: 'NemiCapital Express ATM, SF',
    type: 'ATM',
    bic: 'NEMI-ATM-04',
    address: '555 Market Street, Financial District, SF 94105.',
    phone: '+1 (800) 123 456 78',
    email: 'support@nemicapital.com',
    coords: { top: '52%', left: '58%' },
  },
];

export const BranchMapLocatorSection: React.FC = () => {
  const [filterType, setFilterType] = useState<'BRANCH' | 'ATM'>('BRANCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(LOCATIONS[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matched = LOCATIONS.find(
      (loc) =>
        loc.type === filterType &&
        (loc.city.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query) ||
          loc.name.toLowerCase().includes(query))
    );

    if (matched) {
      setSelectedLocation(matched);
    } else {
      // Find any matching regardless of type
      const anyMatch = LOCATIONS.find(
        (loc) =>
          loc.city.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query)
      );
      if (anyMatch) {
        setFilterType(anyMatch.type);
        setSelectedLocation(anyMatch);
      }
    }
  };

  const handleFilterChange = (type: 'BRANCH' | 'ATM') => {
    setFilterType(type);
    const firstMatch = LOCATIONS.find((l) => l.type === type);
    if (firstMatch) {
      setSelectedLocation(firstMatch);
    }
  };

  return (
    <section className="relative w-full h-[540px] sm:h-[600px] lg:h-[660px] bg-[#E8E8E8] overflow-hidden select-none border-b border-gray-200">
      
      {/* =========================================================================
          1. BACKGROUND MAP SNAPSHOT (High Contrast Grayscale Vector Cartography)
          ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <Image
          src={ASSETS.images.branchMapSnapshot}
          alt="NemiCapital Branch and ATM Locator Map"
          fill
          priority
          className="object-cover object-center grayscale contrast-[108%] brightness-[98%]"
        />
        {/* Subtle Map Ambient Overlay */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      </div>

      {/* =========================================================================
          2. TOP FLOATING SEARCH BAR (Dark Charcoal Bar #1A1818)
          ========================================================================= */}
      <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl bg-[#1A1818] text-white shadow-2xl px-5 sm:px-7 py-3 rounded-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-white/15 animate-fadeIn">
        
        {/* Left: Radio Mode Selectors (BRANCH / ATM) */}
        <div className="flex items-center gap-5 shrink-0 border-b sm:border-b-0 sm:border-r border-white/15 pb-2.5 sm:pb-0 sm:pr-6">
          {/* Branch Radio */}
          <button
            type="button"
            onClick={() => handleFilterChange('BRANCH')}
            className="flex items-center gap-2 text-xs font-poppins font-medium cursor-pointer tracking-wider text-white/90 hover:text-white"
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                filterType === 'BRANCH'
                  ? 'border-[#B81446]'
                  : 'border-white/40'
              }`}
            >
              {filterType === 'BRANCH' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B81446]" />
              )}
            </span>
            <span className={filterType === 'BRANCH' ? 'text-white font-semibold' : 'text-white/70'}>
              BRANCH
            </span>
          </button>

          {/* ATM Radio */}
          <button
            type="button"
            onClick={() => handleFilterChange('ATM')}
            className="flex items-center gap-2 text-xs font-poppins font-medium cursor-pointer tracking-wider text-white/90 hover:text-white"
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                filterType === 'ATM'
                  ? 'border-[#B81446]'
                  : 'border-white/40'
              }`}
            >
              {filterType === 'ATM' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B81446]" />
              )}
            </span>
            <span className={filterType === 'ATM' ? 'text-white font-semibold' : 'text-white/70'}>
              ATM
            </span>
          </button>
        </div>

        {/* Center: Location Input */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 min-w-0">
          <div className="text-white/50 pl-1 shrink-0">
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Your Location"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none font-roboto"
          />
        </form>

        {/* Right: Search CTA */}
        <button
          type="button"
          onClick={handleSearch}
          className="bg-white hover:bg-[#B81446] text-[#1A1818] hover:text-white px-6 py-2 text-xs font-poppins font-semibold uppercase tracking-wider rounded-none transition-all duration-200 shrink-0 cursor-pointer shadow-xs active:scale-95"
        >
          Search
        </button>

      </div>

      {/* =========================================================================
          3. FLOATING BRANCH DETAIL INFO CARD (Matches Screenshot)
          ========================================================================= */}
      <div className="absolute top-28 sm:top-32 left-4 sm:left-10 lg:left-20 z-20 w-[90%] max-w-[320px] sm:max-w-[340px] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] p-6 sm:p-7 border border-gray-100 rounded-none animate-fadeInUp">
        
        {/* Title Header */}
        <div className="pb-4 border-b border-gray-100">
          <h3 className="font-poppins font-bold text-lg sm:text-xl text-[#1A1818] leading-tight">
            {selectedLocation.name.split(', ')[0]},<br />
            <span className="font-semibold text-gray-800">
              {selectedLocation.name.split(', ')[1]}
            </span>
          </h3>
        </div>

        {/* Details List */}
        <div className="space-y-4 pt-4">
          
          {/* ROUTING / BIC (International standard replacing IFSC) */}
          <div>
            <span className="block font-poppins text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              ROUTING / BIC
            </span>
            <p className="font-mono text-xs text-gray-400 mt-0.5">
              {selectedLocation.bic}
            </p>
          </div>

          {/* ADDRESS */}
          <div>
            <span className="block font-poppins text-[10px] font-bold text-[#1A1818] uppercase tracking-widest">
              ADDRESS
            </span>
            <p className="font-roboto text-xs text-gray-600 mt-1 leading-relaxed">
              {selectedLocation.address}
            </p>
          </div>

          {/* PHONE & EMAIL */}
          <div>
            <span className="block font-poppins text-[10px] font-bold text-[#1A1818] uppercase tracking-widest">
              PHONE &amp; EMAIL
            </span>
            <p className="font-roboto text-xs text-gray-600 mt-1">
              <a
                href={`tel:${selectedLocation.phone.replace(/[^+\d]/g, '')}`}
                className="hover:text-[#B81446] transition-colors"
              >
                {selectedLocation.phone}
              </a>
            </p>
            <p className="font-roboto text-xs text-gray-600 mt-0.5">
              <a
                href={`mailto:${selectedLocation.email}`}
                className="hover:text-[#B81446] transition-colors"
              >
                {selectedLocation.email}
              </a>
            </p>
          </div>

        </div>

      </div>

      {/* =========================================================================
          4. MAP PIN / MARKER (Interactive Location Pin)
          ========================================================================= */}
      <div
        className="absolute z-10 transition-all duration-700 ease-out flex flex-col items-center group cursor-pointer"
        style={{
          top: selectedLocation.coords.top,
          left: selectedLocation.coords.left,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {/* Floating Tooltip Pill */}
        <div className="bg-[#1A1818] text-white text-[11px] font-poppins font-medium px-3 py-1 rounded-sm shadow-xl whitespace-nowrap mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <span>{selectedLocation.name}</span>
        </div>

        {/* Pin Marker Shape */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#B81446] text-white flex items-center justify-center shadow-[0_8px_16px_rgba(184,20,70,0.4)] border-2 border-white transition-transform group-hover:scale-110">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          {/* Ground Anchor Triangle */}
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#B81446] mx-auto -mt-0.5" />
        </div>
      </div>

    </section>
  );
};
