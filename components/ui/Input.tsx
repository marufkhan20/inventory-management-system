"use client"; // Required for useState

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react"; // Install lucide-react if you haven't
import React, { forwardRef, useState } from "react";

type IProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, IProps>(
  ({ className, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine if we should show the toggle logic
    const isPassword = type === "password";

    // Toggle the type between 'password' and 'text'
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            `
            w-full p-4 outline-none bg-white rounded-xl text-left block 
            border border-[#E5E7EB] transition-all 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            ${isPassword ? "pr-12" : ""} 
          `,
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-main transition-colors"
            tabIndex={-1} // Prevents tabbing into the eye icon
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
