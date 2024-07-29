# React

## 容器组件与展示组件分离

拆分出通用的 isLoading、data、error 作为 hooks, 与展示组件结偶
还可以传入fetchUrl 和一系列配置, 抽象一个更通用的hooks

```jsx
import { useEffect, useState } from 'react';
import { ISinglePost } from '../Definitions';

export default function usePosts() {
  const [posts, setPosts] = useState<ISinglePost[] | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const resp = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await resp.json();
        setPosts(data.filter((post: ISinglePost) => post.userId === 1));
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    })();
  }, []);

  return {
    isLoading,
    posts,
    error
  };
}


```

```jsx
/**
 * 展示组件
 */
import { ISinglePost } from '../Definitions';
import usePosts from '../hooks/usePosts';
import SinglePost from './SinglePost';

export default function Posts(props: { posts: ISinglePost[] }) {
  const { isLoading, posts, error } = usePosts();

  return (
    <ul
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : posts ? (
        posts.map((post: ISinglePost) => <SinglePost {...post} />)
      ) : (
        <span>{JSON.stringify(error)}</span>
      )}
    </ul>
  );
}
```

## hooks基本原则

1. 只在最顶层使用 Hook
2. 不在循环，条件或嵌套函数中调用 Hook
3. 只在 React 函数中调用 Hook

## 组件设计原则

确定组件的功能、状态管理、副作用、组件结构、以及事件处理。

首先，确定组件的功能和用途。明确组件应该接受哪些props，以及应该渲染什么样的内容。

确定组件状态：
判断组件是否需要内部状态来管理数据。如果需要状态管理，可以使用useState Hook来定义状态。

设计组件结构：
根据组件的功能，设计组件的结构和UI。将组件拆分成更小的子组件，使代码更加模块化和可维护。

使用React Hooks：
在函数组件中使用React Hooks来管理状态和生命周期。常用的Hooks有useState、useEffect、useContext等。

处理副作用：
如果组件需要在挂载、更新或卸载时执行一些副作用操作，可以使用useEffect Hook来处理。

处理事件：
设计并实现组件需要响应的事件处理函数，并将其绑定到相应的UI元素上。

1. 单一职责原则, 尽可能少
2. 划分边界, 确定入参出参
3. 高内聚/低耦合 把组件的逻辑/样式/结构组合在在一起, 降低不同组件之间的依赖关系, 给复杂的业务解耦

## 最佳实践

- 推荐 eslint-plugin-react-hooks 的 ESLint 插件
- 不需要引起页面渲染的状态用 useRef
- 使用 useContext 避免 prop-drilling
- useState 初始值使用惰性初始化函数提升性能
- 自定义hooks 抽离复用逻辑

### PureComponent & Components + shouldComponentUpdate & React.memo()

1. PureComponent 会自动对子组件state 和props 进行浅比较
2. shouldComponentUpdate(nextProps, nextState) 会根据state、props 的返回值判断是否需要更新, 如果是引用类型的数据使用 immutable.js 库来进行深层对比

```js
import { is } from 'immutable'

shouldComponentUpdate (nextProps = {}, nextState = {}) => {
  return !is(this.props, nextProps) || !is(this.state, nextState)
}
```

3. React.memo

- React.memo 包裹的组件仅检查 props 变更, 默认会对 props 进行浅比较, 且其实现中拥有 useState 或 useContext 的 Hook，当 context 发生变化时，它仍会重新渲染, 需要深层比较请自己定义areEqual

```js
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}

React.memo(MyComponent, areEqual)
```

- React hooks的写法，在hooks中useState修改引用类型数据的时候，每一次修改都是生成一个新的对象，也就避免了引用类型数据传递的时候，子组件不更新的情况。

### useEffect & useLayoutEffect

- useEffect 是在渲染函数执行完成，并绘制到屏幕之后，再异步执行
- useLayoutEffect是在渲染函数执行之后，屏幕重绘前同步执行
- 因为 useLayoutEffect 是同步执行的，因此会发生阻塞，直到该 effect 执行完成才会进行页面重绘，如果 effect 内部有执行很慢的代码，可能会引起性能问题。因此，React 官方指出，尽可能使用标准的 useEffect 以避免阻塞视觉更新。

