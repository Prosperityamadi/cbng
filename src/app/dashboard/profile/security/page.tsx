'use client';

import React, { useState } from 'react';
import { ProfileService } from '@/core/services/profile.service';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthenticated');
      
      await ProfileService.changePassword(token, currentPassword, newPassword);
      setPasswordSuccess('Account password was successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPin(true);
    setPinError('');
    setPinSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthenticated');
      
      await ProfileService.changePin(token, currentPin, newPin);
      setPinSuccess('Transaction PIN was successfully updated.');
      setCurrentPin('');
      setNewPin('');
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION: Password Change */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm9 13H6v-8h12v8z" /></svg>
        </div>

        <div className="relative z-10">
          <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-poppins font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-orange-50 items-center justify-center text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
          </div>
          
          {passwordError && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-red-100/50">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium flex items-center gap-3 border border-emerald-100/50">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 group-focus-within:text-[#B81446] transition-colors">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 focus:border-[#B81446] transition-all shadow-xs" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 group-focus-within:text-[#B81446] transition-colors">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 focus:border-[#B81446] transition-all shadow-xs" 
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Make sure it's at least 8 characters including a number and a symbol.</p>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSavingPassword || !currentPassword || newPassword.length < 8}
                className="bg-[#151214] text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#B81446] hover:shadow-lg hover:shadow-[#B81446]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isSavingPassword ? 'Verifying...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION: Transaction PIN */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M11 11h2v6h-2zm0-4h2v2h-2z" /></svg>
        </div>

        <div className="relative z-10">
          <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-poppins font-bold text-gray-900">Transaction PIN</h2>
              <p className="text-sm text-gray-500 mt-1">This 4-6 digit numeric PIN is required for all outgoing wire transfers.</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-indigo-50 items-center justify-center text-indigo-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            </div>
          </div>
          
          {pinError && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-red-100/50">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {pinError}
            </div>
          )}
          {pinSuccess && (
            <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium flex items-center gap-3 border border-emerald-100/50">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {pinSuccess}
            </div>
          )}

          <form onSubmit={handlePinChange} className="space-y-6 max-w-lg">
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 group-focus-within:text-[#B81446] transition-colors">Current PIN</label>
              <div className="relative">
                <input 
                  type="password" 
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin} 
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="••••"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-lg tracking-[0.5em] font-mono text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 focus:border-[#B81446] transition-all shadow-xs" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 group-focus-within:text-[#B81446] transition-colors">New PIN</label>
              <div className="relative">
                <input 
                  type="password" 
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                  minLength={4}
                  placeholder="••••"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-lg tracking-[0.5em] font-mono text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 focus:border-[#B81446] transition-all shadow-xs" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSavingPin || currentPin.length < 4 || newPin.length < 4}
                className="bg-[#151214] text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#B81446] hover:shadow-lg hover:shadow-[#B81446]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isSavingPin ? 'Verifying...' : 'Update Secure PIN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
