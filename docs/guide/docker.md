# Docker

Docker 镜像加载原理是  *UnionFs (联合文件系统)*

## 优化手段

1. .dockerignore 忽略没用的文件
2. ADD COPY RUN 都会增加镜像层数, 所以尽量指令合并
3. 多阶段构建
4. `npm install --production` 不下载devDependency
5. `ADD package.json /code` 先拷贝package.json 再npm i,依赖没有变化的情况可以缓存node_modules, 充分利用[docker layer 的缓存机制](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache).

```dockerfile
RUN --mount=type=cache,target=/app/node_modules,id=my_app_npm_module,sharing=locked \
    --mount=type=cache,target=/root/.npm,id=npm_cache \
    npm i --registry=https://registry.npm.taobao.org

COPY src /app/src

RUN --mount=type=cache,target=/app/node_modules,id=my_app_npm_module,sharing=locked \
    npm run build

RUN  --mount=type=cache,id=yarn_cache,sharing=shared,target=/usr/local/share/.cache \
     NODE_ENV=production yarn build
```

```dockerfile
FROM node:14-alpine as builder
 
WORKDIR /code
 
# 单独分离 package.json，是为了安装依赖可最大限度利用缓存
ADD package.json yarn.lock /code/
RUN yarn
 
ADD . /code
RUN npm run build

# 选择更小体积的基础镜像
FROM nginx:alpine
ADD nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder code/build /usr/share/nginx/html
```
