import React from 'react';

const TintedBackdrop: React.FC = () => {
  return (
    <div 
      aria-hidden 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-transparent to-stone-900/10 dark:from-orange-500/3 dark:via-transparent dark:to-stone-900/20" />
      
      {/* Animated ambient light effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-400/15 rounded-full filter blur-3xl opacity-15 dark:opacity-8 animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default TintedBackdrop;
