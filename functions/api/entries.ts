// GET  /api/entries        — 列出所有日记
// POST /api/entries        — 创建新日记

export interface Env {
  DB: D1Database;
  DIARY_TOKEN: string;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function checkAuth(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization") || "";
  return auth === `Bearer ${env.DIARY_TOKEN}`;
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!checkAuth(request, env)) return unauthorized();

  const { results } = await env.DB.prepare(
    "SELECT id, date, category, title, content, created_at, updated_at FROM entries ORDER BY date DESC, updated_at DESC"
  ).all();

  // 字段名 snake_case → camelCase 给前端
  const entries = results.map((r: any) => ({
    id: r.id,
    date: r.date,
    category: r.category,
    title: r.title,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return new Response(JSON.stringify({ entries }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors() },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!checkAuth(request, env)) return unauthorized();

  let body: any;
  try { body = await request.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const id = String(body.id || Date.now());
  const date = body.date || new Date().toISOString().slice(0, 10);
  const category = body.category || "life";
  const title = (body.title || "").trim();
  const content = (body.content || "").trim();
  const now = Date.now();
  const createdAt = body.createdAt || now;
  const updatedAt = body.updatedAt || now;

  if (!title || !content) {
    return new Response(JSON.stringify({ error: "标题和正文不能空" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...cors() },
    });
  }

  await env.DB.prepare(
    `INSERT INTO entries (id, date, category, title, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       date = excluded.date,
       category = excluded.category,
       title = excluded.title,
       content = excluded.content,
       updated_at = excluded.updated_at`
  ).bind(id, date, category, title, content, createdAt, updatedAt).run();

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors() },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: cors() });
};
