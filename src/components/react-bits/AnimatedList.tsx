'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className = '',
  staggerDelay = 0.06,
}: AnimatedListProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-2', className)}
    >
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;

        const itemVariants = {
          hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.35,
              ease: 'easeOut',
            },
          },
        };

        return (
          <motion.div key={idx} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
