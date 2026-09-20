'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CreditCardVisual, CardTheme } from './CreditCardVisual';
import { useInView } from '@/components/home';

interface CardData {
  id: string;
  slug: string;
  name: string;
  theme: CardTheme;
  ribbon: string;
  category: ('Business' | 'Cashback' | 'Low Interest' | 'Rewards' | 'Secured' | 'Travel & Hotel')[];
  tagline: string;
  benefits: string[];
  annualFee: number; // For sorting
  rewardsRating: number;
}

const ALL_CARDS: CardData[] = [
  {
    id: 'platinum',
    slug: 'platinum-credit-card',
    name: 'Platinum Credit Card',
    theme: 'platinum',
    ribbon: 'Rewards',
    category: ['Rewards', 'Travel & Hotel', 'Low Interest'],
    tagline: 'Explore a new world of rewards with the Platinum Credit Card.',
    benefits: [
      'Zero Joining and Annual Fees',
      '2% Fuel Surcharge waiver at all major gas stations',
      'Multi Rewards & Lifestyle Benefits',
      '5X Travel Miles on all flight bookings',
    ],
    annualFee: 0,
    rewardsRating: 5,
  },
  {
    id: 'millennia',
    slug: 'millennia-credit-card',
    name: 'Millennia Credit Card',
    theme: 'millennia',
    ribbon: 'Cashback',
    category: ['Cashback', 'Rewards'],
    tagline: 'Earn 5% cashback on Amazon, dining, entertainment, and digital subscriptions.',
    benefits: [
      'Welcome vouchers worth $200+ upon activation',
      '1% Fuel Surcharge waiver at all major gas stations',
      'Lifestyle & Streaming Subscription Benefits',
      'Access to 1000+ global airport lounges',
    ],
    annualFee: 95,
    rewardsRating: 4.8,
  },
  {
    id: 'moneyback',
    slug: 'money-back-credit-card',
    name: 'Money Back Credit Card',
    theme: 'moneyback',
    ribbon: 'Rewards',
    category: ['Rewards', 'Cashback', 'Secured'],
    tagline: 'Accelerate your savings with 2X reward points on all online expenditures.',
    benefits: [
      'Zero Joining and Annual Fees',
      '2% Fuel Surcharge waiver at all major gas stations',
      'Multi Rewards & Everyday Cashback',
      '5X Bonus Points on international transactions',
    ],
    annualFee: 0,
    rewardsRating: 4.7,
  },
  {
    id: 'easyemi',
    slug: 'easy-emi-credit-card',
    name: 'Easy EMI Credit Card',
    theme: 'easyemi',
    ribbon: 'Cashback',
    category: ['Cashback', 'Low Interest'],
    tagline: 'Convert large retail transactions into flexible, low-rate installment plans effortlessly.',
    benefits: [
      'Welcome statement credit worth $150+',
      '1% Fuel Surcharge waiver at all major gas stations',
      '0% Intro APR on balance transfers for 12 months',
      'Access to 1000+ global airport lounges',
    ],
    annualFee: 49,
    rewardsRating: 4.6,
  },
  {
    id: 'business',
    slug: 'business-prime-card',
    name: 'Corporate Business Prime',
    theme: 'business',
    ribbon: 'Business',
    category: ['Business', 'Rewards', 'Low Interest'],
    tagline: 'Streamline business expenses with automated ledger sync and executive travel perks.',
    benefits: [
      'Dedicated relationship manager & corporate expense portal',
      'Up to 55 days interest-free credit period',
      'Complimentary airport lounge access worldwide',
      'Comprehensive travel insurance up to $500,000',
    ],
    annualFee: 299,
    rewardsRating: 4.9,
  },
  {
    id: 'travel',
    slug: 'voyage-travel-card',
    name: 'Voyage Travel & Hotel Card',
    theme: 'travel',
    ribbon: 'Travel & Hotel',
    category: ['Travel & Hotel', 'Rewards'],
    tagline: 'Curated for frequent fliers with zero foreign transaction markups.',
    benefits: [
      'Zero foreign exchange markup on all international transactions',
      'Complimentary hotel room upgrades & late checkout',
      '10X Reward Points on airline and hotel bookings',
      'Priority Pass membership with unlimited global lounge visits',
    ],
    annualFee: 395,
    rewardsRating: 4.9,
  },
];

const CATEGORIES = [
  'All',
  'Business',
  'Cashback',
  'Low Interest',
  'Rewards',
  'Secured',
  'Travel & Hotel',
] as const;

type CategoryType = typeof CATEGORIES[number];

