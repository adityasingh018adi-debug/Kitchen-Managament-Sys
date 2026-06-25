"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useState } from "react";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(16,185,129,0.15)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-xl backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(target);
      return;
    }
    let frame: number;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""));
  const isAnimatable = typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?%?$/.test(value));
  const suffix = typeof value === "string" && value.endsWith("%") ? "%" : "";
  const animated = useCountUp(isAnimatable && Number.isFinite(numeric) ? numeric : 0);

  const display = isAnimatable && Number.isFinite(numeric) ? `${Math.round(animated)}${suffix}` : value;

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <motion.p
        key={String(value)}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-3xl font-semibold text-white tabular-nums"
      >
        {display}
      </motion.p>
    </Card>
  );
}
