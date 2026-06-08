import { describe, it, expect } from 'vitest';
import { InitialLoyalty } from '../../src/domain/InitialLoyalty';

describe('InitialLoyalty', () => {
  it('creates with a value', () => {
    const loyalty = new InitialLoyalty('3');
    expect(loyalty.value).toBe('3');
  });

  it('trims whitespace from input', () => {
    const loyalty = new InitialLoyalty(' 4 ');
    expect(loyalty.value).toBe('4');
  });

  it('empty() returns dash representation', () => {
    const loyalty = InitialLoyalty.empty();
    expect(loyalty.isEmpty).toBe(true);
    expect(loyalty.value).toBe('\u2014');
  });

  it('from(undefined) returns empty loyalty', () => {
    const loyalty = InitialLoyalty.from(undefined);
    expect(loyalty.isEmpty).toBe(true);
  });

  it('from(null) returns empty loyalty', () => {
    // @ts-expect-error testing null input
    const loyalty = InitialLoyalty.from(null);
    expect(loyalty.isEmpty).toBe(true);
  });

  it('from("") returns empty loyalty', () => {
    const loyalty = InitialLoyalty.from('');
    expect(loyalty.isEmpty).toBe(true);
  });

  it('from("4") creates non-empty loyalty', () => {
    const loyalty = InitialLoyalty.from('4');
    expect(loyalty.isEmpty).toBe(false);
    expect(loyalty.value).toBe('4');
  });

  it('from("*") preserves star value for *loyalty', () => {
    const loyalty = InitialLoyalty.from('*');
    expect(loyalty.isEmpty).toBe(false);
    expect(loyalty.value).toBe('*');
  });

  it('display returns empty string when isEmpty', () => {
    const loyalty = InitialLoyalty.empty();
    expect(loyalty.display).toBe('');
  });

  it('display returns value when not empty', () => {
    const loyalty = InitialLoyalty.from('4');
    expect(loyalty.display).toBe('4');
  });
});