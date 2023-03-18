## rollup

3. 完成 clean 插件

4. 类型文件不再自动生成了，通过复制自定义文件

5. 声明 `defineESMBuild` `defineCommonJSBuild` `defineBrowserBuild` ? 用来区分三种模式。

如果不是用入口方法区分，用 format 区分有点麻烦，而且 format 是在 output 中，很可能也没法单独模式再添加插件了。
