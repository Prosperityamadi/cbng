'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ASSETS } from '@/core';
import { AccountService } from '@/core/services/account.service';

interface Step4SecurityPinProps {
  userFullName: string;
  onBackToKyc: () => void;
  onPinSubStepChange?: (subStep: 'enter_pin' | 'confirm_pin' | 'account_created') => void;
}

export const Step4SecurityPin: React.FC<Step4SecurityPinProps> = ({
  userFullName,
  onBackToKyc,
  onPinSubStepChange,
}) => {
  const router = useRouter();

  // Sub-step: 'enter_pin' -> 'confirm_pin' -> 'account_created'
  const [subStep, setSubStep] = useState<'enter_pin' | 'confirm_pin' | 'account_created'>('enter_pin');

  const [accountType, setAccountType] = useState<'checking' | 'savings' | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinFocused, setIsPinFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinShaking, setIsPinShaking] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [copiedField, setCopiedField] = useState<'acc' | 'rout' | null>(null);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of sub-step changes
  useEffect(() => {
    onPinSubStepChange?.(subStep);
  }, [subStep, onPinSubStepChange]);

  // Auto-focus on active PIN field
  useEffect(() => {
    if (subStep === 'enter_pin') {
      const timer = setTimeout(() => pinInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else if (subStep === 'confirm_pin') {
      const timer = setTimeout(() => confirmInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [subStep]);

  // Handle Enter PIN submit -> advances to separate confirm PIN screen
  const handleProceedToConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!accountType) {
      setPinError('Please select an account type (Checking or Savings).');
      setIsPinShaking(true);
      setTimeout(() => setIsPinShaking(false), 450);
      return;
    }

    if (pin.length !== 4) {
      setPinError('Please enter all 4 digits for your transfer PIN.');
      setIsPinShaking(true);
      setTimeout(() => setIsPinShaking(false), 450);
      return;
    }

    setPinError(null);
    setConfirmPin('');
    setSubStep('confirm_pin');
  };

  // Handle Confirm PIN submit -> validates match and activates account
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (confirmPin.length !== 4) {
      setPinError('Please re-enter all 4 digits to confirm.');
      setIsPinShaking(true);
      setTimeout(() => setIsPinShaking(false), 450);
      return;
    }

    if (confirmPin !== pin) {
      setPinError('PINs do not match. Please re-enter your 4-digit PIN.');
      setIsPinShaking(true);
      setTimeout(() => {
        setIsPinShaking(false);
        setConfirmPin('');
        confirmInputRef.current?.focus();
      }, 450);
      return;
    }

    setPinError(null);
    setIsCreatingAccount(true);

    try {
      const res = await AccountService.setupAccount({
        account_type: accountType as string,
        transaction_pin: confirmPin
      });
      
      const generatedAcc = res.account.account_number;
      const finalName = userFullName.trim() || 'Sarah Jenkins';

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'nemicapital_account',
          JSON.stringify({
            account_number: generatedAcc,
            routing_number: res.account.routing_number,
            balance: res.account.balance,
            account_type: res.account.account_type
          })
        );
        sessionStorage.setItem('nemicapital_user_name', finalName);
        localStorage.setItem('access_token', res.access_token);
        localStorage.removeItem('onboarding_token'); // Clean up
      }
      setAccountDetails(res.account);
      setIsCreatingAccount(false);
      setSubStep('account_created');
    } catch (err: any) {
      setIsCreatingAccount(false);
      setPinError(err.message || 'Failed to setup account.');
      // UX Fix: If the backend rejects the PIN (e.g., too weak), send them back to the first PIN input screen
      setPin('');
      setConfirmPin('');
      setSubStep('enter_pin');
      setIsPinShaking(true);
      setTimeout(() => setIsPinShaking(false), 450);
    }
  };

  const handleCopy = (text: string, field: 'acc' | 'rout') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // =========================================================================
  // SUB-STEP 1: Enter 4-Digit PIN (Separate Screen)
  // =========================================================================
  if (subStep === 'enter_pin') {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Back to Step 3 */}
        <button
          type="button"
          onClick={onBackToKyc}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#B81446] mb-1 transition-colors cursor-pointer"
        >
          <span>Edit KYC profile or documents</span>
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 relative flex items-center justify-center p-2 bg-[#FAF7F2] rounded-2xl border border-gray-100 shadow-2xs">
            <Image
              src={ASSETS.icons.accountDetails}
              alt="Security PIN"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
            Set Transaction PIN
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed">
            Choose a confidential 4-digit PIN for authorizing wire transfers, card usage, and ATM withdrawals.
          </p>
        </div>

        <form onSubmit={handleProceedToConfirm} noValidate className="space-y-4 pt-1">
          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 text-center mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {/* Checking Account Card */}
              <button
                type="button"
                onClick={() => setAccountType('checking')}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  accountType === 'checking'
                    ? 'border-[#B81446] bg-[#B81446]/5 shadow-[0_4px_16px_rgba(184,20,70,0.12)] scale-[1.02]'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {accountType === 'checking' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#B81446] rounded-full flex items-center justify-center animate-scaleUp">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <Image
                  src={ASSETS.icons.checkingAccount}
                  alt="Checking Account"
                  width={42}
                  height={42}
                  className={`object-contain mb-2 transition-transform duration-300 ${accountType === 'checking' ? 'scale-110 drop-shadow-md' : 'grayscale opacity-70'}`}
                />
                <span className={`font-poppins font-bold text-sm ${accountType === 'checking' ? 'text-[#B81446]' : 'text-gray-600'}`}>
                  Checking
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">Everyday Use</span>
              </button>

              {/* Savings Account Card */}
              <button
                type="button"
                onClick={() => setAccountType('savings')}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  accountType === 'savings'
                    ? 'border-[#B81446] bg-[#B81446]/5 shadow-[0_4px_16px_rgba(184,20,70,0.12)] scale-[1.02]'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                {accountType === 'savings' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#B81446] rounded-full flex items-center justify-center animate-scaleUp">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <Image
                  src={ASSETS.icons.savingsAccount}
                  alt="Savings Account"
                  width={42}
                  height={42}
                  className={`object-contain mb-2 transition-transform duration-300 ${accountType === 'savings' ? 'scale-110 drop-shadow-md' : 'grayscale opacity-70'}`}
                />
                <span className={`font-poppins font-bold text-sm ${accountType === 'savings' ? 'text-[#B81446]' : 'text-gray-600'}`}>
                  Savings
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">4.85% APY</span>
              </button>
            </div>
          </div>

          {/* 4-Digit Numeric Input (Strict Sequential) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 text-center mb-2">
              Enter 4-Digit PIN
            </label>

            <div
              onClick={() => pinInputRef.current?.focus()}
              className={`relative flex justify-center gap-3 cursor-pointer select-none ${
                isPinShaking ? 'animate-shake' : ''
              }`}
            >
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(clean);
                  if (pinError) setPinError(null);
                }}
                onFocus={() => setIsPinFocused(true)}
                onBlur={() => setIsPinFocused(false)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                aria-label="4-digit transaction PIN"
              />

              {[0, 1, 2, 3].map((idx) => {
                const digit = pin[idx] || '';
                const isCurrentActive =
                  isPinFocused && (idx === pin.length || (idx === 3 && pin.length === 4));

                return (
                  <div
                    key={idx}
                    className={`w-13 sm:w-15 h-14 sm:h-16 flex items-center justify-center font-poppins font-bold text-xl sm:text-2xl rounded-2xl border transition-all duration-200 ${
                      pinError
                        ? 'border-red-500 bg-red-50/20 text-red-600 ring-2 ring-red-500/20'
                        : isCurrentActive
                        ? 'border-[#B81446] bg-white ring-4 ring-[#B81446]/15 shadow-xs'
                        : digit
                        ? 'border-[#B81446] bg-white text-[#B81446] shadow-xs'
                        : 'border-gray-200 bg-[#F8F9FA] text-[#1A1818]'
                    }`}
                  >
                    {digit ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#B81446] animate-scaleUp" />
                    ) : isCurrentActive ? (
                      <span className="w-0.5 h-6 bg-[#B81446] animate-pulse rounded-full" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {pinError && (
            <p className="text-[11px] font-medium text-red-600 text-center flex items-center justify-center gap-1 animate-fadeIn">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pinError}</span>
            </p>
          )}

          {/* Continue to Confirm Step Button */}
          <button
            type="submit"
            className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Continue to Confirmation</span>
          </button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // SUB-STEP 2: Confirm 4-Digit PIN (Separate Screen)
  // =========================================================================
  if (subStep === 'confirm_pin') {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Back to Enter PIN Screen */}
        <button
          type="button"
          onClick={() => {
            setPinError(null);
            setSubStep('enter_pin');
          }}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#B81446] mb-1 transition-colors cursor-pointer"
        >
          <span>Change 4-digit PIN</span>
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 relative flex items-center justify-center p-2 bg-[#FAF7F2] rounded-2xl border border-gray-100 shadow-2xs">
            <Image
              src={ASSETS.icons.accountDetails}
              alt="Confirm PIN"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
            Confirm Transaction PIN
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed">
            Please re-enter your 4-digit PIN to confirm and activate your bank account.
          </p>
        </div>

        <form onSubmit={handleFinalSubmit} noValidate className="space-y-4 pt-1">
          {/* Confirm 4-Digit Input (Strict Sequential) */}
          <div>
            <div className="flex items-center justify-between mb-2 max-w-[280px] mx-auto">
              <label className="text-xs font-semibold text-gray-700">
                Re-enter 4-Digit PIN
              </label>
              {confirmPin.length === 4 && (
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 ${
                    confirmPin === pin ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {confirmPin === pin ? '✓ PINs Match' : 'Mismatch'}
                </span>
              )}
            </div>

            <div
              onClick={() => confirmInputRef.current?.focus()}
              className={`relative flex justify-center gap-3 cursor-pointer select-none ${
                isPinShaking ? 'animate-shake' : ''
              }`}
            >
              <input
                ref={confirmInputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setConfirmPin(clean);
                  if (pinError) setPinError(null);
                }}
                onFocus={() => setIsConfirmFocused(true)}
                onBlur={() => setIsConfirmFocused(false)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                aria-label="Confirm 4-digit transaction PIN"
              />

              {[0, 1, 2, 3].map((idx) => {
                const digit = confirmPin[idx] || '';
                const isCurrentActive =
                  isConfirmFocused && (idx === confirmPin.length || (idx === 3 && confirmPin.length === 4));

                return (
                  <div
                    key={idx}
                    className={`w-13 sm:w-15 h-14 sm:h-16 flex items-center justify-center font-poppins font-bold text-xl sm:text-2xl rounded-2xl border transition-all duration-200 ${
                      pinError
                        ? 'border-red-500 bg-red-50/20 text-red-600 ring-2 ring-red-500/20'
                        : isCurrentActive
                        ? 'border-[#B81446] bg-white ring-4 ring-[#B81446]/15 shadow-xs'
                        : digit
                        ? 'border-[#B81446] bg-white text-[#B81446] shadow-xs'
                        : 'border-gray-200 bg-[#F8F9FA] text-[#1A1818]'
                    }`}
                  >
                    {digit ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#B81446] animate-scaleUp" />
                    ) : isCurrentActive ? (
                      <span className="w-0.5 h-6 bg-[#B81446] animate-pulse rounded-full" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {pinError && (
            <p className="text-[11px] font-medium text-red-600 text-center flex items-center justify-center gap-1 animate-fadeIn">
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{pinError}</span>
            </p>
          )}

          {/* Complete Account Button */}
          <button
            type="submit"
            disabled={isCreatingAccount}
            className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-2"
          >
            {isCreatingAccount ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Activating Bank Account...</span>
              </>
            ) : (
              <span>Complete & Activate Bank Account</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // SUB-STEP 3: REDESIGNED LUXURY PHYSICAL & DIGITAL BANK CARD CELEBRATION
  // =========================================================================
  const cardHolderName = (userFullName.trim() || 'Sarah Jenkins').toUpperCase();

  return (
    <div className="w-full max-w-[430px] mx-auto py-1 text-center space-y-3.5 animate-fadeIn">
      {/* Top Celebration Title */}
      <div className="space-y-1">
        <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight">
          Account Successfully Created!
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Welcome to NemiCapital International Bank,{' '}
          <span className="font-semibold text-[#1A1818]">{userFullName || 'Sarah Jenkins'}</span>.
        </p>
      </div>

      {/* ===================================================================== */}
      {/* LUXURY FINTECH DEBIT CARD WITH 3D ISOMETRIC CUBES BACKGROUND          */}
      {/* ===================================================================== */}
      <div className="relative w-full aspect-[1.586/1] max-w-[430px] mx-auto rounded-[24px] p-5 text-left text-white shadow-[0_28px_65px_-12px_rgba(0,0,0,0.85),0_0_35px_rgba(184,20,70,0.28)] border border-white/20 ring-1 ring-inset ring-white/10 overflow-hidden select-none transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_34px_75px_-10px_rgba(0,0,0,0.9),0_0_45px_rgba(184,20,70,0.4)] flex flex-col justify-between bg-[#151113] group">
        
        {/* Subtle Corporate Executive Silhouette Background (Editorial Backdrop) */}
        <Image
          src={ASSETS.heroSlides.slide1}
          alt="Executive Backdrop"
          fill
          className="object-cover opacity-20 grayscale mix-blend-luminosity pointer-events-none scale-110"
        />

        {/* Ambient Dark Gradient Wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#14080D]/95 via-[#180911]/85 to-[#240612]/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-transparent pointer-events-none z-10 opacity-70" />

        {/* =================================================================== */}
        {/* BRAND HALLMARK: 3D ISOMETRIC INTERLOCKING CUBES (SECOND SCREENSHOT) */}
        {/* =================================================================== */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-7/12 pointer-events-none opacity-90 overflow-hidden">
          <svg
            viewBox="0 0 400 450"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover translate-x-8 -translate-y-2 scale-105"
          >
            {/* Top Cube */}
            <polygon points="200,40 290,90 200,140 110,90" fill="#B81446" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
            <polygon points="110,90 200,140 200,240 110,190" fill="#8A0E34" fillOpacity="0.94" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
            <polygon points="200,140 290,90 290,190 200,240" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

            {/* Right Interlocking Cube */}
            <polygon points="290,190 380,240 290,290 200,240" fill="#B81446" fillOpacity="0.85" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
            <polygon points="200,240 290,290 290,390 200,340" fill="#8A0E34" fillOpacity="0.92" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
            <polygon points="290,290 380,240 380,340 290,390" fill="#5A0620" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

            {/* Left Interlocking Cube */}
            <polygon points="110,190 200,240 110,290 20,240" fill="#5A0620" fillOpacity="0.82" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
            <polygon points="110,290 200,340 110,390 20,340" fill="#B81446" fillOpacity="0.86" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.25" />
            <polygon points="20,240 110,290 110,390 20,340" fill="#3D0315" fillOpacity="0.95" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />

            {/* Bottom Interlocking Accent Facet */}
            <polygon points="200,340 290,390 200,440 110,390" fill="#8A0E34" fillOpacity="0.88" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
            <polygon points="200,440 290,390 290,490 200,490" fill="#5A0620" fillOpacity="0.9" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" />
          </svg>
        </div>

        {/* Ambient Specular Metal Reflection Beam */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br from-[#B81446]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* =================================================================== */}
        {/* CARD FOREGROUND CONTENT                                             */}
        {/* =================================================================== */}

        {/* Card Top Row: Official Bank Logo + Green Check "Active & Verified" Badge (ZERO DOTS) */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Official NemiCapital Bank Logo (Replaced N box) */}
            <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
              <Image
                src={ASSETS.logos.main}
                alt="NemiCapital Bank Logo"
                width={32}
                height={32}
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <div>
              <span className="font-poppins font-bold text-xs sm:text-[13px] tracking-[0.24em] text-white uppercase block leading-none">
                NemiCapital
              </span>
              <span className="text-[8.5px] font-semibold text-white/75 uppercase tracking-[0.2em] block mt-1">
                Private Wealth
              </span>
            </div>
          </div>

          {/* User Mandate: Green Checkmark Badge with ZERO DOTS */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 shadow-2xs backdrop-blur-md">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide">Active & Verified</span>
          </div>
        </div>

        {/* Middle Row: Gold Smart Chip & Contactless Wave */}
        <div className="relative z-20 my-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* Detailed Gold EMV Microchip */}
            <div className="relative w-10.5 h-7.5 rounded-md bg-gradient-to-br from-[#FFE082] via-[#FFCA28] to-[#FF8F00] border border-amber-200/90 shadow-inner flex items-center justify-center p-0.5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/40 pointer-events-none" />
              <div className="w-full h-full border border-amber-900/35 rounded-xs grid grid-cols-3 gap-0.5 relative z-10">
                <div className="border-r border-amber-900/30" />
                <div className="border-r border-amber-900/30" />
                <div />
              </div>
            </div>

            {/* Contactless Wave SVG */}
            <svg className="w-4.5 h-4.5 text-white/75" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0M11 12a1.5 1.5 0 0 1 2 0" />
            </svg>
          </div>

          <span className="text-[9.5px] font-mono tracking-[0.2em] text-white/60 uppercase font-semibold">
            DEBIT / TIER 1
          </span>
        </div>

        {/* Hero 10-Digit Account Number Glass Box with 1-Click Copy (from Screenshot 1) */}
        <div className="relative z-20 my-1 bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[8.5px] uppercase tracking-widest text-gray-400 block font-semibold mb-0.5">
              Account Number
            </span>
            <span className="font-mono text-base sm:text-lg font-bold tracking-[0.22em] text-white">
              {accountDetails?.account_number?.match(/.{1,4}/g)?.join(' ') || '1048 2910 29'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(accountDetails?.account_number || '1048291029', 'acc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            {copiedField === 'acc' ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Card Bottom Grid: Cardholder, Routing ABA, Opening Balance */}
        <div className="relative z-20 pt-1 grid grid-cols-3 gap-2 border-t border-white/10 text-[10px]">
          {/* Cardholder */}
          <div>
            <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-semibold">
              Cardholder
            </span>
            <span className="font-poppins font-semibold text-white truncate block text-[11px]">
              {cardHolderName}
            </span>
          </div>

          {/* Routing ABA */}
          <div>
            <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-semibold">
              Routing (ABA)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-white text-[11px] font-semibold">{accountDetails?.routing_number || '021000021'}</span>
              <button
                type="button"
                onClick={() => handleCopy(accountDetails?.routing_number || '021000021', 'rout')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                aria-label="Copy routing number"
              >
                {copiedField === 'rout' ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Opening Balance */}
          <div className="text-right">
            <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-semibold">
              Balance
            </span>
            <span className="font-poppins font-bold text-emerald-400 text-[11px]">
              $0.00 USD
            </span>
          </div>
        </div>
      </div>

      {/* Account Highlights Strip (All Green Checks, ZERO DOTS) */}
      <div className="grid grid-cols-3 gap-2 text-[10.5px] text-gray-600">
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-1.5 text-center">
          <span className="text-emerald-600 font-bold text-xs">✓</span>
          <span className="font-medium text-[#1A1818] text-[10.5px]">FDIC Insured</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-1.5 text-center">
          <span className="text-emerald-600 font-bold text-xs">✓</span>
          <span className="font-medium text-[#1A1818] text-[10.5px]">4.85% APY</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-1.5 text-center">
          <span className="text-emerald-600 font-bold text-xs">✓</span>
          <span className="font-medium text-[#1A1818] text-[10.5px]">Zero Wire Fees</span>
        </div>
      </div>

      {/* Direct Redirect to Dashboard Button (No Arrow) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          Enter Banking Dashboard
        </button>
      </div>
    </div>
  );
};
