import { cn } from "@/lib/utils";
import React from "react";

interface IProps {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button = ({ children, className, type, disabled }: IProps) => {
  return (
    <button
      className={cn(
        "py-3 px-6 bg-primary text-white text-base font-semibold rounded-xl cursor-pointer inline-block w-auto disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      type={type || "button"}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
