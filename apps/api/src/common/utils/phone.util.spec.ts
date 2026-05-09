import { BadRequestException } from '@nestjs/common';
import { normalizeIndianPhone } from './phone.util';

describe('normalizeIndianPhone', () => {
  it('should normalize a plain 10-digit number', () => {
    expect(normalizeIndianPhone('9876543210')).toBe('+919876543210');
  });

  it('should normalize a number with 91 prefix (no +)', () => {
    expect(normalizeIndianPhone('919876543210')).toBe('+919876543210');
  });

  it('should return a number already in +91 format as-is', () => {
    expect(normalizeIndianPhone('+919876543210')).toBe('+919876543210');
  });

  it('should strip spaces and normalize +91 with spaces', () => {
    expect(normalizeIndianPhone('+91 98765 43210')).toBe('+919876543210');
  });

  it('should strip leading 0 and normalize', () => {
    expect(normalizeIndianPhone('09876543210')).toBe('+919876543210');
  });

  it('should throw BadRequestException for a number not starting with 6-9', () => {
    expect(() => normalizeIndianPhone('1234567890')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for a number that is too short', () => {
    expect(() => normalizeIndianPhone('987654')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for a number that is too long', () => {
    expect(() => normalizeIndianPhone('98765432101')).toThrow(BadRequestException);
  });
});
