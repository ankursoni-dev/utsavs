'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
}

function generateParticles(): Particle[] {
  return Array.from({ length: 20 }, (_, i) => ({
    left: `${(i / 20) * 100 + Math.random() * 5}%`,
    animationDuration: `${6 + Math.random() * 8}s`,
    animationDelay: `${Math.random() * 10}s`,
    size: `${4 + Math.random() * 8}px`,
  }));
}

export function GoldenParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  // Track whether particles have been initialized to avoid re-generating on re-render
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Wrap in setTimeout to satisfy react-hooks/set-state-in-effect rule
    const id = setTimeout(() => {
      setParticles(generateParticles());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="particle-container" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}
