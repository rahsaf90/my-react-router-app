import { describe, expect, it } from 'vitest';
import { formatDate, slugify } from '~/lib/utils/general';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes non-word characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld');
  });

  it('collapses multiple hyphens into one', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello');
  });

  it('handles an already-slugified string', () => {
    expect(slugify('my-slug')).toBe('my-slug');
  });

  it('handles an empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles strings with only special characters', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('handles numbers', () => {
    expect(slugify('task 42')).toBe('task-42');
  });

  it('slugifies In Progress correctly', () => {
    expect(slugify('In Progress')).toBe('in-progress');
  });
});

describe('formatDate', () => {
  it('formats a Date object into a localized string', () => {
    const date = new Date(2024, 0, 15, 10, 30, 0); // Jan 15 2024 10:30:00
    const result = formatDate(date);
    // Should contain the year
    expect(result).toContain('2024');
  });

  it('formats an ISO string into a localized string', () => {
    const result = formatDate('2024-06-01T12:00:00');
    expect(result).toContain('2024');
  });

  it('returns a non-empty string', () => {
    const result = formatDate(new Date());
    expect(result.length).toBeGreaterThan(0);
  });
});
