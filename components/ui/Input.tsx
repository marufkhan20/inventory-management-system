import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

// Use Type instead of Interface to avoid the empty object ESLint error
type IProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, IProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          `
          w-full p-4 outline-none bg-white rounded-xl text-center block 
          border border-[#E5E7EB] transition-all 
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        `,
          className
        )}
        // Spreading props here handles value and onChange automatically
        // via React Hook Form's register function
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
