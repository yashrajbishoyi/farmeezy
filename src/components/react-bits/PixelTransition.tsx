'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent?: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  className?: string;
}

export function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = '#059669',
  animationStepDuration = 0.3,
  className = '',
}: PixelTransitionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full">
        {secondContent && isHovered ? secondContent : firstContent}
      </div>

      {/* Decorative subtle pixel border effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.08 : 0,
          backgroundImage: `radial-gradient(${pixelColor} 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }}
      />
    </div>
  );
}
