# Vue 相关

## Vue3 最佳实践

### 对于不需要响应式的变量及时取消相应式  `unref(isMobile)`

### 关于 reactive 用法

```js
// 使用 reactive 声明对象, 修改时不用.value, 更符合习惯
const formState = reactive<FormState>({
    id: '1',
    isEnabled: 0
  });
formState.isEnabled = 1
// 结构后需要保持相应式需要 toRefs
const { formState } => toRefs(props);
// 清空重置对象的做法
// Object.assign 只能深拷贝第一层, 第二层还会是引用原对象
interface SearchFormType { name?: string; }
const searchForm = reactive<SearchFormType>({name: ''});
const resetForm = reactive<SearchFormType>({...searchForm });
const reset = () => Object.assign(searchForm， resetForm);
// or 推荐这种
const initData = () => {
 return {name: '张三'}
}
const state = reactive(initData())
const reset = () => Object.assign(state, initData())
```

### 使用 defineOptions

```vue
// 安装 unplugin-vue-define-options 
// 使用方法 通过编译宏 defineOptions 添加name 和 inheritAttrs
<script setup lang="ts">
 defineOptions({
    name: 'XXX',
  inheritAttrs: false
  });
</script>
```

### 关于 props 在 setup 中的实践用法

1. 直接用 props.xxx 使用
2. 结构还需要保持响应式需要用 toRefs() 包装一下

```vue
props.data.attr = 'foo'
/** ======== */
const {data} = props
data.value.attr = 'foo'

```

### **withDefaults** 搭配defineProps、defineEmits 给传进来的类型声明类型

- defineProps 只能是要么使用`运行时声明`，要么使用`typescript类型声明`.
- 使用运行时声明则报错为控制台warn警告.
- 若想设置[ 编辑器报错、编辑器语法提示 ]则需要使用ts类型声明的方式, 因为ts 可以静态检查类型
- 类型申明方式1, 单独使用defineProps API, 缺点是只能设置类型, 不能设置默认值

- 最佳实践 配合withDefaults辅助函数

```vue
<script lang='ts' setup>
  interface Props {
    modalVisible: boolean;
    formState: FormState;
    isEdit: boolean;
  }
 const emit = defineEmits<{
   (e: 'change', id: number): void
   (e: 'update', value: string): void
 }>()
  const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
    isEdit: false,
  });
</script>
```

### 想通过组件的ref 操作时, ref 的类型声明

- 使用jsx 组件, 引用的时候使用 instanceType 类型, 无法自动获取组件内部类型

```jsx
  <Form
        ref="form"
        :formState="formState"
        :isEdit="isEdit"
        @close="emit('update:modalVisible', false)"
        @refresh="emit('refresh')"
  />
  import Form from './Form.vue';
  const form = ref<InstanceType<typeof Form>>();
  const handleOk = () => {
    form.value?.onSubmit();
  };

// 遇到JSX 的组件会识别不了
```

- 两个办法
  1. 自己声明类型暴露出去(主动行为)
  2. 用一个变量接收 JSX, 使用render 函数 return 出去, 具体如下(被动行为)

```js
import { defineComponent, RenderFunction } from 'vue'
let $render: RenderFunction

export default defineComponent({
  name: 'EditForm',
  emits: ['success'],
  setup(props, { emit }) {
    $render = () => <></>
    return { showModal }
  },
  render() {
    return $render()
  }
})
```

## Vue JSX 及相关问题

### Vue2 使用JSX前置准备安装

- 下载npm 包
- babel-helper-vue-jsx-merge-props
- babel-preset-jsx

### 在Vue 中的jsx, 采用的驼峰和React 不一样(大坑)

```js
// 原生js 
DOM.onmouseenter

// 事件委托
addEventListener('mouseenter', (event) => {});

// React
onMouseEnter

// Vue
onMouseenter
```

### jsx 兼容v 指令语法糖, 使用连接语法

```jsx
<input @click.stop.prevent="click" />
<input vOn:click_stop_prevent={this.click} />

// .sync 指令
<DefaultStyle :editMenuVisible.sync="editMenuVisible"/>
<DefaultStyle on={{ 'update:editMenuVisible': boolean => this.editMenuVisible = boolean }} editMenuVisible={this.editMenuVisible} />

```

