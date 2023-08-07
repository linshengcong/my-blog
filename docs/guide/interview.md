# 面试准备

## 权限

- 用户、角色、权限、菜单
- 用户绑定角色, 角色需要配置权限、权限包括菜单权限、功能权限(按钮权限、查看编辑权限)、数据权限, 后端根据角色过滤数据, 当然数据权限不一定是按照角色来, 也会根据组织架构这些进行过滤

### 页面级别的权限

```js
// 调用接口，后端返回的路由表和我自己的异步路由匹配加上静态路由生成新的路由表。
router.beforeEach(async (to, from, next) => {
  NProgress.start();
  // 本地是否有token
  let isLogin = Cookies.get('is-login');
  if (isLogin !== '1') {
    // 没有token 重新调接口判断一次token是否生效
    isLogin = await store.dispatch('user/checkLogin');
  }
  if (isLogin === '1') {
    if (to.path === '/login') {
      // 已登录, 如果有指定url则跳至指定页面, 否则跳回首页
      let redirect = to.query.redirect || '';
      if (redirect) {
        // 带有重定向链接，重定向到指定路由
        next({ path: redirect });
      } else {
        next({ path: '/' });
      }
      NProgress.done();
    } else {
      const hasRoles = store.getters.roles;

      if (hasRoles) {
        // 通过
        next();
      } else {
        // 无角色则获取角色
        try {
          // 获取角色，获取权限
          const level = await store.dispatch('user/getStaffUser');
          const permissions = await store.dispatch('user/getMyPermissions');
          // 根据角色权限获取路由表
          // 路由表通过调用接口，后端返回的路由表和我自己的异步路由匹配加上静态路由生成新的路由表。
          const accessRoutes = await store.dispatch('permission/generateRoutes', { level, permissions });
          // 动态加载路由
          router.addRoutes(accessRoutes);
          // 来确保addRoutes()时动态添加的路由已经被完全加载上去
          next({ ...to, replace: true });
        } catch (error) {
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 没有token，但是是访问白名单里的路由，合理通过
      next();
    } else {
      // 访问非白名单里的路由，被拼接上重定向参数重新访问
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});
```

### 精确到按钮的权限

```typescript
export default {
  // inserted 被绑定元素插入父节点时调用 
  /**
   * 
   * @param el 所绑定的元素
   * @param binding 一个对象，包含（name, value, arg等） 
   * @param vnode 虚拟节点
   */
  inserted(el, binding, vnode) {
    // value 指令的绑定值，例如：v-permission="['magic_dashboard_act_account']"
    // arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
    const { value } = binding
    const permissions = store.getters && store.getters.permissions
    const roles = store.getters && store.getters.roles
  
    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value

      const hasPermission = roles.includes(superAdminCode) || permissions.some(permission => {
        return permissionRoles.includes(permission)
      })
   
      if (!hasPermission) {
        // 没权限卸载当前节点
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`need permissions!`)
    }
  }
}

const install = function(Vue) {
  Vue.directive('Clipboard', Clipboard)
}

if (window.Vue) {
  window.clipboard = Clipboard
  Vue.use(install); // eslint-disable-line
}


// 简单实现，写个方法 find 遍历权限表，直接 v-if 那个方法
```

## 登录

http 是无状态的，也就是请求和请求之间没有关联，但我们很多功能的实现是需要保存状态的。

### session + cookie(服务端存储)

- 设置 httpOnly, 不让客户端修改cookie
- 给 http 添加状态，那就给每个请求打上个sessionId 放到cookie 里面，然后在服务端根据sessionId存储这个标记对应的数据。

#### CSRF

- 因为 cookie 会在请求时自动带上，那你在一个网站登录了，再访问别的网站，万一里面有个按钮会请求之前那个网站的，那 cookie 依然能带上。而这时候就不用再登录了。

- 解决方案, 验证 origin 和 referer, 但是也能被伪造, 所以会生成一个token, 放在header 里面

#### 分布式session

session 是把状态数据保存在服务端，面对多台服务器如何同步session?

1. 多台服务器自动复制同步session, 比如 java 的 spring-session
2. 放到redis 里面

#### 跨域

- 因为cookie 跨域是不会自动携带cookie的, 需要客户端手动设置 `withCredentials = true`, 服务端header 设置`Access-Control-Allow-Origin: "当前域名";Access-Control-Allow-Credentials: true`

### JWT(客户端存储, 服务器无状态)

json web token, JWT 是由 header、payload、verify signature组成,
header 部分保存当前的加密算法，payload 部分是具体存储的数据，verify signature 部分是把 header 和 payload 还有 salt 做一次加密之后生成的。

```js
/**
 * header, alg 表示签名的加密算法, type 表示令牌类型.
 */
{
  "alg": "HS256",
  "typ": "JWT"
}
/**
 * payload, 实际存储的数据, 除了官方字段也能用自定义业务字段
 */
{
  "jti": "xx", //JWTid
  "exp": "xx", //过期时间
  "nbf": "xx", //生效时间

  "name": "John Doe",
  "admin": true
}
// signature, secret 是服务器指定密钥, 用加密算法生成签名
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

这三部分都用 Base64URL 算法生成字符串用`.`拼接后 `Header.Payload.Signature`, 放到 headers 里`Authorization: Bearer <token>`

JWT是一个token的规范. 而不是认证系统.
JWT只提供token的创建和token的验证(这个验证并不是什么认证,而是对JWT本身是否符合 RFC 7519 定义的基本验证).
首先你要有一个认证系统,再结合JWT.
而不是JWT代替认证系统.
RFC明确说JWT用于OpenID和OAuth,而不是代替.
JWT比自定义token好处就是安全,可以防止客户端破解token生成规则.

#### 优点

1. 服务端无状态, 不用考虑CSRF、分布式 session、跨域这些问题

#### 缺点

1. 性能, JWT 把状态数据都保存在了 headers, 相比 cookie 存在id, 传输消耗增大
2. 没法让他主动失效
可以配合 redis 来解决，记录下每个 token 对应的生效状态，每次先去 redis 查下 jwt 是否是可用的，这样就可以让 jwt 失效
3. 安全性, 因为jwt 在客户端带了很多状态数据, 需要配合https, 避免信息泄漏

### SSO 单点登录

- SSO 代理地址

SSO 的跳转地址 VUE_APP_SSO_LOGIN_URL

- API 添加验证token, 获取管理员信息

### API接口 签名 x-signature

前端（客户端）： 1.不管GET Url 还是 POST Body 的参数，都转换成 [json](http://www.codercto.com/category/json.html) 对象，用 ascll码排序 对参数排序。 2.排序后对参数进行MD5加密，存入 sign 值。 3.把 sign 值 放在 请求URL 后面或者 Head头 里面(该项目直接放在URL后面)。

后端（服务端）： 1.把参数接收，转成 json对象 ，用 ascll码 排序 2.排序后对参数进行MD5加密，存入 paramsSign 值。 3.和 请求URL 中的 sign值 做对比，相同则请求通过

### access_token

`let access_token = md5(`${cuid}-${uncrypted}-${timestamp}-${password}-${random}-${locale}-3`); //后台接口验证`

