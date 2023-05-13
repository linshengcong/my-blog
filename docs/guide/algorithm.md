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
