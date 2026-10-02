import type { Metadata } from 'next';
import { LoginPageView } from '@/components/auth';
import { SITE_CONFIG } from '@/core';

export const metadata: Metadata = {
  title: `Log in | ${SITE_CONFIG.brand.name}`,
  description: `Sign in to your ${SITE_CONFIG.brand.name} internet banking account. Manage high-yield savings, transfers, and corporate wealth solutions.`,
};

export default function LoginPage() {
  return <LoginPageView />;
}
