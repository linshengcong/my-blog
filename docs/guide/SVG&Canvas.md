# SVG & Canvas

## SVG

### Shapes

1. rect 矩形
2. Circle 圆形
3. ellipse 椭圆
4. line 线
5. polyline 折线
6. polygon 多边形
7. 路径 path

### 属性

1. width
2. height
3. x
4. y
5. style
   1. stroke 边颜色
   2. stroke-width
   3. fill
   4. transform="translate(x,y)": 加了描边后需要平移（x=stroke-width/2, y=stroke-width/2）

### path

- M = moveto(M X,Y) ：将画笔移动到指定的坐标位置
- L = lineto(L X,Y) ：画直线到指定的坐标位置
- H = horizontal lineto(H X)：画水平线到指定的X坐标位置
- V = vertical lineto(V Y)：画垂直线到指定的Y坐标位置
- C = curveto(C X1,Y1,X2,Y2,ENDX,ENDY)：三次贝赛曲线
- S = smooth curveto(S X2,Y2,ENDX,ENDY)：平滑曲率
- Q = quadratic Belzier curve(Q X,Y,ENDX,ENDY)：二次贝赛曲线
- T = smooth quadratic Belzier curveto(T ENDX,ENDY)：映射
- A = elliptical Arc(A RX,RY,XROTATION,FLAG1,FLAG2,X,Y)：弧线
- Z = closepath()：关闭路径

大写表示绝对定位，小写表示相对定位

### g

- 用于把相关元素进行组合的容器元素
- 添加到g 元素上的变换会应用到其所有的子元素上。添加到`g`元素的属性会被其所有的子元素继承
- g 元素也可以用来定义复杂的对象，之后可以通过[``](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/use)元素来引用它们

### foreignObject

能在其中使用具有其它XML命名空间的XML元素, 在浏览器上下文一般指xhtml 和html, 就是可以在 `SVG` 内部渲染 `HTML` 标签

```xml
<foreignObject width="120" height="50">
   <body xmlns="http://www.w3.org/1999/xhtml">
      <p>hello world</p>
   </body>
</foreignObject>
```

### SVG (safari、HarmonyOS) 兼容问题

使用vue 自定义节点来渲染节点内容，利用SVG 的foreignObject 元素可以插入HTML 结构的特征, 因为自定义节点内容都是渲染在SVG 的foreignObject 元素内部，因为部分浏览器出现兼容性问题(Safari, HarmonyOS)，主要表现形式为

#### 节点定位失效,部分图标渲染错位重复渲染

解决方案:

不要使用 postion 、transform、opacity 定位来布局, 对于一些需要固定在节点边缘的状态icon, 我的解决方案是使用 float-right + margin + 动态计算高度来解决, float 来使图标脱离文档流, 需要固定在底部的, 我先通过id 获取当前自定义节点, 再通过获取父级 `<foreignObject>` dom, 利用Observer 来监听  `<foreignObject>` height 属性, 来实时通知改变宽高时的底部高度.

```js
const customNode = document.getElementById(`${this.getNode().id}`)

const foreignObject = customNode.parentNode.parentNode

if (!foreignObject) return

this.nodeHeight = foreignObject.getAttribute('height')

const MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver

const mutationObserver = new MutationObserver(() => this.nodeHeight = foreignObject.getAttribute('height')

mutationObserver.observe(foreignObject, { attributeFilter: ['height'] })
```

#### 导出时候样式缺失

解决方案:

导出函数的第二个参数自行添加 stylesheet 补充样式

```js
// be like this
this.graph.toSVG((dataUri: string) => {
  // todo
}, {
  stylesheet: `
    .my-element {
      font-size: 12px;
    }
  ` 
})
```

#### 连接线使用虚线属性, 在Safari 上, 箭头受到虚线属性影响, 变成虚化

解决方案:

我使用SVG marker-end: url() 接收一个自定义的SVG箭头图标解决

