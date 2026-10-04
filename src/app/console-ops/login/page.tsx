'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ASSETS } from '@/core';
import { AdminService } from '@/core/services/admin.service';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AdminService.loginAdmin({
        email: email.trim(),
        password,
      });

      // Save tokens
      localStorage.setItem('admin_access_token', res.access_token);
      localStorage.setItem('admin_role', res.role);
      localStorage.setItem('admin_email', res.email);

      router.push('/console-ops');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrative credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B0C] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B81446]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Monogram / Brand */}
      <div className="text-center mb-8 relative z-10">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <Image
            src={ASSETS.logos.main}
            alt="NemiCapital Bank"
            width={160}
            height={50}
            className="h-10 w-auto object-contain brightness-0 invert mx-auto"
          />
        </Link>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Executive Administration Console</span>
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-[#161315] border border-white/15 rounded-3xl p-8 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative z-10">
        <div className="mb-6 text-center">
          <h1 className="font-serif font-bold text-2xl text-white tracking-tight">
            Administrator Clearance
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in with authorized administrative credentials to manage private clients.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nemicapital.com"
              className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Master Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1F1B1D] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446] transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#B81446] hover:bg-[#9B103B] disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? 'Verifying Clearance...' : 'Authenticate & Enter Portal'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>Need to provision admin?</span>
          <Link href="/console-ops/register" className="text-white hover:text-[#B81446] underline transition-colors font-medium">
            Register Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
