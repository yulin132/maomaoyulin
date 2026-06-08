-- D1 Schema for maomaoyulin diary
-- 在 Cloudflare 控制台 D1 控制台 → "Console" 标签页执行

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
