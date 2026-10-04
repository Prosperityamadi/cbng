'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { ASSETS } from '@/core';
import { BrandLogo } from '@/components/navigation/BrandLogo';
import { Step3KycProfile } from './Step3KycProfile';
import { Step4SecurityPin } from './Step4SecurityPin';
import { AuthService } from '@/core/services/auth.service';

export const RegisterPageView: React.FC = () => {
  // Multi-Step UI State:
  // 1 = Account Credentials, 2 = Verify Email OTP, 3 = KYC Profile, 4 = Security PIN & Provisioning
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pinSubStep, setPinSubStep] = useState<'enter_pin' | 'confirm_pin' | 'account_created'>('enter_pin');

  // =========================================================================
  // STEP 1: Quick Credentials Form Data
  // =========================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Validation & Shake States for Step 1
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    password?: string;
    terms?: string;
  }>({});

  const [shakingFields, setShakingFields] = useState<{
    email?: boolean;
    phone?: boolean;
    password?: boolean;
    terms?: boolean;
  }>({});

  // =========================================================================
  // STEP 2: Email OTP State (Strict Sequential Input)
  // =========================================================================
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpShaking, setIsOtpShaking] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // User Full Name captured from Step 3
  const [userFullName, setUserFullName] = useState('Sarah Jenkins');

  // Trigger shake animation on Step 1 fields
  const triggerShake = (fields: Array<'email' | 'phone' | 'password' | 'terms'>) => {
    const nextShaking = { ...shakingFields };
    fields.forEach((f) => {
      nextShaking[f] = true;
    });
    setShakingFields(nextShaking);

    setTimeout(() => {
      setShakingFields((prev) => {
        const reset = { ...prev };
        fields.forEach((f) => {
          reset[f] = false;
        });
        return reset;
      });
    }, 450);
  };

  // Countdown timer for OTP resend (Step 2)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Auto-focus OTP input on Step 2 entrance
  useEffect(() => {
    if (step === 2 && !isVerifiedSuccess) {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step, isVerifiedSuccess]);

  // Live Input Validation Checks (Step 1)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 7;

  // Real-time Password Security Criteria Checklist
  const passwordCriteria = {
    hasMinLen: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    const score = Object.values(passwordCriteria).filter(Boolean).length;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: '' };
    }
  };

  const passwordStrength = getPasswordStrength();
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const toShake: Array<'email' | 'phone' | 'password' | 'terms'> = [];

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
      toShake.push('email');
    } else if (!isEmailValid) {
      newErrors.email = 'Please enter a valid email address.';
      toShake.push('email');
    }

    if (!phone || phoneDigits.length <= 1) {
      newErrors.phone = 'Phone number is required.';
      toShake.push('phone');
    } else if (!isPhoneValid) {
      newErrors.phone = 'Please enter a complete phone number.';
      toShake.push('phone');
    }

    if (!password) {
      newErrors.password = 'Password is required.';
      toShake.push('password');
    } else if (!isPasswordValid) {
      newErrors.password = 'Password must meet all 4 security criteria below.';
      toShake.push('password');
    }

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions.';
      toShake.push('terms');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake(toShake);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await AuthService.registerIntent({
        email,
        password,
        phone_number: phone,
        terms_accepted: termsAccepted,
        privacy_policy_accepted: termsAccepted
      });
      setIsLoading(false);
      setOtp('');
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      setIsLoading(false);
      setErrors({ email: err.message || 'Registration failed' });
      triggerShake(['email']);
    }
  };

  // Step 2 OTP Submit
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 450);
      return;
    }

    setOtpError(null);
    setIsVerifying(true);

    try {
      const response = await AuthService.verifyOtp({ email, otp_code: otp });
      if (response.onboarding_token) {
        localStorage.setItem('onboarding_token', response.onboarding_token);
      }
      setIsVerifying(false);
      setIsVerifiedSuccess(true);
    } catch (err: any) {
      setIsVerifying(false);
      setOtpError(err.message || 'Invalid verification code.');
      setIsOtpShaking(true);
      setTimeout(() => setIsOtpShaking(false), 450);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setOtpError(null);
    try {
      const response = await AuthService.resendOtp({ email });
      setResendTimer(response.expires_in || 300);
      setOtp('');
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 50);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <main className="h-screen max-h-screen w-full bg-white flex flex-col lg:flex-row antialiased font-roboto selection:bg-[#B81446]/10 selection:text-[#B81446] overflow-x-hidden overflow-y-auto">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Multi-Step Registration Wizard (Steps 1 -> 4)                */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-full lg:h-full flex flex-col justify-between px-6 sm:px-10 md:px-12 lg:px-10 xl:px-14 py-3 sm:py-4.5 bg-white z-10 overflow-y-auto">
        {/* Top Header: Brand Logo & Home Link */}
        <div className="w-full flex items-center justify-between">
          <BrandLogo variant="dark" compact={true} />

          <Link
            href="/"
            className="text-xs font-semibold text-[#1A1818] hover:text-[#B81446] transition-all flex items-center gap-1.5 group py-1.5 px-3 rounded-xl hover:bg-gray-50 border border-gray-100 shadow-2xs"
            aria-label="Return to Home"
          >
            <div className="relative w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Image
                src={ASSETS.icons.home}
                alt="Home"
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span className="font-poppins font-medium tracking-tight">Home</span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className={`w-full mx-auto my-auto py-1 ${step === 3 ? 'max-w-[460px]' : 'max-w-[420px]'}`}>
          {/* Progress Step Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              <span className="text-[#B81446]">
                {step === 1 && 'Step 1 of 4: Account Credentials'}
                {step === 2 && 'Step 2 of 4: Email Verification'}
                {step === 3 && 'Step 3 of 4: KYC Profile & Identity'}
                {step === 4 && (
                  pinSubStep === 'enter_pin'
                    ? 'Step 4 of 4: Set Security PIN'
                    : pinSubStep === 'confirm_pin'
                    ? 'Step 4 of 4: Confirm Security PIN'
                    : 'Step 4 of 4: Account Active'
                )}
              </span>
              <span className="text-gray-400 font-normal">
                {step === 1 && 'Next: Verify Email'}
                {step === 2 && 'Next: KYC Profile'}
                {step === 3 && 'Next: Security PIN'}
                {step === 4 && (pinSubStep === 'enter_pin' ? 'Next: Confirm PIN' : 'Complete')}
              </span>
            </div>

            {/* Stepper Progress Bar (4 Segments) */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step >= 1 ? 'w-1/4 bg-[#B81446]' : 'w-1/4 bg-gray-200'
                }`}
              />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step >= 2 ? 'w-1/4 bg-[#B81446]' : 'w-1/4 bg-gray-200'
                }`}
              />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step >= 3 ? 'w-1/4 bg-[#B81446]' : 'w-1/4 bg-gray-200'
                }`}
              />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step >= 4 ? 'w-1/4 bg-[#B81446]' : 'w-1/4 bg-gray-200'
                }`}
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* STEP 1: Quick Credentials Form with Custom UI Shake & Red Border      */}
          {/* ===================================================================== */}
          {step === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <div className="mb-3.5">
                <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
                  Open an Account
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-normal leading-relaxed">
                  Join NemiCapital private banking in under 3 minutes.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} noValidate className="space-y-2.5 sm:space-y-3">
                {/* Email Input */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                      Email Address
                    </label>
                    {email && !errors.email && (
                      <span
                        className={`text-[10px] font-medium ${
                          isEmailValid ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        {isEmailValid ? '✓ Valid format' : 'Enter valid email'}
                      </span>
                    )}
                  </div>
                  <div className={`relative rounded-xl shadow-xs ${shakingFields.email ? 'animate-shake' : ''}`}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-800">
                      <svg
                        className={`w-3.5 h-3.5 ${errors.email ? 'text-red-500' : 'text-gray-800'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className={`w-full ${
                        errors.email
                          ? 'bg-red-50/20 border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'bg-[#F8F9FA] hover:bg-[#F3F4F6] focus:bg-white border-gray-200/60 focus:border-[#B81446] focus:ring-[#B81446]/10'
                      } border rounded-xl pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all duration-200`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number Input */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label htmlFor="phone" className="block text-xs font-semibold text-gray-700">
                      Phone Number
                    </label>
                    {phone && !errors.phone && (
                      <span
                        className={`text-[10px] font-medium ${
                          isPhoneValid ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        {isPhoneValid ? '✓ Valid format' : 'Enter complete number'}
                      </span>
                    )}
                  </div>
                  <div className={`relative rounded-xl shadow-xs ${shakingFields.phone ? 'animate-shake' : ''}`}>
                    <PhoneInput
                      defaultCountry="us"
                      value={phone}
                      onChange={(phoneVal) => {
                        setPhone(phoneVal);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      inputClassName={`!w-full ${
                        errors.phone
                          ? '!bg-red-50/20 !border-red-500 focus:!border-red-500 focus:!ring-red-500/20'
                          : '!bg-[#F8F9FA] hover:!bg-[#F3F4F6] focus:!bg-white !border-gray-200/60 focus:!border-[#B81446] focus:!ring-[#B81446]/10'
                      } !border !rounded-r-xl !py-2 sm:!py-2.5 !text-xs sm:!text-sm !text-[#1A1818] placeholder:!text-gray-400 focus:!outline-none focus:!ring-4 !transition-all !duration-200 !h-auto !font-roboto`}
                      countrySelectorStyleProps={{
                        buttonClassName: `${
                          errors.phone
                            ? '!bg-red-50/20 !border-red-500'
                            : '!bg-[#F8F9FA] hover:!bg-[#F3F4F6] !border-gray-200/60'
                        } !border !border-r-0 !rounded-l-xl !px-2.5 !h-auto !py-2 sm:!py-2.5 !transition-all !duration-200 flex items-center gap-1`,
                        dropdownStyleProps: {
                          className:
                            '!bg-white !rounded-xl !shadow-2xl !border !border-gray-200 !text-xs !z-50 !font-roboto !max-h-56 !overflow-y-auto',
                        },
                      }}
                      className="w-full flex"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                      Choose Password
                    </label>
                    {password && !errors.password && (
                      <span
                        className={`text-[10px] font-semibold ${
                          passwordStrength.score >= 4 ? 'text-emerald-600' : 'text-gray-500'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className={`relative rounded-xl shadow-xs ${shakingFields.password ? 'animate-shake' : ''}`}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-800">
                      <svg
                        className={`w-3.5 h-3.5 ${errors.password ? 'text-red-500' : 'text-gray-800'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="Enter strong password"
                      className={`w-full ${
                        errors.password
                          ? 'bg-red-50/20 border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'bg-[#F8F9FA] hover:bg-[#F3F4F6] focus:bg-white border-gray-200/60 focus:border-[#B81446] focus:ring-[#B81446]/10'
                      } border rounded-xl pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all duration-200`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* 4-Line Strength Progress Bar */}
                  <div className="mt-1 flex gap-1 w-full">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* 4-Requirement Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[10px]">
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${
                        passwordCriteria.hasMinLen
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 font-semibold'
                          : 'bg-gray-50/70 border-gray-100 text-gray-500 font-normal'
                      }`}
                    >
                      <span className={passwordCriteria.hasMinLen ? 'text-emerald-600 font-bold' : 'text-gray-300'}>
                        {passwordCriteria.hasMinLen ? '✓' : '○'}
                      </span>
                      <span>8+ characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${
                        passwordCriteria.hasUpper
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 font-semibold'
                          : 'bg-gray-50/70 border-gray-100 text-gray-500 font-normal'
                      }`}
                    >
                      <span className={passwordCriteria.hasUpper ? 'text-emerald-600 font-bold' : 'text-gray-300'}>
                        {passwordCriteria.hasUpper ? '✓' : '○'}
                      </span>
                      <span>Uppercase (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${
                        passwordCriteria.hasNumber
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 font-semibold'
                          : 'bg-gray-50/70 border-gray-100 text-gray-500 font-normal'
                      }`}
                    >
                      <span className={passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-300'}>
                        {passwordCriteria.hasNumber ? '✓' : '○'}
                      </span>
                      <span>Number (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${
                        passwordCriteria.hasSpecial
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 font-semibold'
                          : 'bg-gray-50/70 border-gray-100 text-gray-500 font-normal'
                      }`}
                    >
                      <span className={passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : 'text-gray-300'}>
                        {passwordCriteria.hasSpecial ? '✓' : '○'}
                      </span>
                      <span>Symbol (!@#$%)</span>
                    </div>
                  </div>

                  {errors.password && (
                    <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className={`pt-0.5 pb-0.5 ${shakingFields.terms ? 'animate-shake' : ''}`}>
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                      }}
                      className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-[#B81446] focus:ring-[#B81446] cursor-pointer accent-[#B81446]"
                    />
                    <span className={`text-[11px] sm:text-xs ${errors.terms ? 'text-red-600 font-medium' : 'text-gray-600'} leading-normal`}>
                      I certify I am at least 18 years old and agree to the{' '}
                      <Link href="/about" className="text-[#1A1818] font-semibold underline hover:text-[#B81446]">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link href="/about" className="text-[#1A1818] font-semibold underline hover:text-[#B81446]">
                        Privacy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.terms}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-2.5 sm:py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Verification OTP...</span>
                    </>
                  ) : (
                    <span>Continue to Verification</span>
                  )}
                </button>
              </form>

              {/* Already have an account? */}
              <div className="mt-3.5 text-center">
                <p className="text-xs text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#1A1818] hover:text-[#B81446] underline underline-offset-4 transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: Email OTP Verification (Centered Mail Icon, Clean, No Alerts) */}
          {/* ===================================================================== */}
          {step === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              {isVerifiedSuccess ? (
                <div className="w-full max-w-[420px] mx-auto py-5 sm:py-6 px-4 text-center space-y-4 animate-fadeIn">
                  {/* SVG Animated Checkmark with Surrounding Sparkles */}
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    {[
                      { dx: '0px', dy: '-36px', color: '#10B981', size: 'w-2 h-2' },
                      { dx: '26px', dy: '-26px', color: '#F59E0B', size: 'w-2.5 h-2.5' },
                      { dx: '36px', dy: '0px', color: '#B81446', size: 'w-2 h-2' },
                      { dx: '26px', dy: '26px', color: '#10B981', size: 'w-2 h-2' },
                      { dx: '0px', dy: '36px', color: '#38BDF8', size: 'w-2.5 h-2.5' },
                      { dx: '-26px', dy: '26px', color: '#F59E0B', size: 'w-2 h-2' },
                      { dx: '-36px', dy: '0px', color: '#B81446', size: 'w-2.5 h-2.5' },
                      { dx: '-26px', dy: '-26px', color: '#34D399', size: 'w-2 h-2' },
                      { dx: '14px', dy: '-34px', color: '#06B6D4', size: 'w-1.5 h-1.5' },
                      { dx: '-14px', dy: '34px', color: '#EC4899', size: 'w-1.5 h-1.5' },
                    ].map((p, i) => (
                      <span
                        key={i}
                        style={
                          {
                            '--dx': p.dx,
                            '--dy': p.dy,
                            backgroundColor: p.color,
                          } as React.CSSProperties
                        }
                        className={`absolute rounded-full pointer-events-none animate-sparkle ${p.size}`}
                      />
                    ))}

                    <svg
                      className="w-20 h-20 overflow-visible"
                      viewBox="0 0 80 80"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="40" cy="40" r="34" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" className="animate-draw-circle" />
                      <circle cx="40" cy="40" r="34" fill="#10B981" className="animate-pop-green-bg" />
                      <path d="M25 41L35 51L55 29" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
                    </svg>
                  </div>

                  <div className="space-y-1 animate-fadeInUp">
                    <h3 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight">
                      Email Successfully Verified!
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                      Verification successful. You can now safely enter your identity profile.
                    </p>
                  </div>

                  <div className="pt-2 animate-fadeInUp">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Continue to KYC Identity
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#B81446] mb-3 transition-colors cursor-pointer"
                  >
                    <span>Change email or phone</span>
                  </button>

                  <div className="text-center mb-4 sm:mb-5">
                    <div className="relative w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                      <Image
                        src={ASSETS.icons.mail}
                        alt="Mail Verification"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
                      Verify your email
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 font-normal leading-relaxed max-w-xs mx-auto">
                      We sent a 6-digit verification code to{' '}
                      <span className="font-semibold text-[#1A1818]">{email || 'your email'}</span>.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
                    <div
                      onClick={() => otpInputRef.current?.focus()}
                      className={`relative flex justify-between gap-1.5 sm:gap-2 cursor-pointer select-none ${
                        isOtpShaking ? 'animate-shake' : ''
                      }`}
                    >
                      <input
                        ref={otpInputRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(cleanDigits);
                          if (otpError) setOtpError(null);
                        }}
                        onFocus={() => setIsOtpFocused(true)}
                        onBlur={() => setIsOtpFocused(false)}
                        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        aria-label="6-digit verification code"
                      />

                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const digit = otp[idx] || '';
                        const isCurrentActive =
                          isOtpFocused && (idx === otp.length || (idx === 5 && otp.length === 6));

                        return (
                          <div
                            key={idx}
                            className={`w-11 sm:w-13 h-12 sm:h-14 flex items-center justify-center font-poppins font-bold text-lg sm:text-xl rounded-xl border transition-all duration-200 ${
                              otpError
                                ? 'border-red-500 bg-red-50/20 text-red-600 ring-2 ring-red-500/20'
                                : isCurrentActive
                                ? 'border-[#B81446] bg-white ring-4 ring-[#B81446]/15 shadow-xs'
                                : digit
                                ? 'border-[#B81446] bg-white text-[#B81446] shadow-xs'
                                : 'border-gray-200 bg-[#F8F9FA] text-[#1A1818]'
                            }`}
                          >
                            {digit ? (
                              <span className="text-[#B81446] animate-scaleUp">{digit}</span>
                            ) : isCurrentActive ? (
                              <span className="w-0.5 h-6 bg-[#B81446] animate-pulse rounded-full" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {otpError && (
                      <p className="text-[11px] font-medium text-red-600 text-center flex items-center justify-center gap-1 animate-fadeIn">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{otpError}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-500">
                        {resendTimer > 0 ? (
                          <>
                            Resend code in <span className="font-semibold text-[#1A1818]">{resendTimer}s</span>
                          </>
                        ) : (
                          'Code expired'
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendTimer > 0}
                        className={`font-semibold transition-colors cursor-pointer ${
                          resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#B81446] hover:underline'
                        }`}
                      >
                        Resend Code
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-2.5 sm:py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-1"
                    >
                      {isVerifying ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Validating verification code...</span>
                        </>
                      ) : (
                        <span>Verify Code & Continue</span>
                      )}
                    </button>


                  </form>
                </>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 3: KYC Profile & Document Upload (Modular Component)             */}
          {/* ===================================================================== */}
          {step === 3 && (
            <Step3KycProfile
              onSuccess={(data) => {
                setUserFullName(`${data.firstName} ${data.lastName}`);
                setStep(4);
              }}
              onBackToVerification={() => setStep(2)}
            />
          )}

          {/* ===================================================================== */}
          {/* STEP 4: Transaction PIN & Account Creation (Modular Component)        */}
          {/* ===================================================================== */}
          {step === 4 && (
            <Step4SecurityPin
              userFullName={userFullName}
              onBackToKyc={() => setStep(3)}
              onPinSubStepChange={(sub) => setPinSubStep(sub)}
            />
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="w-full pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <p>© All rights reserved by NemiCapital International Bank.</p>
          <div className="flex gap-3">
            <Link href="/about" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-gray-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Contextual Visual Experience & Bank Perks                   */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 h-full max-h-screen relative overflow-hidden flex-col justify-between p-6 xl:p-10 bg-gradient-to-br from-[#800A2C] via-[#5A0620] to-[#2B030E] text-white">
        {/* Background Geometric Vector Accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-8 right-8 w-36 h-36 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div
            className="absolute bottom-8 left-8 w-36 h-36 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="absolute top-12 left-10 w-12 h-12 bg-white/10 rounded-tl-full border-t border-l border-white/20" />
          <div className="absolute top-20 left-16 w-8 h-8 bg-[#B81446]/40 rounded-br-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] bg-[#B81446]/25 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/80">
          <span className="font-poppins font-semibold uppercase tracking-widest text-[10px] text-[#F7F1EB]/75">
            {step === 3
              ? 'Identity & Regulatory Compliance'
              : step === 4
              ? 'Instant Account Provisioning'
              : 'Private Banking Experience'}
          </span>
          <span className="text-[10px] text-white/60 font-medium">
            NemiCapital Global
          </span>
        </div>

        {/* Center: Contextual 3D Showcase Graphics */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center max-w-[320px] xl:max-w-[360px] mx-auto w-full">
          <div className="relative w-full aspect-square rounded-[26px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 bg-[#1F040C] group">
            <Image
              src={
                step === 3
                  ? ASSETS.images.login3dVaultSecurity
                  : step === 4
                  ? ASSETS.images.login3dCardPayment
                  : ASSETS.images.register3dWelcome
              }
              alt="NemiCapital Private Banking Visual Experience"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Ambient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Floating Overlay Badge: Bottom Left */}
            <div className="absolute bottom-3.5 left-3.5 bg-white text-[#1A1818] p-2.5 rounded-2xl shadow-xl border border-gray-100 z-20 min-w-[155px]">
              {step === 3 ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818]">
                      256-Bit Vault
                    </span>
                    <span className="text-[9.5px] font-semibold text-emerald-600">Encrypted</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5 leading-tight">
                    Supabase Storage Security
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                    <span>✓ KYC Verification Guard</span>
                  </div>
                </>
              ) : step === 4 ? (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818]">
                      Metal Card Ready
                    </span>
                    <span className="text-[9.5px] font-semibold text-emerald-600">Active</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5 leading-tight">
                    Zero Global Wire Fees
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                    <span>✓ 10-Digit ABA Provisioned</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-poppins font-bold text-xs sm:text-sm text-[#1A1818]">
                      $0 Opening Fee
                    </span>
                    <span className="text-[9.5px] font-semibold text-emerald-600">Free</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5 leading-tight">
                    Instant Metal Debit Card Included
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                    <span>✓ Active Tier 1 Access</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: 3 Key Account Perks */}
        <div className="relative z-10 pt-3 pb-1 max-w-md mx-auto w-full">
          <h4 className="font-poppins font-semibold text-xs sm:text-sm text-white/95 uppercase tracking-wider mb-2 text-center">
            {step === 3 ? 'Bank Compliance Standards:' : 'What your account includes:'}
          </h4>
          <div className="grid grid-cols-3 gap-2 text-[10.5px] text-white/85 text-center">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-emerald-400 font-bold mb-0.5">✓</span>
              <span>{step === 3 ? 'FDIC Insured to $250k' : 'USD, EUR, GBP Accounts'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-emerald-400 font-bold mb-0.5">✓</span>
              <span>{step === 3 ? '256-Bit Encryption' : '4.85% APY High-Yield'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-emerald-400 font-bold mb-0.5">✓</span>
              <span>{step === 3 ? 'FINRA & SEC Standards' : 'Zero Global Wire Fees'}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
