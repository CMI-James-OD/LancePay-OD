"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  fullWidth = false,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-brand-black text-white hover:bg-gray-900 border border-transparent",
    outline:
      "bg-white text-brand-black border border-brand-border hover:border-brand-black",
    ghost:
      "bg-transparent text-gray-600 hover:text-brand-black hover:bg-brand-light",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? "w-full" : ""} 
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </motion.button>
  );
}
