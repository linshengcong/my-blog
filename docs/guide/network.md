# 网络

## OSI 7层模型和TCP/IP 4层模型

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6fb0c6d33e224d54aa608341e2e80aa7~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp">

### 第七层. 应用层

应用层为应用软件提供接口，使得应用程序能够使用网络服务进行通信。例如 Web 浏览器和电子邮件客户端。它提供的协议规定，允许应用软件发送和接收信息并向用户呈现数据。应用层协议的一些示例包括超文本传输协议(HTTP)、文件传输协议 (FTP)、邮局协议 (POP)、邮件传输协议 (SMTP) 和域名系统 (DNS)等。

- 对应的网络协议: HTTP、FTP、SSH

### 第六层. 表示层

表示层将应用层的信息转换为适合网络传输的格式， 或将来自下一层的数据转换为上一层能够处理的格式，因此它主要负责数据格式的转换。如 编码、加密和压缩。

- 对应的网络协议: Telnet、Rlogin

### 第五层. 会话层

会话层在设备之间创建称为会话的通信通道。它负责打开会话（或者说建立连接也可以），确保它们在数据传输时保持打开和功能，并在通信结束时关闭它们。会话层还可以在数据传输期间设置检查点，如果会话(连接)中断，设备可以从最后一个检查点恢复数据传输。

- 对应的网络协议: DNS

### 第四层. 传输层

建立端口到端口之间的连接；传输层接收从会话层传输过来的数据，并在发送时候将其分解为“段” (拆包)。当从网络层接受到数据后，它还负责重新组装分段 (粘包)，将其转为会话层可以使用的数据。

- 对应的网络协议: TCP、UDP

### 第三层. 网络层

建立主机和主机之间的连接
负责将数据传输到目标地址。简单来说就是路由和寻址

- 对应的网络协议: IP

### 第二层. 数据链路层

负责物理层面上互连的，节点之间的通信传输以及数据帧的生成与接收。
根据以太网协议, 将一组电信号组成一个数据包,称作'帧'(frame), 并控制他的传输, 包含(head、data)两部分
它使用MAC 地址(网卡地址)连接设备并定义传输和接收数据的权限。

- 以太网

### 第一层. 物理层

通过电缆、光缆把电脑连接起来的物理手段, 传送比特流0 和 1

## websocket

### socket(套接字)

Socket是一种进程通信机制，凭借这种机制，客户/服务器系统的开发工作既可以在本地单机上进行，也可以跨网络进行。

Socket并不是一种协议，可以将Socket理解为方便直接使用更底层协议（传输层TCP或UDP）而存在的一个抽象层。Socket跟TCP/IP协议没有必然的联系。Socket编程接口在设计的时候，就希望也能适应其他的网络协议，Socket只是使得用TCP/IP协议栈更方便而已。所以Socket是对TCP/IP协议的封装，它是一组接口。这组接口当然可以由不同的语言去实现。它把复杂的TCP/IP协议族隐藏在Socket接口后面，对用户来说，一组简单的接口就是全部，让Socket去组织数据，以符合指定的协议。用套接字中的相关函数来完成通信过程。

websocket是基于TCP的一个应用协议，与HTTP协议的关联之处在于websocket的握手数据被HTTP服务器当作HTTP包来处理，主要通过Update request HTTP包建立起连接，之后的通信全部使用websocket自己的协议。

### 心跳检测

```js
websocket() {
  let heartCheck = {
    delay: 60000,
    timeout: null,
    serverTimeout: null,
    reset: () => {
      clearTimeout(heartCheck.timeout);
      clearTimeout(heartCheck.serverTimeout);
      return heartCheck;
    },
    start: () => {
      heartCheck.timeout = setTimeout(() => {
        window.ws.send("HeartBeat");
        heartCheck.serverTimeout = setTimeout(() => {
          window.ws.close();
        }, heartCheck.delay);
      }, heartCheck.delay);
    }
  };
  let createWebSocket = url => {
    let ws = new WebSocket(url);
    window.ws = ws;
    ws.onopen = () => {
      console.log("open");
    };
    ws.onmessage = event => {
      heartCheck.reset().start();
      let data = JSON.parse(event.data);
      this.disposeMessage(data);
      console.log(event);
    };
    ws.onerror = () => {
      console.log("error");
      reconnect(url);
    };
    ws.onclose = () => {
      console.log("close");
      reconnect(url);
    };
  };
  if ("WebSocket" in window) {
    let url = `${process.env.VUE_APP_WEBSOCKET_URL}/socketServer/${this.uid}`;
    createWebSocket(url);
  }
  let reconnect = url => {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    setTimeout(() => {
      createWebSocket(url);
      this.lockReconnect = false;
    }, 5000);
  };
}
sposeMessage(data) {
  if (data.type === 201000) {
    this.$store.commit("account/SET_BIND_ACCOUNT_ID", data.data.accountId); // 绑定账户
  } else if (data.type === 201001) {
    const obj = {10001: "无效账户", 10002: "账户已被禁用", 10003: "服务器无法连接"};
    const errMsg = obj[data.data.errCode];
    this.$message.error(errMsg);
  } else if ([1, 2, 3, 4].includes(data.type)) {
    this.$store.commit("message/setNewMessage", data);
  }
}
```

