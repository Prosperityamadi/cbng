'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ASSETS } from '@/core';

interface CommentItem {
  id: string;
  name: string;
  date: string;
  avatar: typeof ASSETS.images.commenterStevenRich;
  text: string;
}

export const PressReleaseArticle: React.FC = () => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [commentsList, setCommentsList] = useState<CommentItem[]>([
    {
      id: 'comment-1',
      name: 'Steven Rich',
      date: '21 Sep 2026',
      avatar: ASSETS.images.commenterStevenRich,
      text: 'A pivotal capital milestone for NemiCapital International Bank. The expanded balance sheet gives institutional depositors and private clients even greater confidence in long-term yield stability.',
    },
    {
      id: 'comment-2',
      name: 'Claire Vance',
      date: '23 Sep 2026',
      avatar: ASSETS.images.commenterClaireVance,
      text: 'Very encouraging development for modern wealth management. The ongoing synergy between digital banking architecture and prudent capital adequacy sets an impressive benchmark in the sector.',
    },
  ]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleShareClick = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
    setShowShareMenu(!showShareMenu);
  };

  const handleReplyClick = (authorName: string) => {
    setReplyTo(authorName);
    setFormData((prev) => ({
      ...prev,
      message: `@${authorName} `,
    }));
    const formEl = document.getElementById('comment-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      name: formData.name.trim(),
      date: '23 Sep 2026',
      avatar: ASSETS.images.commenterStevenRich,
      text: formData.message.trim(),
    };

    setCommentsList((prev) => [...prev, newComment]);
    setFormData({ name: '', email: '', message: '' });
    setReplyTo(null);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <article className="w-full space-y-10 sm:space-y-12">
      {/* =========================================================================
          1. FEATURED IMAGE WITH HOVER ZOOM & SHARE BUTTON
          ========================================================================= */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-stone-100 group shadow-md border border-stone-100">
        <Image
          src={ASSETS.images.pressAtmCard}
          alt="Board Approves Capital Raise of $250 Million"
          fill
          priority
          className="object-cover grayscale contrast-[112%] transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Floating SHARE Button at Bottom Right (Matches user screenshot) */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            type="button"
            onClick={handleShareClick}
            aria-label="Share this press release"
            className="flex items-center gap-2 bg-white/95 hover:bg-white text-stone-700 hover:text-[#B81446] px-3.5 py-1.5 shadow-lg border border-stone-200/60 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="font-poppins font-semibold text-[11px] uppercase tracking-wider">
              {copiedShare ? 'Copied!' : 'Share'}
            </span>
            <div className="w-3.5 h-3.5 relative">
              <Image
                src={ASSETS.icons.share}
                alt="Share icon"
                fill
                className="object-contain"
              />
            </div>
          </button>

          {/* Quick Share Floating Menu */}
          {showShareMenu && (
            <div className="absolute bottom-11 right-0 bg-white shadow-xl border border-stone-100 p-2 flex items-center gap-2 animate-fadeIn z-30">
              <a
                href={`https://twitter.com/intent/tweet?text=Board Approves Capital Raise of $250 Million`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 relative p-1 rounded hover:bg-stone-100 transition-colors"
                title="Share on Twitter"
              >
                <Image src={ASSETS.icons.twitter} alt="Twitter" fill className="object-contain p-1" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 relative p-1 rounded hover:bg-stone-100 transition-colors"
                title="Share on Facebook"
              >
                <Image src={ASSETS.icons.facebook} alt="Facebook" fill className="object-contain p-1" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 relative p-1 rounded hover:bg-stone-100 transition-colors"
                title="Share on Instagram"
              >
                <Image src={ASSETS.icons.instagram} alt="Instagram" fill className="object-contain p-1" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. ARTICLE HEADER & TITLE
          ========================================================================= */}
      <div className="space-y-4">
        <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1A1818] tracking-tight leading-snug">
          Board Approves Capital Raise of $250 Million
        </h1>
      </div>

      {/* =========================================================================
          3. PULLQUOTE WITH CIRCULAR QUOTE BUBBLE ICON
          ========================================================================= */}
      <div className="flex items-start gap-4 sm:gap-6 pt-2 pb-2">
        {/* Quote Bubble Icon */}
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border border-stone-200/60 flex items-center justify-center text-stone-700 shadow-xs transition-transform duration-300 hover:scale-105">
          <span className="font-serif font-black text-2xl sm:text-3xl text-stone-800 leading-none">
            ❝
          </span>
        </div>

        {/* Quote Text & Author */}
        <div className="space-y-1 pt-1">
          <blockquote className="font-poppins font-semibold text-base sm:text-lg md:text-xl text-[#1A1818] leading-snug tracking-tight">
            Don&apos;t just save money, make more money with a checking account from us.
          </blockquote>
          <p className="font-poppins text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
            — Franklin
          </p>
        </div>
      </div>

      {/* =========================================================================
          4. EDITORIAL BODY CONTENT
          ========================================================================= */}
      <div className="space-y-5 text-sm sm:text-[15px] font-roboto text-stone-600 leading-relaxed">
        <p>
          In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. In certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted.
        </p>

        <p>
          Our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted holds in these matters to this principle of selection.
        </p>

        <p>
          Nothing prevents claims duty obligations of business will frequently occur powerchoice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain but in certain chooses to enjoy a pleasure that has no annoying consequences.
        </p>

        <p>
          Prevents our being able to do what we like best, every pleasure is to be welcomed every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations.
        </p>
      </div>

      {/* =========================================================================
          5. SUBSECTION: TRUST YOUR MONEY WITH US
          ========================================================================= */}
      <div className="space-y-3 pt-3">
        <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight">
          Trust Your Money With Us
        </h2>
        <p className="font-roboto text-sm sm:text-[15px] text-stone-600 leading-relaxed">
          Frequently occur our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided all in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures but have to be repudiated and annoyances accepted holds in these matters to this principle.
        </p>
      </div>

      {/* =========================================================================
          6. SUBSECTION: THE BANK THAT'S ALWAYS OPEN & BULLET LIST
          ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-[#B81446] text-xs">◆</span>
          <h3 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818] tracking-tight">
            The Bank That&apos;s Always Open
          </h3>
        </div>

        <p className="font-roboto text-sm text-stone-600 leading-relaxed">
          Every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations.
        </p>

        {/* Diamond Bullet List with Hover Slide */}
        <ul className="space-y-2.5 pt-1">
          {[
            "Don't just make a deposit, make an investment today",
            'Known for trust, honesty, and customer care',
            "We're more than just someone's ATM. We're here for life's big moments",
            'Simplify your finances',
            'A bank for people who want to live life better',
            'Because all other banks are the same',
          ].map((item, idx) => (
            <li
              key={idx}
              className="group flex items-start gap-2.5 text-xs sm:text-sm font-roboto text-stone-700 transition-all duration-300 hover:text-[#B81446] hover:translate-x-1"
            >
              <span className="text-[#B81446] text-xs flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-125">
                ◆
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* =========================================================================
          7. ARTICLE TAGS
          ========================================================================= */}
      <div className="pt-4 border-b border-stone-200/80 pb-8 flex flex-wrap gap-2">
        {['Cards', 'Careers', 'Deposit', 'Fees'].map((tag) => (
          <span
            key={tag}
            className="text-xs px-3.5 py-1.5 bg-[#FAF7F2] text-stone-600 border border-stone-200/80 cursor-pointer transition-all duration-300 hover:bg-[#B81446] hover:text-white hover:border-[#B81446] hover:-translate-y-0.5 hover:shadow-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* =========================================================================
          8. PREV / NEXT POST NAVIGATION (Matches user screenshot)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 pb-4">
        {/* Prev Post */}
        <Link
          href="/news/press-releases"
          className="group block space-y-1.5 text-left border-l-2 border-transparent hover:border-[#B81446] pl-3 transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider group-hover:text-[#B81446] transition-colors">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              &larr;
            </span>
            <span>Prev Post</span>
          </div>
          <h4 className="font-poppins font-semibold text-xs sm:text-sm text-[#1A1818] leading-snug group-hover:text-[#B81446] transition-colors">
            How Non-US Citizens can Open a Bank Account
          </h4>
        </Link>

        {/* Next Post */}
        <Link
          href="/news/press-releases"
          className="group block space-y-1.5 text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-transparent hover:border-[#B81446] pl-3 sm:pl-0 sm:pr-3 transition-all duration-300"
        >
          <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider group-hover:text-[#B81446] transition-colors">
            <span>Next Post</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </div>
          <h4 className="font-poppins font-semibold text-xs sm:text-sm text-[#1A1818] leading-snug group-hover:text-[#B81446] transition-colors">
            The National Avg Interest Rate for Savings Accounts
          </h4>
        </Link>
      </div>

      {/* =========================================================================
          9. AUTHOR BIO CARD (PAUL ANDERSON) (Matches user screenshot)
          ========================================================================= */}
      <div className="bg-[#FAF7F2] border border-stone-200/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 shadow-xs group transition-all duration-300 hover:shadow-md">
        {/* Author Avatar with Subtle Hover Scale */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-stone-200 border-2 border-white shadow-sm">
          <Image
            src={ASSETS.images.authorPaulAnderson}
            alt="Paul Anderson"
            fill
            className="object-cover grayscale contrast-[110%] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Author Information */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <span className="font-poppins font-semibold text-[10px] sm:text-xs text-stone-400 uppercase tracking-[0.2em]">
            Post By
          </span>
          <h4 className="font-poppins font-bold text-base sm:text-lg text-[#1A1818]">
            Paul Anderson
          </h4>
          <p className="font-roboto text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-xl">
            Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because occasionally.
          </p>

          {/* Social Icons with Hover Glow */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            {[
              { name: 'YouTube', icon: ASSETS.icons.youtube, href: 'https://youtube.com' },
              { name: 'Twitter', icon: ASSETS.icons.twitter, href: 'https://twitter.com' },
              { name: 'Facebook', icon: ASSETS.icons.facebook, href: 'https://facebook.com' },
              { name: 'Instagram', icon: ASSETS.icons.instagram, href: 'https://instagram.com' },
            ].map((soc) => (
              <a
                key={soc.name}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                title={soc.name}
                className="w-7 h-7 rounded-full bg-white border border-stone-200/80 flex items-center justify-center p-1.5 shadow-2xs transition-all duration-300 hover:scale-115 hover:border-[#B81446] hover:shadow-sm"
              >
                <div className="w-full h-full relative">
                  <Image src={soc.icon} alt={soc.name} fill className="object-contain" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          10. COMMENTS SECTION (2 Different People, Updated 2026 Dates)
          ========================================================================= */}
      <div className="space-y-6 pt-4">
        <h3 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight">
          Comments ({commentsList.length})
        </h3>

        <div className="space-y-6 divide-y divide-stone-100">
          {commentsList.map((c) => (
            <div key={c.id} className="pt-6 first:pt-0 flex items-start gap-4 sm:gap-5 group">
              {/* Commenter Avatar */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/80">
                <Image
                  src={c.avatar}
                  alt={c.name}
                  fill
                  className="object-cover grayscale contrast-[110%] transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Comment Body */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="font-poppins font-semibold text-sm sm:text-base text-[#1A1818]">
                    {c.name}
                  </h5>
                  <span className="text-stone-300">•</span>
                  <span className="font-poppins text-xs uppercase tracking-wide text-stone-400">
                    {c.date}
                  </span>
                </div>

                <p className="font-roboto text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {c.text}
                </p>

                {/* Reply Button with Custom reply.png Icon */}
                <button
                  type="button"
                  onClick={() => handleReplyClick(c.name)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#B81446] pt-1 transition-colors duration-200 group/btn"
                >
                  <div className="w-3.5 h-3.5 relative transition-transform duration-200 group-hover/btn:-translate-x-0.5">
                    <Image
                      src={ASSETS.icons.reply}
                      alt="Reply"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          11. LEAVE YOUR COMMENTS FORM
          ========================================================================= */}
      <div id="comment-form" className="bg-white border border-stone-200/80 p-6 sm:p-8 sm:rounded-xs shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-poppins font-bold text-lg sm:text-xl text-[#1A1818] tracking-tight">
            Leave Your Comments
          </h3>
          {replyTo && (
            <button
              type="button"
              onClick={() => {
                setReplyTo(null);
                setFormData((prev) => ({ ...prev, message: '' }));
              }}
              className="text-xs text-[#B81446] hover:underline"
            >
              Cancel reply to {replyTo}
            </button>
          )}
        </div>

        {formSubmitted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded animate-fadeIn">
            ✓ Thank you! Your comment has been posted successfully.
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <input
              type="text"
              placeholder="Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-3 bg-white text-[#1A1818] placeholder-stone-400 border border-stone-200 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]/20 transition-all duration-200"
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email *"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-3 bg-white text-[#1A1818] placeholder-stone-400 border border-stone-200 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]/20 transition-all duration-200"
            />
          </div>

          {/* Message Field */}
          <div>
            <textarea
              rows={4}
              placeholder="Message *"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-3 bg-white text-[#1A1818] placeholder-stone-400 border border-stone-200 focus:outline-none focus:border-[#B81446] focus:ring-1 focus:ring-[#B81446]/20 transition-all duration-200 resize-y"
            />
          </div>

          {/* Submit Button with Hover Scale & Crimson Shift */}
          <div>
            <button
              type="submit"
              className="bg-[#1A1818] hover:bg-[#B81446] text-white font-poppins font-semibold text-xs sm:text-sm px-6 py-3 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Post Comment
            </button>
          </div>
        </form>
      </div>
    </article>
  );
};
