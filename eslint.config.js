module.exports = {
  extends: ['love', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*', 'build/**/*'],
  rules: {
    // Add any custom rule overrides here
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}