### 扫码

- 二维码是后端生成的，我去访问服务器的一个静态文件。

- 传个clientId：uuid 作为参数去请求服务端二维码url，同时也是 轮询二维码状态的参数

- 当调用成功时把得到userKey参数再去调用扫码登陆接口，没成功就一直轮询调用二维码状态接口

- 使用 img.onload 和 img.onerror 完成图片的loading error 形态

- 定时器调用接口判断用户是否扫码

  ```js
      createQRcode() {
        let img = this.$refs.qCodeImg;
        img.onload = function() {
          console.log("onload");
          this.isError = false;
        }.bind(this);
        img.onerror = function() {
          console.log("error", this);
          this.status = "invalid";
        }.bind(this);
  
        let params = {clientId: this.uuid, web: true};
        this.$axios
          .$get("/fxchat/ScanStatus", {params})
          .then(() => {
            this.status = "invalid";
          })
          .catch(async result => {
            if (result && result.subCode && result.subCode.endsWith("1")) {
              clearTimeout(timer);
              this.status = "success";
              let params = {userKey: result.bodyMessage.context.userKey};
              let loginResult = await this.$store.dispatch("user/scanCodeLogin", params);
              if (loginResult) this.$router.go(0);
            } else {
              timer = setTimeout(() => {
                this.isStop && this.createQRcode();
              }, 2000);
            }
          });
      }
  ```

### 短信

```vue
// 使用阿里云滑块验证
<template>
  <div class="slide-bar" v-show="showSlideBar">
    <div class="ali-validator-boxer" :id="aliSlideID"></div>
  </div>
</template>

<script>
let nc = null;
export default {
  name: "SlideBar",
  props: {
    aliSlideID: {
      type: String,
      default: "nc"
    }
  },
  data() {
    return {
      showSlideBar: true
    };
  },
  mounted() {
    /*global someFunction NoCaptcha:true*/
    //滑块验证
    let appkey = "FFFF0N0N000000008BB2";
    let params = {
      appkey,
      token: [appkey, new Date().getTime(), Math.random()].join(":"),
      scene: "nc_login"
    };
    nc = NoCaptcha.init({
      renderTo: `#${this.aliSlideID}`,
      ...params,
      callback: data => {
        let res = {...params, ...data};
        this.$emit("pass", res);
        setTimeout(() => {
          // this.showSlideBar = false;
        }, 1000);
      }
    });
    NoCaptcha.setEnabled(true);
    nc.reset();
    NoCaptcha.upLang("cn", {
      SLIDER_LABEL: "请按住滑块，拖动到最右边",
      CHECK_Y: "请按住滑块，拖动到最右边"
    });
  },
  methods: {
    reset() {
      this.showSlideBar = true;
      nc.reset();
    }
  }
};
</script>
  ```

### 滑块验证

> 官方文档 <https://help.aliyun.com/document_detail/121963.html?spm=a2c4g.11186623.6.555.eb7b7a5cB3Gqc8>

<https://blog.csdn.net/weixin_35293807/article/details/108226804>

<https://www.npmjs.com/package/vue-cropper/v/0.4.7>

<https://www.jianshu.com/p/85a52da879bb>

<https://www.jianshu.com/p/5a6bf94a5dc5>

```vue
<template>
  <div class="slide-bar" v-show="showSlideBar">
    <div class="ali-validator-boxer" :id="aliSlideID"></div>
  </div>
</template>

