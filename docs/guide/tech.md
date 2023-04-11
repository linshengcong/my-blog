# 值得学习的代码

##  利用 defineProperty 兼容代码

```js
// Test via a getter in the options object to see 
// if the passive property is accessed
var supportsPassive = false;
try {
  // 利用defineProperty 拦截对象, 判断是否支持设置 passive 属性
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {}

// Use our detect's results. 
// passive applied if supported, capture will be false either way.
elem.addEventListener(
  'touchstart',
  fn,
  supportsPassive ? { passive: true } : false
); 
```

# TypeScript

## 实用公共类型

declare type Recordable<T = any> = Record<string, T>;

声明一个可传入任意类型的对象类型



### enum

- 利用数字枚举进行 mapping，类似数组

```typescript
enum NumberEnum {
    Fisrt,
    Second,
    Third,
    Fourth
}

obj['Fisrt'] // 0
```

-  数字枚举可以反向映射，字符串枚举不行

```typescript
enum NumberEnum {
    Fisrt,
    Second,
    Third,
    Fourth
}

obj[NumberEnum.Fisrt] // first
```



### interface 和 type 的不同

- 接口可以被类实现 (接口不能被接口实现，只有类能实现)

```typescript
interface Person {
  run: () => void;
}
interface Person2 {
  eat: () => void;
}

// implements 实现
class Student implements Person, Person2 {
  run() {}
  eat() {}
}
```

- 接口可以继承类和接口（类不能继承接口）

```typescript
class Person {
  run() { }
}
class Person2 {
  eat() { }
}
interface Person3 extends Person, Person2 {
  sleep: () => void;
}

const person: Person3 = {
  run: () => {},
  eat: () => {},
  sleep: () => {}
}
```



**type**

- type 可以使用联合类型，元组，基本类型别名

```typescript
// type专属 联合类型
interface Dog {
  wang()
}
interface Cat {
  miao()
}
type Pet = Dog | Cat
type PetList = [Dog,Cat]
type Num = number
```



### interface 和 class 的不同

- class 只能继承class
- interface 可以继承class 和 interface
- TS 声明一个类的时候，也会创建一个这个类的类型，所以接口继承一个类和接口继承接口没有本质区别

```ts
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
/** TS 偷偷做的事 */
interface PointInstanceType {
  x: number;
  y: number;
}
/** end */

interface Point2 extends Point {
  c: number;
}
```





### implements 和 extends 的不同

- 继承，一个新的接口或者类，从父类或者接口继承所有的属性和方法，不可以重写属性，但可以重写方法
- 实现，一个新的类，从父类或者接口实现所有的属性和方法，同时可以重写属性和方法



### declare（声明）

- declare就是告诉TS编译器你担保这些变量和模块存在，并声明了相应类型，编译的时候不需要提示错误

```typescript
declare interface Window {
  Vue: Vue;
  tinymce: Tinymce;
  webkitURL: () => void;
}

declare interface Array<T> {
  remove: (cb: (item: T) => boolean) => void;
}
```



#### declare module

- ts 下包需要安装 带ts 声明文件的库（例：npm install --save-dev @types/lodash），默认不支持ts

- 当引入npm 包没有编写 TS 声明文件的时候，就需要自己编写这个包的 declare module 声明类型

```typescript
// vue.d.ts
import { CombinedVueInstance } from 'vue/types/vue';

// 自己绑在Vue 实例上的方法
declare module 'vue/types/vue' {
  interface Vue {
    $permission: (permissions: Array<string>) => boolean;
    $bus: CombinedVueInstance<Vue, object, object, object, Record<never, any>>;
    $userInfo: (userId: number, params?: any) => void;
  }
}
```

```typescript
// 引入没有ts 声明的包
declare module "test" {
  export var value: number;
  export function hello(str: string): String;
}

import test from "test";
```

TS 默认只认 ES 模块。

但如果你用了 Webpack 之类的构建工具，是支持以模块形式导入非 ES 模块的，比如导入了一个 CSS：

`import 'normalize.css';`

这样 TS 不识别，会报错，所以要先把它们声明出来。

```typescript
declare module '*.scss';

```



#### declare global {}

