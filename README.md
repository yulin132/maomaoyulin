# Personal Website · 动森风格

基于 [`animal-island-ui`](../README.md) 设计风格做的个人网站，零依赖、纯 HTML + CSS + JS。

## 目录

```
personal-website/
├── index.html              # 首页：Hero + 实时时间/日期 + 关于我 + 技能 + 经历 + 联系
├── diary.html              # 读研日记：列表页
├── diary-detail.html       # 读研日记：详情 / 编辑 / 新建
├── works.html              # 旧版作品集（保留作为基线参考）
├── assets/
│   ├── home_bg.webp
│   ├── content_bg_pc.jpg
│   ├── animal_icon.png
│   ├── guide-bg-line.webp
│   ├── favicon.ico
│   └── nook-phone/
└── README.md
```

## 怎么打开

**最简单**：双击 `index.html` 或 `diary.html`，浏览器直接看。

**正经点**（推荐，避免 file:// 协议的小毛病）：

```bash
cd personal-website
python -m http.server 8080     # → http://localhost:8080

# 或
npx serve personal-website -l 8080
```

## 三个页面

### 1. 首页 (`index.html`)
- Hero 区：**实时时间 HH:MM:SS + 日期**（描边字样式，模仿 `maomaoyulin`）
- 导航切到读研日记
- 关于我 / 技能 / 经历 / 联系四大块

### 2. 读研日记列表 (`diary.html`)
- 直接列出所有日记
- 5 种分类 chip：🌱 生活日常 / 🛠️ 技术折腾 / 💭 心情随笔 / 🍜 吃喝记录 / 📦 其它
- 卡片点击 → 详情页；右上角"写新日记"按钮 → 编辑页
- 空状态友好提示

### 3. 日记详情 / 编辑 (`diary-detail.html`)
- 路由分发：
  - `diary-detail.html?id=xxx` → 查看
  - `diary-detail.html?new=1` → 新建
  - `diary-detail.html?edit=xxx` → 编辑
- 详情页：富排版（按空行分段）、最后编辑时间戳
- 编辑页：日期 + 分类 + 标题 + 正文 textarea
- 删除走确认弹窗（防误删）
- 编辑保存后跳回详情页

## 数据存储

所有日记**明文存**在你浏览器的 `localStorage`，key 是 `diary:entries`：

```js
// 浏览器控制台粘贴就能看
JSON.parse(localStorage.getItem('diary:entries'))

// 想清空
localStorage.removeItem('diary:entries')
```

⚠️ 注意：
- 数据只在你**自己的浏览器**里，不会传到任何服务器
- 但**清浏览器缓存 = 丢数据**，建议偶尔复制上面那条命令的输出当备份
- 不要在公共电脑用

## git 回退

```bash
git log --oneline -5
# 最新 commit：去掉密码锁的版本
# 8eb5d67 feat(personal-website): baseline before diary rework
# 5816f64 feat(personal-website): live clock + diary with localStorage + password (有密码锁)

# 想回到原始两页（无时间、无日记）
git reset --hard 8eb5d67
```

## 设计要点（与原项目对齐）

- **配色**：`#19c8b9` 强调色，`#725d42` 主文字色，`#7DC395` 草地背景绿
- **字体**：`Nunito`（英）+ `Noto Sans SC`（中），Google Fonts CDN
- **响应式**：< 768px 自动切单列
- **零依赖**：不引入 React / Vue，纯原生 HTML + CSS + JS

## 部署

```bash
# GitHub Pages
npx gh-pages -d personal-website

# 或 Vercel / Netlify 拖拽文件夹
```
