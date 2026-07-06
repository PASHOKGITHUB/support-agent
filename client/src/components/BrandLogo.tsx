import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = 'h-9 w-9' }: BrandLogoProps) => (
  <img 
    src="/logo.png" 
    alt="SupportAgent.ai Logo" 
    className={`${className} object-contain`}
  />
);






