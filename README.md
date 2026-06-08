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

## 数据存储（Cloudflare D1 + Pages Functions）

日记存在 **Cloudflare D1**（云端 SQLite），多设备实时同步。

### API 端点（`/api/entries`）
- `GET /api/entries` — 列出所有
- `POST /api/entries` — 创建
- `GET /api/entries/:id` — 单篇
- `PUT /api/entries/:id` — 更新
- `DELETE /api/entries/:id` — 删除

### 鉴权
所有 API 请求需要 `Authorization: Bearer <DIARY_TOKEN>` 头。
Token 存在环境变量 `DIARY_TOKEN` 里；用户首次访问 diary 页面时输入，存到 localStorage `diary:token`。

### Cloudflare 项目配置
在 Pages 项目 Settings 里需要：
1. **Bindings** → 添加 D1 binding：变量名 `DB`，数据库 `maomaoyulin-diary`
2. **Variables and Secrets** → 添加 `DIARY_TOKEN`（Secret 类型）
3. 跑建表 SQL（在 D1 Console）：

```sql
CREATE TABLE IF NOT EXISTS entries (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'life',
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC, updated_at DESC);
```

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
