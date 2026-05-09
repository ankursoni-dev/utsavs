/**
 * Parses a duration string like "15m", "30d", "1h", "45s" into seconds.
 *
 * Supported suffixes: s (seconds), m (minutes), h (hours), d (days).
 * Throws an Error if the format is invalid.
 */
export function parseDuration(d: string): number {
  const match = /^(\d+)([smhd])$/.exec(d);
  if (!match) {
    throw new Error(`Invalid duration format: "${d}". Expected format like "15m", "1h", "30d".`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      throw new Error(`Unknown duration unit: "${unit}"`);
  }
}
