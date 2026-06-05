import { describe, it, expect } from 'vitest';
import { Rarity } from '../../src/domain/Rarity';

describe('Rarity', () => {
  it('creates rarity from valid string', () => {
    expect(Rarity.from('common').value).toBe('common');
    expect(Rarity.from('uncommon').value).toBe('uncommon');
    expect(Rarity.from('rare').value).toBe('rare');
    expect(Rarity.from('mythic').value).toBe('mythic');
  });

  it('normalizes input case and whitespace', () => {
    expect(Rarity.from('  Rare  ').value).toBe('rare');
    expect(Rarity.from('MYTHIC').value).toBe('mythic');
  });

  it('throws for invalid rarity', () => {
    expect(() => Rarity.from('legendary')).toThrow('Invalid rarity');
  });

  it('provides static factory methods', () => {
    expect(Rarity.common().isCommon).toBe(true);
    expect(Rarity.uncommon().isUncommon).toBe(true);
    expect(Rarity.rare().isRare).toBe(true);
    expect(Rarity.mythic().isMythic).toBe(true);
  });

  it('returns correct color codes', () => {
    expect(Rarity.common().colorCode).toBe('#000000');
    expect(Rarity.uncommon().colorCode).toBe('#C0C0C0');
    expect(Rarity.rare().colorCode).toBe('#FFD700');
    expect(Rarity.mythic().colorCode).toBe('#9b59b6');
  });

  it('constructor creates Rarity instance', () => {
    const r = new Rarity('common');
    expect(r.value).toBe('common');
    expect(r.isCommon).toBe(true);
  });
});
