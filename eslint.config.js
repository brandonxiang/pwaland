import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  ...tsEslint.configs.recommended,
  {
    ...eslint.configs.recommended, 
    ignores: ['dist/', '**/**/dist/'],
    files: ['src/**/*.{ts,tsx,mts,cts}'],
    rules: {
      quotes: [2, 'single'],
      semi: ["error", "always"],
      camelcase: 'off',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'max-len': ['error', { code: 120 }],
      'implicit-arrow-linebreak': 'off',
      'class-methods-use-this': 'off',
      'no-console': 'off',
      'no-mixed-operators': 'off',
      'consistent-return': 'off',
      'object-curly-newline': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'newline-per-chained-call': 'off',
      'arrow-body-style': ['error', 'as-needed'],
    }
  },
);