### jsx vue 语法糖罗列

```jsx
// 1. v-bind="$attrs"
<a-input :value="value" v-bind="$attrs" @change="inputChange"/>


<a-input value={this.value} vOn:change={this.inputChange}  attrs={this.$attrs} />
// 2. 

```

### jsx 条件判断

```jsx
{使用 if else 需要用一个自执行函数 return 出来}
{
  (() => {
    if (this.contextMenuItem.content.type === 'edge') {
      return (
        <div
          class="item"
          vOn:click_stop={() => this.handleMenuClick('remove', this.contextMenuItem.content)}>
            删除
        </div>
      )
    } 
    return (
      <div>
        <div
          class="item"
          vOn:click_stop={() => this.handleMenuClick('copy', this.contextMenuItem.content)}>
            复制
        </div>
      </div>
    )
  })()
}
```

[JSX 总结](https://blog.csdn.net/qq_41000974/article/details/124565498)

<https://xie.infoq.cn/article/9186fd875106e4b00c46b24e0>

## 关于Mixins

个人还是很喜欢 Mixins 的, 混入的方式能很好的把一个聚合的大页面, 大工具剥离开来.

### Mixins 的优点

1. 把整块完整的带有生命周期的逻辑彻底抽离出来, 实现最大程度的抽象节藕, 对大型聚合模块很好的分解成足够灵活的插件, 也方便review 和定位问题.

### Mixins 的缺点

1. 视图逻辑分散问题, 视图和混入函数没法一起绑定, 实现上往往需要把视图抽成一个组件注册在主页面里, 再把逻辑抽离写到mixin 里, 混入主页面
2. 生命周期钩子会合并, 主页面mounted 混入函数内是async mounted, 导致主页面的mounted 也变成异步, 这种问题很隐蔽, 发现后把异步的函数单独抽离.
3. 有混入函数时, Vue 的生命周期会先执行混入函数的生命周期, 再执行主页面的生命周期, 但是一般当我需要注册一个工具实例的时候, 肯定都是在主页面注册, 混入函数在初始化时候需要一个实例注册很多事件及其他配置, 这种情况解决方案有很多, 我最后选择了在混入函数初始化的时候使用`nextTick`, 等主页面执行完毕挂载节点完成, 再执行混入函数的初始化钩子.
4. 多个混入函数之间先后顺序问题
5. 衍生的变量相互引用问题, 在主页面 or 混入函数里使用到一个变量或者调用一个方法, 找不到声明和引用的地方, 只能全局搜索, 或者一个个混入函数找过去, 这些问题在大型项目偏向多人协作的团队肯定会对开发带来不小的心智负担.

### 总结

综合来说在没有setup 的情况下, 我还是非常偏爱Mixins 的, 纵使他的缺点也非常多, 对于团队协作来说慎用, 需要团队成员的编码水平达到一定基准线, 前期多及时review, 制定规范.  多写备注, 多思考, 再组织, 写可理解可维护性代码, 非必要不要相互依赖

## Vue2 与 Vue3 响应式原理的区别

### Object.defineProperty

1. 只能一个一个的去拦截对象里的属性
2. 只能拦截已有的对象属性, 后面加的就不行, 所以Vue2 中需要使用 $set
3. 不能直接拦截数组的get set, 需要靠length 属性实现, 存在缺陷, Vue2 中使用重写原型链方式
4. 不能拦截属性的删除操作
5. 需要使用一个额外的属性来存储属性值, 避免循环调用栈溢出

```js
onst obj = {};

Object.defineProperty(obj, 'name', {
  get() {
    console.log('get name');
    return this._name;
  },
  set(value) {
    console.log('set name');
    this._name = value;
  },
});

Object.defineProperty(obj, 'age', {
  get() {
    console.log('get age');
    return this._age;
  },
  set(value) {
    console.log('set age');
    this._age = value;
  },
});

obj.name = 'Tom'; // set name
```

```js
// 重写数组原型链
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify()
    return result
  })
})
```

### Proxy

1. 可以拦截整个对象的浅层属性的各种操作
2. 新增删除也能拦截到
3. 可以配合 Reflect 更加标准化反射对象的方法
4. 如果只需要拦截对象的部分属性, 性能没那么好

```js
const handler = {
  get(target, key, receiver) {
    console.log(`get ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`set ${key} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
};

const obj = new Proxy({}, handler);
```

## Vue nextTick (源码及其解析)

```js
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    /**
     * 有的UIWebViews 中，Promise.then并没有完全中断，回调被推送到微任务队列，但队列并没有被刷新，
     * 直到浏览器需要做一些其他工作，例如处理一个定时器。因此，我们通过添加一个空的定时器来 "强迫 "微任务队列被刷新
     */
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if 
  (
    !isIE 
    && typeof MutationObserver !== 'undefined' 
    && (isNative(MutationObserver) || MutationObserver.toString() === '[object  MutationObserverConstructor]')
  )
{
  /**
   * Promise 不能用, 就使用 MutationObserver 降级
   * 创建一个文本节点并监听, 执行函数时修改文本, observer 触发回调函数
   */
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }1768 2435  (9 11 10 12)
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  /**
   * 降级使用 setImmediate, 同属于宏任务, 但是比setTimeout 合适
   * 
   * 执行顺序：setImmediate 的任务总是在 setTimeout 之前执行。这是因为 setImmediate 会在当前事件循环的末尾插入任务，
   * 而 setTimeout 则需要等待指定的时间间隔后才会执行。因此，如果你希望任务尽快执行而无需延迟，setImmediate 是更好的选择。
   * 
   * 性能影响：使用 setTimeout 设置一个延迟时间为 0 的任务并不意味着它会立即执行。它仍然需要等待至少 1 毫秒才会被执行。
   * 而 setImmediate 会在当前事件循环的末尾立即执行任务，因此它的性能更高效。
   * 
   * 递归调用：当你在一个任务中递归调用 setImmediate，它会允许事件循环在每个递归步骤之间插入其他的 I/O 事件。
   * 这有助于避免事件循环阻塞，使得其他异步操作有机会执行。
   * 而使用 setTimeout 进行递归调用可能会导致连续的任务堆积在事件循环中，影响性能和响应性。
   */
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 降级使用 setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

## Vue slot (插槽)

### 组件编译流程

- 从根实例入手进行实例的挂载，如果有手写的render函数，则直接进入$mount挂载流程。
- 只有template模板则需要对模板进行解析，这里分为两个阶段，一个是将模板解析为AST树，另一个是根据不同平台生成执行代码，例如render函数。
- $mount流程也分为两步，第一步是将render函数生成Vnode树，子组件会以vue-componet-为tag标记，另一步是把Vnode渲染成真正的DOM节点。
- 创建真实节点过程中，如果遇到子的占位符组件会进行子组件的实例化过程，这个过程又将回到流程的第一步。

- 父组件会优先于子组件进行实例的挂载，接下来是render函数生成Vnode，在这个阶段会遇到子的占位符节点(即：child),因此会为子组件创建子的Vnode。
- 子组件也会走一遍这个流程
- [详情查看Vue插槽源码](https://juejin.cn/post/6844903927129849864)

### 作用域插槽

- 作用域内的插槽允许我们父组件中的插槽内容访问仅在子组件中找到的数据。
- 使用v-bind让slot内容可以使用绑定属性, 这些有界属性称为slot props。
- 在父级作用域中使用v-slot访问slot属性

```vue
// Exaple
// ChidComponent.vue
<template>
  <div>
    <div>some txt...</div>
    // 默认展示title
    <div  v-for="item in items">
      <slot v-bind:item="item"> {{ item.title }} </slot> 
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [{
        title: 'title',
        description: 'description',
      }]
    }
  },
}
</script>
```

```vue
// ParentComponent.vue 
<template>
  <div>
    <child-component >
      <template #item="{ title, description }"> // v-slot 可简写成 #default
        {{ title }}
        {{ description }}
      </template>
    </child-component>
  </div>
</template>
```
