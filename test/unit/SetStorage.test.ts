// SC-TCG — Unit Tests: SetStorage
import { describe, it, expect } from 'vitest';
import { SetStorage } from '../../src/domain/SetStorage';

describe('SetStorage', () => {
  const storage = SetStorage.getInstance();

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSet', () => {
    it('should save a set with name and data', () => {
      const name = 'Test Set';
      const data = '[{"name":"Card A"}]';
      storage.saveSet(name, data);
      expect(storage.loadSet(name)).toBe(data);
    });

    it('should remove existing entry before saving duplicate', () => {
      const name = 'Duplicate Set';
      const data1 = '[{"name":"Card A"}]';
      const data2 = '[{"name":"Card B"}]';
      storage.saveSet(name, data1);
      expect(storage.loadSet(name)).toBe(data1);
      storage.saveSet(name, data2);
      expect(storage.loadSet(name)).toBe(data2);
    });

    it('should handle invalid JSON gracefully', () => {
      const name = 'Invalid Set';
      const data = 'not valid json';
      storage.saveSet(name, data);
      expect(storage.loadSet(name)).toBe(data); // still saved as-is
    });
  });

  describe('loadSet', () => {
    it('should return null for non-existent set', () => {
      const result = storage.loadSet('NonExistent');
      expect(result).toBeNull();
    });

    it('should return data for existing set', () => {
      const name = 'Existing Set';
      const data = '[{"name":"Card A"}]';
      storage.saveSet(name, data);
      expect(storage.loadSet(name)).toBe(data);
    });
  });

  describe('listSets', () => {
    it('should return empty array when no sets saved', () => {
      const result = storage.listSets();
      expect(result).toEqual([]);
    });

    it('should return list of set names', () => {
      storage.saveSet('Set A', '[{"name":"Card 1"}]');
      storage.saveSet('Set B', '[{"name":"Card 2"}]');
      const result = storage.listSets();
      expect(result).toEqual(['Set A', 'Set B']);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(
        SetStorage.STORAGE_KEY,
        '{invalid json}'
      );
      const result = storage.listSets();
      expect(result).toEqual([]);
    });
  });

  describe('deleteSet', () => {
    it('should remove set from storage', () => {
      const name = 'To Delete';
      const data = '[{"name":"Card A"}]';
      storage.saveSet(name, data);
      expect(storage.loadSet(name)).toBe(data);
      storage.deleteSet(name);
      expect(storage.loadSet(name)).toBeNull();
    });

    it('should not throw when deleting non-existent set', () => {
      expect(() => storage.deleteSet('NonExistent')).not.toThrow();
    });
  });
});