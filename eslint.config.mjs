import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * The dependency rule: code may only import from its own layer or one further in.
 * app → components → lib/presentation → lib/application → lib/domain. See wiki-llm/architecture.md.
 */
const FRAMEWORK = ['react', 'react-dom', 'react/*', 'next', 'next/*'];
const layer = (files, forbidden, message) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: forbidden, message }] }],
  },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  layer(
    ['src/lib/domain/**'],
    [
      '@/lib/application/**',
      '@/lib/presentation/**',
      '@/components/**',
      '@/app/**',
      '../**',
      ...FRAMEWORK,
    ],
    'Domain depends on nothing outside lib/domain (dependency rule).',
  ),
  layer(
    ['src/lib/application/**'],
    ['@/lib/presentation/**', '@/components/**', '@/app/**', '../**', ...FRAMEWORK],
    'Application depends only on lib/domain and itself (dependency rule).',
  ),
  layer(
    ['src/lib/presentation/**'],
    ['@/components/**', '@/app/**', '../**', ...FRAMEWORK],
    'Presentation depends only on lib/ (dependency rule).',
  ),
  layer(['src/components/**'], ['@/app/**'], 'Components never import routes (dependency rule).'),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
  ]),
]);

export default eslintConfig;
