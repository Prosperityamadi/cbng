'use client';

import React, { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';
import { useOnboardingStore } from '@/core/stores/onboarding.store';

export const RegisterStep1 = () => {
  const { registerIntent, isLoading, error } = useOnboardingStore();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Validation states
  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isFormValid = email && phone && phone.length > 5 && isLengthValid && hasUppercase && hasNumber && hasSymbol && termsAccepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    await registerIntent({
      email,
      phone_number: phone,
      password,
      terms_accepted: termsAccepted,
      privacy_policy_accepted: termsAccepted,
    });
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-semibold mb-3">
          <span className="text-primary-crimson uppercase tracking-wider">Step 1 of 4: Account Credentials</span>
          <span className="text-[#9C958F] uppercase tracking-wider">Next: Verify Email</span>
        </div>
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 flex-1 bg-primary-crimson rounded-full"></div>
          <div className="h-1.5 flex-1 bg-[#F4EFEA] rounded-full"></div>
          <div className="h-1.5 flex-1 bg-[#F4EFEA] rounded-full"></div>
          <div className="h-1.5 flex-1 bg-[#F4EFEA] rounded-full"></div>
        </div>
        <h1 className="font-poppins text-[32px] leading-tight font-bold text-[#1A1818] mb-2">Open an Account</h1>
        <p className="text-[#5C5652] text-[15px]">Join NemiCapital private banking in under 3 minutes.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start">
          <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1A1818] mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Image src={ASSETS.icons.mail} alt="Email" width={18} height={18} className="opacity-40" />
            </div>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-[#FCFAF7] border border-[#E5DCD2] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-crimson focus:border-transparent transition-all placeholder:text-[#9C958F]"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1A1818] mb-2 flex justify-between">
            <span>Phone Number</span>
            <span className="text-[#9C958F] font-normal">Enter complete number</span>
          </label>
          <PhoneInput
            defaultCountry="us"
            value={phone}
            onChange={(phone) => setPhone(phone)}
            inputClassName="!w-full !py-3.5 !text-[15px] !bg-[#FCFAF7] !border-[#E5DCD2] !rounded-r-xl !border-l-0 focus:!ring-2 focus:!ring-primary-crimson focus:!border-transparent transition-all placeholder:!text-[#9C958F]"
            countrySelectorStyleProps={{
              buttonClassName: "!py-3.5 !px-3.5 !bg-[#FCFAF7] !border-[#E5DCD2] !rounded-l-xl focus:!ring-2 focus:!ring-primary-crimson focus:!border-transparent transition-all"
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1A1818] mb-2">Choose Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-[18px] h-[18px] text-[#1A1818]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full pl-11 pr-11 py-3.5 bg-white border ${password ? 'border-primary-crimson shadow-[0_0_0_3px_rgba(184,20,70,0.1)]' : 'border-[#E5DCD2]'} rounded-xl text-[15px] focus:outline-none transition-all placeholder:text-[#9C958F]`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9C958F] hover:text-[#5C5652]"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          
          {/* Password Checks */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`flex items-center text-[11px] py-1.5 px-3 rounded-lg border ${isLengthValid ? 'border-transparent text-[#5A0620] bg-red-50' : 'border-[#E5DCD2] text-[#9C958F] bg-[#FCFAF7]'}`}>
              <span className="mr-1.5 font-bold">{isLengthValid ? '✓' : '○'}</span> 8+ characters
            </div>
            <div className={`flex items-center text-[11px] py-1.5 px-3 rounded-lg border ${hasUppercase ? 'border-transparent text-[#5A0620] bg-red-50' : 'border-[#E5DCD2] text-[#9C958F] bg-[#FCFAF7]'}`}>
              <span className="mr-1.5 font-bold">{hasUppercase ? '✓' : '○'}</span> Uppercase (A-Z)
            </div>
            <div className={`flex items-center text-[11px] py-1.5 px-3 rounded-lg border ${hasNumber ? 'border-transparent text-[#5A0620] bg-red-50' : 'border-[#E5DCD2] text-[#9C958F] bg-[#FCFAF7]'}`}>
              <span className="mr-1.5 font-bold">{hasNumber ? '✓' : '○'}</span> Number (0-9)
            </div>
            <div className={`flex items-center text-[11px] py-1.5 px-3 rounded-lg border ${hasSymbol ? 'border-transparent text-[#5A0620] bg-red-50' : 'border-[#E5DCD2] text-[#9C958F] bg-[#FCFAF7]'}`}>
              <span className="mr-1.5 font-bold">{hasSymbol ? '✓' : '○'}</span> Symbol (!@#$%)
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <input 
            id="terms" 
            type="checkbox" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-[18px] h-[18px] text-primary-crimson border-gray-300 rounded focus:ring-primary-crimson cursor-pointer" 
          />
          <label htmlFor="terms" className="ml-2.5 text-[14px] text-[#5C5652] leading-relaxed select-none">
            I certify I am at least 18 years old and agree to the <Link href="/terms" className="font-semibold text-[#1A1818] underline underline-offset-4 decoration-gray-300 hover:decoration-primary-crimson transition-colors">Terms</Link> and <Link href="/privacy" className="font-semibold text-[#1A1818] underline underline-offset-4 decoration-gray-300 hover:decoration-primary-crimson transition-colors">Privacy</Link>.
          </label>
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          disabled={!isFormValid || isLoading}
          className={`w-full mt-2 py-4 rounded-xl text-white font-semibold text-[15px] shadow-lg transition-all flex justify-center items-center ${isFormValid ? 'bg-primary-crimson hover:bg-[#9C113D] shadow-primary-crimson/20 hover:shadow-primary-crimson/40 hover:-translate-y-0.5' : 'bg-[#E5DCD2] text-[#9C958F] cursor-not-allowed shadow-none'}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Continue to Verification'}
        </button>

        {/* Login Link */}
        <div className="text-center mt-6 pt-2">
          <span className="text-[#5C5652] text-[14px]">Already have an account? </span>
          <Link href="/login" className="text-[#1A1818] text-[14px] font-bold underline underline-offset-4 hover:text-primary-crimson transition-colors">Log in</Link>
        </div>
      </form>
    </div>
  );
};
