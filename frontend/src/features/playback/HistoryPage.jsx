import { useEffect, useState } from "react";
import "../features.css";
import { getHistory } from "./historyApi";

export default function HistoryPage({ onPlay, onBack }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!items) {
    content = <p>Loading...</p>;
  } else if (items.length === 0) {
    content = <p>You have not watched anything yet.</p>;
  } else {
    content = (
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onPlay(item.title_id)}>
              {item.title}
            </button>{" "}
            — {new Date(item.watched_at).toLocaleString()}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="feature-page">
      <button type="button" onClick={onBack}>← Back</button>
      <h2>Watch history</h2>
      {content}
    </div>
  );
}
