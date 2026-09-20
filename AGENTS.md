<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NemiCapital International Bank (`cbng`) — AI Agent Development Guide

Welcome to the development guide for **NemiCapital International Bank**. This document details the exact rules, visual standards, component architecture, animation practices, and step-by-step workflows for continuing the development of this project.

---

## 1. Core Brand Identity & Design System

### 1.1 Color Palette
- **Primary Crimson**: `#B81446` (Used for key brand accents, active tabs, buttons, borders, and badges).
- **Deep Burgundy**: `#5A0620` to `#800A2C` (Used for rich gradients and secondary brand elements).
- **Foreground / Text**: `#1A1818` (Deep dark slate/charcoal for headings and high-contrast text).
- **Muted Body Text**: `#666666` or `#555555` (Clean, legible text for paragraphs and descriptions).
- **Backgrounds**:
  - **Pure White (`#FFFFFF` / `bg-white`)**: When the user requests a white background, ensure the entire section container is strictly pure white.
  - **Warm Off-White / Sand (`#FAF7F2` or `#F7F1EB`)**: Used exclusively for dedicated warm contrast sections (such as Mission/Vision or Bank Services).
  - **Dark / Cinematic (`#1A1818`)**: Used for hero banners, video modals, and footer.

### 1.2 Typography
- **Headings (`h1` - `h6`)**: `font-poppins`, bold/semibold, tight tracking, crisp leading.
- **Body Text**: `font-roboto` or `font-poppins`, clean line height (`leading-relaxed`), text sizes `text-xs`, `text-sm`, `text-base`.
- **Currency Standard**: Always format currency in **USD (`$`)**. **NEVER** use Indian Rupee symbols (`₹` or `Rs.`).

---

## 2. Codebase Architecture & File Structure

```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Homepage
│   ├── cards/page.tsx             # Credit Cards main page
│   ├── loans/page.tsx             # Loans main page
│   ├── services/loans/page.tsx    # Services > Loans page
│   ├── about/
│   │   ├── page.tsx               # About redirect / Who We Are
│   │   └── who-we-are/page.tsx    # "Who We Are" Page
│   └── globals.css                # Global Tailwind CSS & Animations
├── components/                    # Modular feature-driven components
│   ├── navigation/                # TopNavbar, Header, MegaMenu, MobileMenu
│   ├── home/                      # HeroCarousel, ServiceOverview, FooterSection
│   ├── cards/                     # BestCardsSection, CreditCardVisual, etc.
│   ├── loans/                     # LoansSection, LoanCallbackForm, LoanPartners
│   ├── about/                     # WhoWeAreOverviewSection, MissionVisionSection
│   └── index.ts                   # Central barrel export
├── core/                          # Central source of truth
│   ├── assets.ts                  # Central ASSETS dictionary (images & custom icons)
│   ├── navigation.ts              # Navigation menus & routing links
│   ├── site-config.ts             # Bank metadata, loans data, card catalogs
│   └── index.ts                   # Core exports
└── assets/                        # Static assets
    ├── icons/                     # Custom brand PNG & SVG icons
    └── images/                    # Photography (Hero, Portraits, HQ, Team)
```

---

## 3. Strict Asset Rules & Custom Icons

### 3.1 Custom PNG Icons (USER MANDATE)
- **CRITICAL**: The user prefers **custom PNG icons** located in `src/assets/icons/` over generic framework icon libraries (e.g., Lucide or React Icons) for primary feature cards and value pillars.
- Always check `src/assets/icons/` first before creating cards.
- **Registration**: Import icons in `src/core/assets.ts` and expose them under `ASSETS.icons`.

### 3.2 AI Image Generation ("Nano") Guidelines
When generating images requested by the user:
- **Aesthetic Style**: High-contrast, black-and-white editorial corporate photography. Clean lighting, shallow depth of field, sharp executive styling.
- **Aspect Ratios**:
  - `1:1`: Square sub-cards, team executive portraits, profile avatars.
  - `3:4` or `2:3`: Tall vertical cards (e.g., Bank Building HQ, Mission Hands card).
  - `4:3` or `16:9`: Horizontal cards (e.g., Vision binoculars, Core Values tower, Hero slides).
- **Storage Workflow**:
  1. Generate using `generate_image`.
  2. Copy to `src/assets/images/[name].jpg`.
  3. Import into `src/core/assets.ts` and expose in `ASSETS.images`.

---

## 4. Animation & Micro-Interactions Playbook

To make the application feel alive, dynamic, and premium, implement the following animation patterns:

### 4.1 Smooth Image Zoom on Hover
Wrap images in a container with `overflow-hidden` and apply scale on hover:
```tsx
<div className="relative w-full aspect-square overflow-hidden bg-gray-100 group">
  <Image
    src={ASSETS.images.team}
    alt="Team"
    fill
    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
  />
</div>
```

### 4.2 Floating Badge Overlays
For corner tags and badge pills:
```tsx
{/* Sub-card floating badge */}
<div className="absolute bottom-3 right-3 bg-white px-3.5 py-1.5 shadow-md border border-gray-100/60 z-10">
  <span className="text-[#B81446] font-semibold text-xs tracking-wide">
    Our Team
  </span>
</div>
```

### 4.3 Number Badge Tab (Leaf / Squircle Style)
For value pillars (01, 02, 03):
```tsx
<div className="relative mb-6">
  {/* Overlapping leaf number tab */}
  <div className="absolute -top-3.5 -left-3.5 z-10 w-11 h-11 bg-[#F4EFEA] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm flex items-center justify-center shadow-xs">
    <span className="font-poppins text-xs font-semibold text-[#8C847C]">
      01
    </span>
  </div>

  {/* Icon squircle with soft ambient shadow */}
  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[22px] shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-gray-50 flex items-center justify-center p-5 transition-all duration-300 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)]">
    <Image src={ASSETS.icons.communities} alt="Community" width={52} height={52} className="object-contain transition-transform duration-300 group-hover:scale-110" />
  </div>
</div>
```

### 4.4 Interactive Video Modal
For video triggers (e.g. play button on bank headquarters):
- Centered play button with pulse or scale on hover.
- Modal dialog with `backdrop-blur-sm` and `bg-black/80`.
- Close listener on `Escape` key and backdrop click.
- Prevent document body scrolling while open (`document.body.style.overflow = 'hidden'`).

### 4.5 Link & Button Interactions
- Arrow links: `transition-transform duration-300 group-hover:translate-x-1.5`.
- Primary CTA buttons: `transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`.

---

## 5. Step-by-Step Continuity Workflow for Future Sections

When the user provides a new screenshot and asks to build the next section, follow this exact sequence:

1. **Analyze Design & Requirements**:
   - Check section background color (`bg-white` vs `#FAF7F2` warm cream).
   - Identify layout (grid columns, card hierarchy, dividers).
   - Extract exact text, headings, and subtitles from the screenshot.
2. **Asset Inspection**:
   - Check if images or PNG icons are provided by the user.
   - If missing, use `generate_image` ("nano") following the monochrome editorial corporate prompt formula.
   - Register all assets in `src/core/assets.ts`.
3. **Component Construction**:
   - Create component under `src/components/[feature]/[SectionName].tsx`.
   - Export via `src/components/[feature]/index.ts` and `src/components/index.ts`.
4. **Integration**:
   - Add the component to the relevant page in `src/app/...`.
5. **Quality Assurance**:
   - Run `npx tsc --noEmit` to ensure 0 TypeScript compilation errors.
   - Verify alignment, contrast, responsiveness, and typography.
