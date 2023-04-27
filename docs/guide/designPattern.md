# 设计模式

## 责任链模式

```js
  const pipe =
    (f1, f2) =>
    (...args) =>
      f1.call(null, f2.apply(null, args));

  const compose = (...fns) => fns.reduce(pipe, fns.shift());

  const request = (params) => {
    console.log('模拟请求开始, 参数是', params, ' 3秒后返回结果');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ text: '请求成功' });
      }, 3000);
    });
  };

  const log = (next) => (params) => {
    console.log('请求开始与:', new Date().toString());
    return next(params);
  };

  const authorization = (next) => async (params) => {
    const { auth, ...otherParams } = params;
    if (auth) {
      const code = await getAuthCode();
      console.log('获取验证码:', code);
      return next({ code, ...otherParams });
    }
    return next(params);
  };

  const getAuthCode = () => {
    return new Promise((resolve) => {
      console.log('模拟获取, 3秒后返回code');
      setTimeout(() => {
        resolve(1234);
      }, 3000);
    });
  };

  const requestDispatch = compose(log, authorization)(request);

  (async () => {
    const res = await requestDispatch({ auth: true });
    console.log('获取请求结果:', res);
  })();
```

## 有限状态机(FSM)

```js
/**
 * 售货机有三种状态：待机、选择糖果和出售糖果，并且有两种操作：插入硬币和转动手柄。
 * 当顾客插入硬币时，如果硬币数不足，则售货机不会发生任何操作；如果硬币数足够，则会进入选择糖果状态。
 * 在选择糖果状态下，顾客可以选择想要的糖果，并转动手柄。如果糖果库存不足，则售货机不会出售糖果并返回硬币；
 * 如果库存充足，则售货机出售糖果并返回剩余硬币。
 */ 
const vendingMachine = {
  standby: {
    insertCoin: (coins) => {
      if (coins >= 10) {
        return { nextState: 'selectCandy', coins: coins - 10 };
      } else {
        return { coins };
      }
    },
  },
  selectCandy: {
    insertCoin: (coins) => {
      return { coins: coins + 5 };
    },
    turnHandle: (candyCount, coins) => {
      if (candyCount <= 0) {
        return { nextState: 'standby', coins };
      } else if (coins < 5) {
        return { coins };
      } else {
        return {
          nextState: 'sold',
          candyCount: candyCount - 1,
          coins: coins - 5,
        };
      }
    },
  },
  sold: {
    insertCoin: (coins) => {
      return { coins };
    },
    turnHandle: () => {
      return {};
    },
  },
};
```

**执行**

```js
/**
 * 售货机有三种状态：standby、selectCandy和sold，分别对应待机状态、选择糖果状态和出售糖果状态。
 * 每个状态都有两个可能的操作：插入硬币和转动手柄。
 * 每个操作都是一个函数，它接受当前状态的硬币数、糖果库存数作为参数，并返回一个对象，
 * 该对象指示状态机的下一个状态、输出以及硬币和糖果库存的更新。
 */
let coins = 0;
let candyCount = 5;
let currentState = 'standby';

console.log(`当前状态：${currentState}，当前硬币数：${coins}，当前糖果数：${candyCount}`);

// 插入10元硬币
const { nextState, coins: updatedCoins } = vendingMachine[currentState].insertCoin(coins + 10);
currentState = nextState;
coins = updatedCoins;

console.log(`当前状态：${currentState}，当前硬币数：${coins}，当前糖果数：${candyCount}`);
```
