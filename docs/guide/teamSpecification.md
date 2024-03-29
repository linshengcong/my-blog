# 多人协作规范

## eslint

- npm install --save-dev eslint eslint-plugin-vue eslint-plugin-vue vue-eslint-parser

```js
// .eslintrc.js配置
module.exports = {
  extends: [
      'plugin:vue/recommended', // 官方推荐
      'eslint:recommended' // 最严格的校验
    ]
}
```

- vscode 配置 ESlint 扩展
- .eslintignore, 配置忽略文件
- 不想用的话, vue.config.js 配置 `lintOnSave: false`

## git hooks

- 使用 husky -> pre-commit
- 本地提交前就进行 lint 校验
- 使用 lint-staged, 只会校验你更改的部分

```json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
    "src/**/*.{js,json,css,vue}": [
      "eslint --fix",
      "git add"
    ]
  }
```

## commit 规范

- commit message格式
`<type>(<scope>): <subject>`

### type(必须)

- feat：新功能（feature）

- fix：修复bug，可以是QA发现的BUG，也可以是研发自己发现的BUG。

- docs：文档（documentation）

- style：格式（不影响代码运行的变动）

- refactor：重构（即不是新增功能，也不是修改bug的代码变动）

- perf：优化相关，比如提升性能、体验

- test：增加测试

- chore：构建过程或辅助工具的变动

- revert：回滚到上一个版本

- merge：代码合并

- sync：同步主线或分支的Bug

### scope(可选)

scope用于说明 commit 影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同。

```js
// commitLint.config.js
module.exports = {
  ignores: [commit => commit.includes("init")],
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 108],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "style",
        "docs",
        "test",
        "refactor",
        "build",
        "ci",
        "chore",
        "revert",
        "wip",
        "workflow",
        "types",
        "release"
      ]
    ]
  }
};

```

## 编辑器配置统一

### vscode

- 统一 setting.json 配置
- 统一 .vscode 里的配置文件, 并且推向远程(setting.json, extensions.json)

### webstorm

- webStorm用户，打开设置，配置应用

1. 目录：Settings/Preferences(mac) > Languages & Frameworks > JavaScript > Code Quality Tools > Eslint
2. 选择 Manual ESLint configuration
3. ESLint package: 选择【工程目录】/node_modules/eslint
4. Configuration File: 选择Configuration File > 选择【工程目录】.eslintrc.js

## review code
