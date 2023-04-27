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