<script>
let nc = null;
export default {
  name: "SlideBar",
  props: {
    aliSlideID: {
      type: String,
      default: "nc"
    }
  },
  data() {
    return {
      showSlideBar: true
    };
  },
  mounted() {
    /*global someFunction NoCaptcha:true*/
    //滑块验证
    let appkey = "FFFF0N0N000000008BB2";
    let params = {
      appkey,
      token: [appkey, new Date().getTime(), Math.random()].join(":"),
      scene: "nc_login"
    };
    nc = NoCaptcha.init({
      renderTo: `#${this.aliSlideID}`,
      ...params,
      callback: data => {
        let res = {...params, ...data};
        this.$emit("pass", res);
        setTimeout(() => {
          this.showSlideBar = false;
        }, 1000);
      }
    });
    NoCaptcha.setEnabled(true);
    nc.reset();
  },
  methods: {
    reset() {
      this.showSlideBar = true;
      nc.reset();
    }
  }
};
</script>
```

## vue 和 react 区别

1. 数据是不是可变的
2. 通过js操作一切还是各自的处理方式
3. 类式的组件写法还是声明式的写法
4. 什么功能内置，什么交给社区去做

## Cookie & LocalStorage & SessionStorage difference

### Cookie

1. 会随着http请求自动带到服务端, 设置httpOnly 则只有服务端能修改
2. 限制大小4k
3. 可以设置过期时间
4. 作用域由 domain 属性和 path 属性共同决定
5. Cookie 的作用域由 domain 属性和 path 属性共同决定, 如果将 Cookie 的 domain 属性设置为当前域的父域，所有子域都能共享父域的Cookie, 这样子域之间就能共享Cookie, 利用这一特性可以做OSS 登陆或者各个子域名下系统的登陆态打通(注意加密)

### LocalStorage

1. 没有过期时间, 不手动清理永久存储在硬盘里
2. 最大存储量为5M左右
3. 作用域为同源页面下

### ssesionStorage

1. 过期时间的生命周期为会话级别, 关闭页面就销毁, 刷新不会销毁
2. 最大存储量为5M左右
3. 作用域为同源页面下的独立窗口内, 如果通过window.open 或 a标签打开同源页面, 会复制当前会话的上下文作为新会话的上下文, 之后相互隔离.如果是新开一个tab 页输入url, 则不会复制会话上下文

## 前端网络安全

### XSS攻击

- XSS(Cross-Site Scripting，跨站脚本攻击)是一种代码注入攻击。攻击者在目标网站上注入恶意代码，当被攻击者登陆网站时就会执行这些恶意代码，这些脚本可以读取 cookie，session tokens，或者其它敏感的网站信息，对用户进行钓鱼欺诈，甚至发起蠕虫攻击等。

防御 XSS 攻击

- 防御 XSS 攻击最简单直接的方法就是过滤用户的输入。

- 如果不需要用户输入 HTML，可以直接对用户的输入进行 HTML 转义
- 当用户需要输入 HTML 代码时：匹配白名单，重新构建 HTML 元素树。
- 我之前写一个评论的功能，里面可以输入表情，表情是用图片展示不是用emoji，要上传图片放在下方，所以文字评论内容的地方，我先用[]把表情匹配出来，然后创建一个 documentFragment文档片段，是表情且和表情库匹配的创建一个img元素，其他的用createNodeText创建元素，然后appendChild（）插入。

### csrf攻击

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。
CSRF 可以简单理解为：攻击者盗用了你的身份，以你的名义发送恶意请求，容易造成个人隐私泄露以及财产安全。

1. 因为csrf 通常都是第三方的网站, 直接通过http origin、http refrence 过去第三方域名的请求
2. 我们项目还在请求头使用了特定的签名access token
时间戳 + 随机数 + uid + 语言 + clientType 放到请求头里, 同时加token 加盐再用特定格式拼接起来输出一个字符串再用 MD5加密形成 accessToken 放到请求头里, 服务端每次同样加密再对比access token 确定是否本人
get post 请求, 把入参sort 排序后再加盐再用特定格式输出一个字符串md5 加密, 形成一个签名, 防止参数被串改

## 常见手写题

### 深浅拷贝

```js
let obj = {
  a: { b: 22 },
  c: { d: { g: [33, 22, 11] } }
};

function deepClone(origin, target = {}) {
  
  Object.keys(origin).forEach(prop => {
    const originProp = origin[prop]
    if (typeof originProp === 'object' && originProp !== null) {
      target[prop] = Array.isArray(originProp) ? [] : {}
      deepClone(originProp, target[prop])
    } else target[prop] = originProp
  })
  return target
}

```

### forEach polyfill

```js
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
```

### 实现forEach map

```js
// map
Array.prototype._m = function(callback, instance) {

    if (typeof callback !== 'function') {
        throw new Error('必须传入一个函数')
    }
    const result = []
    for(let i = 0; i < this.length; i++) {
        result[i] = callback.call(instance, this[i], i, this)
    }
    return result
}
// forEach
Array.prototype._m = function(callback, instance) {
    if (typeof callback !== 'function') {
        throw new Error('必须传入一个函数')
    }
    for(let i = 0; i < this.length; i++) {
        callback.call(instance, this[i], i, this)
    }
}
```

### JSON 合并

- 把 [{ a: 1, b: 2018 }, { a: 2, b: 2019 }, { a: 3, b: 2019 }, { a: 4, b: 2019 }]
- 转换成[{a: 1, b: 2018}, {a: 9, b: 2019, children:  {a: 2, b: 2019}, {a: 3, b: 2019},{a: 4, b: 2019}]  格式

```js
  const arr = [
          { a: 1, b: 2018 }, 
                { a: 2, b: 2019 }, 
                { a: 3, b: 2019 }, 
                { a: 4, b: 2019 }
        ]

  const map = {};
  arr.forEach(item => {
    const { a, b } = item

    if (!map[b]) return map[b] = item
    let tempChildren = [{ a: map[b]['a'], b }, { a, b }]
    map[b]['a'] += a
    const len = map[b]['children']?.length
    
    if (!len) return map[b]['children'] = tempChildren
    tempChildren = { a, b }
    map[b]['children'].push(tempChildren)
  })
  const result = Object.values(map);
```

### 求一串字母中频率出现最高的值

```js
    const str = 'aahdffff'
    const maxString = str => {
      let obj = {}
      let maxValue = 0
      let maxStr = ''
      const compare = (k, v) => {
        if (v > maxValue) {
          maxValue = v
          maxStr = k
        }
      }
      for (let index = 0; index < str.length; index++) {
        let item = str[index];
        if (obj[item]) {
          obj[item]++
          compare(item, obj[item])
        } else {
          obj[item] = 1
          compare(item, obj[item])
        }
      }
      return "出现次数最多的字母:" + maxStr + "出现了" + maxValue + "次";
    }
```

### 模拟call

```js
    var name = "Hero";
    var obj = {
      "name": "Condor"
    };
    //如果你看不懂Function构造函数里面的this请去复习ES5的原型链
    Function.prototype._call = function () {
      // ctx需要绑定的上下文，如果没有就去绑定window
      console.log(arguments, this)
      ctx = arguments[0] || window;
      //此处的this就是fun这个函数
      //现在把这个函数，作为ctx(obj)这个对象的属性
      //执行ctx.fn()，fun函数里面的this就变成了obj
      let fn = Symbol();//新增
      ctx[fn] = this;//改动
      let argv = [];
      //第一个参数是绑定上下文的所以从第二个开始拿参数
      for (let i = 1; i < arguments.length; i++) {
        argv.push(arguments[i]);
      }
      //把参数argv传给fun
      let result = ctx[fn](...argv);//改动
      delete ctx[fn];//改动
      return result;//改动
    }
    function fun() {
      console.log(this.name);
      console.log(arguments);
    }
    fun._call(obj, 1, 2, 3);
