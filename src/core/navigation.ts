export interface NavSubItem {
  readonly label: string;
  readonly href: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly hasDropdown?: boolean;
  readonly subItems?: readonly NavSubItem[];
  readonly isAction?: boolean;
}

/**
 * Core Navigation Structure
 * Configures all navigation items, links, and dropdown items.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Home',
    href: '/',
    hasDropdown: true,
    subItems: [
      { label: 'Personal Banking', href: '/personal' },
      { label: 'Corporate Banking', href: '/corporate' },
      { label: 'Private Wealth', href: '/private-wealth' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    hasDropdown: true,
    subItems: [
      { label: 'Accounts', href: '/services/accounts' },
      { label: 'Cards', href: '/services/cards' },
      { label: 'Loans', href: '/services/loans' },
      { label: 'Investments', href: '/services/investments' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    hasDropdown: true,
    subItems: [
      { label: 'Who We Are', href: '/about/who-we-are' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Careers', href: '/about/careers' },
    ],
  },
  {
    label: 'News',
    href: '/news',
    hasDropdown: true,
    subItems: [
      { label: 'Press Releases', href: '/news/press-releases' },
      { label: 'Market Insights', href: '/news/market-insights' },
    ],
  },
  {
    label: 'Apply Now',
    href: '/apply',
    hasDropdown: true,
    subItems: [
      { label: 'Open Account', href: '/apply/account' },
      { label: 'Credit Card', href: '/apply/credit-card' },
      { label: 'Mortgages', href: '/apply/mortgage' },
    ],
  },
  {
    label: 'Get In Touch',
    href: '/contact',
    hasDropdown: false,
    isAction: false,
  },
] as const;
