import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={className}
        fill="none"
    >
        <defs>
            <linearGradient id="outerRing" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            <linearGradient id="innerCyanRing" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
        </defs>

        {/* Outer Purple Ring */}
        <circle cx="50" cy="50" r="46" stroke="url(#outerRing)" strokeWidth="3" opacity="0.9" />
        <circle cx="50" cy="50" r="43" stroke="#ffffff" strokeWidth="1" opacity="0.5" />

        {/* Thick Cyan Ring */}
        <circle cx="50" cy="50" r="39" stroke="url(#innerCyanRing)" strokeWidth="6" />

        {/* Dark Core */}
        <circle cx="50" cy="50" r="36" fill="#0f172a" />
        <circle cx="52" cy="52" r="34" fill="#020617" opacity="0.6" />

        {/* Bitcoin Logo (Centered) */}
        <g transform="translate(-4, -4) scale(1.08)" fill="url(#btcGradient)">
            <path d="M55.5 56.5C57.5 56.5 59 55 59 53C59 51 57.5 49.5 55.5 49.5L47 49.5L47 56.5L55.5 56.5ZM54.5 44.5C56.5 44.5 58 43 58 41C58 39 56.5 37.5 54.5 37.5L47 37.5L47 44.5L54.5 44.5ZM43 32L43 36L40 36L40 39L43 39L43 61L40 61L40 63L43 63L43 67L46 67L46 63L49 63L49 67L52 67L52 63.5C57.5 63.5 62 60.5 62 55.5C62 52 59.5 49.5 56.5 48.5C58.5 47.5 61 45 61 41.5C61 36.5 56.5 33.5 52 33.5L52 30L49 30L49 33.5L46 33.5L46 30L43 32Z" />
        </g>

        {/* Gloss / Light reflection arcs */}
        <path d="M 18 35 Q 35 12 65 18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" fill="none" />
        <path d="M 83 62 Q 62 86 35 80" stroke="#00d2ff" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
        <path d="M 75 25 Q 88 50 65 85" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.2" fill="none" />

    </svg>
);

export default Logo;
