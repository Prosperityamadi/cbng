import React from 'react';
import {
  HeroSlider,
  BetterTomorrowSection,
  WhyChooseUsStatsSection,
  BankingNeedsSection,
  EmergencyServicesSection,
  PersonalizeCardSection,
  ForexRatesSection,
  QuestionsAnswersSection,
  EmiCalculatorSection,
  MoneyProtectionSection,
  FooterSection,
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
 * 7. QuestionsAnswersSection (Interactive FAQ accordion, search filter, question.jpg visual, and deal CTA)
 * 8. EmiCalculatorSection (Flexible EMI Calculator Online, live sliders, loan category badges, house model)
 * 9. MoneyProtectionSection (Institutional investor protection, 3 security pillars, wealth preservation visual)
 * 10. FooterSection (App promo banner, non-clickable link matrix, customer care, action boxes, sub-footer)
 * 11. ScrollToTopButton (Floating red sharp action)
 */
export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-white text-[#1A1818] selection:bg-[#B81446] selection:text-white relative">
      {/* 1. Hero Carousel */}
      <div id="hero">
        <HeroSlider autoPlayInterval={5000} />
      </div>

      {/* 2. "Bank For A Better Tomorrow" Section */}
      <div id="better-tomorrow" className="scroll-mt-16 sm:scroll-mt-20">
        <BetterTomorrowSection />
      </div>

      {/* 2b. "Why Choose Us / Proven Financial Milestones" Section */}
      <div id="why-choose-us" className="scroll-mt-16 sm:scroll-mt-20">
        <WhyChooseUsStatsSection />
      </div>

      {/* 3. "Banking For Your Needs" Section */}
      <div id="banking-needs" className="scroll-mt-16 sm:scroll-mt-20">
        <BankingNeedsSection />
      </div>

      {/* 4. "Emergency Service Requests" Section */}
      <div id="emergency-services" className="scroll-mt-16 sm:scroll-mt-20">
        <EmergencyServicesSection />
      </div>

      {/* 5. "Personalize Your Card" Section */}
      <div id="personalize-card" className="scroll-mt-16 sm:scroll-mt-20">
        <PersonalizeCardSection />
      </div>

      {/* 6. "Foreign Exchange Rates" Section */}
      <div id="forex-rates" className="scroll-mt-16 sm:scroll-mt-20">
        <ForexRatesSection />
      </div>

      {/* 7. "Questions & Answers" FAQ Section */}
      <div id="faqs" className="scroll-mt-16 sm:scroll-mt-20">
        <QuestionsAnswersSection />
      </div>

      {/* 8. "Flexible EMI Calculator Online" Section */}
      <div id="emi-calculator" className="scroll-mt-16 sm:scroll-mt-20">
        <EmiCalculatorSection />
      </div>

      {/* 9. "Money Protection & Security" Section */}
      <div id="money-protection" className="scroll-mt-16 sm:scroll-mt-20">
        <MoneyProtectionSection />
      </div>

      {/* 10. Global Footer Section */}
      <FooterSection />

      {/* Floating Sharp Red Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
