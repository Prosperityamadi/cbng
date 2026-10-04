'use client';

import React, { useEffect, useState } from 'react';
import { ProfileService, UserProfileData } from '@/core/services/profile.service';

export default function GeneralInfoPage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        setError('No active session found. Please sign in.');
        return;
      }
      
      try {
        const data = await ProfileService.getProfile(token);
        setProfile(data);
        setPhone(data.phone_number || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data securely.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthenticated');
      
      await ProfileService.updateProfile(token, { phone_number: phone });
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#B81446]/20 border-t-[#B81446] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading profile context...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    const isAuthError = error.toLowerCase().includes('expired') || 
                        error.toLowerCase().includes('unauthorized') || 
                        error.toLowerCase().includes('session') ||
                        error.toLowerCase().includes('unauthenticated') ||
                        error.toLowerCase().includes('token');

    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="p-6 bg-red-50/70 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-red-700">
            <svg className="w-6 h-6 shrink-0 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-sm">
                {isAuthError ? 'Authentication Session Expired' : 'Failed to load profile data'}
              </p>
              <p className="text-xs text-red-600/80 mt-0.5">
                {isAuthError 
                  ? 'Your banking session has expired. Please sign in again to access your secure client details.' 
                  : (error || 'Failed to load profile data securely.')}
              </p>
            </div>
          </div>
          {isAuthError && (
            <a
              href="/login"
              className="shrink-0 bg-[#B81446] hover:bg-[#9a103a] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Sign In Again
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION: Identity (Read-Only) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-white rounded-bl-full border-l border-b border-gray-50/50 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-xl font-poppins font-bold text-gray-900 flex items-center gap-2">
              Verified Identity
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </h2>
            <p className="text-sm text-gray-500 mt-1">These details are locked by KYC compliance. Contact support to amend.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Legal First Name</label>
              <div className="relative bg-gray-50/50 border border-gray-200/60 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-sm font-semibold text-gray-600">{profile.first_name || '—'}</span>
              </div>
            </div>
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Legal Last Name</label>
              <div className="relative bg-gray-50/50 border border-gray-200/60 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-sm font-semibold text-gray-600">{profile.last_name || '—'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Address</label>
            <div className="relative bg-gray-50/50 border border-gray-200/60 rounded-2xl px-5 py-3.5 flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-sm font-medium leading-relaxed text-gray-600 max-w-lg">
                {`${profile.street_address || ''}, ${profile.city || ''}, ${profile.state || ''} ${profile.postal_code || ''}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Contact Preferences (Editable) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-poppins font-bold text-gray-900">Contact Details</h2>
            <p className="text-sm text-gray-500 mt-1">Manage where we send alerts and communications.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-red-100/50">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium flex items-center gap-3 border border-emerald-100/50">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Email</label>
              <div className="relative bg-gray-50/50 border border-gray-200/60 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-sm font-semibold text-gray-600">{profile.email}</span>
                {profile.is_email_verified && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">VERIFIED</span>
                )}
              </div>
            </div>

            <div className="group">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 group-focus-within:text-[#B81446] transition-colors">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#B81446] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B81446]/10 focus:border-[#B81446] transition-all shadow-xs" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Updates to contact details take effect immediately.</p>
            <button 
              type="submit" 
              disabled={isSaving || phone === profile.phone_number}
              className="bg-[#151214] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-black hover:shadow-lg hover:shadow-black/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
