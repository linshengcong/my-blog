# project

## 混合App

### JSBridge

- 通过一个中间层，将Native端和Web端连接起来，从而实现双方之间的通信。中间层在Native端实现，Web端通过JavaScript代码调用中间层提供的接口，将数据发送给中间层，再通过WebView将数据传递给Native端。Native端接收到数据后，进行相应的处理，并将结果通过WebView传递回Web端。

```js
function callNativeMethod(methodName, params, callback) {
  // 将请求打包成一个消息，发送给中间层
  var message = {
    methodName: methodName,
    params: params,
    callback: callback
  };
  window.JSBridge.postMessage(JSON.stringify(message));
}
```

- Native 端调用 WebView 的加载接口时，会在 WebView 页面的 DOMContentLoaded 事件注入 JavaScript Bridge 对象, 挂载到window 里, 方便调用.

### 首屏优化(离线缓存)

1. 把H5 首屏的数据包一起打包到Native App 应用里面

```js
// example
const data = {
  userInfo: {
    name: 'Alice',
    age: 25
  },
  productList: [
    {
      id: 1,
      name: 'Product A',
      price: 100
    },
    {
      id: 2,
      name: 'Product B',
      price: 200
    }
  ]
};
let data = ... // 从本地存储中读取数据
let json = ... // 将 data 对象转换成 JSON 字符串
let script = "window.__INITIAL_STATE__ = \(json)" // 定义一个脚本，将数据赋值给 window.__INITIAL_STATE__
webView.evaluateJavaScript(script, completionHandler: nil) // 在 WebView 中执行这个脚本
// H5 页面加载完成后, 判断无网弱网情况下, 就可以通过 window.__INITIAL_STATE__ 访问 Native App 中存储的数据
```

1. 使用 AppCache、Service Worker 等技术做H5 的本地缓存

```javascript
// 在 Service Worker 中，利用 install 事件的回调函数中，通过 caches API 将需要缓存的文件缓存到浏览器的缓存中.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});
// 在页面中，可以通过检查 Service Worker 的状态来确定是否有可用的缓存，如果有，则从缓存中读取数据。例如：

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker 注册成功！');
        registration.update(); // 更新 Service Worker
      })
      .catch(error => {
        console.log('Service Worker 注册失败！');
      });
  });

  // 判断 Service Worker 是否激活，如果是则从缓存中读取数据
  if (navigator.serviceWorker.controller) {
    fetch('/')
      .then(response => {
        console.log('从缓存中读取数据！');
      })
      .catch(error => {
        console.log('读取缓存失败！');
      });
  }
}
// 这样，在无网络情况下，Service Worker 就可以从缓存中读取数据并返回给页面，实现了缓存首屏的需求。
```

### 弱网或者无网处理

1. 使用loading or 骨架屏
2. 加载离线缓存资源

### 判断当前网络状态

- 可以使用第三方库，如 Network Information API（网络信息 API）或者 Network Information Indicator（网络信息指示器）

## 使用 lru-cache 配合 axios-extensions 做相应数据缓存

```js
// 客户端请求直接配合 cacheAdapterEnhancer 做缓存
import {cacheAdapterEnhancer} from "axios-extensions";
import LRUCache from "lru-cache";

app.$axios.onRequest(config => {
  // 请求中使用了useCache: true的话，会被缓存起来以便下次直接返回从而减少服务器压力
  let defaultAdapter = app.$axios.defaults.adapter;
  let cacheCfg = new LRUCache({
    maxAge: 1000 * 3, //有效期3s
    max: 1000 // 最大缓存数量
  });
  app.$axios.defaults.adapter = cacheAdapterEnhancer(defaultAdapter, {
    enabledByDefault: true,
    cacheFlag: "useCache",
    defaultCache: cacheCfg
  });
})
```

```js
/**
 * middleware/pageCache
 * 在 serverMiddleware 服务端中间件当中添加 缓存
 * SSR 项目首屏由node 中间层生层返回, 所以需要考虑高并发的问题
 * 在node 中间层给接口添加缓存
 */

export default function(req, res, next) {
  if (process.env.NODE_ENV !== "development" && !req.url.startsWith("/api")) {
    // 本地开发环境及接口不做缓存
    try {
      let uid = cookieParse(req.headers.cookie, "uid");
      let lastUid = cache.get("lastUid");
      if (!lastUid || lastUid !== uid) {
        cache.reset();
        cache.set("lastUid", uid);
      }
      const cacheKey = req.url;
      const cacheData = cache.get(cacheKey);
      if (cacheData) return res.end(cacheData, "utf8");
      const originalEnd = res.end;
      res.end = function(data) {
        cache.set(cacheKey, data);
        originalEnd.call(res, ...arguments);
      };
      next();
    } catch (error) {
      console.log(`page-cache-middleware: ${error}`);
      next();
    }
  } else {
    //本地开发不缓存
    next();
  }
}
```

## OSS单点登录

1. 开发一个认证中心, 部署在专门的统一登录服务器

2. 用户统一在认证中心进行登录，登录成功后，认证中心记录用户的登录状态，并将 Token 写入 Cookie。（注意这个 Cookie 是认证中心的，应用系统是访问不到的。）

3. 应用系统检查当前请求有没有 Token，如果没有，说明用户在当前系统中尚未登录，那么就将页面跳转至认证中心。由于这个操作会将认证中心的 Cookie 自动带过去，因此，认证中心能够根据 Cookie 知道用户是否已经登录过了。如果认证中心发现用户尚未登录，则返回登录页面，等待用户登录，如果发现用户已经登录过了，就不会让用户再次登录了，而是会跳转回目标 URL ，并在跳转前生成一个 Token，拼接在目标 URL 的后面，回传给目标应用系统。

4. 应用系统拿到 Token 之后，还需要向认证中心确认下 Token 的合法性，防止用户伪造。确认无误后，应用系统记录用户的登录状态，并将 Token 写入 Cookie，然后给本次访问放行。（注意这个 Cookie 是当前应用系统的，其他应用系统是访问不到的。）当用户再次访问当前应用系统时，就会自动带上这个 Token，应用系统验证 Token 发现用户已登录，于是就不会有认证中心什么事了。

## 甘特图

## 流程图

## webpack
