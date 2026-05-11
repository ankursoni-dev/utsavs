'use client';
import { useState } from 'react';

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
        <p className="text-lg font-display text-charcoal">You&apos;re on the list.</p>
        <p className="text-sm text-text-muted mt-2">
          We&apos;ll reach out on WhatsApp when we launch.
        </p>
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
        placeholder="Your phone number"
        required
        aria-label="Phone number"
        className="w-full sm:flex-1 h-[46px] px-4 border border-border-strong rounded-[var(--radius-md)] sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-charcoal bg-surface text-text text-sm"
      />
      <button
        type="submit"
        className="w-full sm:w-auto sm:rounded-l-none mt-2 sm:mt-0 h-[46px] px-6 text-white text-sm font-medium rounded-[var(--radius-md)] shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        Get Early Access
      </button>
    </form>
  );
}
