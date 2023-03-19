## rollup

- [] 导出模块的类型

- [] 解析类型模块中的别名

- [x] 声明 `defineESMBuilds` `defineCommonJSBuilds` `defineBrowserBuilds` ? 用来区分三种模式。

```js
import { defineESMBuilds } from '@hutm/footing'
```

如果不是用入口方法区分，用 format 区分有点麻烦，而且 format 是在 output 中，很可能也没法单独模式再添加插件了。

- [] rollup 该如何清空目标目录？

- [] `defineESMBuilds` 等新增方法的测试用例

- [] 有没有新的方式来解析 rollup 配置，现在是手动调用 babel 进行解析，看着很不友好
