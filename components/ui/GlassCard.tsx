import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", hoverEffect = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl
        ${hoverEffect ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/80 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};