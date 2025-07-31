// API扩展文件 - 展示如何对接更多热点数据源
const axios = require('axios');
const moment = require('moment');

// 百度热搜API
async function fetchBaiduHotspots() {
  try {
    const response = await axios.get('https://top.baidu.com/api/board?platform=wise&tab=realtime', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.data && response.data.data.cards) {
      const hotspots = [];
      response.data.data.cards.forEach(card => {
        if (card.content && card.content.length > 0) {
          card.content.forEach(item => {
            hotspots.push({
              title: item.word,
              content: item.desc || item.word,
              category: '百度热搜',
              source: '百度',
              url: `https://www.baidu.com/s?wd=${encodeURIComponent(item.word)}`,
              publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
            });
          });
        }
      });
      return hotspots;
    }
  } catch (error) {
    console.error('获取百度热搜失败:', error.message);
    return [];
  }
}

// 知乎热榜API
async function fetchZhihuHotspots() {
  try {
    const response = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&desktop=true', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.zhihu.com/hot'
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(item => ({
        title: item.target.title,
        content: item.target.excerpt || item.target.title,
        category: '知乎热榜',
        source: '知乎',
        url: `https://www.zhihu.com/question/${item.target.id}`,
        publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
      }));
    }
  } catch (error) {
    console.error('获取知乎热榜失败:', error.message);
    return [];
  }
}

// 今日头条热点API
async function fetchToutiaoHotspots() {
  try {
    const response = await axios.get('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(item => ({
        title: item.Title,
        content: item.Abstract || item.Title,
        category: '今日头条',
        source: '今日头条',
        url: item.Url,
        publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
      }));
    }
  } catch (error) {
    console.error('获取今日头条热点失败:', error.message);
    return [];
  }
}

// 新浪新闻热点API
async function fetchSinaHotspots() {
  try {
    const response = await axios.get('https://top.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=www_www_all_suda_suda', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(item => ({
        title: item.title,
        content: item.title,
        category: '新浪新闻',
        source: '新浪',
        url: item.url,
        publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
      }));
    }
  } catch (error) {
    console.error('获取新浪新闻热点失败:', error.message);
    return [];
  }
}

// 聚合多个数据源
async function fetchAllHotspots() {
  const allHotspots = [];
  
  // 并行获取多个数据源
  const promises = [
    fetchBaiduHotspots(),
    fetchZhihuHotspots(),
    fetchToutiaoHotspots(),
    fetchSinaHotspots()
  ];
  
  try {
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allHotspots.push(...result.value);
      } else {
        console.error(`数据源 ${index} 获取失败:`, result.reason);
      }
    });
    
    return allHotspots;
  } catch (error) {
    console.error('获取热点数据失败:', error);
    return [];
  }
}

// 数据去重和排序
function processHotspots(hotspots) {
  // 去重（基于标题）
  const uniqueHotspots = [];
  const seenTitles = new Set();
  
  hotspots.forEach(hotspot => {
    const normalizedTitle = hotspot.title.toLowerCase().trim();
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueHotspots.push(hotspot);
    }
  });
  
  // 按时间排序
  return uniqueHotspots.sort((a, b) => 
    new Date(b.publish_time) - new Date(a.publish_time)
  );
}

// 导出函数
module.exports = {
  fetchBaiduHotspots,
  fetchZhihuHotspots,
  fetchToutiaoHotspots,
  fetchSinaHotspots,
  fetchAllHotspots,
  processHotspots
};

// 使用示例：
// 在 server.js 中可以这样使用：
/*
const { fetchAllHotspots, processHotspots } = require('./api-extensions');

async function fetchHotspots() {
  try {
    const hotspots = await fetchAllHotspots();
    const processedHotspots = processHotspots(hotspots);
    
    processedHotspots.forEach(async (hotspot) => {
      await saveHotspot(hotspot);
    });
  } catch (error) {
    console.error('获取热点数据失败:', error);
  }
}
*/ 