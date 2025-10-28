import React from 'react';

const WarriorHeadIcon = ({ className = "w-6 h-6" }) => {
  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5685ec041_Logo.png";
  
  return (
    <img 
      src={logoUrl} 
      alt="Crocifisso del Tufo Logo" 
      className={className}
    />
  );
};

export default WarriorHeadIcon;