- 如果状态更新，导致组件渲染闪烁，这个时候，就应该用useLayoutEffect, useLayoutEffect会在页面绘制前阻塞执行, 避免页面重复绘制.

## setState

- setState() 是同步还是异步?
useState 是同步方法， 只是react的流程调度把useState变成了异步方法的样子。react的流程调度里，会把多个事件合成一个事件，一次性处理，所以，变成了异步.

- setState() 同步的方法

1. useEffect() 监听状态
2. setTimeout() 内获取state 状态
3. 如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给setState。该函数将接收先前的 state，并返回一个更新后的值。 `setCountState((preCount) => preCount + 1)`

## immer

- 由于React 数据不可变, immer 简化update 操作, 复杂情况下省去拷贝对象这一步

```jsx
import { useImmer } from 'use-immer';
const [person, updatePerson] = useImmer(initialPerson);
updatePerson(draft => {
  draft.name = e.target.value;
});
```

## useReducer && useImmerReducer

- 当多个事件处理程序以相似的方式修改 state 时，useReducer 可以减少代码量
- useImmerReducer 用immer 的方式修改状态

```jsx
import { useReducer } from 'react';
import { useImmerReducer } from 'react';

/**
 * dispatch 派发的事件
 * tasksReducer 事件处理中心
 */
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
const [tasks, dispatch] = useImmerReducer(tasksReducer, initialTasks);

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

// tasksReducer.js
export default function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
  }
}
```

```jsx
import { useImmerReducer } from 'use-immer';
  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

```

## useContent

- 向后代组件传值

```jsx
import { createContext, useContent } from 'react';
import { LevelContext } from './LevelContext.js';
// createContext 创建一个 content 组件
const LevelContext = createContext(0);

export default function Section({ children }) {
  // 使用这个 content, 配合Provider 声明提供的组件
  const level = useContext(LevelContext);
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  return (
    <LevelContext.Provider value={level + 1}>
      {children}
    </LevelContext.Provider>
  )
}
export default function Heading({ children }) {
  // 接收父级组件注入的属性
  const level = useContext(LevelContext);
  const tasks = useContext(TasksContext);
  return (
    {
      level ? <div>{children}</div> : <div>123</div>
    }
  )

}
```

## useRef

- 处理长列表方案

```jsx
import { useRef } from 'react';

export default function CatFriends() {
  const itemsRef = useRef(null);

  function scrollToId(itemId) {
    const map = getMap();
    const node = map.get(itemId);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  function getMap() {
    if (!itemsRef.current) {
      // 首次运行时初始化 Map。
      itemsRef.current = new Map();
    }
    return itemsRef.current;
  }

  return (
    <>
      <nav>
        <button onClick={() => scrollToId(0)}>
          Tom
        </button>
        <button onClick={() => scrollToId(5)}>
          Maru
        </button>
        <button onClick={() => scrollToId(9)}>
          Jellylorum
        </button>
      </nav>
      <div>
        <ul>
          {catList.map(cat => (
            <li
              key={cat.id}
              ref={(node) => {
                const map = getMap();
                if (node) {
                  map.set(cat.id, node);
                } else {
                  map.delete(cat.id);
                }
              }}
            >
              <img
                src={cat.imageUrl}
                alt={'Cat #' + cat.id}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

const catList = [];
for (let i = 0; i < 10; i++) {
  catList.push({
    id: i,
    imageUrl: 'https://placekitten.com/250/200?image=' + i
  });
}
```

- 访问组件内的节点方案
- 给需要暴露内部组件的包装一层forwardRef, 把ref 传入内部
- useImperativeHandle 限制暴露的功能

```jsx
import {
  forwardRef, 
  useRef, 
  useImperativeHandle
} from 'react';

const MyInput = forwardRef((props, ref) => {
  const realInputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    // 只暴露 focus，没有别的
    focus() {
      realInputRef.current.focus();
    },
  }));
  return <input {...props} ref={realInputRef} />;
});

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>
        聚焦输入框
      </button>
    </>
  );
}
```

