import type { Metadata } from 'next';
import { RegisterPageView } from '@/components/auth';
import { SITE_CONFIG } from '@/core';

export const metadata: Metadata = {
  title: `Open an Account | ${SITE_CONFIG.brand.name}`,
  description: `Open your private banking account with ${SITE_CONFIG.brand.name}. Enjoy instant multi-currency accounts, 4.85% APY compounding savings, and institutional asset security.`,
};

export default function RegisterPage() {
  return <RegisterPageView />;
}
