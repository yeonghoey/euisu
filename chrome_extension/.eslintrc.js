module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
      browser: true,
      webextensions: true,
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
};