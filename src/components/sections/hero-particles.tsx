"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function makeParticles(count: number): Particle[] {
  // Deterministic pseudo-random so server/client markup matches (no hydration mismatch)
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 2,
    duration: 10 + rand() * 14,
    delay: rand() * 6,
    opacity: 0.15 + rand() * 0.35,
  }));
}

export function HeroParticles({ count = 34 }: { count?: number }) {
  const particles = useMemo(() => makeParticles(count), [count]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent-light"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, p.opacity, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
