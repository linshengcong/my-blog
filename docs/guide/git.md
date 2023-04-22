# git

1. git clone 报错  fatal: unable to access

```shell

git config --global --unset http.proxy
git config --global --unset https.proxy
```

2. git colone 报错 remote: The project you were looking for could not be found or you don't have permission to view it.

```shell
# 可能是本地远程名字不一样, 加上自己用户名
git clone http://Shengcong.Lin@xx.xx.xx/wap-website.git
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
