"use client";

import { useEffect, useRef, useState } from "react";

// Fades content in when it enters the screen and out when it leaves, so it
// "disappears and comes back" as you scroll. Set once to keep it visible after the first reveal.
export function Reveal({
  children, delay, once = false, className = "",
}: { children: React.ReactNode; delay?: number; once?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) { setShown(true); if (once) io.disconnect(); }
        else if (!once) setShown(false);
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={delay !== undefined ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}