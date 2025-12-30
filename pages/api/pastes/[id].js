import { pool } from "../../../lib/db";
import { getNow } from "../../../lib/time";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const now = getNow(req);

  const result = await pool.query("SELECT * FROM pastes WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "not found" });
  }

  const paste = result.rows[0];

  if (paste.expires_at && now > paste.expires_at) {
    return res.status(404).json({ error: "not found" });
  }

  if (paste.max_views !== null && paste.view_count >= paste.max_views) {
    return res.status(404).json({ error: "not found" });
  }

  const updated = await pool.query(
    "UPDATE pastes SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count",
    [id]
  );

  const viewCount = updated.rows[0].view_count;

  res.status(200).json({
    content: paste.content,
    remaining_views: paste.max_views === null ? null : Math.max(paste.max_views - viewCount, 0),
    expires_at: paste.expires_at ? paste.expires_at.toISOString() : null
  });
}
