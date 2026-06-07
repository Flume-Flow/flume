import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['scripts/**/*.js'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      indent: ['error', 4],
      'eol-last': ['error', 'always'],
    },
  },
  {
    files: ['scripts/**/*.test.js', 'cli/src/**/*.test.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      indent: ['error', 4],
      'eol-last': ['error', 'always'],
    },
  },
);
