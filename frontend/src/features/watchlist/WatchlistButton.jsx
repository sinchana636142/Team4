import { useEffect, useState } from "react";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "./watchlistApi";

// Add / Remove button. Use <WatchlistButton titleId={id} /> on any title page.
export default function WatchlistButton({ titleId }) {
  const [inList, setInList] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getWatchlist()
      .then((items) => setInList(items.some((item) => item.title_id === Number(titleId))))
      .catch(() => {});
  }, [titleId]);

  async function toggle() {
    setError("");
    try {
      if (inList) {
        await removeFromWatchlist(titleId);
      } else {
        await addToWatchlist(titleId);
      }
      setInList(!inList);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <span>
      <button type="button" onClick={toggle}>
        {inList ? "Remove from watchlist" : "Add to watchlist"}
      </button>
      {error && <span role="alert" className="feature-error"> {error}</span>}
    </span>
  );
}
