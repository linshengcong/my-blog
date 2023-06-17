# npm

## package.json & package-lock.json

"vue": "^2.6.11"

1. 版本号的定义 major.minor.patch
2. 指定前缀
  a. ~ 匹配次要版本依赖包, 比如 ~2.6.11 会匹配所有 2.6.x
  b. ^ 匹配大版本依赖包, ~2.6.11 匹配 2.0.00 ~ 3.0.00(不包含3.0.00)
  c. 什么都不加就是指定版本

### package-lock.json

存在 package-lock.json 会优先加载, 他会对整个依赖树进行版本锁死, 保证开发和生产依赖的同步

## 幽灵依赖

你在package 声明npm的某个包, 他同时依赖了其他的包, 在下载时也会一并下载, 你在项目中虽然没有显示声明这个包, 但是你导入的时候也可以成功

## 依赖重复安装

依赖的包存在不同的版本, 必然会重复安装

## pnpm

pnpm 使用非扁平化目录解决了幽灵依赖的问题, 使用符号链接将项目的直接依赖项添加到模块目录的根目录中, 不再是扁平式依赖的展示
package的一个特定版本将始终只有一组依赖项
node_modules 中的 A 和 B 两个目录会软连接到 .pnpm 这个目录下的真实依赖中，而这些真实依赖则是通过 hard link 存储到全局的 store 目录中。

node_modules
└── A // symlink to .pnpm/A@1.0.0/node_modules/A
└── B // symlink to .pnpm/B@1.0.0/node_modules/B
└── .pnpm
    ├── A@1.0.0
    │   └── node_modules
    │       └── A -> `<store>`/A
    │           ├── index.js
    │           └── package.json
    └── B@1.0.0
        └── node_modules
            └── B -> `<store>`/B
                ├── index.js
                └── package.json
