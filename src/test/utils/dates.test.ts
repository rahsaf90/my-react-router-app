import { describe, expect, it } from 'vitest';
import {
    dateFormat,
    datetimeISO,
    daysFrom,
    localDateFormat,
    localDateTimeFormat,
} from '~/lib/utils/dates';

const FIXED_ISO = '2024-06-15T12:00:00.000Z';

describe('datetimeISO', () => {
  it('converts a Date to an ISO string', () => {
    const result = datetimeISO(new Date(FIXED_ISO));
    expect(result).toBe(FIXED_ISO);
  });

  it('converts an ISO string to an ISO string', () => {
    const result = datetimeISO(FIXED_ISO);
    expect(result).toBe(FIXED_ISO);
  });
});

describe('dateFormat', () => {
  it('formats a date with the default YYYY-MM-DD format', () => {
    // Use UTC date to avoid timezone issues in CI
    const result = dateFormat('2024-06-15');
    expect(result).toBe('2024-06-15');
  });

  it('formats a date with a custom format', () => {
    const result = dateFormat('2024-06-15', 'DD/MM/YYYY');
    expect(result).toBe('15/06/2024');
  });
});

describe('localDateFormat', () => {
  it('returns a YYYY-MM-DD string', () => {
    const result = localDateFormat('2024-06-15T00:00:00');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('accepts a custom format', () => {
    const result = localDateFormat('2024-06-15T00:00:00', 'MM/DD/YYYY');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('localDateTimeFormat', () => {
  it('returns an empty string for null', () => {
    expect(localDateTimeFormat(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(localDateTimeFormat(undefined)).toBe('');
  });

  it('returns a formatted string for a valid date', () => {
    const result = localDateTimeFormat('2024-06-15T10:30:00');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('accepts a custom format', () => {
    const result = localDateTimeFormat('2024-06-15T10:30:00', 'DD/MM/YYYY');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('daysFrom', () => {
  it('returns 0 for null', () => {
    expect(daysFrom(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(daysFrom(undefined)).toBe(0);
  });

  it('returns 0 for today', () => {
    expect(daysFrom(new Date())).toBe(0);
  });

  it('returns a positive number for a past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(daysFrom(pastDate)).toBe(5);
  });
});
