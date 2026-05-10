"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/themes";
import { Chip } from "@/components/ui/chip";
import type { ChipStatus } from "@/components/ui/chip";

const STEPS = [
  {
    number: "01",
    label: "Budget & Shagun",
    headline: "Know where every rupee went.",
    body: "Set category budgets. Track vendor payments against milestones. Collect shagun digitally with instant family-wise reconciliation. Two families, one financial picture.",
    bullets: [
      "Category-wise budget vs. actual",
      "Vendor payment milestones with proof",
      "Digital shagun with auto-reconciliation",
    ],
  },
  {
    number: "02",
    label: "Vendor Command",
    headline: "Six vendors. One dashboard.",
    body: "Track deliverables, flag risks, manage payment milestones. See who's confirmed, who's ghosting, and who needs a nudge — across every wedding you're running.",
    bullets: [
      "Deliverable tracking with status chips",
      "Risk scoring (green/yellow/red)",
      "Payment milestone automation",
    ],
  },
  {
    number: "03",
    label: "Guest Intelligence",
    headline: "Not just a list. A live dashboard.",
    body: "Import from contacts or CSV. Auto-tag by side, relation, dietary needs. Track RSVPs in real time. Know exactly how many plates to order — not how many people said 'will try to come' on WhatsApp.",
    bullets: [
      "Smart import with auto-dedup",
      "Side-based tagging (bride/groom family, friends, work)",
      "Real-time RSVP with dietary roll-ups",
    ],
  },
  {
    number: "04",
    label: "Themed Experiences",
    headline: "Their invitation. Your brand.",
    body: "Choose from 6 curated themes or bring your own. Each guest gets a personalized page with schedule, RSVP, directions, and digital shagun — all wrapped in the event's visual identity.",
    bullets: [
      "6 curated themes (or custom)",
      "Personalized guest pages",
      "Built-in shagun, RSVP, schedule",
    ],
  },
];

// ── Mock panels ──────────────────────────────────────────────────────────────