## http

状态码

- 200 ok 成功
- 201 Created 添加成功
- 301 永久重定向
- 302 临时重定向
- 304 Not Modified 未改变，走缓存
- 400 Bad Request 语法无效
- 401 没权限 缺乏目标资源要求
- 402 payment reqired 需要付费
- 403 没权限 拒绝授权访问 如密码错误
- 404 **`Not Found`**， 服务端找不到这个资源
- 500 Internal Server Error 服务端错误
- 501 Not Implemented 请求方法不被支持
- 502 bad getaway 网关错误
- 504 Gateway Timeout 网关超时

**一次完整的HTTP事务是怎样一个过程？**

　　1）域名解析

　　2） 发起TCP的3次握手

　　3） 建立TCP连接后发起http请求

　　4） 服务器响应http请求，浏览器得到html代码

　　5） 浏览器解析html代码，并请求html代码中的资源（如js、css、图片等）

　　6） 浏览器对页面进行渲染呈现给用户

**关于Http 2.0 你知道多少**

- HTTP/2引入了“服务端推（server push）”的概念，它允许服务端在客户端需要数据之前就主动地将数据发送到客户端缓存中，从而提高性能。
- HTTP/2提供更多的加密支持
- HTTP/2使用多路技术，允许多个消息在一个连接上同时交差。
- 它增加了头压缩（header compression），因此即使非常小的请求，其请求和响应的header都只会占用很小比例的带宽

**TCP和UDP的区别**

- TCP（Transmission Control Protocol，传输控制协议）是基于连接的协议，也就是说，在正式收发数据前，必须和对方建立可靠的连接。一个TCP连接必须要经过三次“对话”才能建立起来
- UDP（User Data Protocol，用户数据报协议）是与TCP相对应的协议。它是面向非连接的协议，它不与对方建立连接，而是直接就把数据包发送过去！ UDP适用于一次只传送少量数据、对可靠性要求不高的应用环境

### GET 和 POST 的区别

GET的语义是请求获取指定的资源。GET方法是安全、幂等、可缓存的（除非有 Cache-ControlHeader的约束）,GET方法的报文主体没有任何语义。

POST的语义是根据请求负荷（报文主体）对指定的资源做出处理，具体的处理方式视资源类型而不同。POST不安全，不幂等，（大部分实现）不可缓存。为了针对其不可缓存性，有一系列的方法来进行优化，以后有机会再研究（FLAG已经立起）。

> GET后退按钮/刷新无害，POST数据会被重新提交（浏览器应该告知用户数据会被重新提交）。
> GET书签可收藏，POST为书签不可收藏。
> GET能被缓存，POST不能缓存 。
> GET编码类型application/x-www-form-url，POST编码类型encodedapplication/x-www-form-urlencoded 或 multipart/form-data。为二进制数据使用多重编码。
> GET历史参数保留在浏览器历史中。POST参数不会保存在浏览器历史中。
> GET对数据长度有限制，当发送数据时，GET 方法向 URL 添加数据；URL 的长度是受限制的（URL 的最大长度是 2048 个字符）。POST无限制。
> GET只允许 ASCII 字符。POST没有限制。也允许二进制数据。
> 与 POST 相比，GET 的安全性较差，因为所发送的数据是 URL 的一部分。在发送密码或其他敏感信息时绝不要使用 GET ！POST 比 GET 更安全，因为参数不会被保存在浏览器历史或 web 服务器日志中。
> GET的数据在 URL 中对所有人都是可见的。POST的数据不会显示在 URL 中。

## https 原理

- https其实就是在http 和 tcp中加一层 SSL 协议

## http2

- http2.0是一种安全高效的下一代http传输协议。安全是因为http2.0建立在https协议的基础上，高效是因为它是通过二进制分帧来进行数据传输。

### 二进制分帧（Binary Format）- http2.0的基石

- 帧(frame)包含部分：类型Type, 长度Length, 标记Flags, 流标识Stream和frame payload有效载荷。
- 消息(message)：一个完整的请求或者响应，比如请求、响应等，由一个或多个 Frame 组成。
- 流是连接中的一个虚拟信道，可以承载双向消息传输。每个流有唯一整数标识符。为了防止两端流ID冲突，客户端发起的流具有奇数ID，服务器端发起的流具有偶数ID。
- 流标识是描述二进制frame的格式，使得每个frame能够基于http2发送，与流标识联系的是一个流，每个流是一个逻辑联系，一个独立的双向的frame存在于客户端和服务器端之间的http2连接中。一个http2连接上可包含多个并发打开的流，这个并发流的数量能够由客户端设置。
- 在二进制分帧层上，http2.0会将所有传输信息分割为更小的消息和帧，并对它们采用二进制格式的编码将其封装，新增的二进制分帧层同时也能够保证http的各种动词，方法，首部都不受影响，兼容上一代http标准。其中，http1.X中的首部信息header封装到Headers帧中，而request body将被封装到Data帧中。

