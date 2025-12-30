import crypto from "crypto";
import { pool } from "../../../lib/db";
import { getNow } from "../../../lib/time";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, ttl_seconds, max_views } = req.body || {};

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "content is required" });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "invalid ttl_seconds" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "invalid max_views" });
  }

  const id = crypto.randomUUID().slice(0, 8);
  const now = getNow(req);

  let expiresAt = null;
  if (ttl_seconds) {
    expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
  }

  await pool.query(
    "INSERT INTO pastes (id, content, expires_at, max_views) VALUES ($1, $2, $3, $4)",
    [id, content, expiresAt, max_views ?? null]
  );

  const baseUrl = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

  res.status(201).json({
    id,
    url: `${baseUrl}/p/${id}`
  });
}
