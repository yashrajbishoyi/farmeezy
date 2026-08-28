'use client';

import React, { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: string;
  extraScale?: number;
  children: React.ReactNode;
  className?: string;
}

export function ClickSpark({
  sparkColor = '#10b981',
  sparkSize = 6,
  sparkRadius = 15,
  sparkCount = 6,
  duration = 400,
  children,
  className = '',
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div');
      spark.style.position = 'absolute';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = `${sparkSize}px`;
      spark.style.height = `${sparkSize}px`;
      spark.style.backgroundColor = sparkColor;
      spark.style.borderRadius = '50%';
      spark.style.pointerEvents = 'none';
      spark.style.zIndex = '999';

      const angle = (i / sparkCount) * 2 * Math.PI;
      const destinationX = Math.cos(angle) * sparkRadius;
      const destinationY = Math.sin(angle) * sparkRadius;

      spark.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY}px)) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: duration,
          easing: 'cubic-bezier(0, .9, .57, 1)',
          fill: 'forwards',
        }
      );

      containerRef.current.appendChild(spark);
      setTimeout(() => spark.remove(), duration);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-block overflow-visible ${className}`}
    >
      {children}
    </div>
  );
}
