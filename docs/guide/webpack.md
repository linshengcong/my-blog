# webpack

## 配置

### 多页面多入口配置

```js
entry: {
    entry: './src/main.js',   // 打包输出的chunk名为entry
    entry2: './src/main2.js'  // 打包输出的chunk名为entry2
} 
```

### cacheGroups

- 缓存组有两个好处，可以减少代码重复打包，把第三方库提取出来方便浏览器缓存。

- 在 optimization 的splitChuns下使用 cacheGroups，缓存组有两个好处，可以减少代码重复打包，把第三方库提取出来方便浏览器缓存。在 optimization 的 splitChuns 里面配置，一般配置两个，一个是 vendors，匹配第三方库node_modules，一个是default，通常配置是两个或以上的chunk单独打包，如果两个都匹配，就看设置的权重大小。

```js
build: {
  maxChunkSize: 360000,
  optimization: {
    splitChunks: {
      cacheGroups: {
        expansions: {
          name: "expansions",
          test(module) {
            return /echarts|errorlog/.test(module.context);
          },
          chunks: "initial",
          priority: 10
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
},
```

### webpack.DefinePlugin

```js
// 注入环境变量
const env = require('./env-config');

const webpackConfigDev = {
  mode: 'development', // 通过 mode 声明开发环境
  devtool: 'cheap-module-eval-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    // 打包多出口文件
    filename: 'js/[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      'process.env.APP_MODE': JSON.stringify(env.HOST_CONF.envName)
    })
  ],
}
```

### 获取环境，即--mode后的环境

`const HOST_ENV = JSON.parse(process.env.npm_config_argv).original[3] || '';`

### Dotenv

### copyWebpackPlugin

- 拷贝出静态资源

```js
    new copyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/static'),
        to: './static',
        ignore: ['.*']
      }
    ]),
```

### html-webpack-plugin

- 会自动生成html 文件, 吧相关资源都引入进来, 优化html, 通常用来当作入口文件,
- inject 能把资源注入到body 底部
- favicon 生产 favicon
- cache 默认开启缓存, 只有内容变化才会生成新的文件
- minify

```js
minify: {
  removeComments: true, //移除HTML中的注释
  collapseWhitespace: true, //折叠空白区域 也就是压缩代码
  removeAttributeQuotes: true //去除属性引用
}
```

### extractTextPlugin

- 抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象。
- 配合HtmlWebpackPlugin插件则自动插入index.html中

### purifycss-webpack

- 实现 CSS Tree-Shaking

### clean-webpack-plugin

- 每次打包, 删除旧的 dist 目录

### optimize-css-assets-webpack-plugin

### extract-text-webpack-plugin

- css 文件名添加hash

### optimize-css-assets-webpack-plugin

- 压缩css 代码

### TerserWebpackPlugin

```js
new TerserWebpackPlugin({
  cache: true,
  parallel: true,
  sourceMap: true, // Must be set to true if using source-maps in production
  terserOptions: {
    compress: {
      warnings: false,
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ["console.log", "console.error"]
    }
  }
});
```

## 预渲染(prerender-spa-plugin)

- prerender-spa-plugin 利用了 Puppeteer[4] 的爬取页面的功能。 Puppeteer 是一个 Chrome官方出品的 headlessChromenode 库。它提供了一系列的 API, 可以在无 UI 的情况下调用 Chrome 的功能, 适用于爬虫、自动化处理等各种场景。它很强大，所以很简单就能将运行时的 HTML 打包到文件中。原理是在 Webpack 构建阶段的最后，在本地启动一个 Puppeteer 的服务，访问配置了预渲染的路由，然后将 Puppeteer 中渲染的页面输出到 HTML 文件中，并建立路由对应的目录。