SVG 的 `marker-end` 属性可以接收一个 `url()` 函数，指向一个包含 `<marker>` 元素的 `<defs>` 块, 用于定义一个路径末尾的箭头标记

```js
// be like this
.x6-edge path:nth-child(2) {
  marker-end: url(#icon-triangle_-∟-0510);
  // #icon 因为项目里使用了svg-sprite-loader, 自动拦截 #icon 的 .svg文件使用use元素解析
  // triangle 是我自定义svg 的文件名
  // -∟-0510 是我定义的marker id
}
```

```xml
<svg xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="-∟-0510" viewBox="0 0 10 10"
            refX="8" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#A3AFBB"/>
    </marker>
  </defs>
</svg>

 <defs> 元素定义了一个 ID 为 -∟-0510 的标记，然后在 <path> 元素的 marker-end 属性中使用了 url(#-∟-0510)。这个 url() 函数指向了包含 <marker> 元素的 <defs> 块，因此箭头标记被成功地引用了。
```

### 能轻松把其中的DOM 元素转成图片, 包括css 动画, 实现导出截图等功能

- 获取DOM 元素outerHTML, 把它插入 `<foreignObject>` 内, 用img 来展示svg, 最后再借助Canvas API 随意输出图片

```html
<img 
  width="300" 
  height="150" 
  src='data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="120" height="50"><body xmlns="http://www.w3.org/1999/xhtml"><p style="font-size:12px;margin:0;">一段需要word wrap的文字。</p></body></foreignObject></svg>'
>
```

- Safari虽然支持`<foreignObject>`貌似由于安全限制, 显示不全

### HTML 结构 to PNG

```html
<div id="cmBox" class="c-m-box">
    <div class="c-m-list">
        <img src="0.jpg" alt="长天" class="c-m-img">
        <div class="c-m-name">长天</div>
        <div class="c-m-title">对网文潮流具有极敏锐嗅觉...</div>
    </div>
</div>

<style>
.outline {
  outline: 2px solid red;
  outline-offset: -2px;
}
</style>

<script>
// DOM转图片的方法
var domToImg = (function () {
    // 转png需要的canvas对象及其上下文
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // canvas绘制图片元素方法
    var draw = function (img) {
        var width = img.width, height = img.height;
        // canvas绘制
        canvas.width = width;
        canvas.height = height;
        // 画布清除
        context.clearRect(0, 0, width, height);
        // 绘制图片到canvas
        context.drawImage(img, 0, 0);
    };

    // canvas画布绘制的原图片
    var img = new Image();
    // 回调
    var callback = function () {};

    // 图片回调
    img.onload = function () {
        draw(this);
        // 回调方法
        callback();
    };

    var exports = {
        dom: null,
        // DOM变成svg，并作为图片显示
        dom2Svg: function () {
            var dom = this.dom;
            if (!dom) {
                return this;
            }

            // 复制DOM节点
            var cloneDom = dom.cloneNode(true);
            cloneDom.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
            cloneDom.classList.remove('outline');

            // 如果有图片，变成base64
            var imgDom = null;
            if (cloneDom.tagName.toLowerCase() == 'img') {
                imgDom = cloneDom;
            } else {
                // 这里就假设一个图片，多图自己遍历转换下就好了
                imgDom = cloneDom.querySelector('img');
            }

            if (imgDom) {
                draw(imgDom);
                imgDom.src = canvas.toDataURL();
            }

            var htmlSvg = 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="' + dom.offsetWidth + '" height="' + dom.offsetHeight + '"><foreignObject x="0" y="0" width="100%" height="100%">'+
                new XMLSerializer().serializeToString(cloneDom) +
                document.querySelector('style').outerHTML +
             '</foreignObject></svg>';

             htmlSvg = htmlSvg.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');

            // 图片地址显示为DOM转换的svg
            img.src = htmlSvg;

            return this;
        },
        download: function () {
            // 创建隐藏的可下载链接
            var eleLink = document.createElement('a');
            // 下载图片文件名就按照时间戳来
            eleLink.download = 'zxx_png-' + (+new Date() + '').slice(1, 9) + '.png';
            eleLink.style.display = 'none';

            // 触发图片onload是个异步过程，因此，需要在回调中处理
            callback = function () {
                eleLink.href = canvas.toDataURL();
                // 触发点击
                document.body.appendChild(eleLink);
                eleLink.click();
                // 然后移除
                document.body.removeChild(eleLink);
            };

            // dom变图片
            this.dom2Svg();
        }
    };

    return exports;
})();

// 实例页面的交互代码
var eleBox = document.getElementById('cmBox');
// hover outline
eleBox.addEventListener('mouseover', function (event) {
    if (event.target !== this) {
        event.target.classList.add('outline');
    }
});
eleBox.addEventListener('mouseout', function (event) {
    var eleOutline = eleBox.querySelector('.outline');
    if (eleOutline) {
        eleOutline.classList.remove('outline');
    }
});
// 点击并下载图片
eleBox.addEventListener('click', function (event) {
    var eleTarget = event.target;
    if (eleTarget !== this) {
        domToImg.dom = eleTarget;
        domToImg.download();
    }
});
</script>
```

