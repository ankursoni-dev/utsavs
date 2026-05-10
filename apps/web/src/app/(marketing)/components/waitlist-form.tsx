'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function WaitlistForm() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 text-center">
        <p className="text-lg font-display text-charcoal">You're on the list. 🎉</p>
        <p className="text-sm text-text-muted mt-2">We'll reach out on WhatsApp when we launch.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-0 max-w-md mx-auto"
    >
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98765 43210"
        required
        aria-label="Phone number"
        className="w-full sm:flex-1 h-[46px] px-4 border border-border-strong rounded-[var(--radius-md)] sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-charcoal bg-surface text-text text-sm"
      />
      <Button
        type="submit"
        variant="champagne"
        size="lg"
        className="w-full sm:w-auto sm:rounded-l-none mt-2 sm:mt-0"
      >
        Get Early Access
      </Button>
    </form>
  );
}
