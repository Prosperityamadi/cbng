'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/core/store/auth.store';
import { ASSETS } from '@/core/assets';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, kyc } = useAuthStore();

  const navLinks = [
    {
      name: 'General Info',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Security & Access',
      href: '/dashboard/profile/security',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
  ];

  const [isUploading, setIsUploading] = React.useState(false);
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);
  const [imgError, setImgError] = React.useState(false);

  // Hydrate auth store on mount
  React.useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  // On mount or when user changes, set avatar from store
  React.useEffect(() => {
    if (user?.profile_picture_url) {
      setAvatarSrc(user.profile_picture_url);
      setImgError(false);
    }
  }, [user?.profile_picture_url]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately show the picked image using a local blob URL
    const localUrl = URL.createObjectURL(file);
    setAvatarSrc(localUrl);
    setImgError(false);

    setIsUploading(true);
    try {
      let token = localStorage.getItem('access_token');
      if (!token) throw new Error('Unauthenticated');

      const formData = new FormData();
      formData.append('file', file);

      let res = await fetch('/api/py/storage/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Handle 401 with transparent token refresh
      if (res.status === 401) {
        try {
          const refreshRes = await fetch('/api/py/auth/refresh', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.access_token) {
              const freshToken = refreshData.access_token as string;
              token = freshToken;
              localStorage.setItem('access_token', freshToken);
              res = await fetch('/api/py/storage/upload-avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${freshToken}` },
                body: formData
              });
            }
          }
        } catch {
          // Ignore and let error throw below
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Avatar upload failed:', res.status, errData);
        throw new Error(errData.detail || 'Upload failed');
      }
      
      // Update global store with the backend URL
      const data = await res.json();
      const backendUrl = `${data.url.split('?')[0]}?v=${Date.now()}`;
      setAvatarSrc(backendUrl);
      setImgError(false);

      useAuthStore.setState((state) => ({
        user: state.user 
          ? { ...state.user, profile_picture_url: backendUrl } 
          : ({ profile_picture_url: backendUrl } as any)
      }));

      // Synchronize entire user state from backend
      await useAuthStore.getState().hydrate();
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      // Revert to store avatar on error
      setAvatarSrc(user?.profile_picture_url || null);
      alert(`Failed to upload avatar: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Determine if we should show an image or the fallback SVG
  const showImage = avatarSrc && !imgError;

  return (
    <div className="max-w-6xl mx-auto w-full pt-2 pb-16">
      {/* Back to Dashboard Link */}
      <div className="mb-6 px-4 md:px-0">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#B81446] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* ========================================== */}
      {/* 1. PREMIUM HEADER BANNER                   */}
      {/* ========================================== */}
      <div className="relative w-full h-52 sm:h-56 md:h-64 rounded-3xl overflow-hidden mb-16 md:mb-20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
        {/* Abstract Dark Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1818] via-[#2A1820] to-[#5A0620]" />
        
        {/* Subtle Overlay Pattern */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\"%3E%3Cpath d=\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\"%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        {/* Decorative Light Flare */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-[#B81446] rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none" />
      </div>

      {/* Overlapping Profile Info Container */}
      <div className="relative -mt-36 sm:-mt-36 md:-mt-40 px-4 sm:px-6 md:px-12 mb-8 md:mb-12 z-10 flex flex-row items-end gap-3 sm:gap-6">
        {/* Circular Avatar */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-2xl bg-white flex-shrink-0 group cursor-pointer">
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handleAvatarUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isUploading}
          />
          
          <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
            {showImage ? (
              <img
                key={avatarSrc}
                src={avatarSrc}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            )}
          </div>

          {/* Upload Overlay */}
          <div className={`absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} z-10 pointer-events-none`}>
            {isUploading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-0.5 sm:mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
              </>
            )}
          </div>
          
          {/* Subtle inner ring */}
          <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none z-30" />
        </div>

        {/* Name & Account Type */}
        <div className="flex flex-col mb-1 sm:mb-2 min-w-0">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-poppins font-bold text-white drop-shadow-md tracking-tight truncate">
            {kyc?.first_name ? `${kyc.first_name} ${kyc.last_name}` : 'Client Profile'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 md:mt-3">
            <span className="inline-flex items-center px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
              {user?.status === 'active' ? 'Active Account' : 'Pending Verification'}
            </span>
            <span className="text-white/80 text-xs sm:text-sm font-medium">
              Member since {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. TWO-COLUMN LAYOUT                       */}
      {/* ========================================== */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 px-2 md:px-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="space-y-1 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="px-3 py-1.5 sm:px-4 sm:py-3 mb-1 sm:mb-2">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Settings Menu</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-[#B81446] text-white shadow-lg shadow-[#B81446]/20 transform scale-[1.02]'
                        : 'text-gray-600 hover:bg-[#FAF7F2] hover:text-gray-900 hover:scale-[1.01]'
                    }`}
                  >
                    {link.icon}
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
