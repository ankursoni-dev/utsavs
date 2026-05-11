'use client';

import { useEffect, useRef, useState } from 'react';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export interface CountUpStatProps {
  value: string;
  label: string;
  className?: string;
}

interface ParsedValue {
  prefix: string;
  from: number;
  to: number | null;
  suffix: string;
}

// Parse pattern: optional prefix, from number, optional range to number, optional suffix
// e.g. "₹15-80L" → { prefix: "₹", from: 15, to: 80, suffix: "L" }
// e.g. "20-50" → { prefix: "", from: 20, to: 50, suffix: "" }
// e.g. "42" → { prefix: "", from: 42, to: null, suffix: "" }
function parseValue(v: string): ParsedValue {
  const match = v.trim().match(/^([^\d]*?)(\d+)(?:\s*[-–]\s*(\d+))?([^\d]*)$/);
  if (!match) return { prefix: '', from: 0, to: null, suffix: v };
  return {
    prefix: match[1] ?? '',
    from: parseInt(match[2], 10),
    to: match[3] != null ? parseInt(match[3], 10) : null,
    suffix: match[4] ?? '',
  };
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
  // Parse once and hold in ref — stable across re-renders
  const parsedRef = useRef<ParsedValue>(parseValue(value));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Use setTimeout to avoid synchronous setState-in-effect lint violation
      const id = setTimeout(() => {
        setDisplayed(value);
        setVisible(true);
      }, 0);
      return () => clearTimeout(id);
    }

    // Re-sync the parsed ref so it reflects the current value prop, not a stale one
    // from a previous render. The ref is set once at init but the effect re-runs on
    // value changes — without this line the animation would count toward a stale target.
    parsedRef.current = parseValue(value);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            setVisible(true);

            const parsed = parsedRef.current;
            const duration = 1800;
            const startTime = performance.now();

            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easedProgress = easeOut(progress);

              const currentFrom = Math.round(easedProgress * parsed.from);

              let result: string;
              if (parsed.to !== null) {
                const currentTo = Math.round(easedProgress * parsed.to);
                result = `${parsed.prefix}${currentFrom}-${currentTo}${parsed.suffix}`;
              } else {
                result = `${parsed.prefix}${currentFrom}${parsed.suffix}`;
              }

              setDisplayed(result);

              if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
              } else {
                // Snap to exact final value
                setDisplayed(value);
              }
            };

            rafRef.current = requestAnimationFrame(tick);
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
      className={`transition-opacity duration-700 motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <Display size="lg" as="h3" className={className}>
        {displayed}
      </Display>
      <Eyebrow className="mt-2">{label}</Eyebrow>
    </div>
  );
}