```

### new 一个对象发生了什么

```js
1、创建一个空对象 （好理解）
2、将所创建对象的__proto__属性值设成构造函数的prototype属性值 （好理解）
3、执行 构造函数中的代码，构造函数中的this指向该对象 (划重点)
4、返回该对象（除非构造函数中返回一个对象）（见下面解释）

var obj  = {};
obj.__proto__ = Base.prototype;
Base.call(obj); 
```

``` js
function soldier(id) {
 var tempObj = {}
  tempObj.__proto__ = soldier.prototype
  tempObj.id = id
  tempObj.HP = 580
  return tempObj
}

soldier.prototype = {
  type: 'chinese',
  run: function() {
    console.log('runnnnnnn')
  }
}

var army = []
for(var i=0; i<100; i++){
  army.push(soldier(i))
}

// 用了new 以后
function Soldier() {
  // 节省了创建临时对象，绑定远行，return 对象
  this.id = id
  this.HP = 580
}

Soldier.prototype = {
  type: 'chinese'
  run: function() {
    console.log('runnnnnnn')
  }
}

var army = []
for(var i=0; i<100; i++){
  army.push(new Soldier(i))
}
```

### 防抖

```html
  <input id="search" name="">
  <script>
    document.querySelector('#search').addEventListener("input", debounce(log))

    function debounce(fn, delay = 1000) {
        // 实现防抖函数的核心是使用setTimeout
        // time变量用于保存setTimeout返回的Id

        let time = null

        // 将回调接收的参数保存到args数组中
        return function (...args) {

          // 如果time不为0，也就是说有定时器存在，将该定时器清除
          time !== null && clearTimeout(time)
          time = setTimeout(() => {
              // 使用apply改变fn的this，同时将参数传递给fn
              fn.apply(this, args)  
          }, delay)
        }
    }
    function log() {
      console.log('hello')
    }
</script>
```

### 节流(**throttle**)

```js
        document.getElementById('search').addEventListener('input', throttle(HHH, 1000))
        function throttle(fn, wait = 1000) {
            //通过闭包保存一个标记
            let flag = true
            return function () {
                //在函数开头判断标志是否为 true，不为 true 则中断函数
                if (!flag) return
                // 将 canRun 设置为 false，防止执行之前再被执行
                flag = false
                setTimeout(() => {
               //把HHH的this指向input、arguments指向event事件，不call的话HHH里的this指向                       window,event是undefined
                    fn.apply(this, arguments) 
                    // 执行完事件（比如调用完接口）之后，重新将这个标志设置为 true
                    flag = true
                }, wait);
            }
        }
        function HHH() {
            console.log('hhhhhhhhhhh');
        }
//arguments就是实参列表，你调用函数时传进去的参数
//至于 fn.apply(context, args)，前面提到 handler 中打印 this 可以拿到正确的值（当前元素），这里即改变 this 的指向。于是乎在加了防抖函数之后去触发事件时，才能保证 fn 内部能够拿到 事件对象 以及 正确的 this 值
```

## 在用vue开发的时候封装过哪些组件

- 我现在作为公司的主程, 一般大型的组件都是我封装的, 然后分配给我的组员接入业务页面, 比如甘特图、流程图
- 还有些通用的 Table、Model、Popover、form 这些, 复杂的一些关于选人组件这种
- 封装组件的目的一般都是为了复用，提效, 要考虑可扩展性、代码整洁度, 可读性可维护性, 包括以后不同项目是否能移植, 是否能打包成SDK

### 困境

1. 需求不能变化太快
2. 样式交互风格要统一, 最好UI 坐在旁边, 或者他的工作量没有那么饱和
3. 工期不能太赶, 前期组员页面写的很快, 马上就要嵌入你的页面, 你拼命设计组件、写功能, 没时间review 组员代码, 或者说项目太赶, 别人需求都没做完, 你不可能让他们加班给你去调整代码, 往往就会代码混乱, 出现乱停放的现象

## new操作的过程是什么?

> 如 var a = new A(); 认为 “a为A函数的实例对象”
> 1.new 创建一个空对象{}
> 2.然后将A.prototype的引用放置到该对象的原型链上。即a.__proto__指向 A.prototype
> 3.执行A函数，将A中this指向该对象，执行结束，如果没有return那么默认返回this引用

## 跨域

1. Window

    利用chrome浏览器添加后缀跨域

    --disable-web-security --user-data-dir=${chrome的路径} （例如：C:\MyChromeDevUserData）

    Mac

    `open -n /Applications/Google\ Chrome.app/ --args --disable-web-security --user-data-dir=/Users/linshengcong/MyChromeDevUserData/` linshengcong 换成自己的名字

2. 浏览器下载插件 [Allow-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=zh-CN)

3. webpack proxy 正向代理

4. nginx 方向代理

5. 设置 cors

6. jsonp，利用 script img iframe 等标签src 不受通源策略影响的特点进行跨域，缺点是只能get请求。其实就是后端去调用前端的代码，前端先定义一个函数，再用script标签加载的是一个合法的js代码文件，并且把函数名字传给后端，后端取了你的参数调用对应的函数并把数据作为参数返回给你，前端下载完文件自动调用这个函数做对应的处理

```html
// 后端返回的 js 文件 xxx.js。
// callback 名字可根据前端传的回调名字来改变

callback({a:1, b:2}); // 后端需要传递的数据直接作为调用参数

