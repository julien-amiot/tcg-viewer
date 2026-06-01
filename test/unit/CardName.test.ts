import { describe, it, expect } from 'vitest';
import { CardName } from '../../src/domain/CardName';

describe('CardName', () => {
  it('creates a CardName from a valid string', () => {
    const name = CardName.from('Lightning Bolt');
    expect(name.value).toBe('Lightning Bolt');
  });

  it('trims whitespace from the name', () => {
    const name = new CardName('  Test Card  ');
    expect(name.value).toBe('Test Card');
  });

  it('throws for empty string', () => {
    expect(() => new CardName('')).toThrow('Card name must be a non-empty string');
  });

  it('throws for whitespace-only string', () => {
    expect(() => new CardName('   ')).toThrow('Card name must be a non-empty string');
  });
});
