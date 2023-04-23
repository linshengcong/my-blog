# Vue 相关

## Vue3 最佳实践

### 使用 .sync 传递变量 (这是Vue2 内容, Vue3 可以用多个v-mode l:name 达到一样的效果)

```js
 // 父组件
     <report :showReport.sync="showReport"></report>
 // 子组件
  <el-dialog
    :visible="showReport"
    @update:visible="$emit("update:showReport", false)"
  >
```

### 对于不需要响应式的变量及时取消相应式  `unref(isMobile)`

### 想通过组件的ref 操作时, ref 的类型声明

```vue
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

### issue

- 使用jsx 组件, 引用的时候使用 instanceType 类型, 无法自动获取组件内部类型
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

### jsx 组件, 引用的时候使用 instanceType 类型, 无法识别, 两个办法, 一个是自己写类型, 另一个是用一个变量接收 render 函数, 然后 return 到全局

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
