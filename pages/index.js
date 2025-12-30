import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    const newWarnings = {};

    // Validation
    if (!content.trim()) {
      newWarnings.content = "Paste content is required.";
    }

    if (!ttl) {
      newWarnings.ttl = "TTL is required.";
    } else if (Number(ttl) < 1) {
      newWarnings.ttl = "TTL must be at least 1 second.";
    }

    if (!views) {
      newWarnings.views = "Max views is required.";
    } else if (Number(views) < 1) {
      newWarnings.views = "Max views must be at least 1.";
    }

    if (Object.keys(newWarnings).length > 0) {
      setWarnings(newWarnings);
      return;
    }

    setWarnings({});
    setError(null);
    setLoading(true);

    const body = {
      content,
      ttl_seconds: Number(ttl),
      max_views: Number(views)
    };

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setUrl(data.url);

        // Clear form
        setContent("");
        setTtl("");
        setViews("");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📋 Pastebin Lite</h1>
        <p style={styles.subtitle}>
          Quickly share text with expiry and view limits
        </p>

        <form onSubmit={submit}>
          {/* Content */}
          <label style={styles.label}>Paste Content *</label>
          {warnings.content && <p style={styles.warning}>{warnings.content}</p>}
          <textarea
            style={styles.textarea}
            rows={8}
            value={content}
            placeholder="Enter your text here..."
            onChange={(e) => {
              setContent(e.target.value);
              setUrl(null);
              setWarnings({ ...warnings, content: null });
            }}
          />

          <div style={styles.row}>
            {/* TTL */}
            <div style={styles.field}>
              <label style={styles.label}>TTL (seconds) *</label>
              {warnings.ttl && <p style={styles.warning}>{warnings.ttl}</p>}
              <input
                style={styles.input}
                type="number"
                min="1"
                placeholder="e.g. 60"
                value={ttl}
                onChange={(e) => {
                  setTtl(e.target.value);
                  setWarnings({ ...warnings, ttl: null });
                }}
              />
            </div>

            {/* Max Views */}
            <div style={styles.field}>
              <label style={styles.label}>Max Views *</label>
              {warnings.views && <p style={styles.warning}>{warnings.views}</p>}
              <input
                style={styles.input}
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={views}
                onChange={(e) => {
                  setViews(e.target.value);
                  setWarnings({ ...warnings, views: null });
                }}
              />
            </div>
          </div>

          <button style={styles.button}>
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </form>

        {url && (
          <div style={styles.result}>
            <p style={styles.resultLabel}>Shareable URL</p>
            <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
              {url}
            </a>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif"
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "1.5rem"
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
    display: "block"
  },
  warning: {
    color: "#d97706",
    fontSize: "0.85rem",
    marginBottom: "0.3rem"
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "1rem",
    resize: "vertical"
  },
  row: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem"
  },
  field: {
    flex: 1
  },
  input: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer"
  },
  result: {
    marginTop: "1.5rem",
    padding: "1rem",
    background: "#f5f7ff",
    borderRadius: "8px"
  },
  resultLabel: {
    margin: 0,
    fontWeight: 600,
    marginBottom: "0.5rem"
  },
  link: {
    wordBreak: "break-all",
    color: "#4c51bf"
  },
  error: {
    marginTop: "1rem",
    color: "red",
    textAlign: "center"
  }
};
