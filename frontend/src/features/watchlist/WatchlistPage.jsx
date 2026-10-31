import { useEffect, useState } from "react";
import "../features.css";
import { getWatchlist, removeFromWatchlist } from "./watchlistApi";
import { getSeriesWatchlist, removeSeriesFromWatchlist } from "./seriesWatchlist";

export default function WatchlistPage({
  user,
  onBack,
  onSelectMovie,
  onSelectSeries,
}) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getWatchlist(), Promise.resolve().then(() => getSeriesWatchlist(user))])
      .then(([movies, series]) => {
        if (!active) return;
        const movieItems = movies.map((item) => ({ ...item, kind: "movie" }));
        const seriesItems = series.map((item) => ({
          ...item,
          kind: "series",
          title_id: item.id,
          poster_url: item.poster,
          synopsis: item.description,
        }));
        setItems([...movieItems, ...seriesItems]);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function remove(item) {
    try {
      if (item.kind === "series") {
        removeSeriesFromWatchlist(user, item.title_id);
      } else {
        await removeFromWatchlist(item.title_id);
      }
      setItems((previous) =>
        previous.filter(
          (existing) =>
            existing.kind !== item.kind ||
            String(existing.title_id) !== String(item.title_id)
        )
      );
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!items) {
    content = <p>Loading your watchlist...</p>;
  } else if (items.length === 0) {
    content = <p>Your watchlist is empty.</p>;
  } else {
    content = (
      <div className="watchlist-grid">
        {items.map((item) => (
          <article className="watchlist-card" key={`${item.kind}-${item.title_id}`}>
            <button
              type="button"
              className="watchlist-poster-link"
              onClick={() => {
                if (item.kind === "series") {
                  onSelectSeries(item);
                } else {
                  onSelectMovie?.({
                    ...item,
                    id: item.title_id,
                    poster: item.poster_url,
                    description: item.synopsis,
                  });
                }
              }}
              aria-label={`View details for ${item.title}`}
            >
              <img
                src={item.poster_url || "/favicon.svg"}
                alt={`${item.title} poster`}
                loading="lazy"
              />
              <span className="watchlist-poster-title">{item.title}</span>
              <span className="watchlist-poster-kind">
                {item.kind === "series" ? "SERIES" : "MOVIE"}
              </span>
            </button>
            <button
              type="button"
              className="watchlist-remove"
              onClick={() => remove(item)}
              aria-label={`Remove ${item.title} from watchlist`}
            >
              ×
            </button>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="feature-page watchlist-page">
      <button className="watchlist-back-button" type="button" onClick={onBack}>← Back</button>
      <h1>My Watchlist</h1>
      <p className="watchlist-intro">Movies and web series you have saved to watch later.</p>
      {content}
    </div>
  );
}
