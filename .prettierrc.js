module.exports = {
  printWidth: 80,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
  importOrderSortSpecifiers: true,
}
