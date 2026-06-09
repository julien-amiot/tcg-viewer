import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/domain/**/*.ts'],
    }
  }
});