## useEffect

- 一般用于获取数据、事件监听或订阅、修改DOM
改变 DOM（changing the DOM）
- 依赖项为[], 相当于 mount 钩子, 只在dom 渲染好后执行一次
- 没有依赖项, 相当于 updated 钩子, 每次页面渲染都会执行一次
- 指定依赖项, 相当于watch , 监听指定依赖触发更新
- return 一个函数, 相当于 destroy 钩子, 常用于清除监听器计时器这些

## useMemo

- 缓存不需要更新的组件, 可以指定依赖项更新, 类似可以指定依赖的计算属性
- `useMemo(calculateValue, dependencies)`

```jsx
import { useMemo } from 'react';

function TodoList({ todos, tab }) {
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab]
  );
}
```

## useCallback

- useCallback 返回一个函数
- `const cachedFn = useCallback(fn, dependencies)`

```jsx
import { useCallback } from 'react';

export default function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
```

## css 样式隔离与样式穿透(Vue scoped & ::v-deep)

- 在Vue 中是利用postcss 对样式做转换
- 可以使用css module, 规则是中间带有 module (style.module.scss)
- 文件使用 :global(.className) 可以把这个类声明一个全局规则, 实现样式穿透

## router-view 是 outlet

## React 状态管理 zustand

```ts
import { create } from 'zustand'
import { User } from '@/types/api'

export const useStore = create<{
 token: string
 userInfo: User.UserItem
 updateToken: (token: string) => void
 updateUserInfo: (userInfo: User.UserItem) => void
}>(set => ({
 token: '',
 userInfo: {
  _id: '',
  userId: 0,
  userName: '',
 },
 collapsed: false,
 updateToken: token => set({ token }),
 updateUserInfo: (userInfo: User.UserItem) => set({ userInfo }),
}))
```

## useImperativeHandle & forwardRef

- 使用useImperativeHandle，减少暴露给父组件的属性，避免使用 ref 这样的命令式代码

### 组件暴露open方法

文档地址：<https://react.dev/reference/react/useImperativeHandle>

```js
useImperativeHandle(ref, createHandle, dependencies?)
```

##### 方法一：**ref + forwardRef + useImperativeHandle**

```jsx
// 父组件 OrderList
import React, { useEffect, useRef, useState } from 'react'

export default () => {
    const userRef = useRef()

    const handleOpen = () => {
        userRef.current?.open()
    }
    return <CreateUser ref={userRef} />
}


// 子组件 CreateUser
const CreateUser = forwardRef((props: IProp, ref: any) => {
    // 组件内部完成显隐
    const [visible, setVisible] = useState(false)
    // 暴露 open 方法给父组件调用
    useImperativeHandle(ref, () => ({
        open: () => {
          setVisible(true)
        }
    }))
    return (
    <Modal
      title="新增用户"
      width={800}
      open={visible}
      okText="确定"
      cancelText="取消"
      onOk={handleOk}
      onCancel={handleCancel}
    >...此处省略...</Modal>
})
```

**forwardRef官方解释：<https://zh-hans.reactjs.org/docs/react-api.html#reactforwardref>**

##### 方法二：自定义属性 + useImperativeHandle

```jsx
// 父组件 OrderList
import React, { useEffect, useRef, useState } from 'react'
 
export default () => {
    const userRef = useRef()

    const handleOpen = () => {
        userRef.current?.open()
    }
    return <CreateOrder userRef={userRef} />
}

// 子组件 CreateOrder
interface IProp {
  userRef: MutableRefObject<{ open: () => void } | undefined>
}
const CreateUser = (props: IProp) => {
    const [visible, setVisible] = useState(false)
    useImperativeHandle(props.userRef, () => ({
        open: () => {
          setVisible(true)
        }
    }))
    return (
        <Modal
          title="新增用户"
          width={800}
          open={visible}
          okText="确定"
          cancelText="取消"
          onOk={handleOk}
          onCancel={handleCancel}
        >...此处省略...</Modal>
    )
}
```

