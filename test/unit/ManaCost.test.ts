import { describe, it, expect } from 'vitest';
import { ManaCost } from '../../src/domain/ManaCost';

describe('ManaCost', () => {
  it('creates a ManaCost from a valid string', () => {
    const cost = ManaCost.from('2RR');
    expect(cost.value).toBe('2RR');
  });

  it('trims whitespace', () => {
    const cost = new ManaCost('  {3}{U}  ');
    expect(cost.value).toBe('{3}{U}');
  });

  it('identifies empty mana cost', () => {
    const cost = ManaCost.empty();
    expect(cost.isEmpty).toBe(true);
    expect(cost.value).toBe('—');
  });

  it('treats empty string as empty', () => {
    const cost = new ManaCost('');
    expect(cost.isEmpty).toBe(true);
  });

  it('throws TypeError for non-string input', () => {
    expect(() => new ManaCost(null as any)).toThrow(TypeError);
  });
});
