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

## IOC & DI

```js
class A {
  name: string
  constructor(name: string) {
      this.name = name
  }
}

class C {
  name: string
  constructor(name: string) {
      this.name = name
  }
}

//中间件用于解耦
class Container {
  modeuls: any
  constructor() {
      this.modeuls = {}
  }
  provide(key: string, modeuls: any) {
      this.modeuls[key] = modeuls
  }
  get(key) {
      return this.modeuls[key]
  }
}

const mo = new Container()
mo.provide('a', new A('nameA'))
mo.provide('c', new C('nameB'))

class B {
  a: any
  c: any
  constructor(container: Container) {
      this.a = container.get('a')
      this.c = container.get('c')
  }
}

new B(mo)
```

## 观察者模式

- 多个对象间存在一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。
- 目标对象和观察者对象逻辑互不干扰, 但是没法对观察者做过滤
- 符合依赖倒置原则

```js
let observer_ids = 0;
let observed_ids = 0;
// 观察者类
class Observer {
   constructor() {
      this.id = observer_ids++;
   }
   //观测到变化后的处理
   update(ob){
      console.log("观察者" + this.id + `-检测到被观察者${ob.id}变化`);
   }
}
//被观察者列
class Observed {
   constructor() {
      this.observers = [];
      this.id=observed_ids++;
   }
   //添加观察者
   addObserver(observer) {
      this.observers.push(observer);
   }
   //删除观察者
   removeObserver(observer) {
      this.observers = this.observers.filter(o => {
         return o.id != observer.id;
      });
   }
   //通知所有的观察者
   notify() {
      this.observers.forEach(observer => {
         observer.update(this);
      });
   }
}

let mObserved=new Observed();
let mObserver1=new Observer();
let mObserver2=new Observer();

mObserved.addObserver(mObserver1);
mObserved.addObserver(mObserver2);

mObserved.notify();
```

- 把上面观察者和被观察者这两个类作为基类供其他类实现

```js

class Teacher extends Observer{
   constructor(name){
      super();
      this.name=name;
   }
    update(st){
      //   super.update(st);
        console.log(st.name+`提交了${this.name}作业`);
    }
}
class Student extends Observed{
    constructor(name){
       super();
       this.name=name;
    }
    submitHomeWork(){
       this.notify(this)
    }
}
let teacher1=new Teacher("数学");
let teacher2=new Teacher("语文");
let stu1=new Student("小玲");
let stu2=new Student("小明");
let stu3=new Student("小李");
stu1.addObserver(teacher1);
stu1.addObserver(teacher2);
stu2.addObserver(teacher1);
stu2.addObserver(teacher2);
stu3.addObserver(teacher1);
stu3.addObserver(teacher2);

stu1.submitHomeWork();
stu2.submitHomeWork();
stu3.submitHomeWork();
```

## 发布订阅者模式

- 发布订阅模式和观察者模式的不同在于，增加了第三方即事件中心；目标对象状态的改变并直接通知观察者，而是通过第三方的事件中心来派发通知。

```js
//发布者
class Pub{
   constructor(dispatcher){
       this.dispatcher=dispatcher;
       this.id=observed_ids++;
   }
   /**
    * @description: 发布方法
    * @param {type} 通知类型
    */
   publish(type){
      this.dispatcher.publish(type,this)
   }
}
//订阅者
class Subscriber{
    constructor(dispatcher){
      this.dispatcher=dispatcher;
      this.id=observer_ids++;
    }
    subscribe(type){
       this.dispatcher.subscribe(type,this);
    }
    doUpdate(type,arg){
        console.log("接受到消息"+arg)
    }
}
//调度中心
class Dispatcher{
   constructor(){
      this.dispatcher={};
   }
   //订阅
   subscribe(pub,subscriber){
      if(!this.dispatcher[pub.id]){
         this.dispatcher[pub.id]=[];
      }  
      this.dispatcher[pub.id].push(subscriber);
   }
   //退订
   unsubscribe(pub, subscriber) {
      let subscribers = this.dispatcher[type];
      if (!subscribers || !subscribers.length) return;
      this.dispatcher[type] = subscribers.filter(item =>{ 
         return item.id !== subscriber.id
      });
  }
  //发布
  publish(type, args) {
      let subscribers = this.dispatcher[type];
      if (!subscribers || !subscribers.length) return;
      subscribers.forEach(subscriber=>{
         subscriber.doUpdate(type,args);
      });        
   }
}
class Reader extends Subscriber{
   constructor(name,dispatcher){
      super(dispatcher);
      this.name=name;
   }
    doUpdate(type,st){
      //   super.update(st);
        console.log(this.name+`阅读了--${type}--公众号的文章`);
    }
}
class WeiX extends Pub{
    constructor(name,dispatcher){
       super(dispatcher);
       this.name=name;
    }
    publishArticle(type){
       this.publish(type)
    }
}

let dispatcher=new Dispatcher();
//公众号
let wei1=new WeiX("前端",dispatcher);
let wei2=new WeiX("数据库",dispatcher);
//读者们
let reader1=new Reader("小玲",dispatcher);
let reader2=new Reader("小明",dispatcher);
let reader3=new Reader("小李",dispatcher);
//读者订阅公众号
reader1.subscribe("前端");
reader2.subscribe("数据库");
reader3.subscribe("数据库");
//公众号发布文章
wei1.publishArticle("前端");
wei1.publishArticle("数据库");
```
