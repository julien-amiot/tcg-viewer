import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'threads',
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/domain/**/*.ts'],
    }
  }
});
