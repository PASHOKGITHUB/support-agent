import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = 'h-9 w-9' }: BrandLogoProps) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 2L3 9L16 16L29 9L16 2Z" fill="url(#logo-grad-top)" />
    <path d="M3 16L16 23L29 16" stroke="url(#logo-grad-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 23L16 30L29 23" stroke="url(#logo-grad-bot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-grad-top" x1="3" y1="9" x2="29" y2="9" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="logo-grad-mid" x1="3" y1="19.5" x2="29" y2="19.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4f46e5" />
        <stop offset="1" stopColor="#9333ea" />
      </linearGradient>
      <linearGradient id="logo-grad-bot" x1="3" y1="26.5" x2="29" y2="26.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4338ca" />
        <stop offset="1" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
  </svg>
);
