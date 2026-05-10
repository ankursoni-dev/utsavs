export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg text-text">
      <h1 className="text-6xl font-display text-charcoal">404</h1>
      <p className="text-text-muted">This page doesn&apos;t exist.</p>
      <a href="/" className="text-sm underline underline-offset-4 hover:text-text transition-colors">
        Go home
      </a>
    </div>
  );
}
