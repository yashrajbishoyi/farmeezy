import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'low' | 'moderate' | 'high' | 'critical' | 'agri';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-[#14231C] text-[#F5F4F0]",
    secondary: "border-[#E3E1D9] bg-white text-[#5C6259]",
    destructive: "border-transparent bg-[#C13B3B] text-white",
    outline: "border-[#E3E1D9] text-[#14231C] bg-white",
    agri: "border-[#E3E1D9] bg-[#F5F4F0] text-[#14231C] font-normal",
    // Exact Risk Scale System (Reserved Exclusively for Risk Data)
    low: "border-transparent bg-[#2F9E5C] text-white font-medium",
    moderate: "border-transparent bg-[#D9A62E] text-white font-medium",
    high: "border-transparent bg-[#E0722F] text-white font-medium",
    critical: "border-transparent bg-[#C13B3B] text-white font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-tight transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