```js
const PrerenderSPAPlugin = require("prerender-spa-plugin");
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

module.exports = {
  configureWebpack: config => {
    
    const routerArr = ["/","/xx/xx",];

      return {
        plugins: [
          new PrerenderSPAPlugin({
            // 生成文件的路径，也可以与webpakc打包的一致。
            // 下面这句话非常重要！！！
            // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，在预渲染的时候只会卡着不动。
            staticDir: path.join(__dirname, "dist"), // 预渲染输出的页面地址
            // outputDir: path.join(__dirname, './'),
            // 对应自己的路由文件，比如a有参数，就需要写成 /a/param1。
            routes: routerArr, // 需要预渲染的路由
            postProcess(renderedRoute) {
              /* eslint-disable */
              renderedRoute.html = renderedRoute.html.replace(
                "<body style=\"visibility: visible;\">",
                "<body style=\"visibility: hidden;\">"
              );
              return renderedRoute;
            },
            // 这个很重要，如果没有配置这段，也不会进行预编译
            renderer: new Renderer({
              renderAfterTime: 10000,
              captureAfterTime: 5000,
              //忽略打包错误
              ignoreJSErrors: true,
              maxAttempts: 10,
              headless: true,
              // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
              //renderAfterDocumentEvent: "render-event"
              maxConcurrentRoutes: 1
            })
          })
        ]
      }
  }
}
```

### gzip 对js, css缓存

```js
const CompressionPlugin = require("compression-webpack-plugin"); // gzip压缩,优化http请求,提高加载速度

// 开启gzip压缩
config.plugins.push(
  new CompressionPlugin({
    algorithm: "gzip",
    test: new RegExp("\\.(" + ["js", "css"].join("|") + ")$"), // 匹配文件扩展名
    // threshold: 10240, // 对超过10k的数据进行压缩
    threshold: 5120, // 对超过5k的数据进行压缩
    minRatio: 0.8,
    cache: true, // 是否需要缓存
    deleteOriginalAssets: false // true删除源文件(不建议);false不删除源文件
  })
); 
config.plugins.push(new webpack.HashedModuleIdsPlugin());// 该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。
```

```nginx
gzip on; // on 开启 off 关闭
gzip_static on;
gzip_min_length 1k; // 压缩的最小字节
gzip_buffers 4 32k; // 获取多少内存用于缓存压缩结果
gzip_http_version 1.1; // 识别http协议的版本,早期浏览器可能不支持gzip自解压,用户会看到乱码
gzip_comp_level 2; // 压缩等级
gzip_types text/plain application/x-javascript text/css application/xml;
gzip_vary on; // 启用应答头"Vary: Accept-Encoding"
gzip_disable "MSIE [1-6]."; // 根据 UA 匹配不需要gzip压缩的浏览器
```

### DllPlugin

- 打包速度优化, 利用提前把第三方包分离到动态库的模块, 生成打包后的 dll.vendor.js 文件与描述动态链接库的 manifest.json, 把dll.vendor.js 在index.html 内引入, 下次打包就不用打包第三方库, 只用打包业务代码, 大大提高打包速度, 一般只在生产中开启

### happyPack

- Happypack 开启多进程打包, webpack 构建过程loader 的各种转换是特别耗时的
- 让子进程把一些常用的loader 替换成 happyPack/loader, 处理好后交给主进程

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        use: ['happypack/loader?id=babel'],
        // 排除 node_modules 目录下的文件，node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        // 把对 .css 文件的处理转交给 id 为 css 的 HappyPack 实例
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['happypack/loader?id=css'],
        }),
      },
    ]
  },
  plugins: [
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory'],
      // ... 其它配置项
    }),
    new HappyPack({
      id: 'css',
      // 如何处理 .css 文件，用法和 Loader 配置中一样
      loaders: ['css-loader'],
    }),
    new ExtractTextPlugin({
      filename: `[name].css`,
    }),
  ],
};
```

### 图片优化

- image-webpack-loader 对图片进行压缩

```js
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        disable: process.env.NODE_ENV == 'development' ? true : false, // webpack@2.x and newer
        quality: "65-80",
        speed: 4
      })
      .end();
```

- webpack的url-loader,自动根据文件大小决定要不要做成内联 base64;
- 图片使用懒加载 vue.js可用使用`vue-lazyload`, 我使用的是 el-image

### 代码分析

```js
    config.plugin("webpack-bundle-analyzer")
      .use(new BundleAnalyzerPlugin({
        openAnalyzer: false,   // 是否打开默认浏览器
        analyzerPort: 8777
      }));
