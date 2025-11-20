import * as React from "react";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

export function Progress({ value = 0, className = "" }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}
    >
      <motion.div
        className="h-full w-full bg-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: value / 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}
