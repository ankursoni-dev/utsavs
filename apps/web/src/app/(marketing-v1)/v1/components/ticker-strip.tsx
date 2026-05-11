const TICKER_TEXT =
  "Budget tracking ◆ Shagun collection ◆ Vendor milestones ◆ Guest RSVPs ◆ Multi-host splits ◆ Event timelines ◆ Themed invitations";

export function TickerStrip() {
  return (
    <>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          animation: ticker 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-inner {
            animation: none;
          }
          .ticker-duplicate {
            display: none;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="w-full overflow-hidden py-4 border-y border-border"
      >
        <div className="ticker-inner flex whitespace-nowrap">
          <span className="font-mono text-xs tracking-widest uppercase text-text-subtle flex-shrink-0 pr-8">
            {TICKER_TEXT.split("◆").map((segment, i, arr) => (
              <span key={i}>
                {segment.trim()}
                {i < arr.length - 1 && (
                  <span className="opacity-50 mx-4">◆</span>
                )}
              </span>
            ))}
            <span className="opacity-50 mx-4">◆</span>
          </span>
          <span
            className="ticker-duplicate font-mono text-xs tracking-widest uppercase text-text-subtle flex-shrink-0 pr-8"
            aria-hidden="true"
          >
            {TICKER_TEXT.split("◆").map((segment, i, arr) => (
              <span key={i}>
                {segment.trim()}
                {i < arr.length - 1 && (
                  <span className="opacity-50 mx-4">◆</span>
                )}
              </span>
            ))}
            <span className="opacity-50 mx-4">◆</span>
          </span>
        </div>
      </div>
    </>
  );
}
