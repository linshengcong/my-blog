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

## rebase

### rebase -i 合并commit

1. git rebase -i <startpoint> <endpoint>
2. 编辑 pick 选择的commit  ,  s 代表合并合并需要 commit , :wq 保存, 遇到问题了 git rebase --abort
3. 编辑 commit message, :wq 保存
4. git push -force

### rebase 合并分支

```shell
$ git rebase master
$ git checkout master
$ git merge [branch] -ff-only

ff 意思是 fast-forward, 使用 merge 时，默认会使用 fast-forward 的方式合并代码

如果合并的分支（master）是被合并分支（feature）的上游分支，则合并成功，不会产生 merge log，

如果合并的分支（master）不是被合并分支（feature）的直接上游分支（比如 master 在 checkout 出 feature 分支后，又进行了几次提交），不能使用 fast-forward 的方式合并代码，git 会进行一次三方合并（magic）,如果合并成功，就会产生一个 merge log, 如果有冲突产生，则合并失败，需要解决冲突并 commit 后才能合并.

--ff-only 表示只接受 fast-forward 方式的合并，如果不能直接使用 fast-forward 合并，会合并失败并报错。
```

### pull rebase

```shell
git add . 
git commit -m
git pull --rebase
git push
git rebase --continue // 有冲突解决冲突add 后 执行的指令，不用commit 了
git rebase --abort // 撤回 rebase 之前
```

### rebase 与 merge

<https://zhuanlan.zhihu.com/p/34197548>

1. 下游分支更新上游分支内容的时候使用 `rebase`
2. 上游分支合并下游分支内容的时候使用 `merge`
3. 更新当前分支的内容时一定要使用 `--rebase` 参数

```bash
git pull origin B1 --rebase
```

**First, rewinding head to replay your work on top of it...**

+ `git fetch origin; git reset --hard origin/<branch>`
+ <https://stackoverflow.com/questions/22320058/git-first-rewinding-head-to-replay>
+ 去除标签的正则 `replace(/<[^>]+>/g, "")`
