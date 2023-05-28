# 算法

## LRU-Cache 算法

```js
class LRUCache {
  /**
   * @param {number} capacity - 缓存容量
   */
  constructor(capacity) {
    /**
     * @type {number}
     * 缓存容量
     */
    this.capacity = capacity;
    /**
     * @type {Map}
     * 用来存储缓存项的 Map
     */
    this.cache = new Map();
  }
  
  /**
   * @param {number} key - 缓存键
   * @return {number}
   * 获取缓存值，如果不存在返回 -1
   */
  get(key) {
    // 如果缓存中不存在该键，则返回 -1
    if (!this.cache.has(key)) {
      return -1;
    }
    // 获取该键对应的缓存项
    const { value, expireTime } = this.cache.get(key);
    // 检查该缓存项是否已经过期
    if (expireTime < Date.now()) {
      // 如果已经过期，则删除该缓存项并返回 -1
      this.cache.delete(key);
      return -1;
    }
    // 从缓存中删除该键值对，并重新插入以保证它是最近使用的
    this.cache.delete(key);
    this.cache.set(key, { value, expireTime });
    // 返回缓存值
    return value;
  }
  
  /**
   * @param {number} key - 缓存键
   * @param {number} value - 缓存值
   * @param {number} expireTime - 缓存过期时间（单位为毫秒）
   */
  put(key, value, expireTime) {
    // 如果缓存中已经存在该键，则将其删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 将该键值对插入缓存中
    this.cache.set(key, { value, expireTime });
    // 如果缓存已满，则删除最近最少使用的缓存项
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// 创建一个容量为 3 的 LRU Cache
const cache = new LRUCache(3);
 // 将几个缓存项插入缓存中
cache.put(1, 'foo', Date.now() + 10000); // 缓存 1, 过期时间为 10 秒后
cache.put(2, 'bar', Date.now() + 20000); // 缓存 2, 过期时间为 20 秒后
cache.put(3, 'baz', Date.now() + 30000); // 缓存 3, 过期时间为 30 秒后
 // 获取缓存项的值
const value1 = cache.get(1); // 'foo'
console.log(value1);
const value2 = cache.get(2); // 'bar'
console.log(value2);
 // 增加一个新的缓存项
cache.put(4, 'qux', Date.now() + 40000); // 缓存 4, 过期时间为 40 秒后
 // 获取不存在的缓存项的值
const value3 = cache.get(5); // -1
console.log(value3);
```

## diff 算法

## QuickSort

```js
    let arr = [3, 5, 4, 3, 6, 8, 99, 6, 8, 51, 3, 33, 1]

    function quickSort(arr) {
      let len = arr.length
      let left = [], right = []
      if (len <= 1) return arr

      let index = Math.floor(len / 2)
      let currentItem = arr.splice(index, 1)[0]
      arr.forEach(el => currentItem < el ? left.push(el) : right.push(el));
      
      return [...quickSort(left), currentItem, ...quickSort(right)]
    }
    console.log(quickSort(arr));

      const arr = [6, 3, 5, 6, 1, 3, 9, 7, 8];
      const quickSort = array => {
        if (array.length <= 1) return array;
        let [pivot, ...rest] = array;
        let small = rest.filter(i => i <= pivot);
        let big = rest.filter(i => i > pivot);
        console.log(small, pivot, big);
        return [...quickSort(small), pivot, ...quickSort(big)];
      };
      console.log(quickSort(arr));
```

## 斐波那契数列

```js
// 一般递归解法
  const fib = n => n < 2 ? n : fib(n - 1) + fib(n - 2)

// 动态规划 利用变量把累加的值存储起来
// 这种算法的时间复杂度仅为O(n),从底部向上算
    function fib(n) {
      let current = 0;
      let next = 1;
      while (n-- > 0) { // while(n>0) {n--} n---–的返回值是n
        [current, next] = [next, current + next];
      } return current;
    }
// 使用尾调用

// 尾递归就是函数的最后一步是调用另一个函数
    'use strict'
    function fib(n, current = 0, next = 1) {
      if (n == 0) return 0;
      if (n == 1) return next; // return next
      console.log(`fibonacci(${n}, ${next}, ${current + next})`);
      return fib(n - 1, next, current + next);
    }
```

## 阶乘

```js
  // 2，6，24,  120
 const f = n => n === 1 ? 1 : n * f(n - 1)
 // 动态规划版
    function f(n) {
      if (n === 1) return 1
      let r = 1
      while (n > 0) {
        r *= n--
        console.log(r);
      }
      return r
    }
    console.log(f(5));
 // 尾递归版本
 const f = (n, r = 1) => n <= 1 ? r : f(n - 1, r *= n)
```

## 尾调用 与 js 调用栈

