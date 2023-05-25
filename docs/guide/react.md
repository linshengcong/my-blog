# React

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
