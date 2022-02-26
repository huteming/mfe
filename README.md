# `@cfe/bigdata-mfe`

## 2022-02-26

### build

没有把 mfe 安装在全局，然后在项目中使用的场景

### test

可以在普通 js/ts 中使用，但是 jsx/tsx 不行。

因为 mfe 中引用 enzyme 并配置了 react 适配器，此时如果项目中要引用 enzyme，势必引用的就不是同一个包，所以在执行测试时会报错:

```
  Enzyme Internal Error: Enzyme expects an adapter to be configured, but found none.
```