### SVG Sprites 技术

- 在webpack 中使用 svg-sprite-loader 包
- 把所有图标图形整合在一起，配合`<symbol>` 内部做隔离, 实际呈现的时候准确显示特定图标。
- 配合 `<use>` 标签xlink:href属性，寻找要使用的元素的, 渲染图形
- use 特性, 可以重复调用

```xml
<svg>
  <defs>
    <g id="shape">
        <rect x="0" y="0" width="50" height="50" />
        <circle cx="0" cy="0" r="50" />
    </g>
  </defs>

  <use xlink:href="#shape" x="50" y="50" />
  <use xlink:href="#shape" x="200" y="50" />
</svg>
<!-- 两个use, 渲染两个图形 -->
```

- use 特性, 跨SVG 调用
- SVG中的use元素可以调用其他SVG文件的元素，只要在一个文档中。

```xml
<svg width="500" height="110"><use xlink:href="#shape" x="50" y="50" /></svg>
<!-- 调用上面的 id -->
```

- SVG Sprite技术 核心, 因为Sprite 把所有SVG图标都在一个SVG源上, 所以直接use 直接调用完事
- retina良好，尺寸可任意拉伸，且颜色可控

## Canvas

- 可以用来简单的绘图, 图片压缩, 图片加水印,图片裁剪等

### 水印

- 利用 css clip 这个属性显示包裹的区域，其他部分隐藏
- 第一个部分：就是只用作展示的一张图片，这张图片上不做任何的功能处理。
- 第二个部分：也是一张图片，这张图片覆盖在第一章图片的上面，利用clip属性只显示选取的部分，其他的隐藏。
- 第三个部分：是利用canvas的图片接口把选择的图片区域绘制在预览区域
- 图片加上事件穿透

```js  
var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var box = document.getElementById('box');
var img = new Image();
img.src = "images/1.jpg";
img.onload = () => {
  context.drawImage(img,l*bili(img,box).w,t*bili(img,box).h,ll*bili(img,box).w,tt*bili(img,box).h,0,0,canvas.width,canvas.height);
}
```

### 画圆形多级多色彩进度条

```vue
<script lang="jsx">
export default {
mounted() {
    let pathList = [
      {start: 0.1 * Math.PI, end: 0.25 * Math.PI, color: "#cff2e9"},
      {start: -0.05 * Math.PI, end: 0.1 * Math.PI, color: "#ffe4d7"},
      {start: 1.8 * Math.PI, end: -0.05 * Math.PI, color: "#ffd6d8"},
      {start: 0.75 * Math.PI, end: 1.8 * Math.PI, color: "#f1f1f1"}
    ];
    this.draw(pathList);
    this.drawScore();
  },
  render() {
    return <canvas ref="chart" width="172" height="172"></canvas>
  },
  methods: {
    draw(pathList) {
      let chart = this.$refs.chart;
      let context = chart.getContext("2d");
      context.lineWidth = 12;
      context.lineCap = "round";
      for (let {start, end, color} of pathList) {
        context.beginPath();
        context.arc(86, 86, 74, start, end);
        context.strokeStyle = color;
        context.stroke();
      }
    },
    drawScore() {
      let angle = (this.rateData.score / this.rateData.total) * 270 + 135;
      let end = (angle / 180) * Math.PI;
      let color = ["#40c5a5", "#ff9666", "#ff686f", "#babebf"][this.grade];
      let pathList = [{start: 0.75 * Math.PI, end, color}];
      this.draw(pathList);
     }
   }
  }
 </script>
  ```

