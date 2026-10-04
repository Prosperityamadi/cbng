'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { ContactService, ContactMessageResponse } from '@/core/services/contact.service';

export const SupportQueryCardSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ContactMessageResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validate Name - letters and characters only (no numbers)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const sanitized = val.replace(/[0-9]/g, '');
    setName(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim() || 'General Customer Support Query';
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      setErrorMsg('Please enter your message (at least 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ContactService.sendMessage({
        name: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      setResult(res);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('[SupportQueryCardSection] Submission failed:', err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to transmit message. Please email support@nemicapital.com directly.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 border-b border-stone-200/60 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Tone Card Container */}
        <div className="relative bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-stone-200/80 rounded-none overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* =========================================================================
                LEFT HALF: White Background + Header + Overlapping Info Card + Red Corner
                ========================================================================= */}
            <div className="lg:col-span-6 bg-white p-8 sm:p-10 lg:p-12 relative flex flex-col justify-between z-10">
              
              {/* Header Text */}
              <div className="max-w-md z-10 mb-8 sm:mb-10">
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight leading-tight">
                  Get Support for<br />
                  any Queries or Complaints
                </h2>
                <p className="font-roboto text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed">
                  Committed to helping you meet all your banking needs.
                </p>
              </div>

              {/* Floating Info Box (Overlaps slightly into the right section on large screens) */}
              <div className="relative z-20 lg:-mr-12 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-gray-100 p-6 sm:p-7 rounded-sm mb-12 sm:mb-14">
                <div className="space-y-6">
                  
                  {/* Row 1: Corporate Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F7F1EB] border border-[#EDE3D7] flex items-center justify-center shrink-0 text-[#1A1818]">
                      <svg className="w-4 h-4 text-[#1A1818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-gray-400 font-poppins">
                        Corporate Office
                      </span>
                      <p className="font-roboto text-xs sm:text-[13px] font-semibold text-[#1A1818] mt-0.5 leading-snug">
                        141, First Floor, 12 St RootsTerrace,<br />
                        Los Angeles USA 90010.
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Office Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F7F1EB] border border-[#EDE3D7] flex items-center justify-center shrink-0 text-[#1A1818]">
                      <svg className="w-4 h-4 text-[#1A1818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-gray-400 font-poppins">
                        Office Hours
                      </span>
                      <p className="font-roboto text-xs sm:text-[13px] font-semibold text-[#1A1818] mt-0.5">
                        Mon – Fri: 9.00am to 5.00pm
                      </p>
                      <span className="text-[11px] text-gray-400 font-roboto">
                        [2nd Sat Holiday]
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Front Desk */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F7F1EB] border border-[#EDE3D7] flex items-center justify-center shrink-0 text-[#1A1818]">
                      <svg className="w-4 h-4 text-[#1A1818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-gray-400 font-poppins">
                        Front Desk
                      </span>
                      <a
                        href="tel:+180012345678"
                        className="font-roboto text-xs sm:text-[13px] font-semibold text-[#1A1818] hover:text-[#B81446] transition-colors block mt-0.5"
                      >
                        +1 (800) 123 456 78
                      </a>
                      <a
                        href="mailto:support@nemicapital.com"
                        className="font-roboto text-xs sm:text-[13px] text-[#1A1818] hover:text-[#B81446] transition-colors block"
                      >
                        support@nemicapital.com
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Bar: Red Corner Shape + Social Buttons */}
              <div className="relative pt-6 flex items-end justify-between z-10 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 lg:-mx-12 lg:-mb-12">
                
                {/* Crimson Angle Polygon Corner on the Left */}
                <div
                  className="bg-[#B81446] text-white px-6 sm:px-8 py-4 sm:py-5 flex items-center gap-2 select-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 82% 0%, 100% 100%, 0% 100%)',
                    minWidth: '200px',
                  }}
                >
                  <span className="text-white text-sm font-semibold">&darr;</span>
                  <span className="font-poppins text-xs font-semibold tracking-wide uppercase">
                    Customer Care
                  </span>
                </div>

                {/* Social Circle Icons to the right */}
                <div className="flex items-center gap-2.5 pb-4 pr-6 sm:pr-8">
                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#B81446] flex items-center justify-center p-1.5 transition-all hover:scale-110 bg-white shadow-2xs"
                  >
                    <Image
                      src={ASSETS.icons.youtube}
                      alt="YouTube"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  </a>

                  {/* Mail / Email */}
                  <a
                    href="mailto:support@nemicapital.com"
                    aria-label="Email Support"
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#B81446] flex items-center justify-center p-1.5 transition-all hover:scale-110 bg-white shadow-2xs"
                  >
                    <Image
                      src={ASSETS.icons.mail}
                      alt="Email"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  </a>

                  {/* Twitter */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#B81446] flex items-center justify-center p-1.5 transition-all hover:scale-110 bg-white shadow-2xs"
                  >
                    <Image
                      src={ASSETS.icons.twitter}
                      alt="Twitter"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#B81446] flex items-center justify-center p-1.5 transition-all hover:scale-110 bg-white shadow-2xs"
                  >
                    <Image
                      src={ASSETS.icons.facebook}
                      alt="Facebook"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  </a>
                </div>

              </div>

            </div>

            {/* =========================================================================
                RIGHT HALF: Warm Sand Background (#F7F1EB) + Clean Contact Form
                ========================================================================= */}
            <div className="lg:col-span-6 bg-[#FAF7F2] p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-stone-200/70">
              
              {/* Success Notification */}
              {result && (
                <div className="bg-white border border-[#E8DCCF] p-6 mb-6 rounded-none shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-emerald-700 font-bold text-lg">✓</span>
                    <h4 className="font-poppins font-bold text-sm text-[#1A1818]">
                      Message Dispatched
                    </h4>
                  </div>
                  <p className="font-roboto text-xs text-gray-600 leading-relaxed mb-3">
                    Your inquiry has been logged in our secure backend and transmitted directly to{' '}
                    <strong className="text-[#B81446]">{result.delivery_destination}</strong>.
                  </p>
                  <p className="font-mono text-[11px] text-gray-400">
                    Reference ID: {result.inquiry_id}
                  </p>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="mt-3 text-xs font-semibold text-[#B81446] hover:underline cursor-pointer"
                  >
                    Send another query &rarr;
                  </button>
                </div>
              )}

              {/* Error Notification */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 p-4 mb-6 text-rose-800 text-xs rounded-none animate-fadeIn">
                  {errorMsg}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label
                    htmlFor="support-name"
                    className="block font-poppins text-xs font-medium text-[#1A1818] mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="xxxxxx"
                    className="w-full bg-white border border-stone-200 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1818] placeholder-gray-300 focus:outline-none focus:border-[#B81446] transition-colors font-roboto"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="support-email"
                    className="block font-poppins text-xs font-medium text-[#1A1818] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1818] focus:outline-none focus:border-[#B81446] transition-colors font-roboto"
                  />
                </div>

                {/* Ph. Num */}
                <div>
                  <label
                    htmlFor="support-phone"
                    className="block font-poppins text-xs font-medium text-[#1A1818] mb-1.5"
                  >
                    Ph. Num
                  </label>
                  <input
                    id="support-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1818] focus:outline-none focus:border-[#B81446] transition-colors font-roboto"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="support-subject"
                    className="block font-poppins text-xs font-medium text-[#1A1818] mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full bg-white border border-stone-200 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1818] placeholder-gray-300 focus:outline-none focus:border-[#B81446] transition-colors font-roboto"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="support-message"
                    className="block font-poppins text-xs font-medium text-[#1A1818] mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-none p-3.5 text-xs sm:text-sm text-[#1A1818] focus:outline-none focus:border-[#B81446] transition-colors font-roboto resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-7 py-3 bg-[#B81446] hover:bg-[#8A0E34] text-white font-poppins text-xs sm:text-sm font-semibold tracking-wide rounded-none transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? 'Sending...' : 'Send A Message'}
                  </button>
                </div>

              </form>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
