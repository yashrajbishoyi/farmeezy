'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
  initialOpacity?: number;
  className?: string;
}

export function FadeContent({
  children,
  blur = false,
  duration = 0.4,
  delay = 0,
  initialOpacity = 0,
  className = '',
}: FadeContentProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: initialOpacity,
        filter: blur ? 'blur(4px)' : 'none',
        y: 6,
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
      }}
      exit={{
        opacity: initialOpacity,
        filter: blur ? 'blur(4px)' : 'none',
        y: -6,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
}
