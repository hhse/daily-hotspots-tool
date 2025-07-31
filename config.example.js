// 配置文件示例
module.exports = {
  // 服务器配置
  port: process.env.PORT || 3000,
  
  // 数据库配置
  database: {
    path: process.env.DB_PATH || './hotspots.db'
  },
  
  // API配置
  apis: {
    // 微博热搜API配置
    weibo: {
      enabled: true,
      apiKey: process.env.WEIBO_API_KEY,
      apiSecret: process.env.WEIBO_API_SECRET,
      url: 'https://weibo.com/ajax/side/hotSearch'
    },
    
    // 百度热搜API配置
    baidu: {
      enabled: false,
      apiKey: process.env.BAIDU_API_KEY,
      url: 'https://top.baidu.com/api/board'
    },
    
    // 知乎热榜API配置
    zhihu: {
      enabled: false,
      url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total'
    }
  },
  
  // 定时任务配置
  cron: {
    // 每小时获取一次热点数据
    schedule: '0 * * * *',
    enabled: true
  },
  
  // 数据获取配置
  fetch: {
    // 每次获取的数据量
    limit: 50,
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 重试次数
    retries: 3
  }
}; 