- 在 `d.ts` 文件中声明的，等价于 在 `.ts` 文件中使用 `declare global { }` 声明
- d.ts 里的 声明默认都是 global 的，只有在模块文件中的定义，如果想要全局就使用 `declare global`

```typescript
在 d.ts 文件中声明的，等价于 在 .ts 文件中使用 declare global { } 声明
```





### 泛型

- 泛型通配符通用定义
  - **？** 表示不确定的类型
  - **T (type)** 表示具体的一个类型
  - **U** 表示另一个类型
  - **K V (key value)** 分别代表键值中的Key Value
  - **E (element)** 代表Elemen

```typescript
function createArray(length: number, value: any): Array<any> {
    let result = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}
createArray(3, 'x'); // ['x', 'x', 'x']
// 泛型接口
interface createArrayFun<T> {
  (length: number, value: T): T[]
}
let createArray: createArrayFun<any>
createArray = function <T>(length: number, value: T): Array<T> {
  let result: T[] = [];
  for (let i = 0; i < length; i++) {
    result[i] = value;
  }
  return result;
}
```

- 泛型约束

```typescript
function loggingIdentity<T>(arg: T): T {
    console.log(arg.length);
    return arg;
}

// 添加约束
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}
```



### [class](http://ts.xcatliu.com/advanced/class.html)

#### 修饰符（Modifiers）

用法可以多参考 table.ts

- public 默认值
- private 私有，不能外部访问 
- protected 本身或者子类能访问 
- static 修饰符，静态方法,实例化后无法调用，只能直接通过类来调用

```typescript
class Animal {
  static isAnimal(a) {
    return a instanceof Animal;
  }
}

let a = new Animal();
Animal.isAnimal(a); // true
a.isAnimal(a); // TypeError: a.isAnimal is not a function
```

- readonly 只读属性关键字，只允许出现在属性声明或索引签名或构造函数中。

#### 继承

- 使用 `extends` 关键字实现继承，子类中使用 `super` 关键字来调用父类的构造函数和方法。

```typescript
class Animal {
    public name;
    constructor(name) {
        this.name = name;
    }
    sayHi() {
        return `My name is ${this.name}`;
    }
}
let a = new Animal('Jack');
console.log(a.sayHi()); // My name is Jack



class Cat extends Animal {
  constructor(name) {
    super(name); // 调用父类的 constructor(name)
    console.log(this.name);
  }
  sayHi() {
    return 'Meow, ' + super.sayHi(); // 调用父类的 sayHi()
  }
}
let c = new Cat('Tom'); // Tom
console.log(c.sayHi()); // Meow, My name is Tom
```



#### abstract class

- `abstract` 用于定义抽象类和其中的抽象方法。
- 抽象类是不允许被实例化（new）
- 抽象类中的抽象方法必须被子类实现

```typescript
abstract class Animal {
  public name;
  public constructor(name) {
    this.name = name;
  }
  public abstract sayHi();
}

class Cat extends Animal {
  public sayHi() {
    console.log(`Meow, My name is ${this.name}`);
  }
}

let cat = new Cat('Tom');
```



### 函数

#### 函数表达式

-    **?:**    表示可选参数，可选参数必须在必选参数后面。
-    TS 函数支持重载

```ts
// TS 的重载不是真正意义的重载，只支持这种方式
// 当不同类型参数得到不同返回值，或者 可选参数是依赖另一个入参进行判断的时候
function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string | void {
    if (typeof x === 'number') {
        return Number(x.toString().split('').reverse().join(''));
    } else if (typeof x === 'string') {
        return x.split('').reverse().join('');
    }
}
```

- 如果要我们现在写一个对函数表达式（Function Expression）的定义，可能会写成这样：

```ts
let mySum = function (x: number, y: number): number {
    return x + y;
};
```

- 这是可以通过编译的，不过事实上，上面的代码只对等号右侧的匿名函数进行了类型定义，而等号左边的 `mySum`，是通过赋值操作进行类型推论而推断出来的。如果需要我们手动给 `mySum` 添加类型，则应该是这样：

```ts
let mySum: (x: number, y: number) => number = function (x: number, y: number): number {
    return x + y;
};
```

注意不要混淆了 TypeScript 中的 `=>` 和 ES6 中的 `=>`。

在 TypeScript 的类型定义中，`=>` 用来表示函数的定义，左边是输入类型，需要用括号括起来，右边是输出类型。