function MockBudget() {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-sm text-text">Budget Overview</span>
        <span className="inline-flex items-center gap-1 bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-medium px-2 py-0.5 rounded-full">
          On Track
        </span>
      </div>
      <div className="space-y-3">
        {[
          {
            name: "Venue",
            fill: 65,
            trackColor: "bg-emerald/20",
            fillColor: "bg-emerald",
            label: "₹4.2L / ₹6.5L",
          },
          {
            name: "Catering",
            fill: 80,
            trackColor: "bg-champagne/20",
            fillColor: "bg-champagne",
            label: "₹2.8L / ₹3.5L",
          },
          {
            name: "Decor",
            fill: 45,
            trackColor: "bg-maroon/10",
            fillColor: "bg-maroon",
            label: "₹1.5L / ₹3.0L",
          },
        ].map((bar) => (
          <div key={bar.name}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-text-muted">{bar.name}</span>
              <span className="text-xs text-text-muted">{bar.label}</span>
            </div>
            <div className={`h-1.5 rounded-full w-full ${bar.trackColor}`}>
              <div
                className={`h-1.5 rounded-full ${bar.fillColor}`}
                style={{ width: `${bar.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border my-3" />
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">Shagun Collected</span>
        <span className="text-sm font-medium text-emerald">↑ ₹8,42,000</span>
      </div>
    </div>
  );
}

function MockVendors() {
  const vendors: {
    name: string;
    category: string;
    status: ChipStatus;
    pct: number;
  }[] = [
    { name: "Grand Palace", category: "Venue", status: "confirmed", pct: 80 },
    {
      name: "Sharma Catering",
      category: "Catering",
      status: "caution",
      pct: 60,
    },
    { name: "DJ Mantra", category: "DJ", status: "confirmed", pct: 100 },
    { name: "Lumina Decor", category: "Decor", status: "pending", pct: 30 },
  ];

  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-sm text-text">Vendors</span>
        <span className="bg-hover text-text-muted text-xs font-medium px-2 py-0.5 rounded-full">
          6
        </span>
      </div>
      <div className="space-y-0">
        {vendors.map((v, i) => (
          <div
            key={v.name}
            className={`py-2.5 ${i < vendors.length - 1 ? "border-b border-border/50" : ""}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm text-text font-medium">{v.name}</span>
                <span className="text-xs text-text-subtle ml-2">
                  {v.category}
                </span>
              </div>
              <Chip status={v.status} dense>
                {v.status}
              </Chip>
            </div>
            <div className="h-1 rounded-full bg-hover w-full">
              <div
                className="h-1 rounded-full bg-charcoal/30"
                style={{ width: `${v.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockGuests() {
  const guests: {
    initials: string;
    color: string;
    name: string;
    side: string;
    rsvp: ChipStatus;
    diet: string;
  }[] = [
    {
      initials: "AS",
      color: "#e8b8b8",
      name: "Aarav Sharma",
      side: "Groom",
      rsvp: "confirmed",
      diet: "Veg",
    },
    {
      initials: "PK",
      color: "#bfdbfe",
      name: "Priya Kapoor",
      side: "Bride",
      rsvp: "confirmed",
      diet: "Non-veg",
    },
    {
      initials: "RM",
      color: "#fde68a",
      name: "Ravi Mehta",
      side: "Groom",
      rsvp: "pending",
      diet: "Veg",
    },
    {
      initials: "SG",
      color: "#d4e8df",
      name: "Sonal Gupta",
      side: "Bride",
      rsvp: "declined",
      diet: "Jain",
    },
    {
      initials: "VN",
      color: "#ede9fe",
      name: "Vikram Nair",
      side: "Groom",
      rsvp: "confirmed",
      diet: "Non-veg",
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
    >
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 mb-2 px-1">
        {["Guest", "Side", "RSVP", "Diet"].map((h) => (
          <span
            key={h}
            className="text-[10px] uppercase tracking-wider text-text-subtle font-mono"
          >
            {h}
          </span>
        ))}
      </div>
      <div className="space-y-0">
        {guests.map((g, i) => (
          <div
            key={g.name}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-1 py-2 ${i < guests.length - 1 ? "border-b border-border/50" : ""}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full text-charcoal/80 text-xs font-medium flex items-center justify-center shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.initials}
              </div>
              <span className="text-xs text-text truncate">{g.name}</span>
            </div>
            <span className="text-xs text-text-subtle">{g.side}</span>
            <Chip status={g.rsvp} dense>
              {g.rsvp}
            </Chip>
            <span className="text-xs text-text-subtle text-right">
              {g.diet}
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs text-text-subtle mt-3 pt-3 border-t border-border/50">
        247 confirmed · 18 pending · 12 declined
      </div>
    </div>
  );
}

function MockInvitation() {
  const theme = THEMES["royal-ivory"];
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div
        className="w-[240px] h-[420px] rounded-[2rem] border-[3px] border-charcoal/20 shadow-[var(--shadow-lg)] rotate-2 overflow-hidden flex flex-col items-center justify-center gap-2 px-6"
        style={{ background: theme.grad }}
      >
        <p
          className="font-display text-2xl tracking-[-0.02em] text-center"
          style={{ color: theme.text }}
        >
          Priya &amp; Arjun
        </p>
        <p className="text-sm mt-1 text-center" style={{ color: theme.text }}>
          14 December 2026
        </p>
        <p
          className="text-xs mt-0.5 opacity-70 text-center"
          style={{ color: theme.text }}
        >
          Jaipur
        </p>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {["Schedule", "RSVP", "Shagun"].map((label) => (
            <span
              key={label}
              className="border text-xs px-3 py-1 rounded-full"
              style={{ borderColor: theme.text, color: theme.text }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCK_PANELS = [MockBudget, MockVendors, MockGuests, MockInvitation];

// ── Timeline ─────────────────────────────────────────────────────────────────

export function StepTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>(STEPS.map(() => null));

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setVisibleSteps(new Set(STEPS.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-step"));
          if (entry.isIntersecting) {
            setActiveStep(index);
            setVisibleSteps((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.3 },
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Center line — desktop only */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2"
      />

      {STEPS.map((step, index) => {
        const MockPanel = MOCK_PANELS[index];
        const isVisible = visibleSteps.has(index);
        const isActive = activeStep === index;

        return (
          <div
            key={step.number}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            data-step={index}
            className="min-h-[80vh] py-16 md:py-20 relative flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-center"
          >
            {/* Step dot — desktop only */}
            <div
              aria-hidden="true"
              className={`hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 ${
                isActive
                  ? "bg-charcoal border-charcoal scale-125"
                  : "bg-surface border-border"
              }`}
            />

            {/* Text column */}
            <div className="md:pr-12 flex flex-col">
              {/* Step label */}
              <div className="flex items-center gap-2 mb-6">
                <span aria-hidden="true" className="w-8 h-px bg-charcoal/30" />
                <span className="font-mono text-xs tracking-widest uppercase text-charcoal/60">
                  {step.number} — {step.label}
                </span>
              </div>

              <h3 className="font-display text-3xl italic tracking-[-0.02em] leading-[1.05] text-text">
                {step.headline}
              </h3>
              <p className="text-text-muted text-base leading-relaxed mt-4">
                {step.body}
              </p>

              <ul className="mt-6 space-y-2">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-charcoal mt-2 shrink-0"
                    />
                    <span className="text-sm text-text-muted">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock UI panel */}
            <div
              aria-hidden="true"
              className={`mt-10 md:mt-0 md:pl-12 transition-all duration-700 ease-out motion-reduce:transition-none ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <MockPanel />
            </div>
          </div>
        );
      })}
    </div>
  );
}
