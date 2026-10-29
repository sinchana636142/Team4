import React from "react";
import "./MovieDetails.css";

export default function MovieDetails({ movie, onClose, onWatchlist, isInWatchlist }) {
if (!movie) return null;

const title = movie.title || movie.name || "Untitled";
const description =
movie.description || movie.overview || "No description available.";
const genre = Array.isArray(movie.genres)
? movie.genres.join(", ")
: movie.genre || "Not specified";
const year = movie.year || movie.release_year || movie.releaseYear || "N/A";

return ( <div className="movie-details-overlay" onClick={onClose}>
<section
className="movie-details-panel"
role="dialog"
aria-modal="true"
aria-labelledby="movie-details-title"
onClick={(event) => event.stopPropagation()}
> <button
       type="button"
       className="movie-details-close"
       onClick={onClose}
       aria-label="Close movie details"
     >
× </button>

    <div className="movie-details-content">
      {movie.poster && (
        <img
          className="movie-details-poster"
          src={movie.poster}
          alt={`${title} poster`}
        />
      )}

      <div className="movie-details-info">
        <h2 id="movie-details-title">{title}</h2>

        <p className="movie-details-year">Release year: {year}</p>

        <p className="movie-details-genre">
          <strong>Genre:</strong> {genre}
        </p>

        <p className="movie-details-description">{description}</p>

        {typeof onWatchlist === "function" && (
          <button
            type="button"
            className="movie-details-watchlist"
            onClick={() => onWatchlist(movie)}
          >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        )}
      </div>
    </div>
  </section>
</div>

);
}
