import { ASSETS } from './assets';

export interface HeroSlide {
  id: string;
  image: typeof ASSETS.heroSlides.slide1;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

/**
 * Core Site Configuration
 * Centralized content and metadata for NemiCapital International Bank.
 */
export const SITE_CONFIG = {
  brand: {
    name: 'NemiCapital International Bank',
    shortName: 'NemiCapital',
    tagline: 'Better Future',
    established: '1984',
    motto: 'Excellence in Global Banking',
  },

  // Very top utility navigation bar items
  topUtilityNav: {
    looking: {
      label: 'Looking',
      current: 'Personal Banking',
      options: ['Personal Banking', 'Corporate Banking', 'Private Wealth', 'SME Banking'],
    },
    branchLocator: {
      label: 'Find Nearest Branch',
      href: '/branches',
    },
    utilityLinks: [
      { label: 'Careers', href: '/careers' },
      { label: "Faq's", href: '/faqs' },
      { label: 'Offers', href: '/offers' },
      { label: 'Calendar', href: '/calendar' },
    ],
    search: {
      label: 'Search',
    },
    languages: {
      current: 'English',
      options: ['English', 'Français', 'Español', 'العربية'],
    },
  },

  headerActions: {
    login: {
      label: 'Login',
      href: '/login',
    },
    openAccount: {
      label: 'Open an Account',
      href: '/apply/account',
    },
  },

  updatesBanner: {
    badge: 'Updates:',
    message: 'Get up to 4%* on our Savings Account Balances with NemiCapital.',
    actionText: 'More Details',
    actionHref: '/services/savings',
    announcement: 'Dear Customer, We have launched Video KYC facility for new customers to open savings accounts.',
  },

  heroQuickActions: [
    {
      id: 'payment',
      label: 'Make Payment',
      href: '/services/payments',
    },
    {
      id: 'enquiry',
      label: 'Make an Enquiry',
      href: '/contact/enquiry',
    },
  ],

  heroSlides: [
    {
      id: 'slide-1',
      image: ASSETS.heroSlides.slide1,
      title: 'Bank with the Happiest Customers in the World',
      subtitle: 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled.',
      ctaText: 'Make An Appointment',
      ctaHref: '/contact/appointment',
    },
    {
      id: 'slide-2',
      image: ASSETS.heroSlides.slide2,
      title: 'Empowering Your Global Financial Future',
      subtitle: 'Personalized wealth management strategies and corporate solutions designed to scale across international borders.',
      ctaText: 'Explore Private Wealth',
      ctaHref: '/services/wealth',
    },
    {
      id: 'slide-3',
      image: ASSETS.heroSlides.slide3,
      title: 'Seamless Digital Banking at Your Fingertips',
      subtitle: 'Manage your portfolio, transfer funds across 45+ currencies with real-time biometric security.',
      ctaText: 'Discover Online Banking',
      ctaHref: '/services/online-banking',
    },
    {
      id: 'slide-4',
      image: ASSETS.heroSlides.slide4,
      title: 'Tailored Financing for Growing Enterprises',
      subtitle: 'Flexible commercial loans, trade finance, and institutional treasury support built for sustainable growth.',
      ctaText: 'Corporate Solutions',
      ctaHref: '/services/corporate',
    },
  ] satisfies readonly HeroSlide[],

  // Section 2: Bank For A Better Tomorrow (Cream background #F7F1EB)
  betterTomorrowSection: {
    title: 'Bank For A Better Tomorrow',
    subtitle: 'Committed to helping our customers succeed.',
    cards: [
      {
        number: '01',
        tag: 'Fixed Deposit',
        title: 'Fixed Returns with Peace of Mind',
        description: 'Grow your surplus capital with guaranteed returns and flexible investment tenures.',
        actionText: 'Read More +',
        href: '/services/accounts',
      },
      {
        number: '02',
        tag: 'Current Account',
        title: 'Banking Solutions for a Business',
        description: 'Seamless corporate transactions, high cash handling limits, and digital treasury tools.',
        actionText: 'Read More +',
        href: '/services/corporate',
      },
      {
        number: '03',
        tag: 'Mutual Funds',
        title: 'Our Strategies for Better Returns',
        description: 'Diversify across international equities, fixed income securities, and curated index funds.',
        actionText: 'Read More +',
        href: '/services/wealth',
      },
    ],
  },

  // Proven Financial Milestones Section (Why Choose Us)
  whyChooseUsSection: {
    tag: 'Why Choose Us',
    title: 'Our bank has been providing services to its customers for over 38 years.',
    subtitle: 'Combining four decades of fiscal stability with cutting-edge international digital banking.',
    stats: [
      {
        id: 'customers',
        value: 1384178,
        formattedValue: '1,384,178',
        suffix: '+',
        label: 'Happy customers',
        description: 'Satisfied retail, private wealth, and corporate clients globally',
        icon: 'costumer' as const,
      },
      {
        id: 'experience',
        value: 38,
        formattedValue: '38',
        suffix: '+',
        label: 'Years in banking',
        description: 'Continuous operational legacy and resilience since 1984',
        icon: 'calendar' as const,
      },
      {
        id: 'branches',
        value: 2545,
        formattedValue: '2,545',
        suffix: '+',
        label: 'Our branches',
        description: 'Full-service international branches & priority lounges worldwide',
        icon: 'branch' as const,
      },
      {
        id: 'works',
        value: 54285,
        formattedValue: '54,285',
        suffix: '+',
        label: 'Successfully works',
        description: 'Completed cross-border credit facilities & structured finance mandates',
        icon: 'goal' as const,
      },
    ],
  },

  // Section 3: Banking For Your Needs (Dark background)
  bankingNeedsSection: {
    title: 'Banking For Your Needs',
    subtitle: 'The bank that builds better relationships.',
    viewAllText: 'View All Services',
    viewAllHref: '/services',
    tabs: [
      {
        id: 'individuals',
        prefix: 'Banking for',
        label: 'Individuals',
      },
      {
        id: 'companies',
        prefix: 'Banking for',
        label: 'Companies',
      },
    ],
    items: {
      individuals: [
        {
          id: 'savings',
          icon: 'coin' as const,
          title: 'Savings & CDs',
          description: 'Tier-1 interest rates with instant liquidity whenever you need it for long-term growth.',
          footnote: '* Interest rate up to 5% p.a',
          href: '/services/savings',
        },
        {
          id: 'digital',
          icon: 'mobileBanking' as const,
          title: 'Online & Mobile',
          description: 'Biometric authorization, multi-currency wallets, and round-the-clock seamless transfers.',
          footnote: '* Terms & Conditions',
          href: '/services/digital',
        },
        {
          id: 'loans',
          icon: 'debt' as const,
          title: 'Consumer Loans',
          description: 'Transparent interest rates, zero hidden prepayment fees, and rapid personal approval.',
          footnote: "* Check today's Interest Rates",
          href: '/services/loans',
        },
      ],
      companies: [
        {
          id: 'corp-accounts',
          icon: 'coin' as const,
          title: 'Corporate Accounts & CDs',
          description: 'Maximize yields on surplus business cash with high-yield institutional accounts & CDs.',
          footnote: '* Flexible institutional terms',
          href: '/services/corporate-accounts',
        },
        {
          id: 'commercial-tech',
          icon: 'mobileBanking' as const,
          title: 'Commercial Banking & API',
          description: 'Automated payroll, enterprise treasury management, and direct ERP banking integrations.',
          footnote: '* 24/7 Dedicated Treasury Desk',
          href: '/services/commercial',
        },
        {
          id: 'commercial-loans',
          icon: 'debt' as const,
          title: 'Working Capital & Credit',
          description: 'Flexible revolving credit lines, trade financing, and tailored commercial equipment loans.',
          footnote: '* Competitive enterprise margins',
          href: '/services/credit',
        },
      ],
    },
  },

  // Section 4: Emergency Service Requests (Light ivory / cream background)
  emergencyServicesSection: {
    title: 'Emergency Service Requests',
    subtitle: 'List of banking service requests all in one place.',
    categories: [
      {
        id: 'credit-debit',
        icon: 'creditCard' as const,
        labelLine1: 'Credit / Debit Card',
        labelLine2: 'Related',
        requests: [
          { title: 'Block Debit / ATM Card', href: '/services/emergency/block-card' },
          { title: 'Generate Debit Card Pin Number', href: '/services/emergency/generate-pin' },
          { title: 'Unlock Debit / ATM Card', href: '/services/emergency/unlock-card' },
          { title: 'Reissue Lost Debit / ATM Card', href: '/services/emergency/reissue-card' },
        ],
      },
      {
        id: 'mobile-banking',
        icon: 'mobileBanking' as const,
        labelLine1: 'Mobile / Internet',
        labelLine2: 'Banking',
        requests: [
          { title: 'Register for Internet Banking', href: '/services/emergency/register-netbanking' },
          { title: 'Reset NetBanking Password', href: '/services/emergency/reset-password' },
          { title: 'Enable International Transactions', href: '/services/emergency/international-tx' },
          { title: 'Update Mobile Banking App Access', href: '/services/emergency/app-access' },
        ],
      },
      {
        id: 'account-details',
        icon: 'accountDetails' as const,
        labelLine1: 'Account Details',
        labelLine2: 'Changing',
        requests: [
          { title: 'Update Registered Mobile Number', href: '/services/emergency/update-mobile' },
          { title: 'Change Communication Address', href: '/services/emergency/change-address' },
          { title: 'Update Email Address', href: '/services/emergency/update-email' },
          { title: 'Link PAN Card / Update KYC', href: '/services/emergency/kyc-update' },
        ],
      },
      {
        id: 'cheque-book',
        icon: 'chequeBook' as const,
        labelLine1: 'Cheque Book / DD',
        labelLine2: 'Related',
        requests: [
          { title: 'Request New Cheque Book', href: '/services/emergency/request-chequebook' },
          { title: 'Stop Cheque Payment', href: '/services/emergency/stop-cheque' },
          { title: 'Check Cheque Clearing Status', href: '/services/emergency/cheque-status' },
          { title: 'Demand Draft (DD) Cancellation', href: '/services/emergency/dd-cancellation' },
        ],
      },
    ],
    calloutBanner: {
      tag: 'Call for',
      title: 'Private Banking',
      phone: '+1(222) 123 456 78',
      phoneHref: 'tel:+122212345678',
      imageAlt: 'Private Banking Customer Service Representative',
    },
  },

  // Section 5: Personalize Your Card (Clean white background)
  personalizeCardSection: {
    title: 'Personalize Your Card And Stand Out From Crowd',
    description:
      'Desire that they cannot foresee the pain & trouble that are bound too ensue equal blame belongs through shrinking.',
    checklist: [
      'Great explorer of the master-builder',
      'Great explorer of the master-builder',
    ],
    form: {
      label: 'Apply for Credit Card',
      placeholder: 'Name',
      buttonText: 'Apply Now',
    },
    overlayBadges: [
      {
        id: 'buy-home',
        icon: 'buyHome' as const,
        alt: 'Buy Home Benefit',
      },
      {
        id: 'online-shopping',
        icon: 'onlineShopping' as const,
        alt: 'Online Shopping Rewards',
      },
      {
        id: 'watching-a-movie',
        icon: 'watchingAMovie' as const,
        alt: 'Entertainment & Movies',
      },
    ],
  },

  // Section 6: Foreign Exchange Rates (Dark cinematic background)
  forexRatesSection: {
    title: 'Foreign Exchange Rates',
    subtitle: 'Denouncing pleasure & praising pain was born.',
    tabs: [
      { id: 'send-receive', label: 'Money Send & Receive' },
      { id: 'forex-card', label: 'Load & Redeem Forex Card' },
    ],
    assistantText: 'Click to Get Assistant',
    currencies: [
      {
        code: 'USD',
        name: 'US Dollar',
        country: 'United States',
        flag: 'US',
        baseSend: 79.89,
        baseReceive: 76.54,
      },
      {
        code: 'SEK',
        name: 'Swedish Krona',
        country: 'Sweden',
        flag: 'SE',
        baseSend: 8.20,
        baseReceive: 7.25,
      },
      {
        code: 'GBP',
        name: 'British Pound',
        country: 'United Kingdom',
        flag: 'GB',
        baseSend: 101.88,
        baseReceive: 96.55,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        country: 'Japan',
        flag: 'JP',
        baseSend: 62.82,
        baseReceive: 58.46,
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        country: 'Australia',
        flag: 'AU',
        baseSend: 57.52,
        baseReceive: 54.21,
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        country: 'Canada',
        flag: 'CA',
        baseSend: 63.41,
        baseReceive: 59.75,
      },
      {
        code: 'EUR',
        name: 'Euro',
        country: 'European Union',
        flag: 'EU',
        baseSend: 87.20,
        baseReceive: 83.60,
      },
      {
        code: 'CHF',
        name: 'Swiss Franc',
        country: 'Switzerland',
        flag: 'CH',
        baseSend: 88.90,
        baseReceive: 85.10,
      },
    ],
  },

  // Questions & Answers (FAQ) Section
  faqSection: {
    title: 'Questions & Answers',
    subtitle: 'Find answers to all your queries about our service.',
    searchLabel: 'Help You to Find',
    searchPlaceholder: 'Related Keyword...',
    helperText: "Didn't get, Click below button to more answers or",
    contactText: 'contact us',
    contactHref: '/contact',
    ctaText: 'Grab Your Deals',
    ctaHref: '/offers',
    items: [
      {
        id: 'faq-1',
        question: 'What is the minimum balance?',
        answer:
          'Our standard savings accounts require a zero minimum balance for the initial 90 days. Thereafter, maintaining an average monthly balance of $1,000 (or currency equivalent) waives all monthly maintenance fees and unlocks our premier yield tiers.',
      },
      {
        id: 'faq-2',
        question: 'What is the rate of interest?',
        answer:
          'We offer tiered annual percentage yields starting at 4.25% p.a. for standard high-yield savings accounts, scaling up to 5.75% p.a. on institutional term deposits and certificates of deposit (CDs) with daily compounding.',
      },
      {
        id: 'faq-3',
        question: 'When will I receive my account statement?',
        answer:
          'Electronic e-statements are automatically published on the 1st of every calendar month and available anytime via your secure online dashboard. Physical consolidated statements are dispatched quarterly to your registered address upon request.',
      },
      {
        id: 'faq-4',
        question: 'Can I use any branch across Europe?',
        answer:
          'Yes. All NemiCapital international branches, regional centers, and authorized partner banking networks across Europe and overseas offer complete cross-branch interoperability with biometric identification and instant counter service.',
      },
      {
        id: 'faq-5',
        question: 'How safe/secure is our net banking a/c?',
        answer:
          'Our digital infrastructure is protected with military-grade 256-bit AES encryption, multi-factor biometric authorization, real-time zero-trust fraud monitoring, and comprehensive regulatory deposit insurance across global jurisdictions.',
      },
    ],
  },

  // Section 8: Flexible EMI Calculator Online
  emiCalculatorSection: {
    title: 'Flexible EMI Calculator Online',
    subtitle: 'Easily calculate your equated monthly instalment online.',
    applyHref: '/apply/loan',
    loanTypes: [
      {
        id: 'home',
        label: 'Home Loan',
        icon: 'buyHome' as const,
        minAmount: 50000,
        maxAmount: 5000000,
        stepAmount: 10000,
        defaultAmount: 1000000,
        minTenure: 1,
        maxTenure: 30,
        stepTenure: 1,
        defaultTenure: 20,
        minRate: 4,
        maxRate: 16,
        stepRate: 0.25,
        defaultRate: 8,
      },
      {
        id: 'personal',
        label: 'Personal Loan',
        icon: 'debt' as const,
        minAmount: 5000,
        maxAmount: 250000,
        stepAmount: 5000,
        defaultAmount: 50000,
        minTenure: 1,
        maxTenure: 7,
        stepTenure: 1,
        defaultTenure: 5,
        minRate: 8,
        maxRate: 20,
        stepRate: 0.25,
        defaultRate: 10.5,
      },
      {
        id: 'car',
        label: 'Vehicle Loan',
        icon: 'car' as const,
        minAmount: 10000,
        maxAmount: 200000,
        stepAmount: 5000,
        defaultAmount: 45000,
        minTenure: 1,
        maxTenure: 10,
        stepTenure: 1,
        defaultTenure: 7,
        minRate: 5,
        maxRate: 14,
        stepRate: 0.25,
        defaultRate: 6.9,
      },
    ],
  },

  // Section 9: Money Protection & Financial Security
  moneyProtectionSection: {
    tag: 'Protect your money',
    title: 'We make every effort to ensure that our customers money is well protected.',
    description:
      "Investor protection is an integral part of NemiCapital's mission. Our Investor Alerts and other resources can help you build knowledge and avoid problems such as the latest frauds, which all too often are perpetrated by unauthorized actors.",
    badgeText: 'Bank-Grade Security Guaranteed',
    pillars: [
      {
        number: '1',
        title: 'Investor Alerts',
        description: 'Keep informed about new or complex products, scams and other investing issues.',
        href: '/security/alerts',
      },
      {
        number: '2',
        title: 'Ask and Check',
        description: 'Learn how to check out sellers and investments and what questions to ask.',
        href: '/security/verification',
      },
      {
        number: '3',
        title: 'Protect Your Identity',
        description:
          "Identity theft can devastate your credit rating and derail financial security. Here's how you can protect yourself.",
        href: '/security/identity',
      },
    ],
  },

  // Section 10: Global Footer Section
  footerSection: {
    appPromo: {
      title: 'Experience a New Digital World.',
      subtitle: 'Mobile banking application with new & exciting features',
      playstoreText: 'Download on playstore',
      appstoreText: 'Download on App Store',
    },
    columns: [
      {
        title: 'Loans',
        links: [
          'Home Loan',
          'Personal Loan',
          'Vehicle Loan',
          'Education Loan',
          'Gold Loan',
          'Low Interest',
          'Our All Cards',
        ],
      },
      {
        title: 'Rates & Charges',
        links: [
          'About Us',
          'Testimonials',
          'Careers',
          'Career Detail',
          "Faq's",
          'List View',
          'Get In Touch',
        ],
      },
      {
        title: 'About Us',
        links: [
          'About Us',
          'Board of Directors',
          'Careers',
          'Career Detail',
          'Business',
          "Faq's",
          'Testimonials',
        ],
      },
      {
        title: 'Services',
        links: [
          'All Accounts',
          'Savings Account',
          'Current Account',
          'Fixed Deposit Account',
          'Salary Account',
          'Recuring Deposit Account',
          'NRI Account',
        ],
      },
    ],
    contact: {
      phone: '(800) 123 456 78',
      phoneLabel: 'Customer Care',
      hours: 'Mon – Fri: 9.00am to 5.00pm',
      hoursLabel: 'Banking Hours',
      copyright: 'Copyright © 2026 NemiCapital International Bank. Licensed by the Central Bank of United States.',
    },
    actionBoxes: [
      {
        title: 'Download Forms',
        type: 'forms',
      },
      {
        title: 'Register Your Complaint',
        type: 'complaint',
      },
    ],
    subFooterLinks: ['About Us', 'All Accounts', 'Secured', 'NRI Account'],
  },

  contact: {
    phone: '+1 (800) 555-NEMI',
    email: 'contact@nemicapital.com',
    supportHref: '/contact',
    ctaText: 'Get In Touch',
    ctaHref: '/contact',
  },

  social: {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
  }
} as const;

export type SiteConfig = typeof SITE_CONFIG;
