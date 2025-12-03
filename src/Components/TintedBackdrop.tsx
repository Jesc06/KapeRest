import React from 'react';

const TintedBackdrop: React.FC = () => {
  return (
    <div 
      aria-hidden 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Multi-layer gradient overlay for premium depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-600/8 dark:from-orange-400/3 dark:via-transparent dark:to-amber-500/5" />
      <div className="absolute inset-0 bg-gradient-to-tl from-rose-400/3 via-transparent to-stone-500/5 dark:from-rose-500/2 dark:via-transparent dark:to-stone-600/3" />
      
      {/* Premium mesh gradient */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent dark:from-orange-500/10"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-200/40 via-transparent to-transparent dark:from-amber-500/10"></div>
      </div>
      
      {/* Animated ambient light orbs with smoother animations */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-gradient-to-br from-orange-300/25 to-amber-300/15 rounded-full filter blur-[100px] opacity-40 dark:opacity-15 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-gradient-to-tl from-amber-300/20 to-orange-300/15 rounded-full filter blur-[80px] opacity-35 dark:opacity-12 animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }} />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-200/10 via-orange-200/15 to-amber-200/10 rounded-full filter blur-[120px] opacity-30 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s', animationDuration: '12s' }} />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>
    </div>
  );
};

export default TintedBackdrop;