### 多路复用 (Multiplexing) / 连接共享

- 在http1.1中，浏览器客户端在同一时间，针对同一域名下的请求有一定数量的限制，超过限制数目的请求会被阻塞。这也是为何一些站点会有多个静态资源 CDN 域名的原因之一。
- 而http2.0中的多路复用优化了这一性能。多路复用允许同时通过单一的http/2 连接发起多重的请求-响应消息。有了新的分帧机制后，http/2 不再依赖多个TCP连接去实现多流并行了。每个数据流都拆分成很多互不依赖的帧，而这些帧可以交错（乱序发送），还可以分优先级，最后再在另一端把它们重新组合起来。
- http 2.0 连接都是持久化的，而且客户端与服务器之间也只需要一个连接（每个域名一个连接）即可。http2连接可以承载数十或数百个流的复用，多路复用意味着来自很多流的数据包能够混合在一起通过同样连接传输。当到达终点时，再根据不同帧首部的流标识符重新连接将不同的数据流进行组装。

### 头部压缩（Header Compression）

- http1.x的头带有大量信息，而且每次都要重复发送。http/2使用encoder来减少需要传输的header大小，通讯双方各自缓存一份头部字段表，既避免了重复header的传输，又减小了需要传输的大小。
- 对于相同的数据，不再通过每次请求和响应发送，通信期间几乎不会改变通用键-值对(用户代理、可接受的媒体类型，等等)只需发送一次。
- 事实上,如果请求中不包含首部(例如对同一资源的轮询请求)，那么，首部开销就是零字节，此时所有首部都自动使用之前请求发送的首部。
- 如果首部发生了变化，则只需将变化的部分加入到header帧中，改变的部分会加入到头部字段表中，首部表在 http 2.0 的连接存续期内始终存在，由客户端和服务器共同渐进地更新。
- 需要注意的是，http 2.0关注的是首部压缩，而我们常用的gzip等是报文内容（body）的压缩，二者不仅不冲突，且能够一起达到更好的压缩效果。
- http/2使用的是专门为首部压缩而设计的HPACK算法。

### 请求优先级（Request Priorities）

- 把http消息分为很多独立帧之后，就可以通过优化这些帧的交错和传输顺序进一步优化性能。每个流都可以带有一个31比特的优先值：0 表示最高优先级；2的31次方-1 表示最低优先级。
- 服务器可以根据流的优先级，控制资源分配（CPU、内存、带宽），而在响应数据准备好之后，优先将最高优先级的帧发送给客户端。高优先级的流都应该优先发送，但又不会绝对的。绝对地准守，可能又会引入首队阻塞的问题：高优先级的请求慢导致阻塞其他资源交付。
- 分配处理资源和客户端与服务器间的带宽，不同优先级的混合也是必须的。客户端会指定哪个流是最重要的，有一些依赖参数，这样一个流可以依赖另外一个流。优先级别可以在运行时动态改变，当用户滚动页面时，可以告诉浏览器哪个图像是最重要的，你也可以在一组流中进行优先筛选，能够突然抓住重点流。

1. 优先级最高：主要的html

2. 优先级高：CSS文件

3. 优先级中：js文件

4. 优先级低：图片

### 服务端推送（Server Push）

- 服务器可以对一个客户端请求发送多个响应，服务器向客户端推送资源无需客户端明确地请求。并且，服务端推送能把客户端所需要的资源伴随着index.html一起发送到客户端，省去了客户端重复请求的步骤。
- 正因为没有发起请求，建立连接等操作，所以静态资源通过服务端推送的方式可以极大地提升速度。Server Push 让 http1.x 时代使用内嵌资源的优化手段变得没有意义；如果一个请求是由你的主页发起的，服务器很可能会响应主页内容、logo 以及样式表，因为它知道客户端会用到这些东西，这相当于在一个 HTML 文档内集合了所有的资源。
- 不过与之相比，服务器推送还有一个很大的优势：可以缓存！也让在遵循同源的情况下，不同页面之间可以共享缓存资源成为可能。

### http2.0性能瓶颈

- 启用http2.0后会给性能带来很大的提升，但同时也会带来新的性能瓶颈。因为现在所有的压力集中在底层一个TCP连接之上，TCP很可能就是下一个性能瓶颈，比如TCP分组的队首阻塞问题，单个TCP packet丢失导致整个连接阻塞，无法逃避，此时所有消息都会受到影响。未来，服务器端针对http 2.0下的TCP配置优化至关重要。

## TCP