<script src="https://xx.com/api/xxx.js?callbackName=callback"></script>
```

<https://www.jianshu.com/p/7e072d416d65>

## 内存泄漏

1. 频繁操作iframe
2. 动态创建DOM
3. 事件绑定
4. 全局变量
5. 闭包

## js 原型链、作用域链、闭包特性

### 原型与原型链

- 原型是用来共享属性和方法的, 每个对象都有一个原型, 你访问一个对象的属性，如果没有找到，就会往它的原型(就是__proto__属性, 同时也是对应的构造函数的prototype属性)中去查找, 还没有就会再往上层查找, 这样链式查找就形成原型链.

1. js分为函数对象和普通对象，每个对象都有__proto__属性，但是只有函数对象才有prototype属性
2. Object、Function都是js内置的函数, 类似的还有我们常用到的Array、RegExp、Date、Boolean、Number、String
3. 属性__proto__是一个对象，它有两个属性，constructor和__proto__
4. 原型对象prototype有一个默认的constructor属性，用于记录实例是由哪个构造函数创建

```js
// 原型对象（即Person.prototype）的constructor指向构造函数本身
Person.prototype.constructor == Person 
// 实例（即person01）的__proto__和原型对象指向同一个地方
person01.__proto__ == Person.prototype 
```

```js
Object.prototype.__proto__ = null;
Array.prototype.__proto__ = Object.prototype;
Foo.prototype.__proto__  = Object.prototype;
```

- 除了Object的原型对象（Object.prototype）的__proto__指向null，其他内置函数对象的原型对象（例如：Array.prototype）和自定义构造函数的
__proto__都指向Object.prototype, 因为原型对象本身是普通对象。

### 利用构造函数继承

```js
        function Person(name) {
            this.name = name
            Person.prototype.age = 18
        }
        function Student(name,job) {
            Person.call(this,name)
            this.job = job
        }
        let stu = new Student('lin','I.T')
        console.log(stu);
//不能用继承的prototype
```

### 利用共有原型继承

```js
        Father.prototype.age = '44'//father给个原型出去，son，father一起用
        function Father() {
        }
        function Son() {
        }
        function extend(Target, Origin) {
            Target.prototype = Origin.prototype
        }
        extend(Son, Father)
        Son.prototype.name = 'Lin'
        let son = new Son()
        console.log(son.age, son.name);// 44 Lin
//缺点就是两个原型对象共享，对son加个私有方法就会影响到father
```

### 圣杯继承

```js
        Father.prototype.age = '44'
        function Father() {
        }
        function Son() {
        }
        function extend(Target, Origin) {
            function Temp() {
            }
            Temp.prototype = Origin.prototype
            Target.prototype = new Temp()
            Target.prototype.constructor = Target
            Target.prototype.uber = Origin.prototype//继承的超类，真正继承的谁
        }
        extend(Son, Father)
        Son.prototype.name = 'Lin'
        let son = new Son()
        let father = new Father()
        console.log(son.name, father.name);// Lin undefined
```

### 闭包

- 闭包的定义：闭包就是能够读取其他函数内部变量的函数。

- 为什么要用闭包: 利用闭包可以突破作用链域，将函数内部的变量和方法传递到外部。延长变量的生命周期，同时固定他的一个访问权限

- 闭包可以模块化开发时候防止污染全局变量，实现封装，属性私有化，可以做缓存，实现公有变量

### 形成闭包

```js
 闭包函数语法注意点
​ 外部函数只调用一次，就得到同一个变量
​ 外部函数调用多次，得到多个变量
​ 让定时器异步函数打印1，2，3，而不是答应3个4
function test() {
      let arr = []
      //这里var改成let，也能解决闭包问题，因为let是十个不同的作用域
      for (var i = 0; i < 10; i++) {
          arr[i] = function(){
              window.console.log(i)
          }
      }
      return arr
    }
    let data = test()
    for (let i = 0; i < 10; i++) {
      data[i]()
    }
//log 10,10,10*10
```

### 闭包的调用

```js
function test() {
      let arr = []
      for (var i = 0; i < 10; i++) {
        (function (j) {
          arr[j] = function () {
            console.log(j);
          }
        }
        )(i)
      }
      return arr
    }
    let data = test()
    for (let i = 0; i < 10; i++) {
      data[i]()
    }
// 0,1,2,3,4...9
```

- 闭包的弊端
  ​ 会消耗内存资源
  ​ 如何手动回收闭包内存？
  ​ 将变量=null，如果没有变量来储存函数或者变量的地址，就会被系统自动回收掉

## Vue相关

### **响应式原理**

#### 我的理解

在Vue 初始化的时候，需要observe的数据对象进行递归遍历，通过Object.defineProperty()达到数据劫持，代理所有数据的getter和setter属性。

在Vue 初始化的时候，把需要observe的对象数据进行递归遍历，通过Object.defineProperty()给所有属性都加上 setter和getter。

Watcher订阅者是Observer和Compile之间通信的桥梁

dep就是个收集器，在编译加订阅者，v-model会添加一个订阅者，{{}}也会，v-bind也会。

在数据变化触发setter的时候，就循环更新Dep中的订阅者（notify），来通知**Watcher**，Watcher作为Observer数据监听器与Compile模板解析器之间的桥梁，当Observer监听到数据发生改变的时候，**Watcher**则会调用自身的update()方法，并触发**Compile**中绑定的回调，解析模板指令，更新视图。

在这里面会有一个dom diff的过程。当我们第一次渲染dom的时候，会把dom转成一个vdom对象，是个js对象。当修改数据的时候，会走vue的update钩子，首先通过拿到修改后的数据依赖，生成一份新的vdom对象，和旧的vdom比较，进行逐层比较，把变了的vdom render成真正的dom就可以了。

#### Object.definedProperty() 缺陷

数据下标变化不会相应，因为效率的问题根本没有去监听

#### 实现方式

```js
原理
vue数据双向绑定通过‘数据劫持’ + 订阅发布模式实现

数据劫持
指的是在访问或者修改对象的某个属性时，通过一段代码拦截这个行为，进行额外的操作或者修改返回结果

