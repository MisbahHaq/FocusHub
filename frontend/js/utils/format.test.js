import { describe, it, expect } from 'vitest';
import { formatTimeHMS, formatHoursAndMins, formatDateRange } from './format.js';

describe('formatTimeHMS', () => {
  it('formats zero seconds', () => {
    expect(formatTimeHMS(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatTimeHMS(45)).toBe('00:00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTimeHMS(125)).toBe('00:02:05');
  });

  it('formats hours, minutes, seconds', () => {
    expect(formatTimeHMS(3661)).toBe('01:01:01');
  });

  it('handles large values', () => {
    expect(formatTimeHMS(99999)).toBe('27:46:39');
  });
});

describe('formatHoursAndMins', () => {
  it('returns <1m for zero', () => {
    expect(formatHoursAndMins(0)).toBe('<1m');
  });

  it('returns minutes only', () => {
    expect(formatHoursAndMins(300)).toBe('5m');
  });

  it('returns hours only', () => {
    expect(formatHoursAndMins(7200)).toBe('2h');
  });

  it('returns hours and minutes', () => {
    expect(formatHoursAndMins(3661)).toBe('1h 1m');
  });

  it('handles edge case', () => {
    expect(formatHoursAndMins(59)).toBe('<1m');
    expect(formatHoursAndMins(60)).toBe('1m');
  });
});

describe('formatDateRange', () => {
  it('formats a date range', () => {
    const result = formatDateRange('2026-01-01', '2026-02-01');
    expect(result).toContain('Jan');
    expect(result).toContain('Feb');
    expect(result).toContain('–');
  });
});
