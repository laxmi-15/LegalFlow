"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  as?: "button" | "a";
  href?: string;
}

export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.35,
  as = "button",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * strength, y: y * strength });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  const sharedProps = {
    onClick,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    animate: { x: pos.x, y: pos.y },
    transition: { type: "spring" as const, stiffness: 150, damping: 12, mass: 0.15 },
    className: cn("inline-flex items-center justify-center", className),
  };

  const inner = (
    <motion.span
      animate={{ x: pos.x * 0.4, y: pos.y * 0.4 }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (as === "a") {
    return (
      <motion.a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...sharedProps}>
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button ref={ref as React.Ref<HTMLButtonElement>} {...sharedProps}>
      {inner}
    </motion.button>
  );
}
