'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AuroraProps {
  children?: React.ReactNode;
  className?: string;
  colorStops?: string[];
  amplitude?: number;
  speed?: number;
}

export function Aurora({
  children,
  className = '',
  colorStops = ['#047857', '#065f46', '#0f766e'],
  amplitude = 1.0,
  speed = 1.0,
}: AuroraProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Aurora visual glow layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  scale: [1, 1.05, 1],
                }
          }
          transition={{
            duration: 18 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-[50%] blur-[70px]"
          style={{
            backgroundImage: `radial-gradient(ellipse at 30% 30%, ${colorStops[0]} 0%, transparent 60%),
                              radial-gradient(ellipse at 70% 60%, ${colorStops[1]} 0%, transparent 60%),
                              radial-gradient(ellipse at 50% 90%, ${colorStops[2]} 0%, transparent 60%)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
