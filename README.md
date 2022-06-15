# mfe

## Features

- ✔︎ 基于 [rollup](http://rollupjs.org/) 和 babel 的组件打包功能
- ✔︎ 支持 TypeScript
- ✔︎ 支持 cjs、esm 和 umd 三种格式的打包
- ✔︎ 支持用 babel 或 rollup 打包 cjs 和 esm
- ✔︎ 支持 css 和 less，支持开启 css modules
- ✔︎ 支持 test

<!-- ## Installation

**未发布到 npm** -->

## Usage

```bash
# 打包代码
$ mfe build

# 发布代码到 npm
$ mfe release

# test
$ mfe test
$ mfe test --coverage

# 生成配置文件
$ mfe mferc

# 生成 eslint + prettier 配置
$ mfe code-style
```

## Config

新建 `.mferc.js` 文件进行配置。

比如：

```js
export const rollup = {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'auto',
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    },
  ],
  plugins: [],
  external: [],
  extraBabelPlugins: [],
}
```
