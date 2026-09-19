import React from 'react';

interface OrigamiDiamondBadgeProps {
  number: string;
  className?: string;
}

/**
 * 3D Origami Faceted Gemstone / Diamond Badge
 * Renders the precise geometric folded-paper badge with top number and isometric facets.
 */
export const OrigamiDiamondBadge: React.FC<OrigamiDiamondBadgeProps> = ({
  number,
  className = 'w-20 h-20',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className} select-none transition-transform duration-300 hover:scale-105`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.07)]"
      >
        <defs>
          <linearGradient id="facetHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="facetShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5EFE7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E8DFD3" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Outer subtle boundary glow */}
        <polygon
          points="50,4 96,50 50,96 4,50"
          fill="#FFFFFF"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth="1"
        />

        {/* 1. Top Section (Above Y = 44) */}
        <polygon
          points="50,4 26,44 74,44"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="50,4 4,50 26,44"
          fill="#F7F3EE"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="50,4 74,44 96,50"
          fill="#FAF6F0"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 2. Middle & Lower Facets (Converging to Bottom Point 50, 96) */}
        <polygon
          points="26,44 50,44 50,68"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="50,44 74,44 50,68"
          fill="#F9F6F0"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="4,50 26,44 26,70"
          fill="#F0EAE0"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="96,50 74,44 74,70"
          fill="#F6F1EA"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="26,44 50,68 26,70"
          fill="#EAE2D6"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="74,44 74,70 50,68"
          fill="#F4EFE7"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="26,70 50,68 50,96"
          fill="#DFD6C9"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <polygon
          points="74,70 50,68 50,96"
          fill="#EBE4D8"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Outer Edge Crisp Boundary Lines */}
        <line x1="50" y1="4" x2="96" y2="50" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="96" y1="50" x2="50" y2="96" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="50" y1="96" x2="4" y2="50" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="4" y1="50" x2="50" y2="4" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Horizontal Dividing Crease */}
        <line x1="26" y1="44" x2="74" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Step Number (Razor Sharp in Top Diamond) */}
        <text
          x="50"
          y="31"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#5A534E"
          fontSize="15"
          fontFamily="var(--font-poppins), sans-serif"
          fontWeight="600"
          letterSpacing="0.5px"
        >
          {number}
        </text>
      </svg>
    </div>
  );
};

export default OrigamiDiamondBadge;
