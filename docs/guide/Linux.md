# Linux

- ssh 链接远程服务器
  - `ssh <name>@<公网IP>` `ssh root@43.138.216.38`
- curl

curl 是常用的命令行工具，用来请求 Web 服务器。它的名字就是客户端（client）的 URL 工具的意思。

它的功能非常强大，命令行参数多达几十种。如果熟练的话，完全可以取代 Postman 这一类的图形界面工具。

不带有任何参数时，curl 就是发出 GET 请求。

[curl网站开发指南](https://www.ruanyifeng.com/blog/2011/09/curl.html)

- **从远程服务器下载文件到本地**

```bash
scp <用户名>@<ssh服务器地址>:<文件> <本地文件路径>
scp root@127.20.36.88:~/test.txt ~/Desktop
```

root@127.20.36.88是服务器地址，冒号后面是服务器上具体的文件，后面就是本地文件路径。

- **从远程服务器下载文件夹到本地**

```bash
scp -r <用户名>@<ssh服务器地址>:<文件夹名> <本地路径>
scp -r root@127.20.36.88:~/test ~/Desktop
```

将test文件夹直接下载到了本地桌面

- **从本地上传文件到服务器上**

```bash
scp <本地文件名> <用户名>@<ssh服务器地址>:<上传保存路径> 
```

- **从本地上传文件夹到服务器上**

```bash
scp  -r <本地文件夹名> <用户名>@<ssh服务器地址>:<上传保存路径> 
```

- 免密登陆

`ssh-copy-id -i ~/.ssh/id_rsa.pub root@43.138.216.38`

## 常用 shell 指令

- 注意shell 要求空格格式严格

```shell
# var1=var2 赋值
version="v101"

# ehco var 打印
ehco $version

# $(var)命令替换,会先完成内部的命令行,然后将其结果替换出来,再重组成新的命令行
$(node -v)

# ${var} or $var 变量替换, 变量取值
$version

# 定义字符数组
A=(a b c def)  

# 条件表达式
if [ $var1 == $var2 ]; 
then echo $var1
else echo $var2
fi
```

### 根据不同项目, 使用不同nodejs 版本并启动

```sh
target_version="v14.19.0"
echo ${target_version}

current_version=$(node -v)
echo $current_version

if [ ${current_version} == ${target_version} ]; then
  n '14.19.0'
fi
npm run serve
```

- 使用shelljs 实现

```js
const shell = require('shelljs')
if (process.versions['node'] !== '14.19.0') {
  shell.exec('n 14.19.0')
}
shell.exec('npm run serve')
```

### 前端环境打包部署发布通知

```sh
PROFILE=$1
token=$2

# 工作目录
src_root=$(pwd)
app_name=xxx
node_modules_path=/usr/lib/jenkins/jenkins_home/node/xxx

# 项目打包
cd $src_root
cp -rf ./package.json $node_modules_path
cd $node_modules_path
npm i
cd $src_root
ln -s $node_modules_path/node_modules node_modules
npm run build:$PROFILE
rm -rf ./node_modules

# 构建docker镜像
mirror_tag=''
source_nginx_conf=''
target_nginx_conf=./nginx/conf.d/app.conf
if [ ${PROFILE} == 'test' ]; then
    mirror_tag=test
    host='https://testwebpc.xxx.com'
    source_nginx_conf=./nginx/conf.d/test.conf
elif [ ${PROFILE} == 'stage' ]; then
    mirror_tag=test
    host='https://prewebpc.xxx.com'
    source_nginx_conf=./nginx/conf.d/stage.conf
elif [ ${PROFILE} == 'prod' ]; then
    mirror_tag=pro
    host='https://www.xxx.com'
    source_nginx_conf=./nginx/conf.d/prod.conf
fi
mv $source_nginx_conf $target_nginx_conf
docker build -t registry-vpc.cn-shenzhen.aliyuncs.com/stl-${mirror_tag}/$app_name:$PROFILE .
docker push registry-vpc.cn-shenzhen.aliyuncs.com/stl-${mirror_tag}/$app_name:$PROFILE

# 部署服务
curl https://cs.console.aliyun.com/hook/trigger?token=$token

# 钉钉通知
webhook='https://oapi.dingtalk.com/robot/send?access_token=xxx'
title="web前端项目发布了，环境：$PROFILE"
text="web前端项目发布了，环境：$PROFILE \n\n [单击打开]($host) \n\n 更新说明:  \n\n$NOTE  \n\n"
curl $webhook \
    -H "Content-Type: application/json" \
    -d "{\"msgtype\": \"markdown\",
    \"markdown\":{
    \"title\":\"$title\",
    \"text\":\"$text\"
}}"

webhook='https://oapi.dingtalk.com/robot/send?access_token=xxx'
curl $webhook \
    -H "Content-Type: application/json" \
    -d "{\"msgtype\": \"markdown\",
            \"markdown\":{
            \"title\":\"$title\",
            \"text\":\"$text\"
        }}"

```

### docker 启动

```sh
cp -rf ./nginx/conf.d/prod.conf ./nginx/conf.d/app.conf
npm i
npm run build:test
app_name=xxx
version=v1
image_name=$app_name:$version
docker stop $app_name
docker rm $app_name
docker rmi -f $image_name
docker build -t $image_name .
rm -f ./nginx/conf.d/app.conf
echo 'run on http://192.168.5.38:8081 http://localhost:8081'
docker run  -p 8081:80 --name $app_name $image_name  
```

## 快速登录：ssh-config

- (背景) 在本地环境上配置 ssh-config, 给自己服务器起个别名, 可以不用去记IP
- 针对某个用户的配置文件，所在路径为`~/.ssh/config`，默认是不存在的，需要手动创建
- 针对系统所有用户的配置文件，，所在路径为`/etc/ssh/ssh_config`

```bash
# configuration 1
Host linshengcong
 HostName 43.138.216.38
 User root


# configuration 2
Host=chaoren
 Hostname=11.111.111.11
 User person1
```

## autojump

### 1. OS X

推荐使用 Homebrew 安装 autojump

```bash
brew install autojump
```

macOS 启动 Shell 自动读取的文件有

```bash
/etc/profile
~/.bash_profile
~/.bash_login
~/.profile
```

所以只需要在上面其中一个文件加上

```ruby
[[ -s $(brew --prefix)/etc/profile.d/[autojump.sh](http://autojump.sh/) ]] && . $(brew --prefix)/etc/profile.d/[autojump.sh](http://autojump.sh/)
```

但如果终端工具使用的是 zsh，需要在`~/.zshrc`添加

```go
[[ -s `brew --prefix`/etc/autojump.sh ]] && . `brew --prefix`/etc/autojump.sh
```

然后，运行 `source <sourcefile>`

### 2. Linux

首先下载 autojump 源码

```shell
git clone git://github.com/joelthelion/autojump.git
```

然后可安装或卸载

```bash
cd autojump
./install.py or ./uninstall.py
```

由于Linux 下 Shell 启动会自动读取 ~/.bashrc 文件，所以将下面一行添加到该文件中

```ruby
[[ -s ~/.autojump/etc/profile.d/autojump.sh ]] && . ~/.autojump/etc/profile.d/autojump.sh
```

然后，运行`source ~/.bashrc`即可。

安装完成后，使用查看autojump版本。

```ruby
$ autojump --version
autojump release-v21.1.2
```

### 用法

只有打开过的目录 autojump 才会记录，所以使用时间越长，autojump 才会越智能。

可以使用 `autojump` 命令，或者使用短命令 `j`

1. 跳转到指定目录

   ```bash
   j directoryName
   ```

   如果不知道目录全名，输入一部分，按Tab键就好，输错了也没关系，可以自动识别，非常强大。

   ```bash
   # j csm
   /data/www/xxx/cms
   ```

   Tab 键效果

   ```bash
   vagrant@homestead:~$ pwd
   /home/vagrant
   vagrant@homestead:~$ j --stat
   10.0:   /etc/nginx/conf.d
   20.0:   /home/vagrant/www/xxx/doc_api
   34.6:   /home/vagrant/www/xxx
   40.0:   /var/log/nginx
   Total key weight: 104. Number of stored dirs: 4
   vagrant@homestead:~$ j n__ (Tab 键自动添加了下划线)
   /var/log/nginx
   vagrant@homestead:/var/log/nginx$
   ```

2. 跳转到指定目录的子目录（Mac 下效果与`j`相同，Ubuntu下不好用）

   ```undefined
   jc directoryName
   ```

3. 使用系统工具（Mac Finder, Windows Explorer, GNOME, etc.）打开目录，类似Mac OS terminal 下的 `open` 命令，但`open` 命令需要指定路径（Mac中还算实用，Ubuntu下不好用）

   ```undefined
   jo directoryName
   ```

4. 查看权重 `j --stat`

   ```bash
   $ j --stat
   10.0:   /etc/nginx/conf.d
   10.0:   /home/vagrant/www/caijing/doc_api
   10.0:   /var/log/nginx
   30.0:   /home/vagrant/www/caijing
   Total key weight: 59. Number of stored dirs: 4
   ```

   权重越高，说明目录使用的越频繁。

   感觉 Mac 中的显示效果更好，还可以自己去调整权重值。

   ```bash
   $ j --stat
   10.0:   /Users/xxx/xxx/xxxx/xxxx/xxxx/vendor
   22.4:   /Users/xxx/xxx/xxxx/xxxx/xxxx/log
   
   32:     total weight
   2:       number of entries
   10.00:   current directory weight
   
   data:    /Users/xxx/Library/autojump/autojump.txt
   ```

### Mac 每次都要执行source ~/.bash_profile 配置的环境变量才生效

在~/.zshrc文件最后，增加一行即可   `source ~/.bash_profile`

## 遇到权限问题(Permission denied)

例子: (bash: /root/.autojump/bin/autojump: Permission denied)

- `ls -al  ~/`  查看权限
- `chmod 766 ~/.autojump/bin/autojump`   设置成管理员执行权限(如果你是其他用户就设置成777)

## Linux 权限说明

```bash
dr-xr-x---. 10 root root  4096 Jul  4 16:45 .
dr-xr-xr-x. 20 root root  4096 Jul  4 17:26 ..
drwxrw-rw-   6 root root  4096 Jul  4 16:35 .autojump
-rw-------   1 root root 10287 Jul  4 17:01 .bash_history
-rw-r--r--.  1 root root    18 Dec 29  2013 .bash_logout
-rw-r--r--.  1 root root   176 Dec 29  2013 .bash_profile
-rwxrw-rw-   1 root root   278 Jul  4 16:44 .bashrc
drwxr-xr-x   5 root root  4096 Jun 20 18:59 .cache
drwxr-xr-x   3 root root  4096 Mar  7  2019 .config
-rw-r--r--.  1 root root   100 Dec 29  2013 .cshrc
drwxr-xr-x   3 root root  4096 Jul  4 16:45 .local
drwxr-xr-x   2 root root  4096 May 11 16:02 .pip
drwxr-----   3 root root  4096 Jun  5 19:12 .pki
-rw-r--r--   1 root root    73 May 11 16:02 .pydistutils.cfg
drwx------   2 root root  4096 Jun 15 17:33 .ssh
-rw-r--r--.  1 root root   129 Dec 29  2013 .tcshrc
-rw-------   1 root root   761 Jul  4 16:44 .viminfo
drwxr-xr-x   5 root root  4096 Jul  4 15:56 .vscode-server
```

1.第一列是当前文件的类型,包括:
d — directory 文件夹;
l — 链接文件；该类文件后面会有一个箭头，指向原地址。所以该类类似于windows中的快捷方式的文件；
s — 套接字文件类型；以.sock结尾的文件；
b — 这类是系统存储数据用的块设备文件；
c — 这类是串行接口设备文件；比如：键盘、鼠标等链接的文件；

- — 普通文件类型。比如:.log、.gz、_.sh_等文件都会是-普通类型文件；
  最常见的就是 d、- 这两种类型；

2.第二、三、四列
这三列为一组。这一组代表文件 **`所有者`** 拥有的权限；权限分为：
r — 可读权限；针对文件有读取文件内容的权限，针对目录有浏览目录的权限；
w — 可写权限；针对文件有修改、删除、新增文件内容的权限，针对目录有新建、删除、修改、移动目录内文件的权限；
x — 可执行权限；针对文件有执行当前文件的权限，针对目录有进入该目录的权限；
(后面的缩写意义一样)
拥有那个权限就显示相应的字母，否则显示-;

3.第五、六、七列
这三列为一组；这一组代表的是**`文件所有组`**对当前文件夹或者文件拥有的权限。也就是所有者所属的用户组；同样是分为r、w、x；

4.第八、九、十列
这三列为一组；代表的是**`其他用户`**对当前文件夹或者文件拥有的权限；同样是分为r、w、x；
第十一列：表示当前文件中的"链接数"。如果当前文件夹是目录则表示：当前目录中包含其他目录的个数，但是得+2；

5.第十二列：表示当前文件的所有者；
6.第十三列：表示当前文件的所有组；
7.第十四列：表示当前文件的大小；
8.从十五到最后就是当前文件的创建时间或者最近的更新时间，但是格式是美式的(xx月 xx日 时:分)；

上面提到文件的权限分为：r、w、x;而且从第2列到第10列，分为三组，每3列一组。那在管理者在使用chmod命令改变文件所有者权限、文件所有组权限、其他用户权限时，可以直接使用相应的字母，但还可以使用八进制数字表示：

r — 4
w — 2
x — 1

那么就会有：

rwx — 7
rx- — 6
r-x — 5
r-- — 4
-wx — 3
-w- — 2
–x — 1
— --- 0

比如说：776对应：drwxrwxrw-以此类推

## iTerm2

<https://juejin.cn/post/6844904178075058189>
