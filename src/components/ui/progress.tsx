import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  colorClass?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, colorClass = "bg-emerald-600", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all duration-500 ease-out", colorClass)}
        style={{ transform: `translateX(-${100 - (Math.min(100, Math.max(0, value || 0)))}%)` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
