import React from 'react';

const KantharosIcon = ({ className = "w-6 h-6", color = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Base/piedestallo */}
      <path 
        d="M8 20h8v1.5c0 0.3-0.2 0.5-0.5 0.5h-7c-0.3 0-0.5-0.2-0.5-0.5V20z" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Corpo principale del vaso */}
      <path 
        d="M6 14c0 3.3 2.7 6 6 6s6-2.7 6-6V10c0-1.1-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v4z" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Anse caratteristiche curve del kantharos - sinistra */}
      <path 
        d="M6 12c-2 0-3.5-1.5-3.5-3.5S4 5 6 5" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Anse caratteristiche curve del kantharos - destra */}
      <path 
        d="M18 12c2 0 3.5-1.5 3.5-3.5S20 5 18 5" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Orlo del vaso */}
      <ellipse 
        cx="12" 
        cy="8" 
        rx="6" 
        ry="1" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
      />
    </svg>
  );
};

export default KantharosIcon;