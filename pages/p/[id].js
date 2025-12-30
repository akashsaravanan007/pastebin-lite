import { pool } from "../../lib/db";
import { getNow } from "../../lib/time";

export async function getServerSideProps({ params, req }) {
  const { id } = params;
  const now = getNow(req);

  const result = await pool.query("SELECT * FROM pastes WHERE id = $1", [id]);

  if (result.rowCount === 0) return { notFound: true };

  const paste = result.rows[0];

  if (paste.expires_at && now > paste.expires_at) return { notFound: true };
  if (paste.max_views !== null && paste.view_count >= paste.max_views) return { notFound: true };

  await pool.query("UPDATE pastes SET view_count = view_count + 1 WHERE id = $1", [id]);

  return { props: { content: paste.content } };
}

export default function PastePage({ content }) {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Pasted Content</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
    </main>
  );
}
