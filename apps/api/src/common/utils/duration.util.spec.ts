import { parseDuration } from './duration.util';

describe('parseDuration', () => {
  it('should parse "15m" to 900 seconds', () => {
    expect(parseDuration('15m')).toBe(900);
  });

  it('should parse "30d" to 2592000 seconds', () => {
    expect(parseDuration('30d')).toBe(2_592_000);
  });

  it('should parse "1h" to 3600 seconds', () => {
    expect(parseDuration('1h')).toBe(3600);
  });

  it('should parse "45s" to 45 seconds', () => {
    expect(parseDuration('45s')).toBe(45);
  });

  it('should throw an Error for invalid format', () => {
    expect(() => parseDuration('abc')).toThrow(Error);
  });

  it('should throw an Error for empty string', () => {
    expect(() => parseDuration('')).toThrow(Error);
  });
});
