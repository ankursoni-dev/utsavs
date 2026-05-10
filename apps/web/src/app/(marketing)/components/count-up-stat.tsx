"use client";

import { useEffect, useRef, useState } from "react";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";

export interface CountUpStatProps {
  value: string;
  label: string;
  className?: string;
}

function isIntegerString(v: string): boolean {
  return /^\d+$/.test(v.trim());
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUpStat({ value, label, className }: CountUpStatProps) {
  const [displayed, setDisplayed] = useState<string>(value);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setDisplayed(value);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            setVisible(true);

            if (isIntegerString(value)) {
              const target = parseInt(value, 10);
              const duration = 1500;
              const startTime = performance.now();

              const tick = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.round(easeOut(progress) * target);
                setDisplayed(String(current));

                if (progress < 1) {
                  rafRef.current = requestAnimationFrame(tick);
                } else {
                  setDisplayed(value);
                }
              };

              rafRef.current = requestAnimationFrame(tick);
            } else {
              setDisplayed(value);
            }
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`transition-opacity duration-700 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <Display size="lg" as="h3" className={className}>
        {displayed}
      </Display>
      <Eyebrow className="mt-2">{label}</Eyebrow>
    </div>
  );
}
