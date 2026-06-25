"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms for items inside a sequence. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * One subtle entrance per element: hidden until it scrolls into view, then a
 * single soft rise (see `.reveal` in globals.css). No loops, and fully neutral
 * under prefers-reduced-motion. Reveals immediately if IntersectionObserver is
 * unavailable so content is never stuck hidden.
 */
export default function Reveal({
  children,
  delay = 0,
  as,
  className = "",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
