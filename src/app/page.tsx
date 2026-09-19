import React from 'react';
import {
  HeroSlider,
  BetterTomorrowSection,
  WhyChooseUsStatsSection,
  BankingNeedsSection,
  EmergencyServicesSection,
  PersonalizeCardSection,
  ForexRatesSection,
  ScrollToTopButton,
} from '@/components/home';

/**
 * Home Page (Route: '/')
 * Architecture:
 * 1. HeroSlider (5s auto-transition, Ken Burns zoom, slow appearing reveal)
 * 2. BetterTomorrowSection (Origami diamond badges, botanical petal backdrops)
 * 2b. WhyChooseUsStatsSection (Milestone counters, custom icons, luxury burgundy banner)
 * 3. BankingNeedsSection (Custom icons: coin, mobile-banking, debt, chat; tabs & glassmorphic cards)
 * 4. EmergencyServicesSection (Custom icons: credit-card, mobile-banking, account-details, cheque-book; customer-rep banner)
 * 5. PersonalizeCardSection (Credit card showcase with 3 overlay badges: buy-home, online-shopping, watching-a-movie)
 * 6. ForexRatesSection (Live exchange rates, currency cards, mode tabs & assistant calculator)
 * 7. ScrollToTopButton (Floating red sharp action)
 */
export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-white text-[#1A1818] selection:bg-[#B81446] selection:text-white relative">
      {/* 1. Hero Carousel */}
      <HeroSlider autoPlayInterval={5000} />

      {/* 2. "Bank For A Better Tomorrow" Section */}
      <BetterTomorrowSection />

      {/* 2b. "Why Choose Us / Proven Financial Milestones" Section */}
      <WhyChooseUsStatsSection />

      {/* 3. "Banking For Your Needs" Section */}
      <BankingNeedsSection />

      {/* 4. "Emergency Service Requests" Section */}
      <EmergencyServicesSection />

      {/* 5. "Personalize Your Card" Section */}
      <PersonalizeCardSection />

      {/* 6. "Foreign Exchange Rates" Section */}
      <ForexRatesSection />

      {/* Floating Sharp Red Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