```

### CDN 优化

```js
- 把常用的包的压缩文件(vue, axios, i18n, vuex)放到CDN 服务器下面
// vue.config.js
const cdn = {
  // 开发环境
  dev: {
    css: [],
    js: []
  },
  // 生产环境
  build: {
    //css: ["https://cdn.bootcss.com/nprogress/0.2.0/nprogress.min.css"],
    js: [
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/vue.min.js`,
      //"https://cdn.bootcss.com/vue/2.6.10/vue.min.js",
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/vue-router.min.js`,
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/vuex.min.js`,
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/axios.min.js`,
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/vue-i18n.min.js`,
      `${process.env.VUE_APP_PC_BASE_URI}/cdn/js/nprogress.min.js`
      // "https://cdn.bootcss.com/js-cookie/2.2.0/js.cookie.min.js"
    ]
  }
};

  // webpack相关配置
  chainWebpack: config => {
    config.entry.app = ["./src/main.js"];
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@cps", resolve("src/components"))
      .set("vue$", "vue/dist/vue.runtime.esm.js");
    //.set("vue$", "vue/dist/vue.common.js");
    //config.resolve.alias.set("vue$", "vue/dist/vue.esm.js");
    // 关闭npm run build之后，This can impact web performance 警告
    config.performance;
    //.set('hints', false)
    // 移除 prefetch 插件
    config.plugins.delete("prefetch");
    // 移除 preload 插件
    config.plugins.delete("preload");
    // 压缩代码
    config.optimization.minimize(true);
    // 分割代码
    config.optimization.splitChunks({
      chunks: "all"
    });
    // 对图片进行压缩处理
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        disable: true, // webpack@2.x and newer
        quality: "65-80",
        speed: 4
      })
      .end();
    // 项目文件大小分析
    // config.plugin("webpack-bundle-analyzer")
    //   .use(new BundleAnalyzerPlugin({
    //     openAnalyzer: false,   // 是否打开默认浏览器
    //     analyzerPort: 8777
    //   }));

    // 对vue-cli内部的 webpack 配置进行更细粒度的修改。
    // 添加CDN参数到htmlWebpackPlugin配置中， 详见public/index.html 修改
    config.plugin("html").tap(args => {
      if (process.env.NODE_ENV === "production") {
        args[0].cdn = cdn.build;
      }
      if (process.env.NODE_ENV === "development") {
        args[0].cdn = cdn.dev;
      }
      return args;
    });
  },
```

- 将依赖的静态资源如`vue`、`vue-router`、`vuex`等，全部改为通过CDN链接获取。
- 借助HtmlWebpackPlugin,可以方便的使用循环语法在index.html里插入js和css的CDN链接。推荐CDN使用 [jsDelivr](https://www.jsdelivr.com/) 提供的。
- `index.html`文件中

```jsp
<!-- 使用CDN加速的CSS文件，配置在vue.config.js下 -->
<% for (var i in htmlWebpackPlugin.options.cdn&&htmlWebpackPlugin.options.cdn.css) { %>
<link href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" rel="preload" as="style">
<link href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" rel="stylesheet">
<% } %>
<!-- 使用CDN加速的JS文件，配置在vue.config.js下 -->
<% for (var i in htmlWebpackPlugin.options.cdn&&htmlWebpackPlugin.options.cdn.js) { %>
<link href="<%= htmlWebpackPlugin.options.cdn.js[i] %>" rel="preload" as="script">
<% } %>
复制代码
```

- `vue.config.js`下添加如下代码，这使得在使用CDN引入外部文件的情况下，依然可以在项目中使用import的语法来引入这些第三方库，也就意味着你不需要改动项目的代码

```js
// 转为CDN外链方式的npm包，键名是引入的npm包名，键值是该库暴露的全局变量
const externals = {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
    vant: 'vant',
    'pdfjs-dist': 'pdfjs',
};
// 添加CDN参数到htmlWebpackPlugin配置中;
        config.plugin('html').tap((args) => {
            if (process.env.NODE_ENV === 'production') {
                args[0].cdn = CDN.build;
            }
            return args;
        });
```
