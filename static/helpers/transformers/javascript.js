const babelJest = require('babel-jest') // 26.x

module.exports = babelJest.createTransformer({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 'current',
        },
      },
    ],
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-typescript'),
  ],
  // plugins: [
  //   require.resolve('@babel/plugin-proposal-optional-chaining'),
  // ],
  babelrc: false,
  configFile: false,
})