### interface

- 接口对数据进行组织结构
- 赋值的时候，变量的形状必须和接口的形状保持一致
- 需要可选属性使用   **?:**    
- 支持 readonly 只读修饰符
- 当接口需要任意扩充的时候

```ts
interface Person {
    name: string;
    age?: number;
    [propName: string]: string | number | undefined;  // 任意属性，一个接口中只能定义一个任意属性。如果接口中有多个类型的属性，则可以在任意属性中使用联合类型
}

let tom: Person = {
    name: 'Tom',
    age: 25,
    gender: 'male'
};
```



### type

类型别称可以继承类型别称和接口

- type extends type

```ts
type Name = {
  name: string
}
type User = Name & { age: number }
```

- type extends interface 

```ts
interface Namge = { name: string }
type User = Name & { age: number }
```



### TS中typeof的用法

1. 检测变量或对象属性的类型,无法查询其他形式的类型(比如:函数调用的类型)

   ```TypeScript
   console.log(typeof 'Hello world');
   
   // 这种查询是错误的:无法查询其他形式的类型(比如:函数调用的类型)
   function add1(num1: number, num2: number) {
     return num1 + num2
   }
   let ret: typeof add1(1, 2)
   ```

2. 出现在类型注解的位置(参数名称的冒号后面)所处的环境就在类型上下文

   ```TypeScript
   let P = { x: 1, y: 2 }
   function formatPoint(point: { x: number, y: number }) { }
   // 等同于
   // function formatPoint(point: typeof P) { }
   formatPoint(P)
   ```



### TS 类型保护 (typeof  instanceof)





### 帮助类型



3.5 版本之后，TypeScript 在 *lib.es5.d.ts* 里添加了一个 `Omit<T, K>` 帮助类型。`Omit<T, K>` 类型让我们可以从另一个对象类型中剔除某些属性，并创建一个新的对象类型：

```
type User = {
id: string;
name: string;
email: string;
};
type UserWithoutEmail = Omit<User, "email">;
// 等价于:
type UserWithoutEmail = {
id: string;
name: string;
};
```

而在 *lib.es5.d.ts* 里面 `Omit<T, K>` 帮助类型长这样：

