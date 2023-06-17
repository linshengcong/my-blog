# Linux

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

## ssh

- ssh 链接远程服务器
  - `ssh <name>@<公网IP>` `ssh root@43.138.216.38`

- 免密登陆

`ssh-copy-id -i ~/.ssh/id_rsa.pub root@43.138.216.38`

### 快速登录：ssh-config

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

## rsync 基本实践

- rsync 可以断点续传,增量远程同步文件(remote + sync)
- rsync 可以替代 cp, scp, mv, ls, rm 这些指令, rsync不支持远程到远程的拷贝，但scp支持.
- rsync 可以拷贝元属性，如 ctime/mtime/mode, 对静态资源缓存有用处
- rsync 有一套自己的算法实现增量更新
- 配合任务计划，rsync能实现定时或间隔同步，配合inotify或sersync，可以实现触发式的实时同步。

接下来我们把本地的一个vue 项目传到远程服务器

```bash
# -l：--links，拷贝符号链接
# -a：--archive，归档模式
# -h：--human-readable，可读化格式进行输出
# -z：--compress，压缩传输
# -v：--verbose，详细输出
# 拷贝目录之下文件路径后面加/
# source 拷贝的文件地址 user@ip:远程服务器 target 粘贴的地址

$ rsync -lahz source user@ip:target

# 多个文件拷贝
$ rsync -r source1 source2 target

# --exclude需要排除拷贝的文件, 可以有多个, 可以自定义一个文件读取规则
$ rsync -av --exclude='*.log' source/ destination
$ rsync -av --exclude 'dist' --exclude 'node_modules' source/ destination
```

