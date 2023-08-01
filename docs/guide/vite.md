# vite

- 利用浏览器ESM特性导入组织代码，在服务器端按需编译返回，完全跳过了打包这个概念，服务器随起随用。生产中利用Rollup作为打包工具.

优点：

1. 快速的冷启动: 采用No Bundle和esbuild预构建，速度远快于Webpack
2. 高效的热更新：基于ESM实现，同时利用HTTP头来加速整个页面的重新加载，增加缓存策略
3. 真正的按需加载: 基于浏览器ESM的支持，实现真正的按需加载

缺点

1. 生态：目前Vite的生态不如Webapck，不过我觉得生态也只是时间上的问题。
2. 生产环境由于esbuild对css和代码分割不友好使用Rollup进行打包

## 优化项

### 开启压缩

```js
import viteCompression from "vite-plugin-compression";

plugins:[
  viteCompression(
    {
      // 生成的压缩包后缀
      ext: ".gz",
      // 体积大于threshold才会被压缩
      threshold: 0,
      // 默认压缩.js|mjs|json|css|html后缀文件，设置成true，压缩全部文件
      filter: () => true,
      // 压缩后是否删除原始文件
      deleteOriginFile: false
    }
  )
]
```

- 使用 vite-plugin-compression

### 依赖预编译

- 默认情况下，Vite 会将 package.json 中生产依赖 dependencies 的部分启用依赖预编译，即会先对该依赖进行编译，然后将编译后的文件缓存在内存中（node_modules/.vite 文件下），在启动 DevServer 时直接请求该缓存内容。
在 vite.config.js 文件中配置 optimizeDeps 选项可以选择需要或不需要进行预编译的依赖的名称，Vite 则会根据该选项来确定是否对该依赖进行预编译。

```js
optimizeDeps: {
  include: ['echarts', 'axios', 'mockjs']
}
```

### cdn 替代依赖包

- 使用 vite-plugin-cdn-import (opens new window)插件，在打包时将指定的 modules 替换成 cdn 链接，从而减少构建时间，提高生产环境中页面加载速度。

```js
import { Plugin as VitePluginCdn } from "vite-plugin-cdn-import";

export const cdn = VitePluginCdn({
  //（prodUrl解释： name: 对应下面modules的name，version: 自动读取本地package.json中dependencies依赖中对应包的版本号，path: 对应下面modules的path，当然也可写完整路径，会替换prodUrl）
  prodUrl: "https://cdn.bootcdn.net/ajax/libs/{name}/{version}/{path}",
  modules: [
    {
      name: "vue",
      var: "Vue",
      path: "vue.global.prod.min.js"
    },
    {
      name: "vue-router",
      var: "VueRouter",
      path: "vue-router.global.min.js"
    }
  ]
});
```

### 去除 debugger console.log

- 内置 build.terserOptions 配置

```js
build: {
    terserOptions: {   
        compress: { 
            drop_console: true,
            drop_debugger: true, 
        },
    },   //去除 console debugger
},
```

### 图片压缩

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import imagemin from 'unplugin-imagemin/vite';
import viteImagemin from 'vite-plugin-imagemin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),   
    viteImagemin()
  ]
});
```

### Css 优化

- 在 `postcss.config.js` 使用 cssnano 压缩css 文件