典型的有
1.Object.defineProperty()
2.es6中Proxy对象

vue2.x使用Object.defineProperty();
vue3.x使用Proxy;

订阅发布模式
定义：对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知
订阅发布模式中事件统一由处理中心处理，订阅者发布者互不干扰。
优点：实现更多的控制，做权限处理，节流控制之类，例如：发布了很多消息，但是不是所有订阅者都要接收

// 实现一个处理中心
let event = {
  clientList: {}, // 订阅事件列表
  // 订阅
  on(key, fn){
    // 如果这个事件没有被订阅，那么创建一个列表用来存放事件
    if(!this.clientList[key]) {
      this.clientList[key] = []
    }
    // 将事件放入已有的事件列表中
    this.clientList[key].push(fn);
  },
  // 发布
  trigger(type, args){
    let fns = this.clientList[type] // 拿到这个事件的所有监听
    if(!fns || fns.length === 0){  // 如果没有这条消息的订阅者
      return false
    }
    // 如果存在这个事件的订阅，那么遍历事件列表，触发对应监听
    fns.forEach(fn => {
      // 可以在此处添加过滤等处理
      fn(args)
    })
  }
}
vue中如何实现
利用Object.defineProperty();把内部解耦为三部分
/watcher(观察者):当数据值修改时，执行相应的回调函数，更新模板内容
dep：链接observer和watcher，每一个observer对应一个dep,内部维护一个数组，保存与该observer相关的watcher

proxy实现观察者模式
观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行

const person = observable({
  name: '张三',
  age: 20
});

function print() {
  console.log(`${person.name}, ${person.age}`)
}

observe(print);
person.name = '李四';
// 输出
// 李四, 20
代码中。对象person是观察目标，函数print是观察者。一旦数据发生变化，print就会自动执行

使用proxy实现一个最简单观察者模式，即实现observable和observe这两个函数。
思路是observable函数返回一个原始对象的proxy代理，拦截复制操作。触发充当观察者的各个函数

const queue = new Set();

