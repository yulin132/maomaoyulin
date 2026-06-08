// GET    /api/entries/:id  — 获取单篇
// PUT    /api/entries/:id  — 更新单篇
// DELETE /api/entries/:id  — 删除单篇

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
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!checkAuth(request, env)) return unauthorized();

  const id = String(params.id);
  const row: any = await env.DB.prepare(
    "SELECT id, date, category, title, content, created_at, updated_at FROM entries WHERE id = ?"
  ).bind(id).first();

  if (!row) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { "Content-Type": "application/json", ...cors() },
    });
  }

  return new Response(JSON.stringify({
    entry: {
      id: row.id,
      date: row.date,
      category: row.category,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors() },
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!checkAuth(request, env)) return unauthorized();

  const id = String(params.id);
  let body: any;
  try { body = await request.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE entries SET
       date = ?,
       category = ?,
       title = ?,
       content = ?,
       updated_at = ?
     WHERE id = ?`
  ).bind(
    body.date,
    body.category || "life",
    (body.title || "").trim(),
    (body.content || "").trim(),
    now,
    id
  ).run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "Content-Type": "application/json", ...cors() },
  });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!checkAuth(request, env)) return unauthorized();

  const id = String(params.id);
  await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "Content-Type": "application/json", ...cors() },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: cors() });
};