```
_/**_
_* Construct a_ _type_ _with the properties of T except_ _for_ _those in_ _type_ _K._
_ */_
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

把这个类型定义解释清楚并且明白其中的原理，我们可以试着实现一个自己的版本，来还原它的功能。

#### 定义 Omit<T, K> 帮助类型

我们先从上面的那个 User 类型开始：

```
type User = {
id: string;
name: string;
email: string;
};
```

首先，我们需要找到所有 User 类型中的属性名。我们可以用 [keyof](https://link.segmentfault.com/?enc=XREvOg7pLQ%2FRNV4lanNDkA%3D%3D.Ia25Isu4rc7%2Fn7ACcLw63ZFj870ZdbwG8fJtsCwGw4Uecwx51tWzZu0O6sNb95eaSikbtR%2B3GBsn8SRJGZ1rDhhLs5P472e2fe48PW10r8I%3D) [操作符](https://link.segmentfault.com/?enc=bylP4ZU%2F2pGjBoFKkRxe4g%3D%3D.4vXJWVTbTkRUaJoksgk07EgFuS0UUS9wuX5PSLVuNFLnWUn0IUGjhublUgKcljmPRyJW0gh%2B%2FUU0vLeJ6VbL8HZfzxj3%2F%2Fqhpa6fIVBTLfI%3D)来获取一个包含所有属性名字[字符串](https://link.segmentfault.com/?enc=ygO6ZOgu%2FLnAwUY2ti7gLA%3D%3D.BTYD7FPrhL99TMnahAkqYoM%2Bf620BO3colFgP971j5QXjItE%2B8TH2Qo4WIe9NxRg4Ct4lj9qeAy248kKrMNQm80KpNsPKr1SCdVxNzI9%2FTA%3D)的联合属性：

```
type UserKeys = keyof User;
_// 等价于:_
type UserKeys = "id" | "name" | "email";
```

然后我们需要能够把联合属性中的某个字符串字面量剔除出去的能力。那我们的 `User` 类型举例的话，我们想要从` "id" | "name" | "email"` 中去掉 `"email"` 。我们可以用 `Exclude<T, U>` 帮助类型来做这件事：

```
type UserKeysWithoutEmail = Exclude<UserKeys, "email">;
_// 等价于:_
type UserKeysWithoutEmail = Exclude<
"id" | "name" | "email",
"email"
>;
_// 等价于:_
type UserKeysWithoutEmail = "id" | "name";
```

而 `Exclude<T, U>` 在 *lib.es5.d.ts* 里面是这样定义的：

```
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;
```

它用了一个[条件类型](https://link.segmentfault.com/?enc=n8DmfL06n7BtVZkDDza75g%3D%3D.nTdPkPP12OYGh30Mqrq8lbTrd%2FQ8igyckCA4GDkJmLLBXW5G%2FELUr7C3OWd%2Fk8vA7h9dv%2F%2Fo7LK78LUpw36Btg%3D%3D)和 [never](https://link.segmentfault.com/?enc=SFKR%2FFA%2FTjwJSgX%2Fbj3xaQ%3D%3D.tW5ps%2BfXfkubWhq%2FE%2BDVAMx4i5TfoNUSs3uqkU2u6KglLefzOvwlhMr2vH1n2wuVmp3R3zRqraKqhjigsG7Zuw%3D%3D) [类型](https://link.segmentfault.com/?enc=h47TOVJciU24dYEBE7bA4w%3D%3D.yMB6IL9HF%2F%2FCR%2Fh3JM6hegjzWhRv49UzK4yX9oGbNEMdV4ijXpQs1rTOQLuDTJ746LuY4%2FXNLDJ1wkifNml9ag%3D%3D)。用 `Exclude<T, U>` 实际上我们在从联合类型`"id" | "name" | "email"` 中去掉那些匹配` "email"` 类型的类型。而匹配` "email"` 类型的只有` "email"` ，所以就剩下了· "id" | "name" 。

最后，我们需要创意一个对象类型，包含 User 类型属性子集的对象类型。其实更具体的说，就是要创建一个对象类型，它的属性都是在联合类型 UserKeysWithoutEmail 中的。我们可以用 Pick<T, K> 帮助类型来挑出来所有对应的属性名：

```
type UserWithoutEmail = Pick<User, UserKeysWithoutEmail>;
// 等价于:
type UserWithoutEmail = Pick<User, "id" | "name">;
// 等价于:
type UserWithoutEmail = {
id: string;
name: string;
};
```

而 Pick<T, K> 帮助类型是这样定义的：

```
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
 [P in K]: T[P];
};
```

Pick<T, K> 帮助类型是一个[映射类型](https://link.segmentfault.com/?enc=G14JI2bSN1n2B7I6%2FtbaPw%3D%3D.GkLLV7JuLJH4Pe6RRJaOYB7eXCunqgOyrtWwwK%2FBseCvSLcCWz%2B06TY%2FYmJm0zx2w9iKGJA74xA2A5cdALHQuA%3D%3D)，它用了 keyof 操作符和一个[索引类型](https://link.segmentfault.com/?enc=2%2Bv1l%2BQe7R0hP637qzNSCw%3D%3D.SRJgLoCjIv4Zo43IPVRck5AR4KjEHYqrhj0uHL0ynll%2BAvXB62MoZmE6rbJ4N1XePIjXUiuq1AXO3YS1osp0wl875ZU0NYuauJ54%2B5tDc8r%2BF0UsjITXgxZz2XEb8BHx) [T[P\]](https://link.segmentfault.com/?enc=tTMbciMtbV%2BvrahsRIT8xg%3D%3D.L0j%2B0rNyw3IHFUVjCn3dTFh171EVAtnsm5qTIeFSc0kMDnJAgbTGNld9y89MRtGg8f4rhyeaxJod48D46nvNRTr7lyw63TldKbVKJV1oLa4gZDqaLrnX%2FmTJJGQ8QW3i) 来获取类型对象类型 T 中的属性 P 。

现在，我们来把上面提到的 keyof ，Exclude<T, U> 和 Pick<T, K> 整合成一个类型：

```
type UserWithoutEmail = Pick<User, Exclude<keyof User, "email">>;
```

值得注意的是这样的写法只能应用到我们定义的 User 类型中。我们加入一个范型，就能让它用在其他地方了：

```
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
```

现在，我们可以计算出我们的 UserWithoutEmail 类型了：

```
type UserWithoutEmail = Omit<User, "email">;
```

因为对象的键只能是字符串、数字或 Symbol，那么我们可以给 K 加个约束条件：

```
type Omit<T, K extends string | number | symbol> = Pick<T, Exclude<keyof T, K>>;
```

这样直接约束 extends string | number | symbol 看上去有点啰嗦了。我们可以用 keyof any 来实现，因为它们是等价的：

```
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

