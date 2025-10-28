import React from 'react';

const TombIcon = ({ className = "w-6 h-6", color = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corpo principale della tomba */}
      <rect x="3" y="8" width="18" height="12" rx="1" fill={color} opacity="0.9" />
      
      {/* Tetto/Copertura */}
      <rect x="2" y="6" width="20" height="3" rx="1" fill={color} opacity="0.7" />
      
      {/* Ingresso (più scuro per dare profondità) */}
      <rect x="10" y="13" width="4" height="7" rx="0.5" fill="rgba(0,0,0,0.3)" />
    </svg>
  );
};

export default TombIcon;