import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      // Test only. `import.meta.hot` is injected by Vite dev server and does not
      // exist under Vitest, which makes the HMR branches of `useHMR.ts` untestable.
      // Redirect `import.meta` to a global so tests can mock the hot context.
      name: 'mock-import-meta',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (!id.replace(/\\/g, '/').endsWith('/src/hooks/useHMR.ts')) {
          return null;
        }

        return {
          code:
            // Test only. Vitest runs ESM, where the CommonJS `module` object does
            // not exist, so the webpack HMR branch is unreachable. Shim it from a
            // global so tests can mock `module.hot` as webpack does.
            `const module = (globalThis.__CSSINJS_TEST_COMMONJS_MODULE__ || {});\n` +
            // `|| {}` keeps the module safe when the global is not mocked (e.g. the
            // module is loaded by other test files), matching "no hot context".
            code.replace(
              /import\.meta/g,
              '(globalThis.__CSSINJS_TEST_IMPORT_META__ || {})',
            ),
          map: null,
        };
      },
    },
  ],
  test: {
    include: ['**/tests/*.spec.*'],
    globals: true,
    setupFiles: './vitest-setup.ts',
    environment: 'jsdom',
  },
});
