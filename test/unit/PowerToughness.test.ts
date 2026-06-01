import { describe, it, expect } from 'vitest';
import { PowerToughness } from '../../src/domain/PowerToughness';

describe('PowerToughness', () => {
  it('parses valid power/toughness string', () => {
    const pt = PowerToughness.from('2/2');
    expect(pt.power).toBe('2');
    expect(pt.toughness).toBe('2');
    expect(pt.isEmpty).toBe(false);
  });

  it('returns empty for invalid format', () => {
    const pt = PowerToughness.from('invalid');
    expect(pt.isEmpty).toBe(true);
  });

  it('returns empty for empty string', () => {
    const pt = PowerToughness.from('');
    expect(pt.isEmpty).toBe(true);
  });

  it('empty factory returns dash values', () => {
    const pt = PowerToughness.empty();
    expect(pt.power).toBe('—');
    expect(pt.toughness).toBe('—');
    expect(pt.isEmpty).toBe(true);
  });

  it('display returns formatted string when not empty', () => {
    const pt = PowerToughness.from('5/3');
    expect(pt.display).toBe('5/3');
  });

  it('display returns empty string when empty', () => {
    const pt = PowerToughness.empty();
    expect(pt.display).toBe('');
  });
});
