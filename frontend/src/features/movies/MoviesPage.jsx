import { useMemo, useState } from "react";
import "./MoviesPage.css";

function getMovieGenres(movie) {
  const value = movie.genre;
  if (Array.isArray(value)) {
    return value.map((genre) => String(genre).trim()).filter(Boolean);
  }
  if (typeof value !== "string") {
    return [];
  }
  return value.split(/[·,|/;]/).map((genre) => genre.trim()).filter(Boolean);
}

export default function MoviesPage({ movies, genres, onSelectMovie, onWatchMovie }) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return movies.filter((movie) => {
      const movieGenres = getMovieGenres(movie);
      const matchesGenre = selectedGenre === "All" || movieGenres.includes(selectedGenre);
      const searchableText = [
        movie.title,
        movie.year,
        movie.genre,
        movie.description,
        movie.overview,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesGenre && (!query || searchableText.includes(query));
    });
  }, [movies, search, selectedGenre]);

  return (
    <section className="movies-page" id="movies">
      <div className="movies-page-heading">
        <p>STREAMHUB ORIGINALS</p>
        <h1>Movies</h1>
        <span>Find your next favorite story.</span>
      </div>

      <div className="movies-discovery" role="search">
        <label className="movies-search-label" htmlFor="movies-search">
          Search movies
        </label>
        <input
          id="movies-search"
          className="movies-search-input"
          type="search"
          placeholder="Search by title, genre, year..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="movies-genre-filter" aria-label="Browse movies by genre">
        <span className="movies-filter-title">Browse by genre:</span>
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            className={`movies-genre-chip${selectedGenre === genre ? " active" : ""}`}
            onClick={() => setSelectedGenre(genre)}
            aria-pressed={selectedGenre === genre}
          >
            {genre}
          </button>
        ))}
      </div>

      <p className="movies-results-count" role="status">
        {filteredMovies.length} {filteredMovies.length === 1 ? "movie" : "movies"} found
        {selectedGenre !== "All" ? ` in ${selectedGenre}` : ""}
      </p>

      {filteredMovies.length > 0 ? (
        <div className="movies-grid">
          {filteredMovies.map((movie) => (
            <article
              className="movies-card"
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectMovie(movie);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${movie.title}`}
            >
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                loading="lazy"
              />
              <div className="movies-card-info">
                <h2>{movie.title}</h2>
                <p>{[movie.year, getMovieGenres(movie).join(", ")].filter(Boolean).join(" · ")}</p>
                <button
                  type="button"
                  className="movies-watch-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onWatchMovie(movie);
                  }}
                  aria-label={`Watch ${movie.title}`}
                >
                  ▶ Watch
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="movies-no-results">
          <h2>No movies found</h2>
          <p>Try another title or choose a different genre.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedGenre("All");
            }}
          >
            Clear search and filters
          </button>
        </div>
      )}
    </section>
  );
}
