function getStorageKey(user) {
  const identity = user?.id ?? user?.email;
  if (!identity) {
    throw new Error("Log in to manage your series watchlist.");
  }
  return `streamhub_series_watchlist_${encodeURIComponent(String(identity))}`;
}

export function getSeriesWatchlist(user) {
  const stored = localStorage.getItem(getStorageKey(user));
  if (!stored) return [];

  const items = JSON.parse(stored);
  if (!Array.isArray(items)) {
    throw new Error("Your series watchlist data is invalid.");
  }
  return items;
}

export function isSeriesInWatchlist(user, seriesId) {
  return getSeriesWatchlist(user).some(
    (item) => String(item.id) === String(seriesId)
  );
}

export function saveSeriesToWatchlist(user, series) {
  const items = getSeriesWatchlist(user);
  if (!items.some((item) => String(item.id) === String(series.id))) {
    localStorage.setItem(
      getStorageKey(user),
      JSON.stringify([...items, series])
    );
  }
}

export function removeSeriesFromWatchlist(user, seriesId) {
  const items = getSeriesWatchlist(user).filter(
    (item) => String(item.id) !== String(seriesId)
  );
  localStorage.setItem(getStorageKey(user), JSON.stringify(items));
}