![image.png](https://cdn.nlark.com/yuque/0/2022/png/21675264/1659182272249-1e2a8522-ac16-4dda-bf0a-6b867cf2c47a.png#clientId=ucea40920-adfb-4&from=paste&height=221&id=u0b7b47c4&originHeight=442&originWidth=2254&originalType=binary&ratio=1&rotation=0&showTitle=false&size=161762&status=done&style=none&taskId=u3eabecba-b375-43bd-83d3-009652f1e39&title=&width=1127)

- rsync 可以拷贝元信息, cp 则元信息拷贝后出现更改, 如下

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

### ![image.png](https://cdn.nlark.com/yuque/0/2022/png/21675264/1659184782127-e90375b4-1e50-4b57-85ba-e6bf0c2d51fd.png#clientId=ucea40920-adfb-4&from=paste&height=183&id=ubbbb5c3c&originHeight=366&originWidth=1404&originalType=binary&ratio=1&rotation=0&showTitle=false&size=155535&status=done&style=none&taskId=uc50f4fb4-b8a1-4ce1-99f8-714e8da2279&title=&width=702)

## 硬链接和软连接

### 总结

硬链接新建的文件相当于拷贝了一份相同Inode的文件, 修改的时候会修改Inode 对应的block
软链接相当于快捷方式, 点击软链接相当于打开原文件, 软链接的size 等于硬链接文件路径名
软链接可以跨磁盘访问, 硬链接不可以

### ln (建立硬链接)

- ln `<file> <file copy>` 建立一个硬链接

![image.png](https://cdn.nlark.com/yuque/0/2022/png/21675264/1659531465541-cb3a4036-cfe0-4f8e-9828-802b67178db7.png#clientId=uc1fd8421-2a89-4&from=paste&height=110&id=ud476d117&originHeight=110&originWidth=610&originalType=binary&ratio=1&rotation=0&showTitle=false&size=14879&status=done&style=none&taskId=ufc8ca9cd-6777-4313-93e7-42de129ec0b&title=&width=610)

- 然后用 stat 命令查看文件元信息

![image.png](https://cdn.nlark.com/yuque/0/2022/png/21675264/1659531526170-6b6c7466-8b3b-45a2-965a-cb5461935192.png#clientId=uc1fd8421-2a89-4&from=paste&height=744&id=ue709dfec&originHeight=744&originWidth=1242&originalType=binary&ratio=1&rotation=0&showTitle=false&size=188995&status=done&style=none&taskId=uf39c4d48-a6d4-4525-b376-734d2c9fedc&title=&width=1242)

- 源文件和硬连接共享所有信息, 改动后的信息通过链接一起同步(不同于copy file)

[理解inode](https://www.ruanyifeng.com/blog/2011/12/inode.html)

### ln -s (建立软链接)

- ln -s `<file> <file copy>` 建立一个软链接
- 然后用 stat 命令查看文件元信息

![image.png](https://cdn.nlark.com/yuque/0/2022/png/21675264/1659533599077-1d6cbdca-c804-4342-88e9-489b01ee8359.png#clientId=uc1fd8421-2a89-4&from=paste&height=368&id=u34282878&originHeight=368&originWidth=1160&originalType=binary&ratio=1&rotation=0&showTitle=false&size=84306&status=done&style=none&taskId=ude369d77-758f-477e-ab55-ab4f6686448&title=&width=1160)

1. 文件名指向源文件名称
2. 大小(Size) 其实是源文件名称的字节数量
3. 有符号链接(symbolic link)标识代表是软链接
4. Inode 与源文件不同
5. 不增加硬链接

### 元信息解读

#### block

- 硬盘的最小存储单位叫做"扇区"（Sector）。每个扇区储存512字节（相当于0.5KB）。

操作系统读取硬盘的时候，一次性连续读取多个扇区，即一次性读取一个"块"（block）。这种由多个扇区组成的"块"，是文件存取的最小单位。"块"的大小，最常见的是4KB，即连续八个 sector组成一个 block。

#### IO block

- 发现对于任意文件，IO Block 恒为 4096，可以推断出这是个固定值，含义为：文件系统的最小寻址单元。

##### inode(index node) 索引

inode是一个文件系统对象，用于储存文件元信息, 包含有关拥有文件的用户和组、文件的权限、大小、类型、最后一个文件访问的时间戳 ( atime, access time)、其修改 ( mtime, modification time)、inode 本身的修改时间 ( ctime, changing time) 以及指向此文件的硬链接的计数器文件。每个文件都有对应的inode, 和 block (用来存储文件数据)

文件系统中每个“文件系统对象”对应一个“inode”数据，并用一个整数值来辨识。这个整数常被称为inode号码（“i-number”或“inode number”）。由于文件系统的inode表的存储位置、总条目数量都是固定的，因此可以用inode号码去索引查找inode表。

Unix/Linux系统内部不使用文件名，而使用inode号码来识别文件。对于系统来说，文件名只是inode号码便于识别的别称或者绰号。表面上，用户通过文件名，打开文件。实际上，系统内部这个过程分成三步：首先，系统找到这个文件名对应的inode号码；其次，通过inode号码，获取inode信息；最后，根据inode信息，找到文件数据所在的block，读出数据。使用ls -i命令，可以看到文件名对应的inode号码

#### 文件目录

Unix/Linux系统中，目录（directory）也是一种文件。打开目录，实际上就是打开目录文件。目录文件的结构非常简单，就是一系列目录项（dirent）的列表。每个目录项，由两部分组成：所包含文件的文件名，以及该文件名对应的inode号码。

继而就可以目录的权限。目录文件的读权限（r）和写权限（w），都是针对目录文件本身。由于目录文件内只有文件名和inode号码，所以如果只有读权限，只能获取文件名，无法获取其他信息，因为其他信息都储存在inode节点中，而读取inode节点内的信息需要目录文件的执行权限（x）

### 硬链接补充

一般情况下，文件名和inode号码是"一一对应"关系，每个inode号码对应一个文件名。但是，Unix/Linux系统允许，多个文件名指向同一个inode号码。这意味着，可以用不同的文件名访问同样的内容；对文件内容进行修改，会影响到所有文件名；但是，删除一个文件名，不影响另一个文件名的访问。这种情况就被称为"硬链接"（hard link）。

运行上面这条命令以后，源文件与目标文件的inode号码相同，都指向同一个inode。inode信息中有一项叫做"链接数"，记录指向该inode的文件名总数，这时就会增加1。

反过来，删除一个文件名，就会使得inode节点中的"链接数"减1。当这个值减到0，表明没有文件名指向这个inode，系统就会回收这个inode号码，以及其所对应block区域。

这里顺便说一下目录文件的"链接数"。创建目录时，默认会生成两个目录项："."和".."。前者的inode号码就是当前目录的inode号码，等同于当前目录的"硬链接"；后者的inode号码就是当前目录的父目录的inode号码，等同于父目录的"硬链接"。所以，任何一个目录的"硬链接"总数，总是等于2加上它的子目录总数（含隐藏目录）。

### 软链接补充

文件A和文件B的inode号码虽然不一样，但是文件A的内容是文件B的路径。读取文件A时，系统会自动将访问者导向文件B。因此，无论打开哪一个文件，最终读取的都是文件B。这时，文件A就称为文件B的"软链接"（soft link）或者"符号链接（symbolic link）。

这意味着，文件A依赖于文件B而存在，如果删除了文件B，打开文件A就会报错："No such file or directory"。这是软链接与硬链接最大的不同：**文件A指向文件B的文件名，而不是文件B的inode号码**，文件B的inode"链接数"不会因此发生变化。
