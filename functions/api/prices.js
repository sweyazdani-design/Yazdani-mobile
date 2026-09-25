// Cloudflare Pages Function — handles GET/POST for /api/prices
// Requires a KV namespace bound to this Pages project as "PRICES",
// and an environment variable ADMIN_SECRET (same value as ADMIN_PASSWORD in index.html).

export async function onRequestGet({ env }) {
  try {
    const data = await env.PRICES.get("catalog");
    return new Response(data || "null", {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "kv_read_failed" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  const secret = request.headers.get("x-admin-secret");
  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "bad_json" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  try {
    await env.PRICES.put("catalog", JSON.stringify(body));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "kv_write_failed" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}
