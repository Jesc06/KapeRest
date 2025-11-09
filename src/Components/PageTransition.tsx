import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

type Props = {
  children: React.ReactNode;
};

const PageTransition: React.FC<Props> = ({ children }) => {
  // Variants for smoother feel (opacity + subtle scale) with spring for entry, shortened fade for exit.
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const variants: Variants = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] } }
  } : {
    // Pure blur in / blur out with slight saturation boost to mitigate banding.
    // Lower blur radius helps avoid pixelation on Windows while keeping the effect.
    initial: { opacity: 0.88, filter: 'saturate(1.05) contrast(1.02) blur(14px)' },
    animate: { opacity: 1, filter: 'saturate(1.05) contrast(1.02) blur(0px)', transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1] } },
    exit: { opacity: 0.78, filter: 'saturate(1.05) contrast(1.02) blur(12px)', transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="motion-blur-smooth relative"
    >
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="transition-grain"
          initial={{ opacity: 0.05 }}
          animate={{ opacity: 0.03, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] } }}
          exit={{ opacity: 0.04, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default PageTransition;
