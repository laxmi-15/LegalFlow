"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const NODES = [
  { id: "client", x: 90, y: 70, label: "Client", size: 46 },
  { id: "intake", x: 300, y: 40, label: "AI Intake", size: 58 },
  { id: "intent", x: 520, y: 110, label: "Intent", size: 42 },
  { id: "conflict", x: 250, y: 260, label: "Conflict Check", size: 44 },
  { id: "attorney", x: 470, y: 300, label: "Attorney", size: 52 },
  { id: "calendar", x: 640, y: 210, label: "Calendar", size: 40 },
];

const EDGES: [string, string][] = [
  ["client", "intake"],
  ["intake", "intent"],
  ["intake", "conflict"],
  ["intent", "attorney"],
  ["conflict", "attorney"],
  ["attorney", "calendar"],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function HeroGraph() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const rotateX = useTransform(sy, [-40, 40], [4, -4]);
  const rotateY = useTransform(sx, [-40, 40], [-4, 4]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 80);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 80);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative mx-auto aspect-[720/380] w-full max-w-3xl select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 720 380"
        className="h-full w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#edgeGradient)"
              strokeWidth={1.4}
              strokeOpacity={0.35}
              strokeDasharray="6 8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, strokeDashoffset: [0, -28] }}
              transition={{
                pathLength: { duration: 1.2, delay: 0.4 + i * 0.15, ease: "easeOut" },
                strokeDashoffset: {
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.6 + i * 0.15,
                },
              }}
            />
          );
        })}

        {NODES.map((node, i) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <motion.circle
              r={node.size / 2 + 16}
              fill="url(#nodeGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            />
            <motion.g
              initial={{ opacity: 0, scale: 0.6, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.circle
                r={node.size / 2}
                fill="#0A0A0A"
                stroke={node.id === "intake" ? "url(#edgeGradient)" : "rgba(255,255,255,0.14)"}
                strokeWidth={node.id === "intake" ? 1.6 : 1}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            </motion.g>
            <motion.text
              y={node.size / 2 + 20}
              textAnchor="middle"
              className="fill-white/70"
              fontSize="11"
              fontWeight={500}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
