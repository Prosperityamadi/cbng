import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Administration Terminal | NemiCapital International Bank',
  description: 'Institutional management portal for private wealth client provisioning and ledger control.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0D0B0C] text-[#F3EFEA] font-poppins antialiased selection:bg-[#B81446] selection:text-white">
      {children}
    </div>
  );
}
