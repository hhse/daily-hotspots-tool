# 每日热点事件整理工具

![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-14.x+-green.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-orange.svg)

一个现代化的热点事件整理和管理工具，支持自动获取热点数据、分类管理、搜索筛选等功能。

## 📸 界面预览

![界面预览](https://via.placeholder.com/800x450.png?text=每日热点事件整理工具)

## ✨ 功能特性

- 🔥 **自动获取热点数据** - 支持对接多个热点API接口
- 📊 **数据分类管理** - 按类别自动分类热点事件
- 🔍 **智能搜索** - 支持标题和内容搜索，实时高亮显示
- 📱 **响应式设计** - 支持桌面端和移动端访问
- ⚡ **实时更新** - 定时自动获取最新热点数据
- 🎨 **现代化UI** - 美观的用户界面和流畅的交互体验
- 💾 **数据持久化** - 使用SQLite数据库存储数据

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **UI框架**: Bootstrap 5
- **图标**: Font Awesome
- **定时任务**: node-cron

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/daily-hotspots-tool.git
cd daily-hotspots-tool
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制配置文件示例：

```bash
cp config.example.js config.js
```

根据需要修改配置文件中的API设置。

### 4. 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 📋 API接口

### 获取热点列表
```
GET /api/hotspots?category=科技&limit=20&offset=0
```

### 获取分类统计
```
GET /api/categories
```

### 添加新热点
```
POST /api/hotspots
Content-Type: application/json

{
  "title": "热点标题",
  "content": "热点内容",
  "category": "科技",
  "source": "来源",
  "url": "https://example.com"
}
```

### 删除热点
```
DELETE /api/hotspots/:id
```

## 🔧 自定义开发

### 添加新的数据源

1. 编辑 `api-extensions.js` 文件
2. 添加新的API获取函数
3. 在 `fetchAllHotspots` 函数中调用新函数
4. 重启服务器

## 📱 移动端支持

应用支持移动端访问，主要特性：
- 自适应屏幕尺寸
- 触摸友好的界面
- 优化的移动端布局
- 快速加载

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

MIT License



---