于是我们现在完成了！我们已经实现了 *lib.es5.d.ts* 中定义的 Omit<T, K> 类型了：

```
_/**_
_* Construct a_ _type_ _with the properties of T except_ _for_ _those in_ _type_ _K._
_ */_
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

#### 拆解 Omit<User, "email">

下面这段代码就是逐步拆解的 Omit<User, "email"> 类型。试着跟随每个步骤并理解 TypeScript 是如何计算出最终的类型的：

```
type User = {
id: string;
name: string;
email: string;
};
type UserWithoutEmail = Omit<User, "email">;
// 等价于:
type UserWithoutEmail = Pick<
 User,
Exclude<keyof User, "email">
>;
// 等价于:
type UserWithoutEmail = Pick<
 User,
 Exclude<"id" | "name" | "email", "email">
>;
// 等价于:
type UserWithoutEmail = Pick<
 User,
 | ("id" extends "email" ? never : "id")
 | ("name" extends "email" ? never : "name")
 | ("email" extends "email" ? never : "email")
>;
// 等价于:
type UserWithoutEmail = Pick<User, "id" | "name" | never>;
// 等价于:
type UserWithoutEmail = Pick<User, "id" | "name">;
// 等价于:
type UserWithoutEmail = {
[P in "id" | "name"]: User[P];
};
// 等价于:
type UserWithoutEmail = {
 id: User["id"];
 name: User["name"];
};
// 等价于:
type UserWithoutEmail = {
id: string;
name: string;
};
```



### 实用技巧

```ts
  /** 角色列表项 */
  type RoleListResultItem = {
    userId: string;
    name: string;
  };

  /** 角色列表 */
  type RoleListResult = RoleListResultItem[];
```



### TS 源码解析

https://segmentfault.com/a/1190000023800536

1. record

```ts
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

- `Record` 接受两个类型变量，`Record` 生成的类型具有类型 K 中存在的属性，值为类型 T
- K extends keyof any 的意意思是 type KEY = keyof any 即 string | number | symbol
- 因为JS 对象里的key 只能是这三种类型之一



### TS 高级特性

- -? 代表去除选填
- in 代表循环( 不要用于 interface )
- keyof 代表获取类型的键值的集合

```ts
type Required<T> = {
  [p in keyof T]-?: T[p]
}
```

- extends
- `K extend keyof T` 表示 K 是 T 的[子类](https://so.csdn.net/so/search?q=子类&spm=1001.2101.3001.7020)型，这里是一个类型约束声明。

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person: Person = {
  name: "Tobias",
  age: 22
};

const name = getProperty(person, "name");
```

​	

```ts
type ReturnType<T extends (...args: any[]) => any>
	= T extends (...args: any[]) => infer R
  ? R
  : any;

type Record<T, U> = {
  []:
}
```


## git

1.  git clone 报错  fatal: unable to access

```shell
$ git config --global --unset http.proxy
$ git config --global --unset https.proxy
```

2. git colone 报错 remote: The project you were looking for could not be found or you don't have permission to view it.

```shell
# 可能是本地远程名字不一样, 加上自己用户名
$ git clone http://Shengcong.Lin@xx.xx.xx/wap-website.git
```

3. 拉取B仓库代码( A仓库同步 B仓库代码内容)

```shell
git remote // 查看远程仓库的名字 -v 详情
git remote add B仓库别名 / B仓库git地址 // 添加远程仓库
git remote rm 仓库别名 // 删除远程仓库
git fetch B仓库别名 // 下载B仓库代码
git checkout -b B-prod wap-website/prod // 新建B仓库分支
git checkout -b zh-master wap-website/master
切换到A 分支再 merge B分支 over
```

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
