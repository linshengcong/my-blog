const fs = require('fs')
const pathModule = require('path')

// 获取该文件夹下的所有文件名
const getFileNames = parentFileName => {
  const files = fs.readdirSync(`./docs/${parentFileName}`)
  const res = []
  files.forEach(fileName => {
    // const blacklist = ['project.md', 'interview.md']
    const blacklist = ['project.md']
    if ((process.env.NODE_ENV !== 'development' && blacklist.includes(fileName))) return
    if (pathModule.extname(fileName) === '.md') {
      const path = fileName.slice(0, fileName.length - 3)
      res.push(parentFileName + '/' + path)
    }
  })
  return res
}

/**
 * 技术相关文档
 */
const techDocList = getFileNames('guide')

/**
 * 个人文章
 */
const words = getFileNames('words')

module.exports = {
  title: '我的小站',
  description: '加油、努力',
  base: "/",
  head: [
    ['link', { rel: 'icon', href: "favicon.ico" }]
  ],
  plugins: [
    ["dynamic-title",
      {
        showIcon: "vuepress/smile.ico",
        showText: "(/≧▽≦/)嘿嘿, 你来啦！",
        hideIcon: "vuepress/cry.ico",
        hideText: "(●—●)别走，好吗！！",
        recoverTime: 2000
      }
    ],
    // 更新刷新插件
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: {
        message: "发现新内容可用",
        buttonText: "刷新"
      }
    }
    ],
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-164658031-1' // UA-00000000-0
      }
    ],
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
    ['@vuepress/pwa', {
      serviceWorker: true,
      //指向自定义组件
      //popupComponent: 'MySWUpdatePopup',
      updatePopup: {
        message: "新的风暴已经出现",
        buttonText: "盘他"
      }
    }],
    [
      'vuepress-plugin-comment',
      {
        choosen: 'valine',
        // options选项中的所有参数，会传给Valine的配置
        options: {
          el: '#valine-vuepress-comment',
          appId: "itsgc3Gidjnj4ggetsm1fEcw-gzGzoHsz",
          appKey: "dG49MkmYpwwr3G8OF3zgjH3u",
          avatar: 'wavatar',
          visitor: true,
          recordIP: true,
          path: `<%-window.location.pathname %>`,
          placeholder: "我想和你虚度时光 ...",
        }
      }
    ],
    // // 代码复制弹窗插件
    // ["vuepress-plugin-nuggets-style-copy", {
    //   copyText: "复制代码",
    //   tip: {
    //     content: "复制成功!"
    //   }
    // }],
    // [
    //   'meting',
    //   {
    //     metingApi: "https://api.i-meto.com/meting.api",
    //     meting: {
    //       server: 'netease',
    //       type: 'playlist',
    //       mid: '621465725',
    //     }, /// 不配置该项的话不会出现全局播放器
    //     aplayer: {
    //       // 吸底模式
    //       fixed: true,
    //       mini: true,
    //       // 自动播放
    //       autoplay: true,
    //       // 歌曲栏折叠
    //       listFolded: true,
    //       // 颜色
    //       theme: '#f9bcdd',
    //       // 播放顺序为随机
    //       order: 'random',
    //       // 初始音量
    //       volume: 0.1,
    //       // 关闭歌词显示
    //       lrcType: 0
    //     },
    //     // defaultCover: 'https://nyakku.moe/avatar.jpg',
    //     mobile: {
    //       // 手机端去掉cover图
    //       cover: false,
    //     }
    //   },
    // ]
  ],
  markdown: {
    lineNumbers: false // 代码块不显示行号
  },
  themeConfig: {
    displayAllHeaders: false, // 默认值：false
    lastUpdated: true,//更新时间 lastUpdated: 'Last Updated', // string | boolean
    // 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
    nextLinks: true,
    // 默认值是 true 。设置为 false 来禁用所有页面的 上一篇 链接
    prevLinks: true,
    repo: 'linshengcong/my-blog',
    editLinks: true,
    docsDir: 'docs',
    smoothScroll: true,//页面滚动
    search: true,//内置搜索
    searchMaxSuggestions: 10,//内置搜索最大数量
    nav: [
      {
        text: '主页', link: '/',
      },
      {
        text: '技术相关', link: '/guide/TypeScript',
        items: [
          { text: 'SVG & Canvas', link: '/guide/SVG&Canvas' },
          { text: 'Vue', link: '/guide/vue' },
          { text: '设计模式', link: '/guide/designPattern' }
        ]
      },
      {
        text: '我喜欢的文字',
        items: [
          { text: '短文', link: '/words/myFavoriteWords' },
          { text: '长文', link: '/words/myFavoriteArticle' },
          { text: '音乐', link: '/words/myMusic' },
          { text: '梦境', link: '/words/dream' }
        ]
      },
      {
        text: '项目管理工具',
        items: [
          { text: '甘特图', link: 'https://gantt-chart.linshengcong.tech' },
          { text: '流程图', link: 'https://flow-chart2.linshengcong.tech' },
        ]
      },
      {
        text: '留言板', link: '/link/contact',
      },
      // {
      //   text: '博客',
      //   items: [
      //     { text: 'GitHub', link: '' }
      //   ]
      // },
    ],
    sidebar: [
      {
        title: '技术',   // 必要的
        path: `/${techDocList[0]}`,      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 2,    // 可选的, 默认值是 1
        children: techDocList
      },
      {
        title: '文字',
        path: `/${words[0]}`,
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 2,    // 可选的, 默认值是 1
        children: words,
        initialOpenGroupIndex: -1 // 可选的, 默认值是 0
      }
    ],
    sidebarDepth: 1,
    palette: pathModule.resolve(__dirname, 'palette.styl'),//样式修改
  }
}
