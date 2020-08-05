module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
  },
  env: {
    browser: true,
    es2017: true,
    webextensions: true,
  },
  plugins: [
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [{
    files: ["**/*.ts"],
    parser: '@typescript-eslint/parser',
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
  }],
};