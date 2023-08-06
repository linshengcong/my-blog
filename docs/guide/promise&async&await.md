# Promise & async await

## 顺序执行最佳实践

- 尽量使用 async await, 异步函数同步写法, 完全解决了回调地狱问题
- 对于异常捕获的两种看法

### 使用try catch(推荐)

- 既然使用了 await 就抛弃链式用法, 配合分支逻辑使用 if else, try catch
- 异常机制的一个要点是集中捕获再处理上报

```js
const fn = async () => {
  try {
    const r1 = await fn1();
    const r2 = await fn2(r1.xxx);
    const r3 = await fn3(r2.xxx);
    const user = { ...r1, ...r2, ...r3 }

    return user
  } catch(e) {
    console.error(e)
    return null
  }
}
```

### 使用 await 配合 .catch() + if () 判断 response, or .catch 里面 throw or Promise 里面 reject(err)

```js
const response1 = await axios("/xxx").catch(handleError) 
if (!response1) return
// or
const response2 = await axios("/xxx").catch(err => throw err) 
```

## 并发执行最佳实践

- 并发不能统一处理异常

```js
const getData1 = this.$axios.$get("/xxx").catch(() => {});
const getData2 = this.$axios.$get("/xxx").catch(() => {});
const [res, res2] = await Promise.all([getData1, getData2]).finally();
if (res) {
  // do something...
}
if (res2) {
  // do something...
}
```

## 利用 Promise 做并发限制

```js
const asyncTask = (t, taskName) => {
  return new Promise(resolve => {
    console.log(`开始执行 ${taskName} ~~~`);
    setTimeout(() => {
      console.log(`${taskName} 结束啦 !!!`);
      resolve()
    }, t);
  })
}

const taskList = [
  () => asyncTask(100, 'task1'),
  () => asyncTask(300, 'task2'),
  () => asyncTask(500, 'task3'),
  () => asyncTask(200, 'task4'),
  () => asyncTask(700, 'task5'),
  () => asyncTask(400, 'task6'),
]

/**
 * 异步任务并发限制
 * @param {*} tasks 任务总数
 * @param {*} limit 最大并发限制数量
 */
const limmitTaskPool = async (tasks, limit) => {

  const taskPool = new Set()
  for (const task of tasks) {
    // 执行
    const promise = task()
    // 添加到任务池中
    taskPool.add(promise)
    // 异步任务,会在同步任务执行完再执行, 删除已执行完的任务
    promise.then(() => taskPool.delete(promise))
    // 任务池的数量大于等于并发限制
    if (taskPool.size >= limit) {
      // 超出限制,需要先执行一个最快的异步任务(等待异步任务执行完删除自身空出任务池),再执行下一个任务
      await Promise.race(taskPool)
    }
  }
  // 这一步是为了让剩下所有任务执行完再返回, 不需要获取所有任务执行完的状态可以省略
  return Promise.all(taskPool)
}

limmitTaskPool(taskList, 2).then(() => console.log('所有任务全部执行完毕!'))
```

## promiseA+

- promise.all 可以让多个异步的接口并发执行，在接口数量很多的时候大大加快请求的速度
- 缺点：一个接口特别慢，其他接口也要等着他
- 每个 promise 实例单独赋值，加上  .catch(e => e)  ， 不然一个接口错误其他也错误

```js
then 里面有几个概念，
promise2 .then调用会返回一个新的promise，所以每次调用都用一个新的promise2接收他。
x 是这次调用的返回值
在then 里面判断state状态，执行 resolvePromise（promise2，x，resolve，reject）
链式调用就是每次都把结果（函数或value）当成参数去调用，
resolvePromise 里判断判断是值还是函数，是函数就在调用，是值就resolve（x）


    class Promise {
      constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        let resolve = value => {
          if (this.state === 'pending') {
            this.state = 'fulfilled';
            this.value = value;
            this.onResolvedCallbacks.forEach(fn => fn());
          }
        };
        let reject = reason => {
          if (this.state === 'pending') {
            this.state = 'rejected';
            this.reason = reason;
            this.onRejectedCallbacks.forEach(fn => fn());
          }
        };
        try {
          executor(resolve, reject);
        } catch (err) {
          reject(err);
        }
      }
      then(onFulfilled, onRejected) {
        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
        let promise2 = new Promise((resolve, reject) => {
          if (this.state === 'fulfilled') {
            // 异步
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'rejected') {
            // 异步
            setTimeout(() => {
              // 如果报错
              try {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'pending') {
            this.onResolvedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onFulfilled(this.value);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0);
            });
            this.onRejectedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onRejected(this.reason);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0)
            });
          };
        });
        // 返回promise，完成链式
        return promise2;
      }
    }
    function resolvePromise(promise2, x, resolve, reject) {
      // 循环引用报错
      if (x === promise2) {
        // reject报错
        return reject(new TypeError('Chaining cycle detected for promise'));
      }
      // 防止多次调用
      let called;
      // x不是null 且x是对象或者函数
      if (x != null && (typeof x === 'object' || typeof x === 'function')) {
        try {
          // A+规定，声明then = x的then方法
          let then = x.then;
          // 如果then是函数，就默认是promise了
          if (typeof then === 'function') {
            // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
            then.call(x, y => {
              // 成功和失败只能调用一个
              if (called) return;
              called = true;
              // resolve的结果依旧是promise 那就继续解析
              resolvePromise(promise2, y, resolve, reject);
            }, err => {
              // 成功和失败只能调用一个
              if (called) return;
              called = true;
              reject(err);// 失败了就失败了
            })
          } else {
            resolve(x); // 直接成功即可
          }
        } catch (e) {
          // 也属于失败
          if (called) return;
          called = true;
          // 取then出错了那就不要在继续执行了
          reject(e);
        }
      } else {
        resolve(x);
      }
    }


    var p = new Promise(function (resolve, reject) {
      setTimeout(function () {
        debugger;
        resolve(3)
      }, 1000)
    });
    p
      .then((r) => {
        console.log(r, 'haola haola')
        return 1;
      })
      .then((res) => {
        //3
        console.log(res)
      })
```

## promise.all

```js
Promise._All = function (promises) {
  let arr = [],
    count = 0
  return new Promise((resolve, reject) => {
    promises.forEach((item, i) => {
      Promise.resolve(item).then(res => {
        arr[i] = res
        count += 1
        if (count === promises.length) resolve(arr)
      }, reject)
    })
  })
}
```
