'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#FAFAF8',
          color: '#1A1917',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Something went wrong</h1>
        <button
          onClick={() => unstable_retry()}
          style={{
            padding: '0.5rem 1.25rem',
            background: '#7C2D6E',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