### 解决 Canvas 渲染出来有锯齿感问题

- 一般都是因为不同屏幕的DPR 的不同，造成的问题

- 在浏览器的window变量中有一个devicePixelRatio的属性，该属性决定了浏览器会用几个（通常是2个）像素点来渲染1个像素，举例来说，假设某个屏幕的devicePixelRatio的值为2，一张100x100像素大小的图片，在此屏幕下，会用2个像素点的宽度去渲染图片的1个像素点，因此该图片在此屏幕上实际会占据200x200像素的空间，相当于图片被放大了一倍，因此图片会变得模糊。
  **其实方案很简单，也很容易明白。我们可以创建一个两倍于实际大小的canvas，然后用css样式把canvas限定在实际的大小。
- 设置canvas的宽度时，他会**清空掉**已画出来的内容

### 简单画圆

```js
  // devicePixelRatio: 浏览器渲染一个像素用的像素点
 // backingStoreRatio: 时间Canvas 用来渲染一个像素用的像素点

   let width = chart.width,
        height = chart.height
      if (window.devicePixelRatio && clear) {
        var devicePixelRatio = window.devicePixelRatio || 1

        var backingStoreRatio =
          ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio ||
          1
        var ratio = devicePixelRatio / 
        var oldWidth = chart.widthbackingStoreRatio
        var oldHeight = chart.height
        chart.width = oldWidth * ratio
        chart.height = oldHeight * ratio
        ctx.scale(ratio, ratio)
      }
```

```js
      let width = chart.width,
        height = chart.height
      if (window.devicePixelRatio && clear) {
        chart.style.width = width + "px"
        chart.style.height = height + "px"
        chart.height = height * window.devicePixelRatio
        chart.width = width * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
```

```js
function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  //获取设备像素比，返回到1。
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  //获取画布的大小（以CSS像素为单位）。


  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  // 给出画布像素尺寸的CSS大小*设备像素比率。
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  // 按dpr缩放所有绘图操作，因此不必担心差异。
  ctx.scale(dpr, dpr);
  return ctx;
}

//现在这一行在页面上的大小相同
//但在高DPR设备上看起来更清晰！
https://www.html5rocks.com/en/tutorials/canvas/hidpi/
```

### 画线条

```js
    draw() {
      let canvas = this.$refs["line" + this.index]
      // 拿到上下文
      const ctx = canvas.getContext("2d")
      // 开始一条新路径/首次画可以不写
      ctx.beginPath()
      // 设置画笔的起始位置点
      ctx.moveTo(0, 0)
      // 设置画笔移动的目的点
      // 可以设置多个来画折线
      ctx.lineTo(400, 0)
      // 设置画笔的大小
      ctx.lineWidth = 30
      //setLineDash([x,y]) 设置所画的直线为虚线，x为线段距离，y表示线段的间隔,如果只有只有一个数 x=y;
      // ctx.setLineDash([x, y])
      //关闭路径
      ctx.closePath()
      //设置画笔描边时的样式
      ctx.strokeStyle = "#0065f5"
      //设置画笔开始描边
      ctx.stroke()
      //设置画笔填充时的样式
      ctx.fillStyle = "#0065f5"
      //设置画笔开始填充
      ctx.fill()
    }
```

### 图片压缩