const observe = fn => queue.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queue.forEach(observer => observer());
  return result;
} 
上面代码中，先定义了一个Set集合，所有观察者函数都放进这个集合，然后，observable函数返回原始对象的代理，拦截赋值操作。
拦截函数set中，自动执行所有观察者
```

#### 其他理解

**理解1**

数据模型仅仅是普通的 JavaScript 对象。而当你修改它们时，视图会进行更新

- 当你把一个普通的 JavaScript 对象传入 Vue 实例作为 data 选项，Vue 将遍历此对象所有的属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter。
  - 转换的getter/setter 在内部它们让 Vue 能够追踪依赖，在属性被访问和修改时通知变更
  - 每个组件实例都对应一个 watcher 实例，它会在组件渲染的过程中把“接触”过的数据属性记录为依赖。之后当依赖项的 setter 触发时，会通知 watcher，从而使它关联的组件重新渲染。
  - 受现代 JavaScript 的限制，Vue 无法检测到对象属性的添加或删除。由于 Vue 会在初始化实例时对属性执行 getter/setter 转化，所以属性必须在 data 对象上存在（在data里初始化属性）才能让 Vue 将它转换为响应式的。
  - 对于已经创建的实例，Vue 不允许动态添加根级别的响应式属性。但是，可以使用 vm.$set(object, propertyName, value) 方法向嵌套对象添加响应式属性
  - 有时你可能需要为已有对象赋值多个新属性，比如使用 Object.assign() ，但是，这样添加到对象上的新属性不会触发更新。在这种情况下，你应该用原对象与要混合进去的对象的属性一起创建一个新的对象。
       // 代替 `Object.assign(this.someObject, { a: 1, b: 2 })`
       <u>this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })</u>

**理解2**

首先是观察者，observer他利用obj defineproperty去拿到data依赖，然后遍历子集依赖，set拿到所有子依赖，就告诉订阅者，warcher，每收集一个子依赖就new一个订阅者，最后订阅者被收集起来，dep就是个收集器，是个集合或者数组。然后通过编译器compile去拿组件里所有我们定义的temeplate dom这里需要区分nodetype，因为vue的模板或者是指令都是自己定义好的，如v-text双大括号这些，然后和dep里的收集做一个匹配，render到我们indec.html定义的app里去。总结一下就是收集数据依赖，然后装到订阅器里，匹配dom中的指令，进行赋值。这是双向绑定，然后每次修改数据呢？会有一个dom diff的过程。当我们第一次渲染dom的时候，会把dom转成一个vdom对象，是个js对象。当修改数据的时候，会走vue的update钩子，首先通过拿到修改后的数据依赖，生成一份新的vdom对象，和旧的vdom比较，比较是一个逐层比较的过程，走patch方法，相同不管，不同直接新生成一个，把旧的移除，把新的放进去。然后去比较下一层，会有一个updatechildren的过程。children可能会是多个，所以我们给每个孩子定义索引，新旧比较，相同不管，不同新的孩子插入到旧孩子前一个索引下标处，旧孩子移除。前面比较的同时后面也开始比较，一直到startindex大于等于endindex表示比较完了。然后我们就知道哪里变了，只把变了的vdom render成真正的dom就可以了。为什么要搞这么复杂呢？原来jq时代也没看出啥问题啊，非说影响效率了。浏览器渲染呢，先从定义的doctype知道浏览器用哪种格式编译文档，然后把我们写的html语义化标签编译成一个dom树然后再拿到css组成样式树，这样就可以计算一些宽高，距离，定义一些颜色，最后由上到下渲染我们的html内容。所以老说少用table iframe由于之前jq最爱操作dom，每次js操作dom都会有一个连桥的过程，会影响性能，每次操作dom都需要访问dom又影响性能，dom改变了浏览器直接回流，就是页面再从body从上到下render一遍，如果修改一些宽高样式，还会完成页面重绘，所以就要搞虚拟dom了呗。手机打字太费劲了

**理解3**

vue.js 是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。

具体步骤：

第一步：需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter和getter这样的话，给这个对象的某个值赋值，就会触发setter，那么就能监听到了数据变化
第二步：compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
第三步：Watcher订阅者是Observer和Compile之间通信的桥梁，主要做的事情是:1、在自身实例化时往属性订阅器(dep)里面添加自己2、自身必须有一个update()方法3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。
第四步：MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。

### Vue路由原理

#### hash

- url 后方的# 原来是作为锚点跳转用，改变#不触发网页重载，改变#会改变浏览器的访问历史, 契合浏览器的前进后退。然后通过监听 `window.addEventListener("hashchange", () => {})` 实现无刷新路由跳转

#### history

- 直接用的 浏览器的 history interface，用 location.pathname 获取路由, 用 back ，go 这些方法跳转，pushState()、replaceState用来对浏览器历史记录栈进行修改, 结合 popstate 方法监听url中路由的变化

- 刷新页面404, 因为Vue 是单页面应用, 所有的请求都是访问的index 目录,pathname 后面的路径匹配不到具体页面, 所以需要在服务器上重定向到index页面, 再走前端的路由, hash 模式没有这种情况是因为hash是用#表示的, 本意是用来代表浏览器页面锚点的, 所以不会出现在 HTTP 请求中

```shell
location / {
  index  /data/dist/index.html;
  try_files $uri $uri/ /index.html;
}
```

### vue for循环中 key 的作用

- 作为一个唯一标识，方便vue 进行就地复用，比如 循环一个数组 [1,2,3], 当你 splice(1,1) 后 [1,3] ,此时 vue 会认为你把第二项进行修改并且把第三项删除，为了方便进行复用，设定key 作为一个唯一标识。另外，如果你的key 使用数组下标index，那么删除数组时下标跟着变化，那么key 就没有意义了

### 计算属性

计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。

#### 计算属性与methods

1. 计算属性依赖的属性没有变化，页面重新渲染，methods 调用方法将总会再次执行函数得出结果，而计算属性会立即返回之前的计算结果，而不必再次执行函数。

2. 计算属性渲染在模版多个地方，依赖的属性改变，methods 就要一个一个计算，而计算属性只会计算一次返回，而不必多次次执行。

### 计算属性与watch

计算属性不建议使用异步操作，比如发请求什么的，所以当需要在数据变化时执行异步或开销较大的操作时，这个方式建议用watch。

### MVVM

- M 代表数据模型
- V 代表UI视图
- VM 则是把View 的状态和行为抽象化，让我们将视图 UI 和业务逻辑分开，利用双向数据绑定把视图和数据模型相结合。
- 比如我们之前渲染一个动态的下拉框，需要调接口获取数据，遍历数据，生成option DOM节点，再插入节点。
- 而在Vue 中，只要把数据赋值就可以了，节约了dom 操作。

### 虚拟dom

diff算法就是进行虚拟节点对比，并返回一个patch对象，用来存储两个节点不同的地方，最后用patch记录的消息去局部更新Dom。

 虚拟DOM是通过js语法来在内存中维护一个通过数据解构描述出来的一个模拟DOM树，当数据发生改变的时候，会先对虚拟DOM进行模拟修改，然后在通过新的虚拟DOM树与旧的虚拟DOM树来对比，而这个对比就是通过diff算法来进行的虚拟DOM最大的意义不在于性能的提升（JavaScript对象比DOM对象性能高），而在于抽象了DOM的具体实现（对DOM进行了一层抽象）

so：步骤一：用JS对象模拟DOM树

步骤二：比较两棵虚拟DOM树的差异

步骤三：把差异应用到真正的DOM树上

同时维护新旧两棵虚拟DOM树，当数据发生改变的时候，开始执行对比

首先对根元素进行对比，如果根元素发生改变就直接对根元素替换

### 单向数据流

所有的 prop 都使得其父子 prop 之间形成了一个**单向下行绑定**：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外变更父级组件的状态，从而导致你的应用的数据流向难以理解。

**prop 用来传递一个初始值；这个子组件接下来希望将其作为一个本地的 prop 数据来使用**

```js
props: ['initialCounter'],
data() {
  return {
    counter: this.initialCounter
  }
}
```

如果数据还需要进行转换, 那就用计算属性

## 性能优化

前端性能优化可以从几方面讲

1. 工程打包优化 dllPlugin、happyPack、CDN、gzip、imgage-loader、svgo雪碧图、cacheGroup(splitChunk)、terser(uglifyjs)
2. 首评渲染速度
3. 异步、拆分 图片懒加载、Tree 懒加载、分页加载、虚拟列表、路由懒加载、组件单例模式
4. 缓存、复用 http请求缓存, CDN缓存、页面缓存, 静态资源缓存 本地缓存hybrid 离线包
5. 合并 requestAnimationFrame、DocumentFragment、SSR、BFF数据聚合、setState事件合并、diff 差量更新

```js
import { lazy，, Suspense } from 'react'
const Home = lazy(() => import('../Home'))
```

### requestAnimationFrame

- requestAnimationFrame 的优点是它能够将所有的动画都放到一个浏览器重绘周期里去做
- 还能根据浏览器以及计算机性能计算帧率
- 他只是请求浏览器在下一次可以获得的机会去展示一帧画面，而不是在一个已经规划好的间隔。也就是说浏览器能够根据页面加载，元素显示，电池的状态来选择 requestAnimationFrame 的性能。

2. DocumentFragment

- 文档片段, dom 批量更新时使用
- DocumentFragment 节点不属于文档树，存在于内存中，并不在DOM中，所以将子元素插入到文档片段中时不会引起页面回流

- 以上两者和React setState 事件合并更新渲染是一个道理

### 回流重绘优化 会使cpu使用率上升 niko and

#### 浏览器的渲染过程

- 解析HTML 生成DOM树
- 解析css 生成css渲染树
- 布局渲染树，获取宽高坐标等
- 开始渲染

#### html 加载时发生了什么

在页面加载时，浏览器把获取到的HTML代码解析成1个DOM树，DOM树里包含了所有HTML标签，包括display:none隐藏，还有用JS动态添加的元素等。
 浏览器把所有样式(用户定义的CSS和用户代理)解析成样式结构体
 DOM Tree 和样式结构体组合后构建render tree, render tree类似于DOM tree，但区别很大，因为render tree能识别样式，render tree中每个NODE都有自己的style，而且render tree不包含隐藏的节点(比如display:none的节点，还有head节点)，因为这些节点不会用于呈现，而且不会影响呈现的，所以就不会包含到 render tree中。我自己简单的理解就是DOM Tree和我们写的CSS结合在一起之后，渲染出了render tree。

#### 什么是回流

当render tree中的一部分(或全部)因为元素的规模尺寸，布局，隐藏等改变而需要重新构建。这就称为回流(reflow)。每个页面至少需要一次回流，就是在页面第一次加载的时候，这时候是一定会发生回流的，因为要构建render tree。在回流的时候，浏览器会使渲染树中受到影响的部分失效，并重新构造这部分渲染树，完成回流后，浏览器会重新绘制受影响的部分到屏幕中，该过程成为重绘。

#### 什么是重绘

当render tree中的一些元素需要更新属性，而这些属性只是影响元素的外观，风格，而不会影响布局的，比如background-color。则就叫称为重绘。

使用一些 transform opacity filters 动画不会导致回流 GPU加速 硬件加速 will-change 动画写到bfc中，以免影响标准流 vuex-persist

## JS EventLoop

### JS是单线程

- JavaScript的单线程，与它的用途有关。作为浏览器脚本语言，JavaScript的主要用途是与用户互动，以及操作DOM。这决定了它只能是单线程，否则会带来很复杂的同步问题。

### 同步和异步

js里的任务分为两种：同步任务（synchronous）和异步任务（asynchronous）。同步阻塞异步非阻塞。
同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务，
异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。
单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。所以会有任务队列的概念。正因为是单线程，所以所有任务都是主线程执行的，异步请求这些也不会开辟新的线程，而是放到任务队列，当这些异步操作被触发时才进入主线程执行。

### 宏任务和微任务

JS任务又分为宏任务和微任务。
宏任务（macrotask）：script、setTimeout、setInterval、事件回调、setImmediate、I/O
微任务（microtask）：promise.then、process.nextTick、MutationObserver

宏任务按顺序执行，且浏览器在每个宏任务之间渲染页面
浏览器为了能够使得JS内部task与DOM任务能够有序的执行，会在一个task执行结束后，在下一个 task 执行开始前，对页面进行重新渲染 （task->渲染->task->...）

微任务通常来说就是需要在当前 task 执行结束后立即执行的任务，比如对一系列动作做出反馈，或或者是需要异步的执行任务而又不需要分配一个新的 task，这样便可以减小一点性能的开销。只要执行栈中没有其他的js代码正在执行且当前宏任务执行完，微任务队列会立即执行。如果在微任务执行期间微任务队列加入了新的微任务，会将新的微任务加入队列尾部，之后也会被执行。

何时使用微任务

微任务的执行时机，晚于当前本轮事件循环的 Call Stack(调用栈)中的代码（宏任务），早于事件处理函数和定时器的回调函数

使用微任务的原因

减少操作中用户可感知到的延迟
确保任务顺序的一致性，即便当结果或数据是同步可用的, 批量操作的优化

### 执行顺序

1. 执行当前执行上下文中的同步代码，直到遇到第一个宏任务。
2. 执行所有微任务队列中的任务，直到微任务队列为空。
3. 当微任务队列为空后，会进行渲染更新
4. 接着从宏任务队列中选择一个任务执行。
5. 上述过程会不断重复，这就是Event Loop，比较完整的事件循环。

- 在宏任务和微任务同时存在的情况下，微任务会优先执行。只有当所有微任务执行完毕后，才会选择执行下一个宏任务。这个顺序确保了微任务能够及时执行，以便在下一个渲染步骤之前进行更新。

- 在JS 中, 由于开始读取脚本需要 script 标签, script 脚本是宏任务，他执行是因为当前的微任务队列是空，而宏任务队列只有script这个任务，再清空微任务队列（此时没有任何任务），然后开始执行script里面的代码

## BFC （Block Formatting Context）

- 块级格式化上下文是 Web 页面中的一块渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。
- 具有 BFC 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性。
- 格式化上下文影响布局，通常，我们会为定位和清除浮动创建新的 BFC，而不是更改布局，因为它将：

1. 包含内部浮动(内部浮动的元素被外部盒子包裹着, 不会脱离文档流, 会撑开外部盒子, 常见场景浮动塌陷)
2. 排除外部浮动(使外部浮动元素不会重叠到一起)
3. 阻止外边距重叠(两个盒子之间margin 重叠时分开)

tips: （display：flex/grid/inline-flex）建立新的 flex/grid 格式上下文，除布局之外，它与块格式上下文类似。flex/grid 容器中没有可用的浮动子级，但排除外部浮动和阻止外边距重叠仍然有效。

### 创建BFC 的方式

1. 根元素（`<html>`）
2. 浮动元素（float 值不为 none）
3. 定位元素（position 值为 absolute 或 fixed）
4. 行内块元素（display 值为 inline-block）
5. overflow 值不为 visible、clip 的块元素

### 处理浮动塌陷

```css
//这种完美
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
//这种通常也可以
.clearfix:after {
    content:'';
    display:block;
    height:0;
    line-height:0;
    clear:both;
    visibility:hidden;
}
```

## 前端上传和后端文件的区别?

### 前端上传

前端直接用oss 上传,前端会暴露accessKeySecret, 可以让后端生成sts给前端，前端用sts构造ossclient去上传, 而且就几分钟生效时间, 只给GET，PUT 权限, 不能删除也没事

一般大文件走前端上传，因为前端-后端-oss的话，容易超时断开连接，要不然就走异步

### 后端上传

前端把文件传给后端，然后后端直接走oss上传
