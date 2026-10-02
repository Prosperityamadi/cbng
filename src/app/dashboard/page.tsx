'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ASSETS } from '@/core';

interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
  iconType: 'wire_in' | 'wire_out' | 'card' | 'yield' | 'vault';
}

export default function DashboardPage() {
  const [accountData, setAccountData] = useState({
    accountNumber: '1048291029',
    routingNumber: '021000021',
    balance: 0.0,
    currency: 'USD',
    accountType: 'Private Wealth Checking',
    holderName: 'Sarah Jenkins',
    tier: 'Tier 1 Metal Access',
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'transfers' | 'cards' | 'treasury' | 'analytics' | 'security'>('accounts');

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'tx-1',
      title: 'Wire Deposit • Apex Capital',
      subtitle: 'Fedwire Transfer #FW-892019',
      category: 'Incoming Wire',
      date: 'Today, 11:42 AM',
      amount: 2450.0,
      type: 'credit',
      status: 'Completed',
      iconType: 'wire_in',
    },
    {
      id: 'tx-2',
      title: 'Apple Store Fifth Ave',
      subtitle: 'Titanium Debit ending in 29',
      category: 'Point of Sale',
      date: 'Yesterday, 03:15 PM',
      amount: 349.0,
      type: 'debit',
      status: 'Settled',
      iconType: 'card',
    },
    {
      id: 'tx-3',
      title: '4.85% APY Daily Accrual',
      subtitle: 'Automatic Yield Credit',
      category: 'Interest Yield',
      date: 'Oct 01, 2026',
      amount: 84.2,
      type: 'credit',
      status: 'Completed',
      iconType: 'yield',
    },
    {
      id: 'tx-4',
      title: 'Private Wealth Vault Provisioning',
      subtitle: 'Institutional ID & PIN Clearance',
      category: 'Account Provisioning',
      date: 'Sep 30, 2026',
      amount: 0.0,
      type: 'credit',
      status: 'Active & Verified',
      iconType: 'vault',
    },
  ]);

  const [txFilter, setTxFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Interactive Modals
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [wireAmount, setWireAmount] = useState('');
  const [wireRecipient, setWireRecipient] = useState('');
  const [wireSuccess, setWireSuccess] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; date: string } | null>(null);

  useEffect(() => {
    // Load stored onboarding user info if available in session
    if (typeof window !== 'undefined') {
      const storedAccount = sessionStorage.getItem('nemicapital_account');
      const storedName = sessionStorage.getItem('nemicapital_user_name');
      if (storedAccount) {
        try {
          const parsed = JSON.parse(storedAccount);
          setAccountData((prev) => ({
            ...prev,
            accountNumber: parsed.account_number || prev.accountNumber,
            routingNumber: parsed.routing_number || prev.routingNumber,
            balance: parsed.balance !== undefined ? Number(parsed.balance) : prev.balance,
            holderName: storedName || prev.holderName,
          }));
        } catch {
          // fallback
        }
      } else if (storedName) {
        setAccountData((prev) => ({ ...prev, holderName: storedName }));
      }
    }
  }, []);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    setDepositSuccess(true);

    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      title: 'Direct ACH Liquidity Deposit',
      subtitle: `Instant Clearing Link #ACH-${Math.floor(100000 + Math.random() * 900000)}`,
      category: 'Deposit',
      date: 'Just now',
      amount: amountNum,
      type: 'credit',
      status: 'Completed',
      iconType: 'wire_in',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAccountData((prev) => ({
      ...prev,
      balance: prev.balance + amountNum,
    }));

    setTimeout(() => {
      setDepositSuccess(false);
      setDepositModalOpen(false);
      setDepositAmount('');
    }, 1500);
  };

  const handleExecuteWire = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(wireAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    setWireSuccess(true);

    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      title: `Wire Outward • ${wireRecipient.trim() || 'Beneficiary ABA'}`,
      subtitle: `Fedwire Transfer #FW-${Math.floor(100000 + Math.random() * 900000)}`,
      category: 'Outgoing Wire',
      date: 'Just now',
      amount: amountNum,
      type: 'debit',
      status: 'Completed',
      iconType: 'wire_out',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAccountData((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amountNum),
    }));

    setTimeout(() => {
      setWireSuccess(false);
      setTransferModalOpen(false);
      setWireAmount('');
      setWireRecipient('');
    }, 1500);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (txFilter === 'inflow') return tx.type === 'credit';
    if (txFilter === 'outflow') return tx.type === 'debit';
    return true;
  });

  const formattedCardNumber = accountData.accountNumber
    ? `${accountData.accountNumber.slice(0, 4)} ${accountData.accountNumber.slice(4, 8)} ${accountData.accountNumber.slice(8)}`
    : '1048 2910 29';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151214] font-roboto antialiased flex flex-col md:flex-row selection:bg-[#B81446]/10 selection:text-[#B81446]">
      {/* ========================================================================= */}
      {/* 1. OBSIDIAN LEFT SIDEBAR (EXACT MATCH TO DESIGN MOCKUP)                   */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#151214] text-white flex flex-col justify-between shrink-0 p-5 md:p-6 lg:p-7 z-30 shadow-2xl md:min-h-screen">
        <div>
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={ASSETS.logos.main}
                  alt="NemiCapital Bank Logo"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-[0_2px_8px_rgba(184,20,70,0.6)]"
                  priority
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-bold text-lg tracking-wider text-white">
                  NemiCapital
                </span>
                <span className="text-[10px] font-mono font-bold text-[#B81446] tracking-tighter">
                  3D
                </span>
              </div>
            </Link>

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block space-y-1.5 font-poppins`}>
            {/* 1. Accounts (Active in Mockup) */}
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Crimson Indicator Notch on Active Item (Mockup Hallmark) */}
              {activeTab === 'accounts' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Accounts</span>
            </button>

            {/* 2. Transfers & Wires */}
            <button
              type="button"
              onClick={() => setTransferModalOpen(true)}
              className="w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Transfers & Wires</span>
            </button>

            {/* 3. Cards */}
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'cards' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
              </svg>
              <span>Cards</span>
            </button>

            {/* 4. Treasury */}
            <button
              type="button"
              onClick={() => setActiveTab('treasury')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'treasury'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'treasury' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z" />
              </svg>
              <span>Treasury</span>
            </button>

            {/* 5. Analytics */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'analytics' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </button>

            {/* 6. Security */}
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'security' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Security</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer / Client Status Badge */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-emerald-400 font-bold text-xs">✓</span>
              <span className="text-[11px] font-semibold text-white tracking-wide">
                FDIC Insured & Active
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Institutional Private Banking Tier 1. Full regulatory protection up to $2.5M.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between text-xs font-medium text-gray-400 hover:text-white transition-colors px-2 py-1"
          >
            <span>Exit to Public Portal</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN EXECUTIVE CANVAS (RIGHT AREA)                                     */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* ======================================================================= */}
        {/* TOP EXECUTIVE NAVIGATION BAR (EXACT MATCH TO DESIGN MOCKUP)             */}
        {/* ======================================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Pill: VIP Private Client */}
          <div className="flex items-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300/80 bg-white text-gray-800 text-xs font-semibold shadow-2xs">
              <span>VIP Private Client</span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-0 sm:mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, routing, treasury..."
                className="w-full bg-white border border-gray-200/90 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Right: Notifications & Sarah Jenkins Profile */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => alert('All systems operational. Zero pending compliance holds.')}
              className="w-9 h-9 rounded-full bg-white border border-gray-200/90 flex items-center justify-center text-gray-700 hover:text-[#B81446] shadow-2xs transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#B81446] rounded-full" />
            </button>

            {/* Profile Block: Avatar + Name + Dropdown */}
            <div className="flex items-center gap-2.5 bg-white border border-gray-200/80 pl-1.5 pr-3 py-1 rounded-full shadow-2xs">
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={ASSETS.images.commenterClaireVance}
                  alt={accountData.holderName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-poppins font-semibold text-xs sm:text-sm text-[#151214] truncate max-w-[130px]">
                {accountData.holderName}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* ======================================================================= */}
        {/* TOTAL AVAILABLE BALANCE HERO CARD (EXACT MATCH TO DESIGN MOCKUP)         */}
        {/* ======================================================================= */}
        <section className="w-full bg-white rounded-[24px] p-6 sm:p-7 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
              Total Available Balance
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl sm:text-4xl font-poppins font-bold text-[#151214] tracking-tight">
                ${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
              {/* Crimson APY Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B81446] text-white text-xs font-semibold shadow-xs">
                <span>4.85% APY Active</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Deposit Funds CTA */}
            <button
              type="button"
              onClick={() => setDepositModalOpen(true)}
              className="bg-[#151214] hover:bg-black active:scale-95 text-white font-poppins text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Deposit Funds</span>
            </button>

            {/* Transfer & Wire CTA */}
            <button
              type="button"
              onClick={() => setTransferModalOpen(true)}
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-800 font-poppins text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl border border-gray-300 flex items-center gap-2 shadow-2xs transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Transfer & Wire</span>
            </button>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 4-QUADRANT BENTO GRID                                                   */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ===================================================================== */}
          {/* QUADRANT 1: 3D ISOMETRIC RUBY CUBES TITANIUM DEBIT CARD               */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-center">
            <div className="relative w-full aspect-[1.586/1] max-w-[420px] rounded-[22px] p-5 sm:p-6 text-white shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7)] border border-white/15 overflow-hidden select-none bg-gradient-to-br from-[#232327] via-[#161618] to-[#0d0d0e] flex flex-col justify-between group transition-all duration-500 hover:scale-[1.01]">
              {/* 3D Isometric Ruby Cubes Pattern (Right Half) */}
              <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none opacity-90 overflow-hidden">
                <svg
                  viewBox="0 0 400 450"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full object-cover translate-x-6 -translate-y-2 scale-105"
                >
                  {/* Top Ruby Cube */}
                  <polygon points="200,40 290,90 200,140 110,90" fill="#B81446" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                  <polygon points="110,90 200,140 200,240 110,190" fill="#8A0E34" fillOpacity="0.94" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                  <polygon points="200,140 290,90 290,190 200,240" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

                  {/* Right Interlocking Ruby Cube */}
                  <polygon points="290,190 380,240 290,290 200,240" fill="#B81446" fillOpacity="0.85" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                  <polygon points="200,240 290,290 290,390 200,340" fill="#8A0E34" fillOpacity="0.92" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                  <polygon points="290,290 380,240 380,340 290,390" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

                  {/* Left Interlocking Ruby Cube */}
                  <polygon points="110,190 200,240 110,290 20,240" fill="#5A0620" fillOpacity="0.82" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                  <polygon points="110,290 200,340 110,390 20,340" fill="#B81446" fillOpacity="0.86" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                  <polygon points="20,240 110,290 110,390 20,340" fill="#3D0315" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

                  {/* Bottom Interlocking Accent Facet */}
                  <polygon points="200,340 290,390 200,440 110,390" fill="#8A0E34" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                  <polygon points="200,440 290,390 290,490 200,490" fill="#5A0620" fillOpacity="0.9" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                </svg>
              </div>

              {/* Ambient Specular Metal Reflection Beam */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#B81446]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

              {/* Top Row: Bank Logo */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={ASSETS.logos.main}
                      alt="NemiCapital Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-poppins font-bold text-sm tracking-wider text-white">
                    NemiCapital
                  </span>
                </div>

                <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase font-medium">
                  PLATINUM
                </span>
              </div>

              {/* Middle Row: Gold Smart Chip */}
              <div className="relative z-10 my-auto pt-2">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#FFE082] via-[#FFCA28] to-[#FF8F00] border border-amber-200/90 shadow-inner flex items-center justify-center p-0.5 overflow-hidden">
                  <div className="w-full h-full border border-amber-900/35 rounded-xs grid grid-cols-3 gap-0.5">
                    <div className="border-r border-amber-900/30" />
                    <div className="border-r border-amber-900/30" />
                    <div />
                  </div>
                </div>
              </div>

              {/* Card Number & Cardholder */}
              <div className="relative z-10 space-y-1">
                <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.24em] text-white drop-shadow-sm">
                  {formattedCardNumber}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/70 font-poppins pt-1">
                  <span className="font-semibold uppercase tracking-wider text-white">
                    {accountData.holderName}
                  </span>
                  <span className="font-mono text-white/80">EXP 10/30</span>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* QUADRANT 2: INTERACTIVE LIQUIDITY & WEALTH GROWTH CHART               */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-semibold text-gray-800 text-sm sm:text-base">
                Interactive liquidity and wealth growth chart
              </h2>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-black/5 text-[10px] font-semibold">
                  {(['1M', '6M', '1Y', 'ALL'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setChartPeriod(period)}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        chartPeriod === period
                          ? 'bg-[#B81446] text-white shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 p-1 text-base tracking-widest font-bold"
                  aria-label="Options"
                >
                  •••
                </button>
              </div>
            </div>

            {/* Glowing Spline Chart Canvas */}
            <div className="relative w-full h-44 sm:h-52 flex items-center justify-center">
              <svg
                viewBox="0 0 500 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Under-curve Soft Crimson Glow Gradient */}
                  <linearGradient id="crimsonChartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B81446" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#B81446" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#B81446" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Stroke Filter Drop Shadow */}
                  <filter id="crimsonSplineShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#B81446" floodOpacity="0.45" />
                  </filter>
                </defs>

                {/* Subtle Horizontal Reference Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#FAF7F2" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#FAF7F2" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="170" x2="500" y2="170" stroke="#FAF7F2" strokeWidth="1" strokeDasharray="4 4" />

                {/* Shaded Area Below Spline Curve */}
                <path
                  d="M 10 165 C 50 140, 80 170, 130 145 C 180 120, 220 155, 270 110 C 320 65, 370 95, 430 45 L 490 20 L 490 200 L 10 200 Z"
                  fill="url(#crimsonChartGlow)"
                />

                {/* Glowing Smooth Crimson Spline Wave (Exact Mockup Match) */}
                <path
                  d="M 10 165 C 50 140, 80 170, 130 145 C 180 120, 220 155, 270 110 C 320 65, 370 95, 430 45 L 490 20"
                  fill="none"
                  stroke="#B81446"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#crimsonSplineShadow)"
                />

                {/* Interactive Anchor Points */}
                <circle
                  cx="130"
                  cy="145"
                  r="4"
                  fill="#FFFFFF"
                  stroke="#B81446"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredPoint({ x: 130, y: 145, val: '$0.00 Opening', date: 'Q1' })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx="270"
                  cy="110"
                  r="4"
                  fill="#FFFFFF"
                  stroke="#B81446"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredPoint({ x: 270, y: 110, val: '+$182.40 Accrued', date: 'Q2' })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx="430"
                  cy="45"
                  r="4"
                  fill="#FFFFFF"
                  stroke="#B81446"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredPoint({ x: 430, y: 45, val: '+$390.85 Accrued', date: 'Q3' })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx="490"
                  cy="20"
                  r="5"
                  fill="#B81446"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer animate-pulse"
                  onMouseEnter={() => setHoveredPoint({ x: 490, y: 20, val: '4.85% APY Target: +$485.00', date: 'Q4' })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-[#151214] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none -translate-x-1/2 -translate-y-9 border border-white/10"
                  style={{ left: `${(hoveredPoint.x / 500) * 100}%`, top: `${(hoveredPoint.y / 200) * 100}%` }}
                >
                  <span>{hoveredPoint.val}</span>
                </div>
              )}
            </div>

            {/* Bottom Timeline Axis */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 pt-2 border-t border-gray-100">
              <span>Q1 Opening</span>
              <span>Q2 Compound</span>
              <span>Q3 Yield</span>
              <span className="text-[#B81446] font-bold">Q4 Projected Target</span>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* QUADRANT 3: ACCOUNT CREDENTIAL HUB                                    */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <h2 className="font-poppins font-semibold text-gray-800 text-base mb-4">
                Account Credential Hub
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Side: Account Number & Routing Number with Copy Buttons */}
                <div className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <span className="text-xs text-gray-500 font-medium block mb-1">
                      Account Number
                    </span>
                    <div className="flex items-center justify-between bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                      <span className="font-mono font-bold text-base sm:text-lg text-gray-900 tracking-wider">
                        {accountData.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountData.accountNumber, 'acc')}
                        className="bg-[#151214] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        {copiedField === 'acc' ? (
                          <>
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Routing Number */}
                  <div>
                    <span className="text-xs text-gray-500 font-medium block mb-1">
                      Routing Number
                    </span>
                    <div className="flex items-center justify-between bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                      <span className="font-mono font-bold text-base sm:text-lg text-gray-900 tracking-wider">
                        {accountData.routingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountData.routingNumber, 'rout')}
                        className="bg-[#151214] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        {copiedField === 'rout' ? (
                          <>
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Daily Limit Stats Card (Exact Mockup Match) */}
                <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-black/5 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-700 block mb-3">
                    Daily limit stats
                  </span>

                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-200/60">
                    <div>
                      <span className="text-xl sm:text-2xl font-poppins font-bold text-gray-900 block leading-tight">
                        $50k
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">limit</span>
                    </div>

                    <div>
                      <span className="text-xl sm:text-2xl font-poppins font-bold text-gray-900 block leading-tight">
                        $0
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">wire fees</span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                    <span className="text-[10px] font-semibold text-gray-700">
                      Uncapped Tier 1 Fedwire Access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* QUADRANT 4: LATEST TRANSACTIONS                                       */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              {/* Header with Title, Filter Tabs & Options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-poppins font-semibold text-gray-800 text-base leading-tight">
                    Latest Transactions
                  </h2>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Real-time clearing & settled activity
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-black/5 text-[10px] font-semibold font-poppins">
                    {(['all', 'inflow', 'outflow'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTxFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                          txFilter === filter
                            ? 'bg-[#151214] text-white shadow-2xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 p-1 text-base tracking-widest font-bold cursor-pointer"
                    aria-label="Options"
                    title="Transaction Options"
                  >
                    •••
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs font-medium">
                    No transactions found for the selected filter.
                  </div>
                ) : (
                  filteredTransactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/60 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Transaction Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            tx.type === 'credit' && tx.amount > 0
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                              : tx.iconType === 'card'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : tx.iconType === 'yield'
                              ? 'bg-[#B81446]/10 text-[#B81446] border-[#B81446]/20'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {tx.iconType === 'wire_in' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : tx.iconType === 'wire_out' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : tx.iconType === 'card' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
                            </svg>
                          ) : tx.iconType === 'yield' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </div>

                        {/* Title and subtitle */}
                        <div className="min-w-0">
                          <span className="font-poppins font-semibold text-xs sm:text-sm text-gray-900 block truncate group-hover:text-[#B81446] transition-colors">
                            {tx.title}
                          </span>
                          <span className="text-[11px] text-gray-500 block truncate">
                            {tx.date} • {tx.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Status Badge (ZERO DOTS - GREEN CHECKS ONLY) */}
                      <div className="text-right shrink-0 pl-3">
                        <div
                          className={`font-poppins font-bold text-xs sm:text-sm tracking-tight ${
                            tx.type === 'credit' && tx.amount > 0
                              ? 'text-emerald-600'
                              : tx.amount === 0
                              ? 'text-gray-500'
                              : 'text-gray-900'
                          }`}
                        >
                          {tx.type === 'credit' && tx.amount > 0 ? '+' : tx.type === 'debit' ? '-' : ''}
                          ${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-semibold">
                          <span className="font-bold text-emerald-600">✓</span>
                          <span>{tx.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">
                {filteredTransactions.length} settled records synced
              </span>
              <button
                type="button"
                onClick={() => alert('Official bank statement exported in compliance with Federal Reserve standards.')}
                className="text-[#B81446] font-semibold hover:underline cursor-pointer"
              >
                Download PDF Statement
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: DEPOSIT FUNDS (KEEPS EVERYTHING ON SINGLE DASHBOARD)             */}
      {/* ========================================================================= */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setDepositModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#B81446]/10 text-[#B81446] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="font-poppins font-bold text-lg text-gray-900">
                Deposit Funds to NemiCapital
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Initiate an incoming domestic Fedwire or ACH transfer using your private credentials.
              </p>
            </div>

            {depositSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-poppins font-bold text-gray-900 text-base">
                  Deposit Successfully Credited!
                </h4>
                <p className="text-xs text-gray-500">
                  Funds are now available in your Private Wealth Checking account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteDeposit} className="space-y-4">
                <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-black/5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                    <span className="text-gray-500">Bank Name</span>
                    <span className="font-semibold text-gray-900">NemiCapital International Bank</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                    <span className="text-gray-500">Routing (ABA)</span>
                    <span className="font-mono font-bold text-gray-900">{accountData.routingNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                    <span className="text-gray-500">Account Number</span>
                    <span className="font-mono font-bold text-gray-900">{accountData.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Beneficiary</span>
                    <span className="font-semibold text-gray-900">{accountData.holderName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Direct Instant Deposit Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 5000.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#151214] hover:bg-black text-white font-poppins font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Confirm Instant Deposit
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: TRANSFER & WIRE (KEEPS EVERYTHING ON SINGLE DASHBOARD)          */}
      {/* ========================================================================= */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#B81446]/10 text-[#B81446] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-poppins font-bold text-lg text-gray-900">
                Instant Transfer & Wire
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Zero fees on domestic wire and instant interbank settlement.
              </p>
            </div>

            {wireSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-poppins font-bold text-gray-900 text-base">
                  Wire Successfully Dispatched!
                </h4>
                <p className="text-xs text-gray-500">
                  Transaction confirmation #WIRE-{Math.floor(100000 + Math.random() * 900000)} issued.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteWire} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Recipient Account or IBAN
                  </label>
                  <input
                    type="text"
                    required
                    value={wireRecipient}
                    onChange={(e) => setWireRecipient(e.target.value)}
                    placeholder="e.g. US190201000021..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Wire Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="1"
                    value={wireAmount}
                    onChange={(e) => setWireAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Fee Standard:</span>
                  <span className="font-semibold text-emerald-600">$0.00 (Zero Wire Fee)</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B81446] hover:bg-[#9B103B] text-white font-poppins font-semibold py-3 px-4 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Send Wire Now
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
