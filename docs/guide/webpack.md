# webpack

### 多页面多入口配置

```js
entry: {
    entry: './src/main.js',   // 打包输出的chunk名为entry
    entry2: './src/main2.js'  // 打包输出的chunk名为entry2
} 
```

### cacheGroups

- 缓存组有两个好处，可以减少代码重复打包，把第三方库提取出来方便浏览器缓存。

在 optimization 的 splitChuns 里面配置，一般配置两个，一个是 vendors，匹配第三方库node_modules，一个是default，通常配置是两个或以上的chunk单独打包，如果两个都匹配，就看设置的权重大小。

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

### uglifyjs-webpack-plugin

- 去掉代码中的 debuuger console.log , 适合生产模式用
