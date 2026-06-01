import { describe, it, expect } from 'vitest';
import { Color } from '../../src/domain/Color';

describe('Color', () => {
  it('creates Color from valid single letter', () => {
    expect(Color.from('W').value).toBe('W');
    expect(Color.from('U').value).toBe('U');
    expect(Color.from('B').value).toBe('B');
    expect(Color.from('R').value).toBe('R');
    expect(Color.from('G').value).toBe('G');
  });

  it('throws for invalid color', () => {
    expect(() => Color.from('X')).toThrow('Invalid color');
    expect(() => Color.from('white')).toThrow('Invalid color');
  });
});
