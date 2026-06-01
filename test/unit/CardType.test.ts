import { describe, it, expect } from 'vitest';
import { CardType } from '../../src/domain/CardType';

describe('CardType', () => {
  it('creates a CardType from a valid string', () => {
    const ct = CardType.from('Creature');
    expect(ct.value).toBe('Creature');
  });

  it('trims the type value', () => {
    const ct = new CardType('  Instant  ');
    expect(ct.value).toBe('Instant');
  });

  it('throws for empty string', () => {
    expect(() => new CardType('')).toThrow('Card type must be a non-empty string');
  });

  it('handles subtypes', () => {
    const ct = CardType.creature(['Human', 'Wizard']);
    expect(ct.subtypes).toEqual(['Human', 'Wizard']);
  });

  it('filters empty subtypes', () => {
    const ct = new CardType('Instant', ['', ' ', 'valid']);
    expect(ct.subtypes).toEqual(['valid']);
  });

  it('isCreature returns true for Creature', () => {
    expect(CardType.creature([]).isCreature()).toBe(true);
  });

  it('isLand returns true for Land', () => {
    expect(CardType.land().isLand()).toBe(true);
  });

  it('isInstant returns true for Instant', () => {
    expect(CardType.instant().isInstant()).toBe(true);
  });

  it('isSorcery returns true for Sorcery', () => {
    expect(CardType.sorcery().isSorcery()).toBe(true);
  });

  it('static factories create correct types', () => {
    expect(CardType.creature([]).value).toBe('Creature');
    expect(CardType.instant().value).toBe('Instant');
    expect(CardType.sorcery().value).toBe('Sorcery');
    expect(CardType.land().value).toBe('Land');
  });

  it('isEnchantment returns true for Enchantment', () => {
    const ct = CardType.from('Enchantment');
    expect(ct.isEnchantment()).toBe(true);
    expect(ct.isCreature()).toBe(false);
  });

  it('isArtifact returns true for Artifact', () => {
    const ct = CardType.from('Artifact');
    expect(ct.isArtifact()).toBe(true);
  });

  it('isPlanewalker returns true for Planewalker', () => {
    const ct = CardType.from('Planewalker');
    expect(ct.isPlanewalker()).toBe(true);
  });
});
