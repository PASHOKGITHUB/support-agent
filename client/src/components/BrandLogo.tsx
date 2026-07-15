import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = 'h-9 w-9' }: BrandLogoProps) => (
  <img 
    src="/invaccs.jpeg" 
    alt="Invaccs Logo" 
    className={`${className} object-contain`}
  />
);






