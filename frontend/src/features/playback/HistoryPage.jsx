import { useEffect, useState } from "react";
import "../features.css";
import { clearHistory, deleteHistoryEntry, getHistory } from "./historyApi";

export default function HistoryPage({ onPlay, onBack }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  async function removeEntry(historyId) {
    setError("");
    try {
      await deleteHistoryEntry(historyId);
      setItems((previous) => previous.filter((item) => item.id !== historyId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function removeAllHistory() {
    if (!window.confirm("Clear all watch history? This cannot be undone.")) {
      return;
    }

    setError("");
    setDeleting(true);
    try {
      await clearHistory();
      setItems([]);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  }

  let content;
  if (error) {
    content = null;
  } else if (!items) {
    content = <p>Loading...</p>;
  } else if (items.length === 0) {
    content = <p>You have not watched anything yet.</p>;
  } else {
    content = (
      <div className="history-grid">
        {items.map((item) => (
          <article className="history-card" key={item.id}>
            <button
              type="button"
              className="history-delete-button"
              onClick={() => removeEntry(item.id)}
              aria-label={`Delete ${item.title} from watch history`}
              title="Delete from history"
            >
              ×
            </button>
            <button
              type="button"
              className="history-card-poster"
              onClick={() => onPlay(item.title_id)}
              aria-label={`Play ${item.title}`}
            >
              <img src={item.poster_url || "/favicon.svg"} alt="" loading="lazy" />
              <span>▶ Play</span>
            </button>{" "}
            <div className="history-card-info">
              <h3>{item.title}</h3>
              <p>{new Date(item.watched_at).toLocaleString()}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="feature-page history-page">
      <button className="history-back-button" type="button" onClick={onBack}>← Back</button>
      <header className="history-heading">
        <div>
          <p>YOUR ACTIVITY</p>
          <h1>Watch History</h1>
        </div>
        {items?.length > 0 && (
          <button
            type="button"
            className="history-clear-button"
            onClick={removeAllHistory}
            disabled={deleting}
          >
            {deleting ? "Clearing..." : "Clear History"}
          </button>
        )}
      </header>
      {error && <p role="alert" className="feature-error">{error}</p>}
      {content}
    </div>
  );
}
