export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("MMK Reward Bot is running!");
    }

    if (!env.BOT_TOKEN || !env.DB) {
      return new Response("Missing BOT_TOKEN or DB", { status: 500 });
    }

    const update = await request.json();
    const msg = update.message;

    if (!msg || !msg.text) return new Response("OK");

    const id = String(msg.from.id);
    const username = msg.from.username || "";
    const text = msg.text.trim();
    const api = `https://api.telegram.org/bot${env.BOT_TOKEN}`;

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        telegram_id TEXT PRIMARY KEY,
        username TEXT,
        coins INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        telegram_id TEXT PRIMARY KEY,
        state TEXT,
        amount INTEGER
      )
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO users (telegram_id, username, coins)
      VALUES (?, ?, 
