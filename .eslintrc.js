module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['promise'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    indent: [0, 2],
    'linebreak-style': ['error', 'unix'],
    quotes: [0, 'single'],
    semi: ['error', 'never'],
    'prettier/prettier': 2,
  },
}