export const BestCardsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [sortBy, setSortBy] = useState<'default' | 'fee-low' | 'fee-high' | 'rewards'>('default');
  const [comparedCards, setComparedCards] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 });

  // Toggle card in compare list
  const toggleCompare = (id: string) => {
    setComparedCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 cards simultaneously.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Filter cards
  const filteredCards = useMemo(() => {
    let list = ALL_CARDS;
    if (selectedCategory !== 'All') {
      list = list.filter((card) =>
        card.category.includes(selectedCategory as any)
      );
    }

    // Sort cards
    const sorted = [...list];
    if (sortBy === 'fee-low') {
      sorted.sort((a, b) => a.annualFee - b.annualFee);
    } else if (sortBy === 'fee-high') {
      sorted.sort((a, b) => b.annualFee - a.annualFee);
    } else if (sortBy === 'rewards') {
      sorted.sort((a, b) => b.rewardsRating - a.rewardsRating);
    }
    return sorted;
  }, [selectedCategory, sortBy]);

  return (
    <section ref={ref} className="w-full bg-white py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* =====================================================================
            LEFT COLUMN: Card Types Filter Sidebar (Slides in from left)
            ===================================================================== */}
        <div
          className={`lg:col-span-3 w-full transition-all duration-800 ease-out ${
            isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          {/* Card Types Header with Red Triangle */}
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-3.5 h-3.5 text-[#B81446] flex-shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            <h3 className="font-poppins font-semibold text-base sm:text-lg text-[#1A1818] tracking-tight">
              Card Types
            </h3>
          </div>

          {/* Filter Pill Buttons Stack */}
          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-none text-xs sm:text-sm font-medium transition-all duration-200 border flex items-center justify-between shadow-sm ${
                    isActive
                      ? 'bg-white text-[#B81446] border-[#B81446] font-semibold shadow-md translate-x-1'
                      : 'bg-white text-[#4A4543] border-[#E8E1D9] hover:bg-[#FDFBF9] hover:text-[#1A1818] hover:border-[#D5CBC1]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#B81446]' : 'bg-[#9C948D]'
                      }`}
                    />
                    <span>{cat === 'All' ? 'All Cards' : cat}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-3 bg-[#B81446] -mr-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: Best Cards for Your Needs & Card List
            ===================================================================== */}
        <div className="lg:col-span-9 w-full flex flex-col">
          
          {/* Header Row: Title & Default Sorting Dropdown */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E8E1D9] gap-4 transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            <h2 className="font-poppins font-bold text-xl sm:text-2xl lg:text-[26px] text-[#1A1818] tracking-tight">
              Best Cards for Your Needs
            </h2>

            {/* Default Sorting Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#DDD5CB] text-[#554F4B] text-xs sm:text-sm px-4 py-2 pr-8 rounded-none font-medium cursor-pointer shadow-sm hover:border-[#B81446] focus:outline-none focus:ring-1 focus:ring-[#B81446]"
              >
                <option value="default">Default Sorting</option>
                <option value="fee-low">Annual Fee: Free to Low</option>
                <option value="fee-high">Annual Fee: High to Free</option>
                <option value="rewards">Highest Rewards Rating</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#554F4B]">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cards List Stack */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {filteredCards.length === 0 ? (
              <div className="bg-white border border-[#E8E1D9] p-12 text-center">
                <p className="text-[#736B65] text-sm">
                  No cards found in the selected category.
                </p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 px-5 py-2 bg-[#B81446] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  View All Cards
                </button>
              </div>
            ) : (
              filteredCards.map((card, idx) => {
                const isCompared = comparedCards.includes(card.id);
                const isExpanded = expandedCardId === card.id;
                const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
                const delayClass = delays[idx % delays.length];

                return (
                  <div
                    key={card.id}
                    className={`relative bg-white border border-[#E8E1D9] shadow-sm hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 overflow-hidden ${delayClass} ${
                      isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
                    }`}
                  >
                    {/* Top-Right Folded Crimson Ribbon Badge */}
                    <div className="absolute top-0 right-0 z-30">
                      <div className="relative bg-[#9E0C34] text-white text-[11px] font-poppins font-semibold uppercase tracking-wider px-4 py-1 shadow-sm">
                        {card.ribbon}
                        {/* 3D Fold notch triangle below ribbon */}
                        <div className="absolute right-0 -bottom-1.5 w-0 h-0 border-t-[6px] border-t-[#6B0420] border-r-[6px] border-r-transparent" />
                      </div>
                    </div>

                    {/* Card Content Grid */}
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                      
                      {/* Left Column: Title, Credit Card Mockup & Dual Action Buttons */}
                      <div className="md:col-span-5 flex flex-col items-center text-center">
                        {/* Card Name */}
                        <h4 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] tracking-tight mb-4">
                          {card.name}
                        </h4>

                        {/* Credit Card Visual */}
                        <div className="w-full max-w-[280px] sm:max-w-[300px]">
                          <CreditCardVisual
                            theme={card.theme}
                            title={card.name}
                          />
                        </div>

                        {/* Dual Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] sm:max-w-[300px] mt-5">
                          <Link
                            href={`/apply/card?name=${encodeURIComponent(card.name)}`}
                            className="w-full py-2.5 px-3 bg-[#FAF2EB] hover:bg-[#B81446] text-[#1A1818] hover:text-white font-poppins font-semibold text-xs text-center tracking-wide uppercase transition-colors duration-200 border border-[#E8DFD5] shadow-xs"
                          >
                            Apply Now
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCardId(isExpanded ? null : card.id)
                            }
                            className="w-full py-2.5 px-3 bg-white hover:bg-[#1A1818] text-[#1A1818] hover:text-white font-poppins font-semibold text-xs text-center tracking-wide uppercase transition-colors duration-200 border border-[#DDD5CA] shadow-xs"
                          >
                            {isExpanded ? 'Show Less' : 'Read More'}
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Tagline, Features & Benefits, Compare Checkbox */}
                      <div className="md:col-span-7 flex flex-col justify-between h-full pt-4 md:pt-0">
                        <div>
                          {/* Tagline / Subtitle */}
                          <p className="font-roboto text-xs sm:text-sm text-[#736B65] leading-relaxed mb-4">
                            {card.tagline}
                          </p>

                          {/* Section Title */}
                          <h5 className="font-poppins font-bold text-sm sm:text-[15px] text-[#1A1818] tracking-tight mb-3">
                            Features & Benefits
                          </h5>

                          {/* Crimson Square Bulleted List */}
                          <ul className="space-y-2 text-xs sm:text-[13px] text-[#4A4543]">
                            {card.benefits.map((benefit, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 bg-[#B81446] mt-1.5 flex-shrink-0" />
                                <span className="leading-snug">{benefit}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Expanded Details when "Read More" is toggled */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-dashed border-[#E8E1D9] bg-[#FBFBFB] p-3 text-xs text-[#5E5753] space-y-1.5 animate-fadeIn">
                              <p>
                                <strong className="text-[#1A1818]">Annual Fee:</strong>{' '}
                                {card.annualFee === 0
                                  ? '$0 (Zero Joining & Annual Fee)'
                                  : `$${card.annualFee.toLocaleString()}/year + applicable taxes`}
                              </p>
                              <p>
                                <strong className="text-[#1A1818]">Interest Rate:</strong>{' '}
                                15.99% - 24.99% Variable APR based on creditworthiness.
                              </p>
                              <p>
                                <strong className="text-[#1A1818]">Contactless Limit:</strong>{' '}
                                Up to $250 per transaction without PIN.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Separator & Compare Checkbox */}
                        <div className="pt-4 mt-5 border-t border-[#EDE5DC] flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => toggleCompare(card.id)}
                              className="w-4 h-4 rounded-none border-[#C8BFB5] text-[#B81446] focus:ring-[#B81446] cursor-pointer"
                            />
                            <span className="text-xs sm:text-[13px] font-medium text-[#736B65] group-hover:text-[#1A1818] transition-colors">
                              Add to Compare
                            </span>
                          </label>

                          <span className="text-[11px] text-[#A39B94]">
                            {card.annualFee === 0 ? 'Zero Annual Fee' : `Annual Fee: $${card.annualFee}`}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* =======================================================================
          FLOATING CARD COMPARISON BAR (Appears when cards are selected)
          ======================================================================= */}
      {comparedCards.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 sm:max-w-md bg-[#1A1818] text-white p-4 shadow-2xl z-50 border-t-2 border-[#B81446] flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#B81446] flex items-center justify-center font-bold text-xs text-white">
              {comparedCards.length}
            </div>
            <div>
              <p className="font-poppins font-semibold text-xs sm:text-sm">
                Cards Selected to Compare
              </p>
              <p className="text-[10px] text-white/60">
                Compare perks, fees & interest rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-1.5 bg-[#B81446] hover:bg-[#D41B54] text-white font-poppins font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Compare
            </button>
            <button
              onClick={() => setComparedCards([])}
              className="px-2.5 py-1.5 text-white/60 hover:text-white text-xs underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          COMPARISON MODAL
          ======================================================================= */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-t-4 border-[#B81446] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 text-[#8C847E] hover:text-[#1A1818] text-xl font-bold p-1"
            >
              ✕
            </button>

            <h3 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] mb-6">
              Compare Credit Cards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ALL_CARDS.filter((c) => comparedCards.includes(c.id)).map((card) => (
                <div key={card.id} className="border border-[#E8E1D9] p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-poppins font-bold text-sm text-[#1A1818] mb-3 text-center">
                      {card.name}
                    </h4>
                    <div className="mb-4">
                      <CreditCardVisual theme={card.theme} />
                    </div>
                    <div className="space-y-2 text-xs text-[#554F4B] border-t border-[#E8E1D9] pt-3">
                      <p>
                        <strong>Annual Fee:</strong>{' '}
                        {card.annualFee === 0 ? 'Free' : `$${card.annualFee}/year`}
                      </p>
                      <p>
                        <strong>Category:</strong> {card.category.join(', ')}
                      </p>
                      <p>
                        <strong>Key Perks:</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        {card.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    href={`/apply/card?name=${encodeURIComponent(card.name)}`}
                    className="mt-5 w-full py-2 bg-[#B81446] text-white text-xs font-semibold text-center uppercase tracking-wider block"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
