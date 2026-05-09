import { BadRequestException } from '@nestjs/common';

/**
 * Normalizes a raw Indian mobile number string to the canonical "+91XXXXXXXXXX" format.
 *
 * Accepted inputs (examples):
 *   "9876543210"       → "+919876543210"
 *   "919876543210"     → "+919876543210"
 *   "+919876543210"    → "+919876543210"
 *   "+91 98765 43210"  → "+919876543210"
 *   "09876543210"      → "+919876543210"
 *
 * Throws BadRequestException for any number that cannot be mapped to a valid
 * 10-digit Indian mobile number starting with 6-9.
 */
export function normalizeIndianPhone(raw: string): string {
  // Strip spaces, dashes, parentheses, dots
  const stripped = raw.replace(/[\s\-().]/g, '');

  let digits: string;

  if (stripped.startsWith('+91')) {
    digits = stripped.slice(3);
  } else if (stripped.startsWith('91') && stripped.length === 12) {
    digits = stripped.slice(2);
  } else if (stripped.startsWith('0')) {
    digits = stripped.slice(1);
  } else {
    digits = stripped;
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new BadRequestException(
      'Invalid Indian mobile number. Must be 10 digits starting with 6-9.',
    );
  }

  return `+91${digits}`;
}
