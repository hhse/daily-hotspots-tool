const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('./hotspots.db');

// 创建数据表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS hotspots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    source TEXT,
    url TEXT,
    publish_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#007bff'
  )`);
});

// 热点数据获取函数
async function fetchHotspots() {
  try {
    // 这里可以对接各种热点API，比如微博热搜、百度热搜等
    // 示例：获取微博热搜
    const response = await axios.get('https://weibo.com/ajax/side/hotSearch');
    
    if (response.data && response.data.data) {
      const hotspots = response.data.data.realtime || [];
      
      hotspots.forEach(async (item) => {
        const hotspot = {
          title: item.note,
          content: item.note,
          category: '微博热搜',
          source: '微博',
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.note)}`,
          publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        
        await saveHotspot(hotspot);
      });
    }
  } catch (error) {
    console.error('获取热点数据失败:', error.message);
    
    // 如果API调用失败，使用模拟数据
    const mockHotspots = [
      {
        title: '人工智能技术发展迅速',
        content: 'AI技术在各个领域的应用越来越广泛，从智能助手到自动驾驶，人工智能正在改变我们的生活方式。专家预测，未来五年内，AI将在医疗、教育和金融领域带来革命性变化。',
        category: '科技',
        source: '科技日报',
        url: 'https://example.com/ai-news',
        publish_time: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '新能源汽车市场持续增长',
        content: '电动汽车销量创历史新高，多家车企纷纷加大投资力度。据统计，今年第一季度电动汽车销量同比增长超过50%，市场份额首次突破20%。',
        category: '汽车',
        source: '汽车之家',
        url: 'https://example.com/ev-market',
        publish_time: moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '全球气候变化会议召开',
        content: '第28届联合国气候变化大会在迪拜举行，各国代表就减排目标展开讨论。会议重点关注如何实现2050年碳中和目标，以及发达国家对发展中国家的气候资金支持问题。',
        category: '国际',
        source: '环球时报',
        url: 'https://example.com/climate-conference',
        publish_time: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '最新研究发现咖啡有助于延长寿命',
        content: '发表在《自然》杂志上的一项研究表明，适量饮用咖啡可能有助于延长寿命。研究跟踪了超过50万人的健康数据，发现每天饮用2-3杯咖啡的人群死亡风险降低约15%。',
        category: '健康',
        source: '健康时报',
        url: 'https://example.com/coffee-research',
        publish_time: moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '国内首个量子计算云平台正式上线',
        content: '我国首个量子计算云服务平台今日正式上线，向公众开放量子计算资源。该平台将为科研机构、高校和企业提供量子算法开发和测试环境，推动量子计算技术的普及和应用。',
        category: '科技',
        source: '中国科技网',
        url: 'https://example.com/quantum-cloud',
        publish_time: moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '国家发布数字经济发展新规划',
        content: '国务院发布《数字经济发展规划（2024-2030年）》，提出到2030年数字经济核心产业增加值占GDP比重达到15%的目标。规划重点支持人工智能、大数据、区块链等新兴技术发展。',
        category: '财经',
        source: '经济日报',
        url: 'https://example.com/digital-economy',
        publish_time: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '世界杯预选赛：国足1:0小胜泰国',
        content: '在昨晚进行的2026年世界杯亚洲区预选赛中，中国队凭借武磊的进球，以1:0战胜泰国队，取得小组赛两连胜。下一场比赛，中国队将对阵韩国队。',
        category: '体育',
        source: '体育周报',
        url: 'https://example.com/football-match',
        publish_time: moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '知名导演新片获威尼斯电影节金狮奖',
        content: '著名导演张艺谋的最新作品《光影之间》在第80届威尼斯电影节上获得金狮奖。该片讲述了一个关于坚守艺术理想的感人故事，获得了评委会的一致好评。',
        category: '娱乐',
        source: '电影日报',
        url: 'https://example.com/movie-award',
        publish_time: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '全国多地迎来今年首场降雪',
        content: '据气象部门预报，今日起全国多地将迎来今年首场降雪。北方地区气温将明显下降，部分地区降温幅度可达10℃以上，提醒公众注意防寒保暖。',
        category: '社会',
        source: '天气网',
        url: 'https://example.com/weather-snow',
        publish_time: moment().subtract(4, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '新冠病毒变异株引发关注',
        content: '世界卫生组织发布通报，一种新的新冠病毒变异株正在全球多个国家传播。专家表示，虽然传播速度较快，但目前没有证据表明其致病性增强，现有疫苗仍然有效。',
        category: '健康',
        source: '卫生报',
        url: 'https://example.com/covid-variant',
        publish_time: moment().subtract(6, 'hours').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '教育部发布新版义务教育课程方案',
        content: '教育部今日发布新版义务教育课程方案，加强劳动教育和信息技术教育，减轻学生课业负担。新方案将从下学期开始在全国范围内试行，预计两年内全面推广。',
        category: '教育',
        source: '教育周刊',
        url: 'https://example.com/education-reform',
        publish_time: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '5G技术在工业互联网领域应用加速',
        content: '随着5G网络的普及，其在工业互联网领域的应用正在加速推进。多家制造企业通过部署5G专网，实现了生产流程的智能化和自动化，生产效率平均提升30%以上。',
        category: '科技',
        source: '工业信息网',
        url: 'https://example.com/5g-industry',
        publish_time: moment().subtract(9, 'hours').format('YYYY-MM-DD HH:mm:ss')
      }
    ];
    
    mockHotspots.forEach(async (hotspot) => {
      await saveHotspot(hotspot);
    });
  }
}

// 保存热点数据
function saveHotspot(hotspot) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO hotspots (title, content, category, source, url, publish_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      hotspot.title,
      hotspot.content,
      hotspot.category,
      hotspot.source,
      hotspot.url,
      hotspot.publish_time
    ], function(err) {
      if (err) {
        console.error('保存热点数据失败:', err);
        reject(err);
      } else {
        console.log('保存热点数据成功:', hotspot.title);
        resolve(this.lastID);
      }
    });
    
    stmt.finalize();
  });
}

// API路由
app.get('/api/hotspots', (req, res) => {
  const { category, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM hotspots';
  let params = [];
  
  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category as name, COUNT(*) as count FROM hotspots GROUP BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/hotspots', (req, res) => {
  const { title, content, category, source, url } = req.body;
  
  if (!title) {
    res.status(400).json({ error: '标题不能为空' });
    return;
  }
  
  const hotspot = {
    title,
    content: content || '',
    category: category || '其他',
    source: source || '手动添加',
    url: url || '#',
    publish_time: moment().format('YYYY-MM-DD HH:mm:ss')
  };
  
  saveHotspot(hotspot)
    .then(() => {
      res.json({ message: '添加成功' });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.delete('/api/hotspots/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM hotspots WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '删除成功' });
  });
});

// 定时任务：每小时获取一次热点数据
cron.schedule('0 * * * *', () => {
  console.log('开始获取热点数据...');
  fetchHotspots();
});

// 启动时获取一次数据
fetchHotspots();

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 