```js
递归就是先递进再回归，呈一种 > 形状

尾递归就是把上一步计算的结果作为参数传递给下一次调用

了解 js 的调用栈我们知道，当脚本要调用一个函数时，解析器把该函数添加到栈中并且执行这个函数，并形成一个栈帧（调用帧），保存调用位置和内部变量等信息。

如果在函数A的内部调用函数B，那么在A的调用帧上方，还会形成一个B的调用帧。等到B运行结束，将结果返回到A，B的调用帧才会销毁。此时如果函数B内部还调用函数C，那就还有一个C的调用帧，以此类推。例如递归操作，一个调用栈中如果保存了大量的栈帧，调用栈非常长，消耗了巨大的内存，会导致爆栈（栈溢出，stack overflow）。后入先出的结构。

如果所有函数的调用都是尾调用，即只保留内层函数的调用帧，做到每次执行时（例如递归操作），一个调用栈中调用帧只有一项，那么调用栈的长度就会小很多，这样需要占用的内存也会大大减少。这就是尾调用优化的含义。
```

## 大数相加 (差值法)

```js
/**
 * 
 * 输入：nums = [2,7,11,15], target = 9
 * 输出：[0,1]
 * 解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1]
 */
var twoSum = function (nums, target) {
  const map = new Map()
  for (i = 0; i < nums.length; i++) {
    const n = nums[i]
    const diff = target - n
    if (map.get(diff) !== undefined) {
      return [map.get(diff), i]
    } else {
      map.set(n, i)
    }
  }
};
```

## 回文数 (头尾双指针)

```js
var isPalindrome = function(x) {
  const nums = String(x).split('')
  const len = nums.length
  const halfLen = Math.floor(nums.length / 2)
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== nums[len - 1 - i]) return false
    if (i === halfLen) return true
  }
};
```

## 有效括号

```js
/**
 * s = '({})]['
 */
var isValid = function (s) {
  const map = {
    '}': '{',
    ']': '[',
    ')': '('
  }
  const stack = []
  const arr = s.split('')
  for (let i = 0; i < arr.length; i++) {
    if (arr.length % 2 !== 0) return false
    const s = arr[i]
    const lastStr = stack[stack.length - 1]
    if (!lastStr) {
      stack.push(s)
      continue
    }
    if (lastStr === map[s]) stack.pop()
    else stack.push(s)
  }
  return !stack.length
};
```

## 反转链表

```js
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
/*function ListNode(x){
    this.val = x;
    this.next = null;
}*/
//时间复杂度O(n),空间复杂度O(1)
function ReverseList(pHead) {
  //保存当前结点
  let cur = pHead;
  if (cur === null || cur.next === null) return cur;
  let prev = null; //前一个结点
  let next = null; //下一个结点
  while (cur) {
    next = cur.next; //保存下一个结点
    cur.next = prev; //当前结点的下一个结点指向前面的节点
    prev = cur; //把所有节点往后挪
    cur = next;
  }
  return prev;
}
/**------------------------------**/
//时间复杂度O(n),空间复杂度O(n)
function ReverseList(pHead) {
  //把链表存到数组中
  let node = pHead;
  let ary = [];
  while (node) {
    ary.push(node.val);
    node = node.next; //指向下一个结点
  }
  node = pHead;
  while (node) {
    node.val = ary.pop();
    node = node.next;
  }
  return pHead;
}
```

## 无重复字符的最长子串(滑动窗口)

```js
/**
 * 滑动窗口 快慢指针
 * 时间复杂度 O(n)
 * 每次右指针走一步, 用一个 map 存储每个字符的index,
 * 当字符重复时, 更新map 里字符的 index, 确定最长的非重复字符, 左边 * 指针走一步
 */
const lengthOfLongestSubstring = function (s) {
  const map = new Map()
  let left = 0
  let right = 0
  let len = 0

  while (right < s.length) {
    const char = s.charAt(right)
    const charIndex = map.get(char)
    if (charIndex === undefined) {
      // 右指针指向的字符不存在时，以字符为键，保存其下标，并继续迭代
      map.set(char, right)
    } else {
      // 存在重复值, 更新重复字符的下标, 确定一个最长距离
      map.set(char, right)
      /**
       * 因为每次左指针变动都已经确定了当前左指针至右指针的最长区间
       * 重复字符的索引值如果小于左指针的情况, 必定不可能产生更大的最长区间
       * 故跳过这种情况, 没有意义
       */
      if (charIndex >= left) {
        len = Math.max(len, right - left)
        /**
         * 左指针, 指向重复字符位置的下一个字符, 确定一个当前可能的最长区间
         * 去等待下一个新的最长非重复字符
         */
        left = charIndex + 1
      }
    }
    // 当左指针到终点的距离小于现存最大长度, 就没有后续比较的必要了
    if ((s.length - left) < len) break
    // 每次右指针向后走一格
    right++
  }
  // 最后对比最大长度 和 最后左右指针的差额, 因为有这一步, 所以 charIndex < left 的可能性不用考虑, 因为最后会比较
  return Math.max(len, right - left)
}
```
