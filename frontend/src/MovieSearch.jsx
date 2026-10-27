import React, { useState } from "react";
import "./MovieSearch.css";

export default function MovieSearch({ movies = [], onSelectMovie }) {
const [searchQuery, setSearchQuery] = useState("");

const filteredMovies = movies.filter((movie) => {
const title = (movie.title || movie.name || "").toLowerCase();
const genre = (movie.genre || "").toLowerCase();
const query = searchQuery.trim().toLowerCase();

return title.includes(query) || genre.includes(query);

});

return ( <section className="movie-search"> <h2>Search Movies & Shows</h2>

  <input
    type="search"
    className="movie-search-input"
    placeholder="Search movies and shows by title or genre..."
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    aria-label="Search movies and shows"
  />

  {searchQuery.trim() !== "" && (
    <p className="movie-search-count" role="status">
      {filteredMovies.length > 0
        ? `${filteredMovies.length} result(s) found`
        : "No movies or shows match your search."}
    </p>
  )}

  <div className="movie-search-results">
    {filteredMovies.map((movie) => (
      <button
        type="button"
        className="movie-search-card"
        key={movie.id}
        onClick={() => onSelectMovie?.(movie)}
      >
        {movie.poster && (
          <img
            src={movie.poster}
            alt=""
            className="movie-search-poster"
          />
        )}

        <span className="movie-search-info">
          <strong>{movie.title || movie.name}</strong>
          <small>
            {[movie.genre, movie.year].filter(Boolean).join(" • ")}
          </small>
        </span>
      </button>
    ))}
  </div>
</section>

);
}
