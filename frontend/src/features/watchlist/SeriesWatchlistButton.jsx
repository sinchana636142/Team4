import { useEffect, useState } from "react";
import {
  isSeriesInWatchlist,
  removeSeriesFromWatchlist,
  saveSeriesToWatchlist,
} from "./seriesWatchlist";

export default function SeriesWatchlistButton({ series, user }) {
  const [inList, setInList] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setInList(isSeriesInWatchlist(user, series.id));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [series.id, user]);

  function toggle() {
    setError("");
    try {
      if (inList) {
        removeSeriesFromWatchlist(user, series.id);
      } else {
        saveSeriesToWatchlist(user, series);
      }
      setInList((previous) => !previous);
    } catch (storageError) {
      setError(storageError.message);
    }
  }

  return (
    <span className="watchlist-action">
      <button type="button" onClick={toggle}>
        {inList ? "✓ In Watchlist" : "＋ Add to Watchlist"}
      </button>
      {error && <span role="alert" className="feature-error">{error}</span>}
    </span>
  );
}