> 这种方式注意，<CreateOrder userRef={userRef} /> 组件上面的属性不可以定义ref，需要自定义其它属性。

## 路由拦截

**Loader功能介绍：**

- 调用权限列表接口

- 递归生成页面路径（后续页面权限判断使用）

- 返回菜单列表、按钮列表和页面路径

**获取Loader返回值**

```js
useRouteLoaderData('layout')
```

加载页面前，先执行Loader，获取权限列表，再根据权限列表动态生成左侧菜单。

```js
// 在layout 路由里注册loader, 保证所有需要鉴权的页面里会走校验流程
{
  id: 'layout',
  element: <Layout />,
  loader: AuthLoader,
  children: []
}
```

```ts
// AuthLoader
export default async function AuthLoader() {
  const data = await api.getPermissionList()
  const menuPathList = getMenuPath(data.menuList)
  return {
    buttonList: data.buttonList,
    menuList: data.menuList,
    menuPathList
  }
}
```

```jsx
// useRouteLoaderData 会优先加载, 优先处理, 没有权限直接重定向
// 权限判断
const data = useRouteLoaderData('layout')
const route = searchRoute(pathname, router)
if (route && route.meta?.auth === false) {
  // 正常向下加载页面
} else {
  // 没有权限且不是白名单内重定向403
  const staticPath = ['/welcome', '/403', '/404']
  if (!data.menuPathList.includes(pathname) && !staticPath.includes(pathname)) {
    return <Navigate to='/403' />
  }
}
```

## 常见问题

### React16 生命周期钩子

construtor() //组件构建
getDerivedStateFromProps() //将props派生为state
shouldComponentUpdate() //组件是否更新
render() //组件渲染
getSnapshotBeforeUpdate() //可返回一个参数供componentDidUpdate使用，可以操作真是dom
componentDidMount() //组件渲染完成
componentDidUpdate() //组件更新完成
componentWillUnmount() //组件将要卸载

### Virtual DOM

- <https://www.zhihu.com/question/31809713/answer/53544875>
- 虚拟DOM 分为 tag、props、children 三个属性
- React 相对于直接操作原生 DOM 最大的优势在于 batching（批处理）和 diff
- batching 就是将多次比较的结果合并后一次性更新到页面，从而有效地减少页面渲染的次数，提高渲染效率。无论是 batching 还是 diff，都是为了尽量减少对 DOM 的调用
- 提供了更好的跨平台能力，因为 Virtual DOM 是以 JavaScript 对象为基础而不依赖具体的平台环境，因此可以适用于其他的平台，如 native、VR、小程序

```html
<ul id="list">
    <li class="item">Item1</li>
    <li class="item">Item2</li>
</ul>
```

```JSON
{
    "tag": "ul",
    "attrs": {
        "id": "list"
    },
    "children": [
        {
            "tag": "li",
            "attrs": { "className": "item" },
            "children": ["Item1"]
        },
        {
            "tag": "li",
            "attrs": { "className": "item" },
            "children": ["Item2"]
        }
    ]
}
```

### fiber 架构

- Fiber 是 React 16 中新的协调引擎。它的主要目的是使 Virtual DOM 可以进行增量式渲染。
React 在 V16 之前会面临的主要性能问题是：当组件树很庞大时，更新状态可能造成页面卡顿，根本原因在于——更新流程是 【同步、不可中断的】

为了解决这个问题，React 提出Fiber 架构怎么做的？

让 React 渲染的过程可以被中断，可以将控制权交回浏览器，让浏览器及时地相应用户的交互——异步可中断
通过将工作任务拆分成一个个雄安的工作单元分别来执行——Fiber
Fiber 即是一种数据结构，又是一个工作单位

Fiber 作为数据结构

React Fiber 机制的实现，就是依赖于下面的这种数据结构-链表实现的。其中每个节点都是一个 Fiber，一个 Fiber 包含了 child（第一个子节点）、sibling（兄弟节点）、parent（父节点）等属性。Fiber 节点中其实还会保存节点的类型、节点的信息（比如 state、props）、节点对应的值等

