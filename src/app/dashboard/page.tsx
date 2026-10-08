'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ASSETS } from '@/core';
import { AccountService } from '@/core/services/account.service';
import { WireClearanceInitiateResponse, PendingWireTransferResponse } from '@/core/models/account.types';
import { useAuthStore } from '@/core/store/auth.store';
import ContactConciergeView from '@/components/dashboard/ContactConciergeView';

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: 'C$', GBP: '£', EUR: '€', AUD: 'A$', ZAR: 'R', NGN: '₦', GHS: 'GH₵', KES: 'KSh'
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || '$';
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDisplayLimit(val: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  if (val >= 1000000) {
    const m = val / 1000000;
    return `${symbol}${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `${symbol}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${symbol}${val.toLocaleString()}`;
}

function formatAccountNumberDisplay(accNum: string): string {
  if (!accNum) return '•••• •••• ••';
  const clean = accNum.replace(/\s+/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  }
  return clean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, kyc } = useAuthStore();
  const [accountData, setAccountData] = useState({
    accountNumber: '',
    routingNumber: '',
    balance: 0.0,
    currency: 'USD',
    accountType: 'Private Wealth Checking',
    holderName: '',
    tier: 'Tier 1 Metal Access',
    dailyLimit: 500000.0,
    wireFee: 0.0,
    swiftBic: 'NEMIUSB33',
  });
  
  const [cardsData, setCardsData] = useState<any[]>([]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'transfers' | 'cards' | 'contact'>('accounts');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const [txFilter, setTxFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Interactive Modals
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  
  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositRefNumber, setDepositRefNumber] = useState('');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Wire Transfer State
  const [wireAmount, setWireAmount] = useState('');
  const [wireRecipient, setWireRecipient] = useState('');
  const [wireRecipientName, setWireRecipientName] = useState('');
  const [wireSuccess, setWireSuccess] = useState(false);
  const [wireRefNumber, setWireRefNumber] = useState('');
  const [isProcessingWire, setIsProcessingWire] = useState(false);
  const [wireError, setWireError] = useState<string | null>(null);

  // Wire Regulatory Clearance State (Sequential Multi-Stage Protection)
  const [clearanceStepActive, setClearanceStepActive] = useState(false);
  const [clearanceStageData, setClearanceStageData] = useState<WireClearanceInitiateResponse | null>(null);
  const [clearanceCode, setClearanceCode] = useState('');
  const [isVerifyingClearance, setIsVerifyingClearance] = useState(false);
  const [clearanceError, setClearanceError] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Persistent Wire Clearance Session (Survives modal close, browser refresh, support delays)
  const [pendingWire, setPendingWire] = useState<PendingWireTransferResponse | null>(null);
  const [isCancellingPending, setIsCancellingPending] = useState(false);

  const [chartPeriod, setChartPeriod] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; date: string } | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showCardCvv, setShowCardCvv] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  // Reset avatar error when profile picture changes
  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.profile_picture_url]);

  // Hydrate auth store on mount (loads user profile including avatar URL)
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  // Handle outside click and escape key to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target as Node)) {
        setMobileProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token') || localStorage.getItem('onboarding_token');
        if (!token) {
          router.push('/login');
          return;
        }
      }
      try {
        const data = await AccountService.getDashboardSummary();
        if (isMounted) {
          setAccountData(prev => ({
            ...prev,
            accountNumber: data.account.account_number,
            routingNumber: data.account.routing_number,
            balance: Number(data.account.balance),
            accountType: data.account.account_type === 'checking' ? 'Private Wealth Checking' : 'Savings',
            tier: data.account.tier === 'private_wealth' ? 'Tier 1 Metal Access' : 'Standard Access',
            dailyLimit: Number(data.account.daily_limit !== undefined ? data.account.daily_limit : 500000.0),
            wireFee: Number(data.account.wire_fee !== undefined ? data.account.wire_fee : 0.0),
          }));
          
          setCardsData(data.cards);
          // Map backend transactions to frontend TransactionItem
          if (data.transactions) {
            const mappedTxs = data.transactions.map((tx: any) => {
              let iconType: any = 'vault';
              if (tx.transaction_type === 'wire_in' || tx.transaction_type === 'deposit_ach') iconType = 'wire_in';
              if (tx.transaction_type === 'wire_out') iconType = 'wire_out';
              if (tx.transaction_type === 'card_purchase') iconType = 'card';
              if (tx.transaction_type === 'yield_credit') iconType = 'yield';

              // formatting dates based on timestamp
              const dt = new Date(tx.created_at);
              const isToday = dt.toDateString() === new Date().toDateString();
              const dateStr = isToday ? `Today, ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

              const isDebit = tx.transaction_type === 'wire_out' || tx.transaction_type === 'card_purchase';
              const refLabel = tx.reference_number ? `${tx.reference_number} • ` : '';

              return {
                id: tx.id,
                title: tx.description,
                subtitle: `${refLabel}${tx.counterparty_name || tx.transaction_type.replace('_', ' ').toUpperCase()}`,
                category: tx.transaction_type,
                date: dateStr,
                amount: Math.abs(Number(tx.amount)),
                type: isDebit ? 'debit' : 'credit',
                status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
                iconType: iconType,
              };
            });
            setTransactions(mappedTxs);
          }

          // Check for active pending wire transfer awaiting clearance
          try {
            const pending = await AccountService.getPendingWireTransfer();
            if (isMounted && pending && pending.has_pending) {
              setPendingWire(pending);
              setWireAmount(String(pending.amount || ''));
              setWireRecipient(pending.recipient_account || '');
              setWireRecipientName(pending.recipient_name || '');
              setClearanceStageData({
                status: 'clearance_required',
                stage: pending.current_stage || 1,
                title: pending.stage_title || '',
                code_name: pending.code_name || '',
                description: pending.description || '',
                support_email: pending.support_email || 'support@nemicapbank.com',
              });
              setClearanceStepActive(true);
            }
          } catch (pendingErr) {
            console.warn('No pending wire session found', pendingErr);
          }
        }
      } catch (e: any) {
        console.error('Failed to fetch dashboard data', e);
        if (e.message && (e.message.toLowerCase().includes('unauthorized') || e.message.toLowerCase().includes('token') || e.message.toLowerCase().includes('credential'))) {
          router.push('/login');
        }
      }
    };
    
    fetchDashboard();
    
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (kyc) {
      setAccountData(prev => ({
        ...prev,
        holderName: `${kyc.first_name} ${kyc.last_name}`,
      }));
    } else if (user) {
      // fallback
      setAccountData(prev => ({
        ...prev,
        holderName: 'Valued Client',
      }));
    }
  }, [kyc, user]);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsProcessingDeposit(true);
    setDepositError(null);

    try {
      const res = await AccountService.depositFunds({
        amount: amountNum,
        deposit_method: 'ach',
        source_institution: 'Direct Liquidity ACH',
      });

      setDepositRefNumber(res.reference_number);
      setDepositSuccess(true);

      // Update real balance from DB response
      setAccountData(prev => ({
        ...prev,
        balance: Number(res.new_balance),
      }));

      // Prepend to transaction ledger
      const newTx: TransactionItem = {
        id: res.transaction_id,
        title: 'Direct ACH Liquidity Deposit',
        subtitle: `${res.reference_number} • Instant Clearing`,
        category: 'deposit_ach',
        date: 'Just now',
        amount: amountNum,
        type: 'credit',
        status: 'Completed',
        iconType: 'wire_in',
      };
      setTransactions(prev => [newTx, ...prev]);

      setTimeout(() => {
        setDepositSuccess(false);
        setDepositModalOpen(false);
        setDepositAmount('');
        setDepositRefNumber('');
      }, 2000);
    } catch (err: any) {
      setDepositError(err.message || 'Deposit failed. Please try again.');
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  const handleInitiateWire = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(wireAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (amountNum > accountData.balance) {
      setWireError(`Insufficient available funds. Current balance: ${formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}.`);
      return;
    }

    const cleanName = wireRecipientName.trim();
    const cleanAccount = wireRecipient.trim();

    if (!cleanName || /\d/.test(cleanName)) {
      setWireError('Recipient name cannot contain numbers. Please enter letters only.');
      return;
    }

    if (!cleanAccount || !/^\d+$/.test(cleanAccount)) {
      setWireError('Recipient account number must contain digits only.');
      return;
    }

    setIsProcessingWire(true);
    setWireError(null);

    try {
      const res = await AccountService.initiateWireClearance({
        recipient_name: wireRecipientName.trim() || 'Private Beneficiary',
        recipient_account: wireRecipient.trim(),
        amount: amountNum,
      });

      setClearanceStageData(res);
      setClearanceStepActive(true);
      setClearanceCode('');
      setClearanceError(null);
      setPendingWire({
        has_pending: true,
        amount: amountNum,
        fee: Number(accountData.wireFee || 0),
        recipient_name: wireRecipientName.trim() || 'Private Beneficiary',
        recipient_account: wireRecipient.trim(),
        current_stage: res.stage,
        stage_title: res.title,
        code_name: res.code_name,
        description: res.description,
        support_email: res.support_email,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setWireError(err.message || 'Wire dispatch authorization failed. Please check details.');
    } finally {
      setIsProcessingWire(false);
    }
  };

  const handleVerifyClearanceCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clearanceStageData) return;

    const cleanCode = clearanceCode.trim();
    if (cleanCode.length !== 6) {
      setClearanceError('Please enter the complete 6-digit numeric authorization key.');
      return;
    }

    const amountNum = parseFloat(wireAmount);
    setIsVerifyingClearance(true);
    setClearanceError(null);

    try {
      const res = await AccountService.verifyWireClearanceStage({
        stage: clearanceStageData.stage,
        code: cleanCode,
        amount: amountNum,
        recipient_name: wireRecipientName.trim() || 'Private Beneficiary',
        recipient_account: wireRecipient.trim(),
      });

      if (res.status === 'next_stage_required') {
        // Transition seamlessly to the next required compliance authorization (never showing stage numbers)
        const nextData = {
          status: 'clearance_required' as const,
          stage: res.stage!,
          title: res.title!,
          code_name: res.code_name!,
          description: res.description!,
          support_email: res.support_email || 'support@nemicapbank.com',
        };
        setClearanceStageData(nextData);
        setClearanceCode('');
        setClearanceError(null);
        setPendingWire(prev => prev ? ({
          ...prev,
          current_stage: res.stage!,
          stage_title: res.title!,
          code_name: res.code_name!,
          description: res.description!,
        }) : null);
      } else if (res.status === 'completed' && res.transaction) {
        // Federal Reserve settlement complete!
        setWireRefNumber(res.transaction.reference_number);
        setWireSuccess(true);
        setClearanceStepActive(false);
        setPendingWire(null);

        // Update real balance
        setAccountData(prev => ({
          ...prev,
          balance: Number(res.transaction!.new_balance),
        }));

        // Prepend to transaction ledger
        const newTx: TransactionItem = {
          id: res.transaction.transaction_id,
          title: `Wire Outward • ${res.transaction.recipient_name}`,
          subtitle: `${res.transaction.reference_number} • Fedwire Dispatch`,
          category: 'wire_out',
          date: 'Just now',
          amount: amountNum,
          type: 'debit',
          status: 'Completed',
          iconType: 'wire_out',
        };
        setTransactions(prev => [newTx, ...prev]);

        setTimeout(() => {
          setWireSuccess(false);
          setTransferModalOpen(false);
          setWireAmount('');
          setWireRecipient('');
          setWireRecipientName('');
          setWireRefNumber('');
          setClearanceStageData(null);
        }, 3200);
      }
    } catch (err: any) {
      setClearanceError(err.message || 'Invalid clearance key. Please contact Private Wealth Support.');
    } finally {
      setIsVerifyingClearance(false);
    }
  };

  const handleCancelPendingWire = async () => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Are you sure you want to cancel this wire transfer? This will reset all clearance stages back to Stage 1.')
      : true;
    if (!confirmed) return;

    setIsCancellingPending(true);
    try {
      await AccountService.cancelPendingWireTransfer();
      setPendingWire(null);
      setClearanceStepActive(false);
      setClearanceStageData(null);
      setTransferModalOpen(false);
      setWireAmount('');
      setWireRecipient('');
      setWireRecipientName('');
      setClearanceCode('');
      setWireError(null);
      setClearanceError(null);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel wire transfer. Please try again.');
    } finally {
      setIsCancellingPending(false);
    }
  };

  const buildMailtoUrl = () => {
    if (!clearanceStageData) return '#';
    const subject = encodeURIComponent(`Wire Authorization Clearance Request - ${clearanceStageData.code_name}`);
    const clientName = `${kyc?.first_name || ''} ${kyc?.last_name || ''}`.trim() || user?.email || 'Valued Client';
    const bodyText = `Dear NemiCapital Private Wealth Support,

I am requesting the authorized 6-digit clearance code to approve my outward wire transfer.

Transaction Information:
- Account Holder: ${clientName}
- Beneficiary Name: ${wireRecipientName.trim()}
- Beneficiary Account / IBAN: ${wireRecipient.trim()}
- Wire Amount: ${formatCurrency(parseFloat(wireAmount || '0'), accountData.currency)} {accountData.currency}
- Required Clearance Key: ${clearanceStageData.code_name}

Please provide the authorized 6-digit code to complete clearance.

Sincerely,
${clientName}`;
    return `mailto:${clearanceStageData.support_email}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const copySupportRequest = () => {
    if (!clearanceStageData) return;
    const clientName = `${kyc?.first_name || ''} ${kyc?.last_name || ''}`.trim() || user?.email || 'Valued Client';
    const bodyText = `Dear NemiCapital Private Wealth Support,

I am requesting the authorized 6-digit clearance code to approve my outward wire transfer.

Transaction Information:
- Account Holder: ${clientName}
- Beneficiary Name: ${wireRecipientName.trim()}
- Beneficiary Account / IBAN: ${wireRecipient.trim()}
- Wire Amount: ${formatCurrency(parseFloat(wireAmount || '0'), accountData.currency)} {accountData.currency}
- Required Clearance Key: ${clearanceStageData.code_name}

Please provide the authorized 6-digit code to complete clearance.

Sincerely,
${clientName}`;
    navigator.clipboard.writeText(bodyText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
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

  const mainCard = cardsData && cardsData.length > 0 ? cardsData[0] : null;
  const formattedCardNumber = mainCard && mainCard.card_number
    ? `${mainCard.card_number.slice(0, 4)} ${mainCard.card_number.slice(4, 8)} ${mainCard.card_number.slice(8, 12)} ${mainCard.card_number.slice(12, 16)}`
    : '1048 2910 2910 0000';
  
  const cardExp = mainCard ? mainCard.expiration_date : '12/30';
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#151214] font-roboto antialiased flex flex-col md:flex-row selection:bg-[#B81446]/10 selection:text-[#B81446]">
      {/* ========================================================================= */}
      {/* 1. OBSIDIAN LEFT SIDEBAR (EXACT MATCH TO DESIGN MOCKUP)                   */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. OBSIDIAN LEFT SIDEBAR (DESKTOP: EXACT MATCH TO DESIGN MOCKUP)          */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#151214] text-white flex-col justify-between shrink-0 p-5 md:p-6 lg:p-7 z-30 shadow-2xl md:min-h-screen md:sticky md:top-0 md:h-screen md:overflow-y-auto">
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
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1.5 font-poppins">
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
              onClick={() => setActiveTab('transfers')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer group ${
                activeTab === 'transfers'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'transfers' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <Image
                src={ASSETS.icons.moneyTransfer}
                alt="Transfers & Wires"
                width={16}
                height={16}
                className={`w-4 h-4 mr-3 flex-shrink-0 object-contain brightness-0 invert transition-opacity ${
                  activeTab === 'transfers' ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                }`}
              />
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

            {/* 4. Contact Concierge */}
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-[#252023] text-white shadow-inner relative'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'contact' && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#B81446] rounded-r-full" />
              )}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact</span>
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
      {/* 2. MOBILE TOP APP BAR (STICKY, ELEGANT OBSIDIAN & RUBY)                   */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-[#151214]/95 backdrop-blur-xl border-b border-white/10 px-3.5 py-3 flex items-center justify-between shadow-lg">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-7 h-7 flex-shrink-0 flex items-center justify-center">
            <Image
              src={ASSETS.logos.main}
              alt="NemiCapital Bank Logo"
              width={28}
              height={28}
              className="object-contain drop-shadow-[0_2px_8px_rgba(184,20,70,0.6)]"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-poppins font-bold text-sm tracking-wider text-white">
              NemiCapital
            </span>
            <span className="text-[9px] font-mono font-bold text-[#B81446]">
              3D
            </span>
          </div>
        </Link>

        {/* Right Controls: VIP Plaque + Notifications + Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* VIP Button */}
          <button
            type="button"
            onClick={() => setVipModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-b from-[#242124] to-[#0E0C0E] border border-white/20 text-[10px] font-semibold text-white shadow-xs cursor-pointer active:scale-95"
            title="VIP Private Wealth Privileges"
          >
            <span className="font-serif font-bold text-xs text-[#E5C158]">VIP</span>
            <span className="font-mono text-gray-400">Tier 1</span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => alert('All systems operational. Zero pending compliance holds.')}
            className="w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Mobile Profile Trigger & Dropdown */}
          <div className="relative" ref={mobileProfileRef}>
            <button
              type="button"
              onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-gray-800 flex items-center justify-center cursor-pointer"
              aria-label="Account Menu"
            >
              {user?.profile_picture_url && !avatarLoadError ? (
                <img
                  src={user.profile_picture_url}
                  alt={accountData.holderName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              )}
            </button>

            {/* Mobile Profile Dropdown */}
            {mobileProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-gray-100 p-2.5 z-50 animate-fadeIn text-left text-gray-900">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileProfileOpen(false)}
                  className="p-3 bg-[#FAF7F2] hover:bg-[#F3EBE1] rounded-xl border border-gray-200/80 mb-2 block transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center">
                      {user?.profile_picture_url && !avatarLoadError ? (
                        <img
                          src={user.profile_picture_url}
                          alt={accountData.holderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-poppins font-bold text-sm text-gray-900 truncate group-hover:text-[#B81446] transition-colors">
                          {accountData.holderName}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">Edit →</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {user?.email || 'client@nemicapbank.com'}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#B81446]/10 text-[#B81446] text-[10px] font-semibold">
                        Tier 1 Private Wealth
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileProfileOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-900">Profile & Personal Settings</span>
                  </div>
                  <span className="text-gray-400 text-xs">→</span>
                </Link>

                <Link
                  href="/dashboard/profile/security"
                  onClick={() => setMobileProfileOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-900">Security & PIN Access</span>
                  </div>
                  <span className="text-gray-400 text-xs">→</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('contact');
                    setMobileProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-900">Contact Concierge Desk</span>
                  </div>
                  <span className="text-gray-400 text-xs">→</span>
                </button>

                <div className="h-[1px] bg-gray-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setMobileProfileOpen(false);
                    useAuthStore.getState().logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-xs font-bold">Lock Session & Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN EXECUTIVE CANVAS (RIGHT AREA)                                     */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-8 flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Mobile Search Bar (Only shown on mobile) */}
        <div className="md:hidden w-full">
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
              className="w-full bg-white border border-gray-200/90 rounded-full pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TOP EXECUTIVE NAVIGATION BAR (DESKTOP ONLY: EXACT MATCH TO MOCKUP)      */}
        {/* ======================================================================= */}
        <header className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: VIP Private Client Plaque Container (Nano-Designed Swiss Luxury) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setVipModalOpen(true)}
              className="relative group cursor-pointer inline-flex items-center gap-3.5 px-4 py-2 rounded-xl bg-gradient-to-b from-[#242124] via-[#161416] to-[#0E0C0E] border border-white/20 hover:border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              title="Click to view Private Wealth Privileges"
            >
              {/* Heraldic Shield Crest Emblem */}
              <div className="w-5 h-5 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3.5v6c0 5.25-3.5 10-7 11.5-3.5-1.5-7-6.25-7-11.5v-6L12 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5m-2.5-2.5h5" />
                </svg>
              </div>

              {/* Typography: Classic Serif VIP + Wide-Tracked PRIVATE CLIENT */}
              <div className="flex flex-col text-left">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-bold text-sm tracking-wider text-white">VIP</span>
                  <span className="font-poppins text-[10px] font-semibold tracking-[0.24em] uppercase text-gray-300">
                    PRIVATE CLIENT
                  </span>
                </div>
                {/* Precision Inlaid Crimson Accent Hairline */}
                <div className="w-full h-[2px] bg-[#B81446] rounded-full mt-0.5 shadow-[0_0_6px_rgba(184,20,70,0.7)]" />
              </div>

              {/* Live Status & Tier Pill */}
              <div className="flex items-center pl-2 border-l border-white/10">
                <span className="text-[10px] font-mono font-medium text-gray-400 group-hover:text-gray-200">Tier 1</span>
              </div>
            </button>
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
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 bg-white border border-gray-200/80 pl-1.5 pr-3 py-1 rounded-full shadow-2xs hover:border-[#B81446]/50 transition-all cursor-pointer focus:outline-none"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                title="Account & Profile Menu"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {user?.profile_picture_url && !avatarLoadError ? (
                    <img
                      src={user.profile_picture_url}
                      alt={accountData.holderName}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  )}
                </div>
                <span className="font-poppins font-semibold text-xs sm:text-sm text-[#151214] truncate max-w-[130px]">
                  {accountData.holderName}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180 text-[#B81446]' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Luxury Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-76 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] border border-gray-100 p-2.5 z-50 animate-fadeIn">
                  {/* User Profile Header Card */}
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="p-3 bg-[#FAF7F2] hover:bg-[#F3EBE1] rounded-xl border border-gray-200/80 mb-2 block transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center">
                        {user?.profile_picture_url && !avatarLoadError ? (
                          <img
                            src={user.profile_picture_url}
                            alt={accountData.holderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-poppins font-bold text-sm text-gray-900 truncate group-hover:text-[#B81446] transition-colors">
                            {accountData.holderName}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium">Edit →</span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {user?.email || 'client@nemicapbank.com'}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#B81446]/10 text-[#B81446] text-[10px] font-semibold">
                          Tier 1 Private Wealth
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* 1. Direct Profile Section Link */}
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#B81446]/10 group-hover:text-[#B81446] flex items-center justify-center text-gray-600 transition-colors">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-[#B81446] transition-colors">
                          Profile & Personal Settings
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Manage contact info & identification
                        </span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#B81446] transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {/* 2. Security & Credentials Section */}
                  <Link
                    href="/dashboard/profile/security"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#B81446]/10 group-hover:text-[#B81446] flex items-center justify-center text-gray-600 transition-colors">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-[#B81446] transition-colors">
                          Security & PIN Access
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Transaction PIN, password & 2FA
                        </span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#B81446] transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {/* 3. Contact Concierge Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('contact');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#B81446]/10 group-hover:text-[#B81446] flex items-center justify-center text-gray-600 transition-colors">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-[#B81446] transition-colors">
                          Contact Concierge Desk
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Direct inquiry to info@nemicapbank.com
                        </span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#B81446] transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  {/* 4. Sign Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      useAuthStore.getState().logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold">Lock Session & Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'contact' ? (
          <ContactConciergeView
            initialClientName={accountData.holderName}
            initialEmail={user?.email || ''}
          />
        ) : activeTab === 'cards' ? (
          /* ======================================================================= */
          /* DEDICATED CARDS PORTFOLIO & SECURITY VIEW                               */
          /* ======================================================================= */
          <div className="space-y-6">
            {/* Card Portfolio Hero Header */}
            <div className="w-full bg-white rounded-[24px] p-5 sm:p-7 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#B81446] uppercase">
                    Private Client Portfolio
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] text-gray-500 font-medium">EMV 3D Biometric</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-poppins font-bold text-[#151214] tracking-tight">
                  Titanium Debit & Credit Suite
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Zero foreign transaction fees • FDIC insured protection up to $2,500,000.00
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                  isCardFrozen
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isCardFrozen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span>{isCardFrozen ? 'Card Frozen' : 'Active & Verified'}</span>
                </div>
              </div>
            </div>

            {/* Card Display Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Titanium Card Visual */}
              <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-full aspect-[1.586/1] max-w-[420px] rounded-[22px] p-5 sm:p-6 text-white shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7)] border border-white/15 overflow-hidden select-none bg-gradient-to-br from-[#232327] via-[#161618] to-[#0d0d0e] flex flex-col justify-between group transition-all duration-500 hover:scale-[1.01]">
                  {/* 3D Isometric Ruby Cubes Pattern */}
                  <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none opacity-90 overflow-hidden">
                    <svg
                      viewBox="0 0 400 450"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full object-cover translate-x-6 -translate-y-2 scale-105"
                    >
                      <polygon points="200,40 290,90 200,140 110,90" fill="#B81446" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                      <polygon points="110,90 200,140 200,240 110,190" fill="#8A0E34" fillOpacity="0.94" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="200,140 290,90 290,190 200,240" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="290,190 380,240 290,290 200,240" fill="#B81446" fillOpacity="0.85" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                      <polygon points="200,240 290,290 290,390 200,340" fill="#8A0E34" fillOpacity="0.92" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="290,290 380,240 380,340 290,390" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="110,190 200,240 110,290 20,240" fill="#5A0620" fillOpacity="0.82" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="110,290 200,340 110,390 20,340" fill="#B81446" fillOpacity="0.86" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
                      <polygon points="20,240 110,290 110,390 20,340" fill="#3D0315" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="200,340 290,390 200,440 110,390" fill="#8A0E34" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                      <polygon points="200,440 290,390 290,490 200,490" fill="#5A0620" fillOpacity="0.9" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
                    </svg>
                  </div>

                  {/* Specular Beam */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#B81446]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* Frozen Frosted Overlay if Card is Frozen */}
                  {isCardFrozen && (
                    <div className="absolute inset-0 bg-[#0E0C0E]/75 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-1.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </div>
                      <span className="font-poppins font-bold text-xs uppercase tracking-wider text-rose-300">
                        Card Temporarily Frozen
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Tap Unfreeze in controls to re-enable
                      </span>
                    </div>
                  )}

                  {/* Top Row: Bank Logo & Tier */}
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
                      {mainCard ? mainCard.card_tier.toUpperCase() : 'PLATINUM'}
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
                    <div className="font-mono text-base sm:text-xl font-bold tracking-[0.24em] text-white drop-shadow-sm">
                      {formattedCardNumber}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/70 font-poppins pt-1">
                      <span className="font-semibold uppercase tracking-wider text-white truncate max-w-[160px]">
                        {accountData.holderName}
                      </span>
                      <div className="flex gap-4 flex-shrink-0">
                        <span className="font-mono text-white/80">EXP {cardExp}</span>
                        <span className="font-mono text-white/80">
                          CVV {showCardCvv ? (mainCard?.cvv || '842') : '•••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Security Controls & Dossier */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. Credentials Strip */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#B81446]/20 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
                  <h3 className="font-poppins font-bold text-gray-900 text-sm sm:text-base">
                    Card Credentials & Clearance
                  </h3>

                  {/* Number with Copy */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        16-Digit Card Number
                      </span>
                      <span className="font-mono font-bold text-sm sm:text-base text-gray-900 truncate block">
                        {formattedCardNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(mainCard?.card_number || '1048291029100000', 'card_num')}
                      className="bg-white hover:bg-gray-100 active:scale-95 text-[#151214] text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition-all cursor-pointer flex-shrink-0"
                    >
                      {copiedField === 'card_num' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* EXP & CVV Strip */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200/60">
                      <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Expiration Date
                      </span>
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {cardExp}
                      </span>
                    </div>

                    <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                          Security Code
                        </span>
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {showCardCvv ? (mainCard?.cvv || '842') : '•••'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCardCvv(!showCardCvv)}
                        className="text-[11px] font-semibold text-[#B81446] hover:underline cursor-pointer flex-shrink-0"
                      >
                        {showCardCvv ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                  </div>

                  {/* Freeze & Security Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCardFrozen;
                        setIsCardFrozen(nextState);
                        alert(nextState ? 'Card has been locked. Online and physical purchases paused.' : 'Card has been unlocked and is ready for transactions.');
                      }}
                      className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-poppins text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isCardFrozen
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span>{isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('Secure PIN reset instructions dispatched to your verified phone number via encrypted SMS.')}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-poppins text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Reset Card PIN</span>
                    </button>
                  </div>
                </div>

                {/* 2. Spending Limits & Protection Card */}
                <div className="bg-[#FAF7F2] rounded-[24px] p-4 sm:p-5 border border-gray-200/80 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
                    Tier 1 Spending Privileges
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 block">Daily Limit</span>
                      <span className="font-poppins font-bold text-xs sm:text-sm text-gray-900 block">$500,000</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 block">Contactless</span>
                      <span className="font-poppins font-bold text-xs sm:text-sm text-gray-900 block">$50,000</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-500 block">ATM Cash</span>
                      <span className="font-poppins font-bold text-xs sm:text-sm text-gray-900 block">$25,000</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span> International Transactions Active
                    </span>
                    <span className="text-gray-400 font-mono">FDIC Insured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Activity Section */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-poppins font-bold text-gray-900 text-sm sm:text-base">
                    Recent Card Settlements
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Point of Sale, contactless and digital wallet transactions
                  </p>
                </div>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  Live Settlement
                </span>
              </div>

              {/* Card Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.filter(tx => tx.iconType === 'card' || tx.subtitle.toLowerCase().includes('card') || tx.category.toLowerCase().includes('card')).length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No card charges found. All previous settlements archived.
                  </div>
                ) : (
                  filteredTransactions
                    .filter(tx => tx.iconType === 'card' || tx.subtitle.toLowerCase().includes('card') || tx.category.toLowerCase().includes('card'))
                    .slice(0, 6)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/60 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-gray-100 text-gray-800 border-gray-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="font-poppins font-semibold text-xs sm:text-sm text-gray-900 block truncate">
                              {tx.title}
                            </span>
                            <span className="text-[11px] text-gray-500 block truncate">
                              {tx.date} • {tx.subtitle}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-3">
                          <div className="font-poppins font-bold text-xs sm:text-sm text-gray-900">
                            {formatCurrency(Math.abs(tx.amount), accountData.currency)}
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
          </div>
        ) : activeTab === 'transfers' ? (
          /* ======================================================================= */
          /* DEDICATED TRANSFERS & FEDWIRE VIEW                                      */
          /* ======================================================================= */
          <div className="space-y-6">
            {/* Wire Hero Card */}
            <section className="w-full bg-white rounded-[24px] p-5 sm:p-7 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#B81446] uppercase">
                    Federal Reserve & SWIFT
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] text-gray-500 font-medium">Real-Time Gross Settlement</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-poppins font-bold text-[#151214] tracking-tight">
                  Domestic Fedwire & International SWIFT
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-poppins font-bold text-[#151214] tracking-tight">
                    {formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Available to Wire</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(true)}
                  className="bg-gradient-to-r from-[#B81446] to-[#800A2C] hover:from-[#960e37] hover:to-[#680823] active:scale-95 text-white font-poppins text-xs sm:text-sm font-bold px-4 sm:px-6 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(184,20,70,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Image
                    src={ASSETS.icons.moneyTransfer}
                    alt="Initiate Wire"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 object-contain brightness-0 invert"
                  />
                  <span>Dispatch Wire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 font-poppins text-xs sm:text-sm font-semibold px-4 sm:px-5 py-3.5 rounded-xl border border-gray-300 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Deposit Liquidity</span>
                </button>
              </div>
            </section>

            {/* Pending Wire Clearance Banner (if active) */}
            {pendingWire && pendingWire.has_pending && (
              <div className="w-full bg-[#161416]/95 backdrop-blur-xl border border-white/10 rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.04] before:to-transparent before:pointer-events-none">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/25 via-[#B38728]/15 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#F59E0B] shadow-inner flex-shrink-0 mt-0.5">
                      <svg className="w-6 h-6 text-[#E5C158]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3.5v6c0 5.25-3.5 10-7 11.5-3.5-1.5-7-6.25-7-11.5v-6L12 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5m-2.5-2.5h5" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#C5B49E] uppercase">
                          ACTION REQUIRED
                        </span>
                      </div>
                      <h3 className="font-poppins font-bold text-lg sm:text-xl text-white tracking-tight leading-tight">
                        OUTWARD WIRE CLEARANCE
                      </h3>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#3D2C17]/90 border border-[#D4AF37]/40 text-[#E5C158] text-[11px] font-semibold tracking-wide shadow-2xs mt-1">
                          <span>{pendingWire.code_name || 'COT Security Key Required'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10 w-full lg:w-auto justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelPendingWire}
                      disabled={isCancellingPending}
                      className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 px-2 py-1 underline-offset-4 hover:underline"
                    >
                      {isCancellingPending ? 'Cancelling...' : 'Cancel Transfer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWireAmount(String(pendingWire.amount || ''));
                        setWireRecipient(pendingWire.recipient_account || '');
                        setWireRecipientName(pendingWire.recipient_name || '');
                        setClearanceStepActive(true);
                        setTransferModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-[#B81446] to-[#800A2C] hover:from-[#960e37] hover:to-[#680823] active:scale-95 text-white font-poppins text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(184,20,70,0.35)] flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 group"
                    >
                      <span>Resume Authorization</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-1 relative z-10">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-poppins font-bold text-white text-xl sm:text-2xl tracking-tight">
                      {formatCurrency(Number(pendingWire.amount), accountData.currency)} {accountData.currency}
                    </span>
                    <span className="font-poppins font-medium text-gray-400 text-sm sm:text-base">
                      to
                    </span>
                    <span className="font-poppins font-bold text-white text-base sm:text-lg">
                      {pendingWire.recipient_name}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-3xl">
                    Awaiting authorized clearance key from Private Wealth desk. Beneficiary account <span className="font-mono text-gray-300 font-semibold">{pendingWire.recipient_account}</span> ({pendingWire.support_email}).
                  </p>
                </div>
              </div>
            )}

            {/* Wire Settlement Coordinates Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-[26px] p-5 sm:p-6 border border-[#B81446]/20 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-poppins font-bold text-gray-900 text-base">
                      Wire Settlement Coordinates
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Provide these credentials for incoming Fedwire or International SWIFT transfers
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    RTGS Verified
                  </span>
                </div>

                <div className="space-y-3">
                  {/* ABA Routing */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Routing Number (ABA / Fedwire)
                      </span>
                      <span className="font-mono font-bold text-sm sm:text-lg text-gray-900 truncate block">
                        {accountData.routingNumber || '021000021'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountData.routingNumber || '021000021', 'wire_aba')}
                      className="bg-white hover:bg-gray-100 active:scale-95 text-[#151214] text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition-all cursor-pointer flex-shrink-0"
                    >
                      {copiedField === 'wire_aba' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* SWIFT / BIC */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        International SWIFT / BIC Code
                      </span>
                      <span className="font-mono font-bold text-sm sm:text-lg text-gray-900 truncate block">
                        {accountData.swiftBic || 'NEMIUSB33'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountData.swiftBic || 'NEMIUSB33', 'wire_swift')}
                      className="bg-white hover:bg-gray-100 active:scale-95 text-[#151214] text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition-all cursor-pointer flex-shrink-0"
                    >
                      {copiedField === 'wire_swift' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="bg-[#151214] text-white p-4 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[#E5A8B8] font-bold block">
                        Beneficiary Account Number
                      </span>
                      <span className="font-mono font-bold text-base sm:text-xl text-white tracking-wider truncate block">
                        {formatAccountNumberDisplay(accountData.accountNumber || '1019301430')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountData.accountNumber || '1019301430', 'wire_acc')}
                      className="bg-white hover:bg-gray-100 active:scale-95 text-[#151214] text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
                    >
                      {copiedField === 'wire_acc' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Regulatory Guidelines */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#FAF7F2] rounded-[26px] p-5 sm:p-6 border border-gray-200/80 space-y-4">
                  <h3 className="font-poppins font-bold text-gray-900 text-sm sm:text-base">
                    Wire Transfer Guidelines
                  </h3>
                  <ul className="space-y-3 text-xs text-gray-600">
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-gray-900 block">Federal Reserve Same-Day Settlement:</strong>
                        Transfers authorized before 5:00 PM EST clear same-day via Fedwire.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-gray-900 block">Zero Processing Fees:</strong>
                        All incoming and outgoing domestic wires are 100% complimentary for Tier 1 Private Clients.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-gray-900 block">Regulatory Clearance Protection:</strong>
                        High-value transactions over $5,000 may require a COT regulatory clearance authorization key.
                      </div>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500 font-mono">
                    <span>Daily Limit:</span>
                    <span className="font-bold text-gray-900">{formatDisplayLimit(accountData.dailyLimit, accountData.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wire History Section */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-poppins font-bold text-gray-900 text-sm sm:text-base">
                    Wire Transfer Records
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Real-time Federal Reserve & SWIFT settlement log
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Official bank statement exported in compliance with Federal Reserve standards.')}
                  className="text-[#B81446] font-semibold text-xs hover:underline cursor-pointer"
                >
                  Download Wire Receipts
                </button>
              </div>

              {/* Wire Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.filter(tx => tx.iconType === 'wire_in' || tx.iconType === 'wire_out' || tx.title.toLowerCase().includes('wire') || tx.subtitle.toLowerCase().includes('wire')).length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No wire transfers recorded in this cycle.
                  </div>
                ) : (
                  filteredTransactions
                    .filter(tx => tx.iconType === 'wire_in' || tx.iconType === 'wire_out' || tx.title.toLowerCase().includes('wire') || tx.subtitle.toLowerCase().includes('wire'))
                    .slice(0, 6)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/60 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            tx.type === 'credit'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {tx.iconType === 'wire_in' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-poppins font-semibold text-xs sm:text-sm text-gray-900 block truncate">
                              {tx.title}
                            </span>
                            <span className="text-[11px] text-gray-500 block truncate">
                              {tx.date} • {tx.subtitle}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-3">
                          <div className={`font-poppins font-bold text-xs sm:text-sm ${
                            tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), accountData.currency)}
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
          </div>
        ) : (
          <>
            {/* ======================================================================= */}
            {/* TOTAL AVAILABLE BALANCE HERO CARD (EXACT MATCH TO DESIGN MOCKUP)         */}
            {/* ======================================================================= */}
            <section className="w-full bg-white rounded-[24px] p-5 sm:p-7 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 transition-all duration-300">
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                  Total Available Balance
                </span>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <span className="text-2xl sm:text-4xl font-poppins font-bold text-[#151214] tracking-tight">
                    {formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}
                  </span>
                  {/* Crimson APY Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B81446] text-white text-xs font-semibold shadow-xs">
                    <span>4.85% APY Active</span>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
                {/* Deposit Funds CTA */}
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  className="bg-[#151214] hover:bg-black active:scale-95 text-white font-poppins text-xs sm:text-sm font-semibold px-4 sm:px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
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
                  className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 font-poppins text-xs sm:text-sm font-semibold px-4 sm:px-5 py-3 rounded-xl border border-gray-300 flex items-center justify-center gap-2 shadow-2xs hover:border-gray-400 transition-all duration-200 cursor-pointer"
                >
                  <Image
                    src={ASSETS.icons.moneyTransfer}
                    alt="Transfer & Wire"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 object-contain"
                  />
                  <span>Transfer & Wire</span>
                </button>
              </div>
            </section>

        {/* ======================================================================= */}
        {/* ACTION REQUIRED: PENDING WIRE CLEARANCE BANNER (NANO LUXURY DESIGN)     */}
        {/* ======================================================================= */}
        {pendingWire && pendingWire.has_pending && (
          <div className="w-full bg-[#161416]/95 backdrop-blur-xl border border-white/10 rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.04] before:to-transparent before:pointer-events-none">
            {/* Top Bar: Emblem + Action Tag + Title + Pill + Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="flex items-start gap-4">
                {/* Gold Shield Emblem */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/25 via-[#B38728]/15 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#F59E0B] shadow-inner flex-shrink-0 mt-0.5">
                  <svg className="w-6 h-6 text-[#E5C158]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 3.5v6c0 5.25-3.5 10-7 11.5-3.5-1.5-7-6.25-7-11.5v-6L12 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5m-2.5-2.5h5" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#C5B49E] uppercase">
                      ACTION REQUIRED
                    </span>
                  </div>
                  <h3 className="font-poppins font-bold text-lg sm:text-xl text-white tracking-tight leading-tight">
                    OUTWARD WIRE CLEARANCE
                  </h3>
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#3D2C17]/90 border border-[#D4AF37]/40 text-[#E5C158] text-[11px] font-semibold tracking-wide shadow-2xs mt-1">
                      <span>{pendingWire.code_name || 'COT Security Key Required'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side Actions Bar */}
              <div className="flex items-center gap-4 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10 w-full lg:w-auto justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCancelPendingWire}
                  disabled={isCancellingPending}
                  className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 px-2 py-1 underline-offset-4 hover:underline"
                >
                  {isCancellingPending ? 'Cancelling...' : 'Cancel Transfer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWireAmount(String(pendingWire.amount || ''));
                    setWireRecipient(pendingWire.recipient_account || '');
                    setWireRecipientName(pendingWire.recipient_name || '');
                    setClearanceStepActive(true);
                    setTransferModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#B81446] to-[#800A2C] hover:from-[#960e37] hover:to-[#680823] active:scale-95 text-white font-poppins text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(184,20,70,0.35)] flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 group"
                >
                  <span>Resume Authorization</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Content Row: Large Currency & Beneficiary + Subtext */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-1 relative z-10">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-poppins font-bold text-white text-xl sm:text-2xl tracking-tight">
                  {formatCurrency(Number(pendingWire.amount), accountData.currency)} {accountData.currency}
                </span>
                <span className="font-poppins font-medium text-gray-400 text-sm sm:text-base">
                  to
                </span>
                <span className="font-poppins font-bold text-white text-base sm:text-lg">
                  {pendingWire.recipient_name}
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-3xl">
                Awaiting authorized clearance key from Private Wealth desk. Beneficiary account <span className="font-mono text-gray-300 font-semibold">{pendingWire.recipient_account}</span> ({pendingWire.support_email}).
              </p>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4-QUADRANT BENTO GRID                                                   */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ===================================================================== */}
          {/* QUADRANT 3: ACCOUNT CREDENTIAL HUB                                    */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#B81446]/20 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              {/* Header Title & Account Type Pill */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="font-poppins font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                    Account Credential Hub
                  </h2>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Institutional Deposit & Settlement Credentials
                  </span>
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200/60 text-emerald-800 rounded-full text-[11px] font-bold tracking-wide">
                  <span>{accountData.accountType || 'Private Wealth Checking'}</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* 1. HERO PRIMARY ACCOUNT NUMBER (HIGH CONTRAST OBSIDIAN CARD) */}
                <div className="bg-[#151214] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white/5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A8B8] font-bold">
                      Primary Account Number
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Official Checking Account
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono font-bold text-xl sm:text-2xl text-white tracking-[0.14em] whitespace-nowrap select-all">
                      {formatAccountNumberDisplay(accountData.accountNumber || '1019301430')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountData.accountNumber || '1019301430', 'acc')}
                      className="bg-white hover:bg-gray-100 active:scale-95 text-[#151214] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm flex-shrink-0"
                    >
                      {copiedField === 'acc' ? (
                        <>
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. ROUTING NUMBER (WARM SAND CARD WITH RIGHT-ALIGNED COPY BUTTON) */}
                <div className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-2xl p-4 sm:p-4.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                      Routing Number (ABA / Fedwire)
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Settlement Branch
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono font-bold text-lg sm:text-xl text-gray-900 tracking-wider whitespace-nowrap select-all">
                      {accountData.routingNumber || '021000021'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(accountData.routingNumber || '021000021', 'rout')}
                      className="bg-white hover:bg-gray-50 active:scale-95 text-gray-800 border border-gray-300 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs flex-shrink-0"
                    >
                      {copiedField === 'rout' ? (
                        <>
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. DAILY LIMIT, WIRE FEE & CLEARANCE STATUS STRIP */}
                <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
                  {/* Daily Limit */}
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium text-gray-500 block">Daily Limit</span>
                    <span className="font-poppins font-bold text-sm sm:text-base text-gray-900 block leading-tight whitespace-nowrap">
                      {formatDisplayLimit(accountData.dailyLimit, accountData.currency)}
                    </span>
                  </div>

                  <div className="h-7 w-[1px] bg-gray-200 flex-shrink-0" />

                  {/* Wire Fee */}
                  <div className="min-w-0 text-center">
                    <span className="text-[10px] font-medium text-gray-500 block">Wire Fee</span>
                    <span className="font-poppins font-bold text-sm sm:text-base text-emerald-700 block leading-tight whitespace-nowrap">
                      {Number(accountData.wireFee) === 0 ? '$0 (Waived)' : `${formatCurrency(Number(accountData.wireFee), accountData.currency)}`}
                    </span>
                  </div>

                  <div className="h-7 w-[1px] bg-gray-200 flex-shrink-0" />

                  {/* Network Clearance Access */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[10px] font-medium text-gray-500 block">Clearance</span>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
                      <span className="text-[10px] font-bold text-emerald-600">✓</span>
                      <span>Tier 1 Fedwire</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* QUADRANT 1: 3D ISOMETRIC RUBY CUBES TITANIUM DEBIT CARD               */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-center">
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
                  {mainCard ? mainCard.card_tier.toUpperCase() : 'PLATINUM'}
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
                  <div className="flex gap-4">
                    <span className="font-mono text-white/80">EXP {cardExp}</span>
                    <span className="font-mono text-white/80">CVV {mainCard ? mainCard.cvv : '***'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* QUADRANT 2: INTERACTIVE LIQUIDITY & WEALTH GROWTH CHART               */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
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
                  className="cursor-pointer"
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
          {/* QUADRANT 4: LATEST TRANSACTIONS                                       */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-[24px] p-6 border border-[#B81446] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
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
                          {formatCurrency(Math.abs(tx.amount), accountData.currency)}
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
        </>
      )}
      </main>

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION DOCK (FIXED DOCKED DOCK WITH 4 CORE TABS)      */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151214]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-[0_-8px_28px_rgba(0,0,0,0.45)]">
        {/* 1. Accounts Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'accounts' ? 'text-[#B81446]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'accounts' ? 'bg-[#B81446]/15 text-[#B81446]' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="text-[10px] font-poppins font-medium mt-0.5">Accounts</span>
        </button>

        {/* 2. Transfers & Wires Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'transfers' ? 'text-[#B81446]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'transfers' ? 'bg-[#B81446]/15 text-[#B81446]' : ''}`}>
            <Image
              src={ASSETS.icons.moneyTransfer}
              alt="Transfers"
              width={20}
              height={20}
              className={`w-5 h-5 object-contain brightness-0 invert transition-opacity ${
                activeTab === 'transfers' ? 'opacity-100' : 'opacity-60'
              }`}
            />
          </div>
          <span className="text-[10px] font-poppins font-medium mt-0.5">Transfers</span>
        </button>

        {/* 3. Cards Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'cards' ? 'text-[#B81446]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'cards' ? 'bg-[#B81446]/15 text-[#B81446]' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
            </svg>
          </div>
          <span className="text-[10px] font-poppins font-medium mt-0.5">Cards</span>
        </button>

        {/* 4. Contact Concierge Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'contact' ? 'text-[#B81446]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'contact' ? 'bg-[#B81446]/15 text-[#B81446]' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-poppins font-medium mt-0.5">Contact</span>
        </button>
      </nav>

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
                {depositRefNumber && (
                  <p className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-1 px-3 inline-block mt-2">
                    Reference #{depositRefNumber}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleExecuteDeposit} className="space-y-4">
                {depositError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {depositError}
                  </div>
                )}

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
                    disabled={isProcessingDeposit}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingDeposit}
                  className="w-full bg-[#151214] hover:bg-black disabled:bg-gray-400 text-white font-poppins font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessingDeposit && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isProcessingDeposit ? 'Crediting Liquidity...' : 'Confirm Instant Deposit'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: TRANSFER & WIRE (COMPACT LUXURY UI FITTING 100% RESOLUTION)      */}
      {/* ========================================================================= */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-[#FAF8F5] border-[2px] border-[#151214] rounded-[24px] sm:rounded-[32px] max-w-[480px] w-full p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] relative animate-scaleUp my-auto max-h-[92vh] flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setTransferModalOpen(false);
                setWireSuccess(false);
                if (!pendingWire?.has_pending) {
                  setClearanceStepActive(false);
                  setClearanceStageData(null);
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer z-10"
              aria-label="Close transfer modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto pr-0.5">
              {wireSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
                    ✓
                  </div>
                  <h4 className="font-serif font-bold text-gray-900 text-xl">
                    Wire Successfully Dispatched!
                  </h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Federal Reserve reference #{wireRefNumber || 'FW-829104'} generated. Instant clearing in progress.
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTransferModalOpen(false);
                        setWireSuccess(false);
                        setClearanceStageData(null);
                        setClearanceStepActive(false);
                      }}
                      className="bg-[#151214] hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all cursor-pointer"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              ) : clearanceStepActive && clearanceStageData ? (
                /* ============================================================= */
                /* REGULATORY WIRE CLEARANCE KEY CHALLENGE (NO STAGE INDICATOR) */
                /* ============================================================= */
                <div className="space-y-3.5 text-left pt-1">
                  {/* Unified Institutional Security Header */}
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#151214] flex items-center justify-center mx-auto mb-2 shadow-md border border-white/10 text-[#E5A8B8]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#151214] tracking-tight leading-snug">
                      {clearanceStageData.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                      {clearanceStageData.description}
                    </p>
                  </div>

                  {/* Wire Summary Mini-Strip */}
                  <div className="bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <span className="text-gray-500 font-medium truncate">
                      To: <strong className="text-gray-900">{wireRecipientName.trim()}</strong> ({wireRecipient.trim()})
                    </span>
                    <span className="font-mono font-bold text-[#720C28] flex-shrink-0 ml-2">
                      {formatCurrency(parseFloat(wireAmount || '0'), accountData.currency)} {accountData.currency}
                    </span>
                  </div>

                  {/* Support Contact Action Box */}
                  <div className="bg-[#FAF7F2] border border-[#D5CEC5] rounded-xl p-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-800 block text-[11px]">
                          Private Wealth Support Desk
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {clearanceStageData.support_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={buildMailtoUrl()}
                          className="px-3.5 py-1 rounded-full bg-[#151214] hover:bg-black text-white text-[11px] font-medium transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Email Support</span>
                        </a>
                        <button
                          type="button"
                          onClick={copySupportRequest}
                          className="px-3 py-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          {copiedDraft ? 'Copied ✓' : 'Copy Request'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PIN Input Form */}
                  <form onSubmit={handleVerifyClearanceCode} className="space-y-3 pt-0.5">
                    {clearanceError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                        {clearanceError}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-[#151214] tracking-wide mb-1 block">
                        Enter 6-Digit Authorization Code:
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={clearanceCode}
                        onChange={(e) => setClearanceCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        disabled={isVerifyingClearance}
                        autoFocus
                        className="w-full text-center tracking-[0.55em] sm:tracking-[0.7em] text-2xl sm:text-3xl font-mono font-bold py-2.5 bg-white border-2 border-[#D5CEC5] focus:border-[#720C28] rounded-xl text-gray-900 focus:outline-none transition-all shadow-inner"
                      />
                      <span className="text-[10px] text-gray-500 mt-1 block text-center">
                        Codes do not expire. Submit your code exactly as provided by support.
                      </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleCancelPendingWire}
                        disabled={isVerifyingClearance || isCancellingPending}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 underline underline-offset-4 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isCancellingPending ? 'Cancelling...' : 'Cancel Transfer & Reset'}
                      </button>
                      <button
                        type="submit"
                        disabled={clearanceCode.trim().length !== 6 || isVerifyingClearance}
                        className="bg-[#720C28] hover:bg-[#8B0F32] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 text-white font-poppins font-medium text-xs px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        {isVerifyingClearance && (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{isVerifyingClearance ? 'Verifying...' : 'Verify & Authorize'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ============================================================= */
                /* INITIAL WIRE TRANSFER FORM                                    */
                /* ============================================================= */
                <div>
                  {/* Circular Custom Money Transfer Icon & Headers */}
                  <div className="text-center mb-4">
                    <div className="w-13 h-13 rounded-full bg-[#151214] flex items-center justify-center mx-auto mb-2 p-3 shadow-lg shadow-black/25 border border-white/10">
                      <Image
                        src={ASSETS.icons.moneyTransfer}
                        alt="Instant Transfer & Wire"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#151214] tracking-tight">
                      Instant Transfer & Wire
                    </h3>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                      Initiate secure real-time funds transfer
                    </p>
                  </div>

                  <form onSubmit={handleInitiateWire} className="space-y-3 text-left">
                    {wireError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                        {wireError}
                      </div>
                    )}

                    {/* From: Source Account Selector */}
                    <div>
                      <label className="text-xs font-bold text-[#151214] tracking-wide mb-1 block">
                        From:
                      </label>
                      <div className="bg-[#FAF7F2] border border-[#D5CEC5] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {accountData.accountType} • {formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}
                        </span>
                        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* To (Recipient): Beneficiary & Routing */}
                    <div>
                      <label className="text-xs font-bold text-[#151214] tracking-wide mb-1 block">
                        To (Recipient):
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={wireRecipientName}
                          onChange={(e) => {
                            // Strip any numbers and non-name symbols (letters, spaces, periods, hyphens only)
                            const clean = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
                            setWireRecipientName(clean);
                          }}
                          placeholder="Recipient Full Name (letters only)"
                          disabled={isProcessingWire}
                          className="w-full bg-[#FAF7F2] border border-[#D5CEC5] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#720C28] focus:bg-white transition-all shadow-2xs"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={wireRecipient}
                          onChange={(e) => {
                            // Strip any letters or symbols (digits only)
                            const clean = e.target.value.replace(/\D/g, '');
                            setWireRecipient(clean);
                          }}
                          placeholder="Recipient Account Number (digits only)"
                          disabled={isProcessingWire}
                          className="w-full bg-[#FAF7F2] border border-[#D5CEC5] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#720C28] focus:bg-white transition-all shadow-2xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Amount to Transfer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                      <label className="text-xs sm:text-sm font-bold text-[#151214] tracking-tight whitespace-nowrap">
                        Amount to Transfer:
                      </label>
                      <div className="flex items-center rounded-xl border border-[#D5CEC5] overflow-hidden bg-white shadow-2xs">
                        <span className="inline-flex items-center px-3 py-1.5 sm:py-2 bg-[#EBE7E0] text-xs font-bold text-gray-700 border-r border-[#D5CEC5] select-none">
                          USD
                        </span>
                        <div className="relative flex items-center">
                          <span className="pl-3 text-gray-400 font-serif font-bold text-base select-none">
                            $
                          </span>
                          <input
                            type="number"
                            required
                            step="0.01"
                            min="1"
                            value={wireAmount}
                            onChange={(e) => setWireAmount(e.target.value)}
                            placeholder="0.00"
                            disabled={isProcessingWire}
                            className="w-28 sm:w-36 bg-white pl-2 pr-3 py-1.5 sm:py-2 text-sm sm:text-base font-mono font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fee & Limit Pill Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#DDD4C4] text-[11px]">
                        <span className="font-bold text-[#151214]">
                          {formatCurrency(Number(accountData.wireFee), accountData.currency)}
                        </span>
                        <span className="text-gray-600 font-medium">
                          {Number(accountData.wireFee) === 0 ? '(VIP Zero Fee Instant Settlement)' : '(Standard Fedwire Processing Fee)'}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E5E0D8] text-[10px] text-gray-500 font-mono">
                        <span>Daily Limit:</span>
                        <strong className="text-gray-900">{formatDisplayLimit(accountData.dailyLimit, accountData.currency)}</strong>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setTransferModalOpen(false)}
                        disabled={isProcessingWire}
                        className="text-xs sm:text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-black transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessingWire}
                        className="bg-[#720C28] hover:bg-[#8B0F32] disabled:bg-gray-400 active:scale-95 text-white font-poppins font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        {isProcessingWire && (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{isProcessingWire ? 'Authorizing Fedwire...' : 'Authorize Wire Transfer'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* VIP PRIVATE CLIENT OVERLAY CARD (EXACT RECREATION OF NANO-GENERATED UI) */}
      {/* ======================================================================= */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#141215]/95 border border-white/15 rounded-3xl p-8 pt-10 shadow-[0_32px_120px_rgba(0,0,0,0.9),0_0_40px_rgba(184,20,70,0.08)] overflow-visible">
            {/* Ambient Background Radial Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#B81446]/20 rounded-full blur-[90px] pointer-events-none" />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setVipModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              ✕
            </button>

            {/* FLOATING TOP PLAQUE (MATCHES NANO DESIGN) */}
            <div className="relative flex flex-col items-center -mt-16 mb-8 z-10">
              {/* Circular Monogram Seal */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#333035] to-[#161416] p-[2px] shadow-lg border border-white/20 flex items-center justify-center -mb-5 z-20">
                <div className="w-full h-full rounded-full bg-[#181518] flex items-center justify-center border border-white/10">
                  <span className="font-serif text-lg font-bold text-white tracking-widest">N</span>
                </div>
              </div>

              {/* Beveled Obsidian Plaque */}
              <div className="px-10 py-5 rounded-2xl bg-gradient-to-b from-[#201D21] via-[#141215] to-[#0D0B0D] border border-white/20 shadow-2xl text-center min-w-[260px]">
                <div className="font-serif text-3xl font-bold tracking-[0.25em] text-white">
                  VIP
                </div>
                <div className="font-poppins text-[10px] font-semibold tracking-[0.32em] uppercase text-gray-300 mt-1">
                  PRIVATE CLIENT
                </div>
                {/* Crimson Accent Tab on Bottom */}
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#B81446] to-transparent mx-auto mt-2.5 rounded-full" />
              </div>
            </div>

            {/* 3-COLUMN CONTENT GRID (EXACT NANO LAYOUT) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-4 border-b border-white/10 text-left">
              {/* Column 1: Current Tier Status */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
                  Current Tier Status
                </p>
                <h4 className="font-poppins font-bold text-2xl text-white tracking-tight">
                  Premier
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Platinum Tier 1
                </p>
              </div>

              {/* Column 2: Relationship Manager */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-2">
                  Relationship Manager
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-gray-800">
                    <Image
                      src={ASSETS.images.team5Wealth}
                      alt="Sarah Jenkins"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-poppins font-semibold text-sm text-white">Sarah Jenkins</p>
                    <p className="text-[11px] text-gray-400">Senior Director</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Direct connection to Sarah Jenkins: +1 (800) 492-NEMI • Priority Ext #7401. Your callback has been requested.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Contact
                </button>
              </div>

              {/* Column 3: Exclusive Benefits */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-2">
                  Exclusive Benefits
                </p>
                <ul className="space-y-1.5 text-xs text-gray-300 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-[#B81446] font-bold text-xs">✓</span>
                    Portfolio Insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#B81446] font-bold text-xs">✓</span>
                    Bespoke Advisory
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#B81446] font-bold text-xs">✓</span>
                    Unlimited Fedwire
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#B81446] font-bold text-xs">✓</span>
                    24/7 Concierge
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="flex items-center justify-between pt-5">
              <span className="text-[11px] text-gray-400">
                NemiCapital Private Wealth Client #NC-89210
              </span>
              <button
                type="button"
                onClick={() => setVipModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-poppins text-xs font-semibold transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