```html
<input id="file" type="file">

<script>
var eleFile = document.querySelector('#file');

// 压缩图片需要的一些元素和对象
var reader = new FileReader(), img = new Image();

// 选择的文件对象
var file = null;

// 缩放图片需要的canvas
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

// base64地址图片加载完毕后
img.onload = function () {
    // 图片原始尺寸
    var originWidth = this.width;
    var originHeight = this.height;
    // 最大尺寸限制
    var maxWidth = 400, maxHeight = 400;
    // 目标尺寸
    var targetWidth = originWidth, targetHeight = originHeight;
    // 图片尺寸超过400x400的限制
    if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
            // 更宽，按照宽度限定尺寸
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
    }
        
    // canvas对图片进行缩放
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // 清除画布
    context.clearRect(0, 0, targetWidth, targetHeight);
    // 图片压缩
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    // canvas转为blob并上传
    canvas.toBlob(function (blob) {
        // 图片ajax上传
        var xhr = new XMLHttpRequest();
        // 文件上传成功
        xhr.onreadystatechange = function() {
            if (xhr.status == 200) {
                // xhr.responseText就是返回的数据
            }
        };
        // 开始上传
        xhr.open("POST", 'upload.php', true);
        xhr.send(blob);    
    }, file.type || 'image/png');
};

// 文件base64化，以便获知图片原始尺寸
reader.onload = function(e) {
    img.src = e.target.result;
};
eleFile.addEventListener('change', function (event) {
    file = event.target.files[0];
    // 选择的文件是图片
    if (file.type.indexOf("image") == 0) {
        reader.readAsDataURL(file);    
    }
});
</script>
```

## Canvas 解决事件监听问题

- 可视化库一般都会对Canvas 封装成各种类, 调用的时候每个实例可以当做一个虚拟节点用, 利用事件委托, 这样就能解决事件监听问题, 目前主流的两种事件实现方式分别是取色值法和几何法。

## Canvas 异步渲染提高性能

- 利用 requestAnimFrame, 在修改图形时的下一帧进行批量渲染

## Canvas 脏区渲染提高性能

- rect 和 clip 限制绘制区域，从而做到只对部分区域重绘

## SVG 和 Canvas 异同

1. 监听事件: SVG 可以直接获取元素, 自由添加事件监听器, Canvas 事件监听器的坐标系是相对于 Canvas 元素的,  所以还要进行坐标的计算才能细化.
2. 绘制方式：SVG 是通过向文档中添加矢量图形来绘制图像的，而 Canvas 是通过使用 JavaScript 绘制像素来绘制图像的。
3. 渲染效果：SVG 使用矢量图形格式，因此可以缩放和变形而不失真，通过 DOM 渲染的，它可以与其他 HTML 元素结合使用.而 Canvas 通过 JavaScript 直接操作像素来绘制图形，对于大规模的图形和动画，性能更高，不能缩放和变形。
4. 处理复杂图形：SVG 可以很容易地处理复杂的图形和图形变换，而 Canvas 需要自行编写 JavaScript 代码来处理。
5. 交互性：SVG 可以很容易地处理交互性，包括鼠标事件、动画和滚动等，而 Canvas 需要通过自行编写 JavaScript 代码来实现。
6. 性能：Canvas 通常比 SVG 快，特别是在处理大量图形和动画时，因为 Canvas 只需要重绘像素，而 SVG 是基于DOM 需要重新解析和布局文档。
7. 控制方式：SVG 可以使用 CSS 样式表和 JavaScript 进行控制，支持动态效果和交互操作；Canvas 只能使用 JavaScript 进行控制，动态效果和交互操作需要自己实现。
8. 图形品质：SVG 图形可以任意缩放和变换，不会失真；Canvas 图形品质依赖于画布大小和绘制质量。

总的来说，SVG 适用于绘制矢量图形和需要交互性的场景，而 Canvas 适用于绘制大量的位图和需要高性能动画的场景。因此，在选择 SVG 和 Canvas 时，需要根据具体的需求来选择适合的技术。
