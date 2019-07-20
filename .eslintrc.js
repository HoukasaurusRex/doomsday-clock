module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-var': 'error'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
