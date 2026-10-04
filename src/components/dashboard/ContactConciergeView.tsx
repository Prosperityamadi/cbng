'use client';

import React, { useState, useEffect } from 'react';
import { ContactService, ContactInquiryItem } from '@/core/services/contact.service';

interface ContactConciergeViewProps {
  initialClientName?: string;
  initialEmail?: string;
}

export default function ContactConciergeView({
  initialClientName = '',
  initialEmail = '',
}: ContactConciergeViewProps) {
  const [clientName, setClientName] = useState(initialClientName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState('Transaction Support & Wire Tracking');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [pastInquiries, setPastInquiries] = useState<ContactInquiryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (initialClientName && !clientName) setClientName(initialClientName);
    if (initialEmail && !email) setEmail(initialEmail);
  }, [initialClientName, initialEmail]);

  // Load client's previous inquiries
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const res = await ContactService.getMyInquiries();
        if (res && res.inquiries) {
          setPastInquiries(res.inquiries);
        }
      } catch (e) {
        // Silently catch if not fully authenticated yet
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [submitSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitSuccess(null);

    const trimmedName = clientName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage('Please fill in your name, email, and detailed message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ContactService.sendMessage({
        name: trimmedName,
        email: trimmedEmail,
        subject,
        message: trimmedMessage,
      });

      if (response && response.success) {
        setSubmitSuccess(response.message || 'Your inquiry has been successfully dispatched.');
        setInquiryId(response.inquiry_id || null);
        setMessage('');
      } else {
        throw new Error(response?.message || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while dispatching your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* ======================================================================= */}
      {/* 1. TOP HEADER BANNER (SWISS LUXURY PRIVATE WEALTH CONCIERGE)           */}
      {/* ======================================================================= */}
      <section className="w-full bg-[#151214] text-white rounded-[26px] p-6 sm:p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] relative overflow-hidden">
        {/* Subtle Ambient Gold / Crimson Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#B81446]/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Swiss Cross / Heraldic Shield */}
            <div className="w-13 h-13 rounded-2xl bg-[#B81446] flex items-center justify-center shadow-[0_4px_20px_rgba(184,20,70,0.5)] flex-shrink-0">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5A8B8] font-bold">
                  INSTITUTIONAL CLIENT DESK
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  Live 24/7
                </span>
              </div>
              <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                Private Wealth Concierge
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
                Direct 24/7 communication with your dedicated institutional banking team and clearing desk.
              </p>
            </div>
          </div>

          {/* SLA Pill */}
          <div className="self-start sm:self-center flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-sm">
            <svg className="w-4 h-4 text-[#E5C158]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Target Response: <strong className="text-white">Under 15 Mins</strong></span>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. MAIN CONCIERGE CANVAS: TWO-COLUMN LAYOUT                            */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER: NEW INQUIRY FORM (2 COLUMNS ON LG) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-[26px] p-6 sm:p-8 border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
            <div className="pb-4 mb-6 border-b border-gray-100">
              <h2 className="font-poppins font-bold text-xl text-gray-900 tracking-tight">
                New Inquiry
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Messages are encrypted and transmitted directly to <strong className="text-gray-800">info@nemicapbank.com</strong>.
              </p>
            </div>

            {/* Success Feedback Notification */}
            {submitSuccess && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-poppins font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
                  <span>Inquiry Transmitted to Private Wealth Desk</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {submitSuccess}
                </p>
                {inquiryId && (
                  <div className="mt-1 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-mono text-emerald-700">
                    <span>Reference ID: <strong className="font-semibold">{inquiryId}</strong></span>
                    <span>Delivered to: info@nemicapbank.com</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(null);
                    setInquiryId(null);
                  }}
                  className="mt-2 self-start text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span className="font-bold text-rose-600">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 font-poppins block">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Alexander J. Dubois"
                    required
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#B81446] focus:bg-white focus:ring-2 focus:ring-[#B81446]/10 transition-all font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 font-poppins block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@mail.ch"
                    required
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#B81446] focus:bg-white focus:ring-2 focus:ring-[#B81446]/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Inquiry Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 font-poppins block">
                  Inquiry Subject
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#B81446] focus:bg-white focus:ring-2 focus:ring-[#B81446]/10 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Transaction Support & Wire Tracking">Transaction Support & Wire Tracking</option>
                    <option value="Wire Clearance & IMF / Federal Reserve Clearance">Wire Clearance & Security Passcode</option>
                    <option value="Portfolio Request & Treasury Allocation">Portfolio Request & Institutional Treasury</option>
                    <option value="Account Credentials & Security Update">Account Credentials & Access Control</option>
                    <option value="Compliance Documentation & Tax Forms">Compliance Documentation & KYC</option>
                    <option value="General Private Banking Concierge">General Private Banking Concierge</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 3: Message Textarea (Obsidian High-Contrast Luxury Design) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 font-poppins block">
                    Message
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {message.length} / 5000 characters
                  </span>
                </div>
                <div className="relative rounded-2xl p-1 bg-[#151214] border border-[#332E30] focus-within:border-[#B81446] transition-all">
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your detailed message or wire inquiry..."
                    required
                    className="w-full bg-transparent text-white placeholder-gray-500 p-3 text-sm focus:outline-none resize-y leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#B81446] hover:bg-[#960e37] active:scale-95 text-white font-poppins font-bold text-sm px-8 py-3.5 rounded-full shadow-[0_4px_20px_rgba(184,20,70,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>[Send Secure Message →]</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* =================================================================== */}
          {/* OFFICIAL INQUIRIES SUB-CARD (WARM CREAM DESIGN)                     */}
          {/* =================================================================== */}
          <div className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-[24px] p-6 sm:p-7 shadow-xs">
            <h3 className="font-poppins font-bold text-gray-900 text-base mb-4">
              Official Inquiries & Direct Channels
            </h3>

            <div className="space-y-3.5">
              {/* 1. Official Bank Inbox Card (Full Width - Zero Compression) */}
              <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-[#E8DFC8]/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#B81446] flex-shrink-0 border border-[#E8DFC8]/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Official Bank Inbox</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-gray-900 select-all tracking-tight block">
                      info@nemicapbank.com
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyEmail('info@nemicapbank.com')}
                  className="self-start sm:self-center bg-[#FAF7F2] hover:bg-[#F3EBE1] active:scale-95 text-gray-800 hover:text-[#B81446] border border-[#E8DFC8] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs flex-shrink-0"
                >
                  {copiedEmail ? (
                    <>
                      <span className="text-emerald-600 font-bold text-xs">✓</span>
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 2: Settlement Hotline & Response SLA in 2 Roomy Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Settlement Hotline */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8]/80 shadow-2xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#B81446] flex-shrink-0 border border-[#E8DFC8]/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Settlement Hotline</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-gray-900 block whitespace-nowrap">+1-202-555-0100</span>
                  </div>
                </div>

                {/* Response SLA */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8]/80 shadow-2xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#B81446] flex-shrink-0 border border-[#E8DFC8]/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Dedicated Response</span>
                    <span className="font-poppins text-sm sm:text-base font-bold text-[#B81446] block whitespace-nowrap">Under 15-Minute SLA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED TEAM & RECENT INQUIRIES */}
        <div className="space-y-6">
          {/* Dedicated Team Card (Matching Nano Mockup) */}
          <section className="bg-white rounded-[26px] p-6 border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">
              Dedicated Team
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Assigned advisors for your Private Wealth accounts.
            </p>

            <div className="space-y-4">
              {/* Advisor 1 */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    alt="Henrietta Vance"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-poppins font-bold text-sm text-gray-900 truncate">
                    Henrietta Vance
                  </h4>
                  <span className="text-[11px] text-[#B81446] font-semibold block">
                    Senior Advisor
                  </span>
                  <span className="text-[10px] text-gray-500 block truncate">
                    info@nemicapbank.com
                  </span>
                </div>
              </div>

              {/* Advisor 2 */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                    alt="Lukas Fischer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-poppins font-bold text-sm text-gray-900 truncate">
                    Lukas Fischer
                  </h4>
                  <span className="text-[11px] text-[#B81446] font-semibold block">
                    Portfolio Manager
                  </span>
                  <span className="text-[10px] text-gray-500 block truncate">
                    info@nemicapbank.com
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Routing Note */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-500 leading-relaxed">
              Inquiries dispatched through this portal are routed directly to both assigned executives and the institutional clearance desk.
            </div>
          </section>

          {/* Previous Inquiries / Activity Tracking */}
          <section className="bg-white rounded-[26px] p-6 border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-gray-900 text-sm">
                Your Past Inquiries
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                {pastInquiries.length} logged
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Loading inquiries...
              </div>
            ) : pastInquiries.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No previous messages found. Inquiries sent will appear here.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {pastInquiries.map((inq) => (
                  <div key={inq.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 truncate max-w-[170px]">
                        {inq.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {inq.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                      <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                      <span className="font-mono text-gray-400">info@nemicapbank.com</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
