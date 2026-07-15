import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = 'h-8 w-auto max-w-[120px]' }: BrandLogoProps) => (
  <img 
    src="/invaccs.jpeg" 
    alt="Invaccs Logo" 
    className={`${className} object-contain`}
  />
);