Fiber 作为工作单位

将它视作一个执行单元，每次执行完一个“执行单元”，React 就会检查现在还剩多少时间，如果没有时间就将控制权让出来

组件交互的流程，用 jsx 写 react 组件，render() 输出虚拟 dom（通过 babel 插件），虚拟 dom 转为 DOM，再在 DOM 上注册事件，事件触发 setState()修改数据，在每次调用 setState 方法时，React 会自动执行 render 方法来更新虚拟 dom，如果组件已经被渲染，那么还会更新到 DOM 中去

异步渲染中的 Fiber 的做法是：分片

把一个很耗时的任务分成很多小片，

Fiber 之前的架构是同步更新，遍历，从根组件开始到子节点，

假如更新一个组件需要 1 毫秒，如果有 200 个组件要更新，那就需要 200 毫秒，在这 200 毫秒的更新过程中，浏览器那个唯一的主线程都在专心运行更新操作，无暇去做任何其他的事情。想象一下，在这 200 毫秒内，用户往一个 input 元素中输入点什么，敲击键盘也不会获得响应，因为渲染输入按键结果也是浏览器主线程的工作，但是浏览器主线程被 React 占着呢，抽不出空，最后的结果就是用户敲了按键看不到反应，等 React 更新过程结束之后，咔咔咔那些按键一下子出现在 input 元素里了。

这就是所谓的界面卡顿，很不好的用户体验。

现有的 React 版本，当组件树很大的时候就会出现这种问题，因为更新过程是同步地一层组件套一层组件，逐渐深入的过程，在更新完所有组件之前不停止，函数的调用栈就像下图这样，调用得很深，而且很长时间不会返回。

因为 JavaScript 单线程的特点，每个同步任务不能耗时太长，不然就会让程序不会对其他输入作出相应，React 的更新过程就是犯了这个禁忌，而 React Fiber 就是要改变现状。

React Fiber 的方式：

破解 JavaScript 中同步操作时间过长的方法其实很简单——分片。

把一个耗时长的任务分成很多小任务，每一个小任务完成了，就把控制权交还给 React 负责任务协调的模块，看看有没有其他其他紧急任务要做，如果没有就继续去更新，如果有紧急任务，那就去做紧急任务

如果一个任务还没完成（时间到了），就会被另一个更高优先级的更新过程打算，这个时候，优先级高的更新任务会优先处理，而低优先级更新任务所作的工作则会完全作废，然后等待机会重头再来

React Fiber 更新过程被分为两个阶段（Phase）：第一个阶段 Reconciliation Phase 和第二阶段 Commit Phase

第一阶段，Fiber 会找到需要更新哪些 DOM，这个阶段可以被打算；但到了第二阶段，就会一鼓作气把 DOM 更新完，绝不会被打断

因为第一阶段的过程会被打断而且“重头再来”，就会造成意想不到的情况。

比如说，一个低优先级的任务 A 正在执行，已经调用了某个组件的 componentWillUpdate 函数，接下来发现自己的时间分片已经用完了，于是冒出水面，看看有没有紧急任务，哎呀，真的有一个紧急任务 B，接下来 React Fiber 就会去执行这个紧急任务 B，任务 A 虽然进行了一半，但是没办法，只能完全放弃，等到任务 B 全搞定之后，任务 A 重头来一遍，注意，是重头来一遍，不是从刚才中段的部分开始，也就是说，componentWillUpdate 函数会被再调用一次。

虚拟 DOM 是由 JSX 转译过来的，JSX 的入口函数是 React.createElement, 可操作空间不大， 第三大的底层 API 也非常稳定，因此我们只能改变第二层。

React16 将内部组件层改成 Fiber 这种数据结构，因此它的架构名也改叫 Fiber 架构。Fiber 节点拥有 return, child, sibling 三个属性，分别对应父节点， 第一个孩子， 它右边的兄弟， 有了它们就足够将一棵树变成一个链表， 实现深度优化遍历。
