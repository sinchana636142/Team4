import { useEffect, useState } from "react";
import "../features.css";
import { getWatchlist, removeFromWatchlist } from "./watchlistApi";

export default function WatchlistPage({ onPlay, onBack }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWatchlist()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  async function remove(titleId) {
    try {
      await removeFromWatchlist(titleId);
      setItems(items.filter((item) => item.title_id !== titleId));
    } catch (e) {
      setError(e.message);
    }
  }

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!items) {
    content = <p>Loading...</p>;
  } else if (items.length === 0) {
    content = <p>Your watchlist is empty.</p>;
  } else {
    content = (
      <ul>
        {items.map((item) => (
          <li key={item.title_id}>
            <button type="button" onClick={() => onPlay(item.title_id)}>
              {item.title}
            </button>{" "}
            <button type="button" onClick={() => remove(item.title_id)}>Remove</button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="feature-page">
      <button type="button" onClick={onBack}>← Back</button>
      <h2>My watchlist</h2>
      {content}
    </div>
  );
}
