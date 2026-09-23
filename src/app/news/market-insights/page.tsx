'use client';

import React from 'react';
import { SubpageHeroBanner } from '@/components/navigation';
import {
  MarketLeadStorySection,
  MarketInsightsGridSection,
  MarketStrategistsSection,
  MarketNewsletterSection,
} from '@/components/market-insights';
import { FooterSection } from '@/components/home/FooterSection';

export default function MarketInsightsPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col select-none">
      {/* =========================================================================
          1. HERO HEADER BANNER (Consistent Subpage Design)
             - Background Photography with Grayscale & Contrast
             - Overlapping White Card with Crimson Top Border: "Market Insights"
             - Breadcrumbs on the right: "Home > News > Market Insights"
          ========================================================================= */}
      <SubpageHeroBanner
        title="Market Insights"
        breadcrumbs={[
          { label: 'News', href: '/news' },
          { label: 'Market Insights' },
        ]}
      />

      {/* =========================================================================
          2. FEATURED COVER STORY & LEAD MACRO ANALYSIS
          ========================================================================= */}
      <MarketLeadStorySection />

      {/* =========================================================================
          3. SECTOR INTELLIGENCE LIBRARY & FILTERABLE BRIEFS GRID
          ========================================================================= */}
      <MarketInsightsGridSection />

      {/* =========================================================================
          4. EXECUTIVE RESEARCH LEADERSHIP & STRATEGISTS
          ========================================================================= */}
      <MarketStrategistsSection />

      {/* =========================================================================
          7. WEEKLY MACRO BRIEFING SUBSCRIPTION (Dark Ambient Card)
          ========================================================================= */}
      <MarketNewsletterSection />

      {/* Global Brand Footer */}
      <FooterSection />
    </main>
  );
}
