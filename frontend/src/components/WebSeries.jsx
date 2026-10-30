import React, { useMemo, useState } from "react";
import { series } from "../data/series";
import "./WebSeries.css";

const getGenres = (show) => {
  const value = show?.genre;
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/[·,|/;]/).map((item) => item.trim()).filter(Boolean);
};

export default function WebSeries({ onSelectSeries }) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = useMemo(() => {
    const all = series.flatMap(getGenres);
    return ["All", ...Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))];
  }, []);

  const filteredSeries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return series.filter((show) => {
      const showGenres = getGenres(show);
      const matchesGenre = selectedGenre === "All" || showGenres.includes(selectedGenre);
      const searchableText = [show.title, show.year, show.genre, show.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesGenre && (!query || searchableText.includes(query));
    });
  }, [search, selectedGenre]);

  return (
    <section className="web-series-page" id="web-series">
      <div className="web-series-heading">
        <p>STREAMHUB ORIGINALS</p>
        <h1>Web Series</h1>
        <span>Discover your next binge-worthy story.</span>
      </div>

      <div className="series-discovery" role="search">
        <label className="series-search-label" htmlFor="series-search">Search web series</label>
        <input
          id="series-search"
          className="series-search-input"
          type="search"
          placeholder="Search by title, genre, year..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="series-genre-filter" aria-label="Browse web series by genre">
        <span className="series-filter-title">Browse by genre:</span>
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            className={`series-genre-chip${selectedGenre === genre ? " active" : ""}`}
            onClick={() => setSelectedGenre(genre)}
            aria-pressed={selectedGenre === genre}
          >
            {genre}
          </button>
        ))}
      </div>

      <p className="series-results-count">
        {filteredSeries.length} {filteredSeries.length === 1 ? "series" : "series"} found
        {selectedGenre !== "All" ? ` in ${selectedGenre}` : ""}
      </p>

      {filteredSeries.length > 0 ? (
        <div className="series-grid">
          {filteredSeries.map((show) => (
            <article
              className="series-card"
              key={show.id}
              onClick={() => onSelectSeries?.(show)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectSeries?.(show);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${show.title}`}
            >
              <img src={show.poster} alt={show.title} loading="lazy" />
              <div className="series-card-info">
                <h3>{show.title}</h3>
                <p>{show.year} · {show.genre}</p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectSeries?.(show);
                  }}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="series-no-results">
          <h2>No web series found</h2>
          <p>Try another title or choose a different genre.</p>
          <button type="button" onClick={() => { setSearch(""); setSelectedGenre("All"); }}>
            Clear search and filters
          </button>
        </div>
      )}
    </section>
  );
}
