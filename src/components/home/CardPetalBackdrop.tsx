import React from 'react';

interface CardPetalBackdropProps {
  className?: string;
}

/**
 * Organic Botanical Petal / Clover Watermark Backdrop
 * Renders the graceful 4-petal translucent white framing behind each banking card.
 */
export const CardPetalBackdrop: React.FC<CardPetalBackdropProps> = ({
  className = 'w-full h-full',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 380 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[380px] max-h-[440px] transition-transform duration-500 group-hover:scale-105"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="petalGlow" cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </radialGradient>

          <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Top-Left Petal Lobe */}
        <path
          d="M 190 200 C 130 110, 45 100, 48 180 C 50 250, 130 260, 190 220 Z"
          fill="url(#petalGlow)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.9"
        />

        {/* 2. Top-Right Petal Lobe */}
        <path
          d="M 190 200 C 250 110, 335 100, 332 180 C 330 250, 250 260, 190 220 Z"
          fill="url(#petalGlow)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.9"
        />

        {/* 3. Bottom-Left Petal Lobe (Curves under text toward center) */}
        <path
          d="M 190 220 C 115 250, 35 290, 55 375 C 75 425, 160 410, 190 350 Z"
          fill="url(#petalGlow)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.9"
        />

        {/* 4. Bottom-Right Petal Lobe (Curves under text toward center) */}
        <path
          d="M 190 220 C 265 250, 345 290, 325 375 C 305 425, 220 410, 190 350 Z"
          fill="url(#petalGlow)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.9"
        />

        {/* 5. Central Overlap Soft Body */}
        <ellipse
          cx="190"
          cy="230"
          rx="110"
          ry="120"
          fill="#FFFFFF"
          fillOpacity="0.5"
          filter="url(#softBlur)"
        />

        {/* Subtle Decorative Delicate Curve Linework (From template) */}
        <path
          d="M 60 360 C 110 400, 150 370, 190 345 C 230 370, 270 400, 320 360"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />
        <path
          d="M 60 190 C 120 150, 190 210, 190 210 C 190 210, 260 150, 320 190"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default CardPetalBackdrop;
