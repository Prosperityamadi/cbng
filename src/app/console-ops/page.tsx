'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ASSETS } from '@/core';
import { AdminService } from '@/core/services/admin.service';
import {
  AdminClientListItem,
  AdminStatsResponse,
  AdminClientDetailResponse,
  ClearanceCodeItem,
} from '@/core/models/admin.types';

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

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [clients, setClients] = useState<AdminClientListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Modal State
  const [selectedClient, setSelectedClient] = useState<AdminClientDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Clearance Codes State for Dossier
  const [clearanceCodes, setClearanceCodes] = useState<ClearanceCodeItem[]>([]);
  const [isGeneratingClearance, setIsGeneratingClearance] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Account Limit & Wire Fee State for Dossier
  const [editDailyLimit, setEditDailyLimit] = useState('');
  const [editWireFee, setEditWireFee] = useState('');
  const [isSavingLimits, setIsSavingLimits] = useState(false);
  const [limitsFeedback, setLimitsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Balance Adjustment Modal State
  const [balanceModalClient, setBalanceModalClient] = useState<AdminClientListItem | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('Executive Liquidity Adjustment');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin token is stored
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_access_token');
      if (!token) {
        router.push('/console-ops/login');
        return;
      }
      const email = localStorage.getItem('admin_email');
      setAdminEmail(email || 'Chief Operations Officer');
    }

    loadDashboardData();
  }, [statusFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, clientsData] = await Promise.all([
        AdminService.getStats().catch(() => null),
        AdminService.getClients(undefined, statusFilter === 'all' ? undefined : statusFilter).catch(() => ({ total_clients: 0, clients: [] })),
      ]);

      if (statsData) setStats(statsData);
      if (clientsData && clientsData.clients) setClients(clientsData.clients);
    } catch (e: any) {
      console.error('Failed to load admin dashboard data', e);
      if (e.message && (e.message.toLowerCase().includes('unauthorized') || e.message.toLowerCase().includes('token') || e.message.toLowerCase().includes('credential'))) {
        router.push('/console-ops/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const clientsData = await AdminService.getClients(
        searchQuery.trim() || undefined,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setClients(clientsData.clients);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDossier = async (clientId: string) => {
    setIsLoadingDetail(true);
    setClearanceCodes([]);
    setLimitsFeedback(null);
    try {
      const [detail, clearance] = await Promise.all([
        AdminService.getClientDetails(clientId),
        AdminService.getClearanceCodes(clientId).catch(() => ({ user_id: clientId, codes: [] })),
      ]);
      setSelectedClient(detail);
      setEditDailyLimit(detail.account?.daily_limit !== undefined ? String(detail.account.daily_limit) : '500000.00');
      setEditWireFee(detail.account?.wire_fee !== undefined ? String(detail.account.wire_fee) : '0.00');
      if (clearance && clearance.codes) {
        setClearanceCodes(clearance.codes);
      }
    } catch (err: any) {
      alert(`Could not fetch client dossier: ${err.message || 'Error'}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveAccountLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const parsedLimit = parseFloat(editDailyLimit);
    const parsedFee = parseFloat(editWireFee);

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setLimitsFeedback({ type: 'error', message: 'Daily outward limit must be a valid non-negative number.' });
      return;
    }
    if (isNaN(parsedFee) || parsedFee < 0) {
      setLimitsFeedback({ type: 'error', message: 'Wire fee must be a valid non-negative number.' });
      return;
    }

    setIsSavingLimits(true);
    setLimitsFeedback(null);

    try {
      await AdminService.updateAccountLimits(selectedClient.user.id, {
        daily_limit: parsedLimit,
        wire_fee: parsedFee,
      });

      setLimitsFeedback({
        type: 'success',
        message: `Account limits updated: Daily limit set to ${formatCurrency(parsedLimit, selectedClient.account?.currency || 'USD')} {selectedClient.account?.currency || 'USD'}, wire fee set to ${formatCurrency(parsedFee, selectedClient.account?.currency || 'USD')} {selectedClient.account?.currency || 'USD'}.`,
      });

      // Update selected client in memory
      setSelectedClient((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          account: prev.account ? {
            ...prev.account,
            daily_limit: parsedLimit,
            wire_fee: parsedFee,
          } : undefined,
        };
      });

      // Update client table in memory
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.user.id
            ? { ...c, daily_limit: parsedLimit, wire_fee: parsedFee }
            : c
        )
      );
    } catch (err: any) {
      setLimitsFeedback({
        type: 'error',
        message: err.message || 'Failed to update client account limits.',
      });
    } finally {
      setIsSavingLimits(false);
    }
  };

  const handleRegenerateClearanceCodes = async (stageNumber?: number) => {
    if (!selectedClient) return;
    setIsGeneratingClearance(true);
    try {
      const res = await AdminService.generateClearanceCodes(selectedClient.user.id, {
        stage_number: stageNumber,
      });
      setClearanceCodes(res.codes);
    } catch (err: any) {
      alert(`Failed to regenerate clearance keys: ${err.message || 'Error'}`);
    } finally {
      setIsGeneratingClearance(false);
    }
  };

  const copyClearanceCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleToggleStatus = async (client: AdminClientListItem) => {
    const newStatus = client.status === 'active' ? 'frozen' : 'active';
    const confirmChange = window.confirm(
      `Are you sure you want to change the status of ${client.email} to '${newStatus}'?`
    );
    if (!confirmChange) return;

    try {
      await AdminService.updateClientStatus(client.id, newStatus);
      // Update local state
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert(`Status update failed: ${err.message || 'Error'}`);
    }
  };

  const handleExecuteBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalClient) return;

    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount greater than $0.00');
      return;
    }

    setIsAdjusting(true);
    setAdjustSuccess(null);

    try {
      const res = await AdminService.adjustBalance(balanceModalClient.id, {
        adjustment_type: adjustType,
        amount: amountNum,
        description: adjustDescription,
      });

      setAdjustSuccess(`Successfully executed ${adjustType} of ${formatCurrency(amountNum, balanceModalClient.currency || 'USD')} ${balanceModalClient.currency || 'USD'}.`);

      // Update client balance in table
      setClients((prev) =>
        prev.map((c) =>
          c.id === balanceModalClient.id ? { ...c, balance: Number(res.new_balance) } : c
        )
      );

      setTimeout(() => {
        setBalanceModalClient(null);
        setAdjustAmount('');
        setAdjustSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message || 'Error'}`);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDeleteClient = async (client: AdminClientListItem) => {
    const confirmChange = window.confirm(
      `CRITICAL WARNING: Are you sure you want to PERMANENTLY wipe ${client.email} from the database? This action cannot be undone.`
    );
    if (!confirmChange) return;

    try {
      await AdminService.deleteClient(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      if (selectedClient && selectedClient.user.id === client.id) {
        setSelectedClient(null);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error'}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_email');
    router.push('/console-ops/login');
  };

  return (
    <div className="min-h-screen bg-[#0D0B0C] p-4 sm:p-6 lg:p-8 relative">
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src={ASSETS.logos.main}
              alt="NemiCapital Bank"
              width={150}
              height={45}
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-serif font-bold text-base sm:text-lg text-white tracking-tight">
              Executive Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/console-ops/users/create"
            className="bg-[#B81446] hover:bg-[#9B103B] active:scale-95 text-white font-poppins font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="text-base font-bold">+</span>
            <span>Provision New Client</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300">
            <span className="text-gray-500 font-mono">Logged as:</span>
            <span className="font-medium text-white truncate max-w-[140px]">{adminEmail}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* =================================================================== */}
        {/* 1. OVERVIEW STATS CARDS                                             */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total AUM */}
          <div className="bg-[#161315] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#B81446]/10 rounded-bl-full pointer-events-none" />
            <span className="text-xs text-gray-400 font-medium block mb-1">
              Assets Under Management (AUM)
            </span>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
              ${stats ? Number(stats.total_assets_under_management).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-2 block">
              ● Active Private Wealth Reserves
            </span>
          </div>

          {/* Card 2: Total Clients */}
          <div className="bg-[#161315] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-md">
            <span className="text-xs text-gray-400 font-medium block mb-1">
              Total Private Wealth Clients
            </span>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {stats ? stats.total_clients : clients.length}
            </div>
            <span className="text-[11px] text-gray-400 font-medium mt-2 block">
              100% Institutional KYC Verified
            </span>
          </div>

          {/* Card 3: Active Accounts */}
          <div className="bg-[#161315] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-md">
            <span className="text-xs text-gray-400 font-medium block mb-1">
              Active Checking & Savings
            </span>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {stats ? stats.active_accounts : 0}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-2 block">
              Tier 1 Metal Routing Link Active
            </span>
          </div>

          {/* Card 4: Transactions */}
          <div className="bg-[#161315] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-md">
            <span className="text-xs text-gray-400 font-medium block mb-1">
              Ledger Transactions Processed
            </span>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {stats ? stats.total_transactions_count : 0}
            </div>
            <span className="text-[11px] text-gray-400 font-medium mt-2 block">
              Real-time Fedwire & Clearing Logs
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CLIENT DIRECTORY & SEARCH BAR                                    */}
        {/* =================================================================== */}
        <section className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight">
                Private Client Directory
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Real-time oversight of all client accounts, balances, and security clearance.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-xl bg-black/40 border border-white/10 p-1 self-start md:self-auto text-xs font-medium">
              {(['all', 'active', 'frozen', 'suspended'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-[#B81446] text-white font-semibold shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, email, or 10-digit account number..."
                className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Client Table */}
          {/* Client Table Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                <div className="w-6 h-6 border-2 border-[#B81446] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Querying institutional ledger...
              </div>
            ) : clients.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No clients found matching the query or filter.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Email / Phone</th>
                    <th className="py-3 px-4">Account Number</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Daily Limit & Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/5 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-bold text-xs flex items-center justify-center">
                            {(client.first_name || client.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-semibold">
                              {client.first_name ? `${client.first_name} ${client.last_name || ''}` : 'Private Client'}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize">
                              {client.account_type || 'Checking'} • {client.tier || 'Tier 1'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email / Phone */}
                      <td className="py-4 px-4 font-mono text-gray-300">
                        <div>{client.email}</div>
                        <div className="text-[10px] text-gray-500">{client.phone_number}</div>
                      </td>

                      {/* Account Number */}
                      <td className="py-4 px-4 font-mono text-gray-200">
                        {client.account_number ? (
                          <span className="font-bold tracking-wider">{client.account_number}</span>
                        ) : (
                          <span className="text-gray-500 italic">Unprovisioned</span>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-4 px-4 font-serif font-bold text-sm text-emerald-400">
                        {formatCurrency(Number(client.balance), client.currency || 'USD')}
                      </td>

                      {/* Daily Limit & Wire Fee */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-white text-xs">
                          {formatDisplayLimit(client.daily_limit || 500000, client.currency || 'USD')}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Fee: {formatCurrency(Number(client.wire_fee || 0), client.currency || 'USD')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            client.status === 'active'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : client.status === 'frozen'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Dossier */}
                          <button
                            type="button"
                            onClick={() => handleViewDossier(client.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all cursor-pointer"
                          >
                            Dossier
                          </button>

                          {/* Adjust Balance */}
                          <button
                            type="button"
                            onClick={() => setBalanceModalClient(client)}
                            className="px-3 py-1.5 rounded-lg bg-[#B81446]/20 hover:bg-[#B81446]/40 text-[#B81446] border border-[#B81446]/40 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Adjust {getCurrencySymbol(client.currency || 'USD')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(client)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                              client.status === 'active'
                                ? 'bg-amber-950/30 border-amber-800/40 text-amber-400 hover:bg-amber-900/40'
                                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/40'
                            }`}
                            title={client.status === 'active' ? 'Freeze Client Account' : 'Activate Client Account'}
                          >
                            {client.status === 'active' ? 'Freeze' : 'Activate'}
                          </button>
                          
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                            title="Wipe Client from DB"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards View (Visible on small screens) */}
          {!isLoading && clients.length > 0 && (
            <div className="lg:hidden flex flex-col gap-4">
              {clients.map((client) => (
                <div key={client.id} className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-bold text-sm flex items-center justify-center">
                        {(client.first_name || client.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-semibold text-white">
                          {client.first_name ? `${client.first_name} ${client.last_name || ''}` : 'Private Client'}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">
                          {client.account_type || 'Checking'} • {client.tier || 'Tier 1'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        client.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : client.status === 'frozen'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="overflow-hidden">
                      <span className="block text-[10px] text-gray-500 mb-0.5">Contact</span>
                      <div className="text-gray-300 font-mono text-[10px] truncate" title={client.email}>{client.email}</div>
                      <div className="text-[10px] text-gray-500">{client.phone_number}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 mb-0.5">Account</span>
                      <div className="font-mono text-gray-200">
                        {client.account_number ? (
                          <span className="font-bold">{client.account_number}</span>
                        ) : (
                          <span className="italic">Unprovisioned</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 mb-0.5">Balance</span>
                      <div className="font-serif font-bold text-emerald-400 truncate">
                        {formatCurrency(Number(client.balance), client.currency || 'USD')}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 mb-0.5">Limit / Fee</span>
                      <div className="font-bold text-white text-[11px]">
                        {formatDisplayLimit(client.daily_limit || 500000, client.currency || 'USD')}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Fee: {formatCurrency(Number(client.wire_fee || 0), client.currency || 'USD')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-1 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDossier(client.id)}
                      className="flex-1 min-w-[70px] px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium transition-all cursor-pointer"
                    >
                      Dossier
                    </button>
                      <button
                      type="button"
                      onClick={() => setBalanceModalClient(client)}
                      className="flex-1 min-w-[70px] px-2 py-2 rounded-lg bg-[#B81446]/20 hover:bg-[#B81446]/40 text-[#B81446] border border-[#B81446]/40 text-[10px] font-semibold transition-all cursor-pointer"
                    >
                      Adjust {getCurrencySymbol(client.currency || 'USD')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(client)}
                      className={`flex-1 min-w-[70px] px-2 py-2 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${
                        client.status === 'active'
                          ? 'bg-amber-950/30 border-amber-800/40 text-amber-400'
                          : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                      }`}
                    >
                      {client.status === 'active' ? 'Freeze' : 'Active'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client)}
                      className="flex-1 min-w-[70px] px-2 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-400 text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =================================================================== */}
      {/* 3. MODAL: 360-DEGREE CLIENT INSPECTION DOSSIER                      */}
      {/* =================================================================== */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161315] border border-white/20 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6 pb-4 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B81446] font-bold">
                Private Wealth Dossier
              </span>
              <h3 className="font-serif font-bold text-2xl text-white tracking-tight mt-1 flex flex-wrap items-center gap-2">
                <span>{selectedClient.kyc?.first_name} {selectedClient.kyc?.last_name} ({selectedClient.user.email})</span>
                {selectedClient.kyc?.country && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    {selectedClient.kyc.country}
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-6 text-xs">
              {/* Credentials & Vault Recovery Section */}
              <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-4">
                <span className="font-semibold text-white block mb-2 font-mono uppercase tracking-wider text-[11px] text-amber-400">
                  Vault Security Credentials (Executive Inspection)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-500 block">Plaintext Password</span>
                    <span className="font-mono text-white font-bold">
                      {selectedClient.user.password_unhashed || '•••••••• (Hashed only)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Transaction PIN</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {selectedClient.security?.pin_unhashed || '••••'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Account Status</span>
                    <span className="font-semibold text-white capitalize">{selectedClient.user.status}</span>
                  </div>
                </div>
              </div>

              {/* Wire Regulatory Clearance Authorization Keys (Stages 1-3) */}
              <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                  <div>
                    <span className="font-semibold text-white block font-mono uppercase tracking-wider text-[11px] text-[#B81446]">
                      Wire Regulatory Clearance Keys
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      Sequential 6-digit compliance keys requested by client during wire dispatch
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingClearance}
                    onClick={() => handleRegenerateClearanceCodes()}
                    className="px-3 py-1.5 rounded-lg bg-[#B81446]/20 hover:bg-[#B81446]/40 text-[#B81446] border border-[#B81446]/40 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    {isGeneratingClearance && (
                      <div className="w-3 h-3 border-2 border-[#B81446] border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Regenerate All 3 Keys</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {clearanceCodes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                            Stage {item.stage_number}
                          </span>
                          <span className="text-white font-semibold text-xs">
                            {item.code_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              item.is_used
                                ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {item.is_used ? 'Cleared / Used' : 'Active / Ready'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {item.stage_number === 1 && 'First key required when client clicks Authorize Wire Transfer.'}
                          {item.stage_number === 2 && 'Second key requested after Stage 1 is verified.'}
                          {item.stage_number === 3 && 'Final Federal Reserve release key to dispatch funds.'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="font-mono font-bold text-base sm:text-lg text-emerald-400 tracking-wider bg-black/50 px-3 py-1 rounded-lg border border-white/10 select-all">
                          {item.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyClearanceCode(item.code, item.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          {copiedCodeId === item.id ? 'Copied ✓' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          disabled={isGeneratingClearance}
                          onClick={() => handleRegenerateClearanceCodes(item.stage_number)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs transition-colors cursor-pointer"
                          title="Generate new random 6-digit key for this stage"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                  {clearanceCodes.length === 0 && (
                    <div className="text-gray-400 text-center py-2 text-xs">
                      No clearance keys loaded yet. Click "Regenerate All 3 Keys" to initialize.
                    </div>
                  )}
                </div>
              </div>

              {/* KYC Profile Details */}
              {selectedClient.kyc && (
                <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-4">
                  <span className="font-semibold text-white block mb-2 font-mono uppercase tracking-wider text-[11px]">
                    Legal Identity & Residence
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-gray-500 block">DOB</span>
                      <span className="text-white">{selectedClient.kyc.date_of_birth}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">ID Document ({selectedClient.kyc.id_type})</span>
                      <span className="font-mono text-white font-bold">{selectedClient.kyc.id_number_unhash}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Occupation / Income</span>
                      <span className="text-white">{selectedClient.kyc.occupation} • {selectedClient.kyc.annual_income}</span>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-gray-500 block">Address</span>
                      <span className="text-white">
                        {selectedClient.kyc.street_address}, {selectedClient.kyc.city}, {selectedClient.kyc.state} {selectedClient.kyc.postal_code}, {selectedClient.kyc.country}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards & Accounts */}
              {selectedClient.account && (
                <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-4">
                  <span className="font-semibold text-white block mb-2 font-mono uppercase tracking-wider text-[11px]">
                    Banking Provision
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-gray-500 block">Account Number</span>
                      <span className="font-mono font-bold text-white">{selectedClient.account.account_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Routing Number</span>
                      <span className="font-mono text-white">{selectedClient.account.routing_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Live Balance</span>
                      <span className="font-serif font-bold text-emerald-400">
                        ${Number(selectedClient.account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Limits & Wire Fee Governance Card */}
              {selectedClient.account && (
                <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="font-semibold text-white block font-mono uppercase tracking-wider text-[11px] text-[#B81446]">
                        Account Limits & Wire Fee Governance
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        Configure daily outward Fedwire transfer threshold and processing fee for this client
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-gray-300">
                        Current: <strong className="text-white">{formatDisplayLimit(selectedClient.account.daily_limit || 500000)}</strong> / Fee: <strong className="text-white">${Number(selectedClient.account.wire_fee || 0).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  {limitsFeedback && (
                    <div
                      className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                        limitsFeedback.type === 'success'
                          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/70 border-rose-800 text-rose-300'
                      }`}
                    >
                      <span>{limitsFeedback.message}</span>
                      <button
                        type="button"
                        onClick={() => setLimitsFeedback(null)}
                        className="text-gray-400 hover:text-white text-xs ml-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveAccountLimits} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Daily Outward Limit */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-300">
                            Daily Outward Transfer Limit ($ USD)
                          </label>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Starts from $500,000.00
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-gray-500 font-serif font-bold text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={editDailyLimit}
                            onChange={(e) => setEditDailyLimit(e.target.value)}
                            placeholder="500000.00"
                            disabled={isSavingLimits}
                            className="w-full bg-black/30 border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Client cannot dispatch wire amounts higher than this threshold per day.
                        </span>
                      </div>

                      {/* Outward Wire Fee */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-300">
                            Outward Wire Transfer Fee ($ USD)
                          </label>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Default: $0.00 (Zero Fee)
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-gray-500 font-serif font-bold text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={editWireFee}
                            onChange={(e) => setEditWireFee(e.target.value)}
                            placeholder="0.00"
                            disabled={isSavingLimits}
                            className="w-full bg-black/30 border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Deducted from client account balance upon final wire settlement.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSavingLimits}
                        className="bg-[#B81446] hover:bg-[#9B103B] disabled:bg-gray-700 active:scale-95 text-white font-poppins font-semibold text-xs px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        {isSavingLimits && (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{isSavingLimits ? 'Saving Changes...' : 'Update Account Limits & Wire Fees'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL: BALANCE ADJUSTMENT (CREDIT / DEBIT)                        */}
      {/* =================================================================== */}
      {balanceModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161315] border border-white/20 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setBalanceModalClient(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B81446] font-bold">
                Direct Ledger Adjustment
              </span>
              <h3 className="font-serif font-bold text-xl text-white tracking-tight mt-1">
                Adjust Client Balance
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Client: {balanceModalClient.email} ({balanceModalClient.account_number})
              </p>
            </div>

            {adjustSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 font-medium">
                {adjustSuccess}
              </div>
            )}

            <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      adjustType === 'credit'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    + Credit (Deposit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      adjustType === 'debit'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    - Debit (Withdraw)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Adjustment Amount ({getCurrencySymbol(balanceModalClient.currency || 'USD')} {balanceModalClient.currency || 'USD'})</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 25000.00"
                  className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Audit Memo / Description</label>
                <input
                  type="text"
                  required
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="Reason for adjustment"
                  className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setBalanceModalClient(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="bg-[#B81446] hover:bg-[#9B103B] text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isAdjusting ? 'Processing Ledger...' : `Confirm ${adjustType.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
