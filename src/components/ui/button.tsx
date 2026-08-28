import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ink' | 'dusk' | 'paper' | 'outline' | 'ghost' | 'inverted' | 'agri' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  withArrow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', withArrow = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] border border-transparent shadow-none",
      ink: "bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] border border-transparent shadow-none",
      dusk: "bg-[#1F3A2E] text-white hover:bg-[#244537] border border-transparent shadow-none",
      agri: "bg-[#14231C] text-[#F5F4F0] hover:bg-[#23372E] border border-transparent shadow-none",
      paper: "bg-white text-[#14231C] border border-[#E3E1D9] hover:bg-[#F5F4F0] shadow-none",
      outline: "bg-transparent text-[#14231C] border border-[#E3E1D9] hover:bg-white shadow-none",
      inverted: "bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] border border-transparent shadow-none font-medium",
      ghost: "bg-transparent text-[#14231C] hover:text-[#5C6259] hover:bg-transparent shadow-none",
      destructive: "bg-[#C13B3B] text-white hover:bg-[#A82E2E] border border-transparent shadow-none",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2 text-[14px]",
      sm: "h-9 px-4 py-1.5 text-[13px]",
      lg: "h-13 px-7 py-3 text-[15px]",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#14231C] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] group",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {withArrow && (
          <span className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors flex items-center justify-center ml-2.5 shrink-0">
            <ArrowRight className="w-3 h-3 text-current" />
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
