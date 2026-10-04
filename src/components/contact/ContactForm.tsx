'use client';

import React, { useState } from 'react';
import { ContactService, ContactMessageResponse } from '@/core/services/contact.service';

const INQUIRY_SUBJECTS = [
  'General Inquiry & Customer Support',
  'Private Wealth & Family Office Advisory',
  'Corporate & Institutional Banking',
  'International Wire Transfer & Clearing',
  'Credit Card Services & Limit Review',
  'Mortgage & Commercial Real Estate Loans',
  'Compliance & Account Verification (KYC)',
];

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(INQUIRY_SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ContactMessageResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validate Name - letters, spaces, hyphens, apostrophes only (no numbers)
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
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setErrorMsg('Please provide your full legal name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid business or personal email address.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      setErrorMsg('Please provide a message with at least 5 characters detailing your inquiry.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ContactService.sendMessage({
        name: trimmedName,
        email: trimmedEmail,
        subject: subject.trim(),
        message: trimmedMessage,
      });

      setResult(res);
      // Reset fields
      setName('');
      setEmail('');
      setMessage('');
      setSubject(INQUIRY_SUBJECTS[0]);
    } catch (err: any) {
      console.error('[ContactForm] Submission failed:', err);
      const messageText =
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to transmit inquiry at this moment. Please call our 24/7 client desk or write to info@nemicapbank.com directly.';
      setErrorMsg(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 relative overflow-hidden">
      {/* Decorative Brand Top Border Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5A0620] via-[#B81446] to-[#8A0E34]" />

      <div className="max-w-3xl">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B81446] bg-[#B81446]/5 px-3 py-1 rounded-full border border-[#B81446]/10 inline-block mb-3">
            Secure Concierge Channel
          </span>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1818] tracking-tight">
            Send a Confidential Message
          </h2>
          <p className="font-roboto text-sm text-gray-500 mt-2 leading-relaxed">
            Your inquiry will be logged securely in our institutional database and routed directly to our private desk at{' '}
            <span className="font-semibold text-[#1A1818]">info@nemicapbank.com</span>.
          </p>
        </div>

        {/* Success Confirmation View */}
        {result && (
          <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-6 sm:p-8 mb-8 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1A1818] text-white flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-poppins font-bold text-lg text-[#1A1818] mb-1">
                  Inquiry Dispatched Successfully
                </h3>
                <p className="font-roboto text-sm text-gray-700 leading-relaxed mb-4">
                  Thank you for reaching out. Your inquiry has been delivered to{' '}
                  <span className="font-semibold text-[#B81446]">{result.delivery_destination}</span>. An assigned private banking advisor will review your request and reply promptly.
                </p>
                <div className="bg-white border border-[#E8DCCF] rounded-lg p-3 sm:p-4 mb-4 text-xs font-mono text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>Reference ID: <strong className="text-[#1A1818]">{result.inquiry_id}</strong></span>
                  <span>Status: <strong className="text-emerald-700 uppercase">{result.status}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#B81446] hover:text-[#8A0E34] transition-colors"
                >
                  &larr; Send Another Inquiry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 mb-8 text-rose-800 text-sm flex items-start gap-3 animate-fadeIn">
            <svg
              className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold mb-0.5">Submission Notice</p>
              <p className="text-xs text-rose-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Main Form Fields */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-poppins text-xs font-semibold text-[#1A1818] uppercase tracking-wider mb-2"
                >
                  Full Legal Name <span className="text-[#B81446]">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#1A1818] placeholder-gray-400 focus:bg-white focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 outline-hidden transition-all duration-200 font-roboto"
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-poppins text-xs font-semibold text-[#1A1818] uppercase tracking-wider mb-2"
                >
                  Email Address <span className="text-[#B81446]">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor.vance@example.com"
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#1A1818] placeholder-gray-400 focus:bg-white focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 outline-hidden transition-all duration-200 font-roboto"
                />
              </div>
            </div>

            {/* Subject / Category Dropdown */}
            <div>
              <label
                htmlFor="contact-subject"
                className="block font-poppins text-xs font-semibold text-[#1A1818] uppercase tracking-wider mb-2"
              >
                Inquiry Topic / Category <span className="text-[#B81446]">*</span>
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#1A1818] focus:bg-white focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 outline-hidden transition-all duration-200 font-roboto cursor-pointer"
              >
                {INQUIRY_SUBJECTS.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="contact-message"
                  className="block font-poppins text-xs font-semibold text-[#1A1818] uppercase tracking-wider"
                >
                  Message <span className="text-[#B81446]">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {message.length} / 5000 characters
                </span>
              </div>
              <textarea
                id="contact-message"
                required
                rows={5}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe how our private wealth advisory team can assist you with your banking, investment, or account service needs..."
                className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl p-4 text-sm text-[#1A1818] placeholder-gray-400 focus:bg-white focus:border-[#B81446] focus:ring-2 focus:ring-[#B81446]/10 outline-hidden transition-all duration-200 font-roboto resize-y"
              />
            </div>

            {/* Privacy & Guarantee note */}
            <p className="text-xs text-gray-500 leading-relaxed font-roboto">
              By submitting this confidential inquiry, you agree to NemiCapital Bank&apos;s privacy protocols. Information transmitted is protected by institutional 256-bit SSL encryption.
            </p>

            {/* Submit CTA */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B81446] to-[#8A0E34] text-white font-poppins text-sm font-semibold tracking-wide shadow-lg shadow-[#B81446]/20 hover:shadow-xl hover:shadow-[#B81446]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Transmitting Secure Message...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <span className="text-base">&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
