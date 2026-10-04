'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ASSETS } from '@/core';
import { AdminService } from '@/core/services/admin.service';
import { StorageService } from '@/core/services/storage.service';
import { AdminCreateUserResponse } from '@/core/models/admin.types';

export default function AdminCreateUserPage() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+1 ');

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');

  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  const [occupation, setOccupation] = useState('Private Wealth Investor');
  const [annualIncome, setAnnualIncome] = useState('$250,000 - $500,000');

  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  const [transactionPin, setTransactionPin] = useState('1920');

  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountTier, setAccountTier] = useState<'private_wealth' | 'premier' | 'standard'>('private_wealth');
  const [initialDeposit, setInitialDeposit] = useState('10000.00');
  const [dailyLimit, setDailyLimit] = useState('500000.00');
  const [wireFee, setWireFee] = useState('0.00');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Status & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<AdminCreateUserResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    try {
      if (type === 'front') setIsUploadingFront(true);
      if (type === 'back') setIsUploadingBack(true);

      const res = await StorageService.uploadKyc(file, `id_${type}`);
      if (type === 'front') setIdFrontUrl(res.url);
      if (type === 'back') setIdBackUrl(res.url);
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Failed to upload document.'}`);
    } finally {
      if (type === 'front') setIsUploadingFront(false);
      if (type === 'back') setIsUploadingBack(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 14; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleGeneratePin = () => {
    const weakPins = new Set(['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '0123', '3210']);
    let candidate = '';
    do {
      candidate = Math.floor(1000 + Math.random() * 9000).toString();
    } while (weakPins.has(candidate));
    setTransactionPin(candidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (transactionPin.length !== 4 || !/^\d{4}$/.test(transactionPin)) {
      setErrorMessage('Security transaction PIN must be exactly 4 numeric digits.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await AdminService.createUser({
        email: email.trim(),
        password,
        phone_number: phoneNumber.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || undefined,
        date_of_birth: dateOfBirth,
        id_type: idType,
        id_number: idNumber.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
        occupation: occupation.trim() || undefined,
        annual_income: annualIncome.trim() || undefined,
        id_front_image_url: idFrontUrl.trim() || undefined,
        id_back_image_url: idBackUrl.trim() || undefined,
        transaction_pin: transactionPin.trim(),
        account_type: accountType,
        account_tier: accountTier,
        initial_deposit: parseFloat(initialDeposit) || 0.00,
        daily_limit: parseFloat(dailyLimit) || 500000.00,
        wire_fee: parseFloat(wireFee) || 0.00,
        send_welcome_email: sendWelcomeEmail,
      });

      setCreatedClient(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision client account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B0C] p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#B81446]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#B81446]/20 text-[#B81446] border border-[#B81446]/30 font-bold">
                  Direct Onboarding
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OTP Bypass Active
                </span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                Provision Private Wealth Client
              </h1>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-gray-400 font-mono block">NemiCapital Protocol</span>
            <span className="text-xs text-white font-semibold">Tier 1 Institutional Provisioning</span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SUCCESS CONFIRMATION MODAL / DOSSIER RECEIPT                        */}
        {/* =================================================================== */}
        {createdClient ? (
          <div className="bg-[#161315] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] animate-scaleUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-emerald-950/50">
                ✓
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                Client Account Successfully Provisioned!
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto mt-1">
                The client profile is fully verified, the institutional checking account has been established, and security credentials have been stamped into the vault.
              </p>
            </div>

            {/* Account Credentials Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Account Number Card */}
              <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-5 relative">
                <span className="text-xs text-gray-400 font-medium block mb-1">
                  10-Digit Account Number
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xl sm:text-2xl text-white tracking-wider">
                    {createdClient.account_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdClient.account_number, 'acc')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    {copiedKey === 'acc' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-3">
                  <span>Routing: <strong className="text-white font-mono">{createdClient.routing_number}</strong></span>
                  <span>Type: <strong className="text-white capitalize">{createdClient.account_type}</strong></span>
                </div>
              </div>

              {/* Initial Balance Card */}
              <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-gray-400 font-medium block mb-1">
                  Opening Liquidity Balance
                </span>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-emerald-400">
                  ${Number(createdClient.initial_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
                <div className="mt-2 text-[11px] text-emerald-500 font-medium">
                  ✓ Available instantly in Private Wealth Checking
                </div>
              </div>

              {/* Client Identity */}
              <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-5">
                <span className="text-xs text-gray-400 font-medium block mb-1">
                  Client Legal Identity
                </span>
                <div className="text-white font-semibold text-base">
                  {createdClient.first_name} {createdClient.last_name}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-mono">
                  {createdClient.email} • {createdClient.phone_number}
                </div>
              </div>

              {/* Virtual Debit Card */}
              {createdClient.card && (
                <div className="bg-[#1F1B1D] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-medium">Auto-Issued Platinum Card</span>
                    <span className="text-[10px] uppercase font-bold text-[#B81446] bg-[#B81446]/20 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="font-mono text-white text-base tracking-widest font-bold">
                    {createdClient.card.card_number.replace(/(\d{4})/g, '$1 ').trim()}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <span>EXP: <strong className="text-white">{createdClient.card.expiration_date}</strong></span>
                    <span>CVV: <strong className="text-white">{createdClient.card.cvv}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setCreatedClient(null);
                  setEmail('');
                  setPassword('');
                  setFirstName('');
                  setLastName('');
                  setIdNumber('');
                  setStreetAddress('');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                + Provision Another Client
              </button>
              <Link
                href="/admin"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#B81446] hover:bg-[#9B103B] text-white font-semibold text-xs transition-all shadow-md text-center cursor-pointer"
              >
                Return to Admin Directory
              </Link>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* CLIENT PROVISIONING FORM                                            */
          /* =================================================================== */
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 font-medium">
                {errorMessage}
              </div>
            )}

            {/* SECTION 1: AUTHENTICATION & LOGIN CREDENTIALS */}
            <div className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-mono font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h2 className="font-serif font-bold text-lg text-white">
                  Client Authentication & Login Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Client Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@executive.com"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    ✓ Automatically verified upon creation
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Initial Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-mono text-[#B81446] hover:underline cursor-pointer"
                    >
                      Generate Strong
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: LEGAL & KYC IDENTITY */}
            <div className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-mono font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h2 className="font-serif font-bold text-lg text-white">
                  Legal Identification & KYC Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alexander"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Middle Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Vance"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sterling"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Government ID Document Type *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID Card</option>
                    <option value="ssn">Social Security Number (SSN)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    ID Document Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. USA-92819034"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>
              </div>

              {/* Occupation & Annual Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Occupation / Executive Title
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Annual Income Range
                  </label>
                  <select
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  >
                    <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                    <option value="$250,000 - $500,000">$250,000 - $500,000</option>
                    <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
                    <option value="$1,000,000+">$1,000,000+ (Ultra High Net Worth)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: RESIDENTIAL ADDRESS */}
            <div className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-mono font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h2 className="font-serif font-bold text-lg text-white">
                  Residential Address Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 740 Park Avenue, Apt 14B"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10021"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: ID DOCUMENTS & VERIFICATION */}
            <div className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-mono font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <h2 className="font-serif font-bold text-lg text-white">
                  Government ID Document Attachments
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Front */}
                <div className="border border-white/15 rounded-2xl p-4 bg-[#1F1B1D]">
                  <label className="text-xs font-semibold text-gray-300 block mb-2">
                    ID Document Front
                  </label>
                  {idFrontUrl ? (
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-emerald-500/30">
                      <span className="text-xs font-mono text-emerald-400 truncate max-w-[200px]">
                        Front Attached ✓
                      </span>
                      <button
                        type="button"
                        onClick={() => setIdFrontUrl('')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="idFrontInput"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                        className="hidden"
                      />
                      <label
                        htmlFor="idFrontInput"
                        className="w-full py-4 border-2 border-dashed border-white/20 hover:border-[#B81446] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-gray-300 font-medium">
                          {isUploadingFront ? 'Uploading Front...' : 'Click to Upload ID Front'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, or WEBP (Max 15MB)</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={idFrontUrl}
                          onChange={(e) => setIdFrontUrl(e.target.value)}
                          placeholder="Or paste direct image URL..."
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#B81446]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div className="border border-white/15 rounded-2xl p-4 bg-[#1F1B1D]">
                  <label className="text-xs font-semibold text-gray-300 block mb-2">
                    ID Document Back
                  </label>
                  {idBackUrl ? (
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-emerald-500/30">
                      <span className="text-xs font-mono text-emerald-400 truncate max-w-[200px]">
                        Back Attached ✓
                      </span>
                      <button
                        type="button"
                        onClick={() => setIdBackUrl('')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="idBackInput"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                        className="hidden"
                      />
                      <label
                        htmlFor="idBackInput"
                        className="w-full py-4 border-2 border-dashed border-white/20 hover:border-[#B81446] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-gray-300 font-medium">
                          {isUploadingBack ? 'Uploading Back...' : 'Click to Upload ID Back'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, or WEBP (Max 15MB)</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={idBackUrl}
                          onChange={(e) => setIdBackUrl(e.target.value)}
                          placeholder="Or paste direct image URL..."
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#B81446]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 5: SECURITY PIN & BANKING PROVISIONS */}
            <div className="bg-[#161315] border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#B81446]/20 border border-[#B81446]/40 text-[#B81446] font-mono font-bold text-xs flex items-center justify-center">
                  05
                </span>
                <h2 className="font-serif font-bold text-lg text-white">
                  Security PIN & Account Banking Setup
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Security Transaction PIN *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePin}
                      className="text-[10px] text-[#B81446] hover:text-[#d32f5d] font-semibold cursor-pointer transition-colors"
                    >
                      Generate 4-Digit PIN
                    </button>
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 digits"
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono tracking-widest focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Strictly 4 digits • Used to authorize wire transfers
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Account Classification *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  >
                    <option value="checking">Private Wealth Checking</option>
                    <option value="savings">High-Yield Wealth Reserve</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Client Membership Tier *
                  </label>
                  <select
                    value={accountTier}
                    onChange={(e) => setAccountTier(e.target.value as any)}
                    className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                  >
                    <option value="private_wealth">Tier 1 Private Wealth</option>
                    <option value="premier">Premier Institutional</option>
                    <option value="standard">Standard Client</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Opening Liquidity Balance ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 font-serif font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Daily Outward Transfer Limit ($ USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 font-serif font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      placeholder="500000.00"
                      className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Starts from $500,000.00 USD ($500k default)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Outward Wire Transfer Fee ($ USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 font-serif font-bold text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={wireFee}
                      onChange={(e) => setWireFee(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Default: $0.00 (VIP Zero-Fee Instant Settlement)
                  </span>
                </div>
              </div>

              {/* Welcome Email Checkbox */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <input
                  type="checkbox"
                  id="welcomeEmailCheckbox"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#B81446] cursor-pointer"
                />
                <label htmlFor="welcomeEmailCheckbox" className="text-xs text-gray-300 cursor-pointer">
                  Dispatch official executive welcome letter with account & routing credentials via Resend
                </label>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/admin"
                className="px-6 py-3 rounded-full text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel & Return
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#B81446] hover:bg-[#9B103B] disabled:bg-gray-700 active:scale-95 text-white font-poppins font-semibold text-xs sm:text-sm px-9 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isSubmitting ? 'Provisioning Account...' : 'Provision & Activate Client Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
