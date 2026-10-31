
import React, { useState } from "react";
import "./MovieDetailsPage.css";
import WatchlistButton from "./features/watchlist/WatchlistButton";

const movieDescriptions = {
  "The Dark Knight":
    "Batman faces his greatest challenge when the Joker brings chaos to Gotham City. With the help of his allies, he must protect the city and confront difficult choices.",

  "Mad Max: Fury Road":
    "In a post-apocalyptic wasteland, Max joins Furiosa on a dangerous escape from a tyrannical ruler. Their journey becomes a high-speed battle for survival and freedom.",

  "John Wick":
    "A retired hitman returns to the criminal underworld after a devastating personal loss. His search for justice sets off a relentless chain of action.",

  "The Hangover":
    "Three friends wake up after a wild Las Vegas bachelor party with no memory of the previous night. They must retrace their steps to find the missing groom.",

  "The Conjuring":
    "Paranormal investigators Ed and Lorraine Warren help a family experiencing terrifying supernatural events in their farmhouse.",

  Titanic:
    "A young couple from different social backgrounds fall in love aboard the RMS Titanic. Their romance unfolds as the ship faces a historic disaster.",

  "Home Alone":
    "An eight-year-old boy accidentally gets left behind when his family goes on vacation. He must protect his home from two determined burglars.",

  "The Matrix":
    "A computer programmer discovers that the world he knows may be an illusion. He joins a rebellion to uncover the truth about humanity.",

  Interstellar:
    "As Earth faces an environmental crisis, a group of explorers travels beyond our planet in search of a future for humanity.",

  Joker:
    "Arthur Fleck struggles with isolation and rejection in Gotham City. His experiences gradually lead him down a disturbing path.",

  "The Martian":
    "An astronaut stranded on Mars must use science, ingenuity, and determination to survive while a rescue mission is planned.",

  "Shutter Island":
    "Two U.S. marshals investigate the disappearance of a patient from a remote psychiatric hospital. As the investigation continues, disturbing secrets begin to emerge.",
};

const trailerLinks = {
  "The Dark Knight": "EXeTwQWrcwY",
  "Mad Max: Fury Road": "hEJnMQG9ev8",
  "John Wick": "2AUmvWm5ZDQ",
  Titanic: "kVrqfYjkTdQ",
  "The Conjuring": "k10ETZ41q5o",
  Interstellar: "zSWdZVtXT7E",
  Joker: "zAGVQLHvwOY",
  "The Martian": "ej3ioOneTy8",
  "Shutter Island": "5iaYLCiq5RM",
};

export default function MovieDetailsPage({
  movie,
  onClose,
  onWatchMovie,
}) {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) {
    return null;
  }

  const title = movie.title || "Untitled Movie";

  const description =
    movie.description ||
    movie.overview ||
    movieDescriptions[title] ||
    `${title} is a ${movie.genre || "popular"} movie released in ${
      movie.year || "an earlier year"
    }. Discover its story, characters, and memorable moments.`;

  const trailerId = trailerLinks[title];

  const handleWatchMovie = () => {
    if (typeof onWatchMovie === "function") {
      onWatchMovie(movie);
    } else {
      alert("Movie playback is not connected yet.");
    }
  };

  const handleWatchTrailer = () => {
    if (trailerId) {
      setShowTrailer(true);
    } else {
      alert(`A trailer has not been configured for ${title} yet.`);
    }
  };

  const handleClose = () => {
    setShowTrailer(false);

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="movie-details-overlay"
      onClick={handleClose}
    >
      <section
        className="movie-details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} details`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="movie-details-close"
          onClick={handleClose}
          aria-label="Close movie details"
        >
          ×
        </button>

        {showTrailer ? (
          <div className="movie-trailer-view">
            <div className="trailer-header">
              <div>
                <h2>{title} — Official Trailer</h2>
                <p>
                  Watch the trailer without leaving StreamHub.
                </p>
              </div>

              <button
                type="button"
                className="trailer-back-button"
                onClick={() => setShowTrailer(false)}
              >
                ← Back to Details
              </button>
            </div>

            <div className="trailer-video-wrapper">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <>
            <div className="movie-details-poster">
              <img
                src={movie.poster || movie.image || ""}
                alt={`${title} poster`}
              />
            </div>

            <div className="movie-details-content">
              <span className="movie-details-badge">
                STREAMHUB ORIGINALS
              </span>

              <h1>{title}</h1>

              <div className="movie-details-meta">
                <span>
                  📅 {movie.year || "Year unavailable"}
                </span>

                <span>
                  🎭 {movie.genre || "Genre unavailable"}
                </span>

                {movie.duration && (
                  <span>⏱ {movie.duration}</span>
                )}
              </div>

              <h3>About this movie</h3>

              <p className="movie-details-description">
                {description}
              </p>

              <div className="movie-details-tags">
                <span>{movie.genre || "Movie"}</span>
                <span>HD</span>
                <span>StreamHub</span>
              </div>

              <div className="movie-details-actions">
                <button
                  type="button"
                  className="movie-watch-button"
                  onClick={handleWatchMovie}
                >
                  ▶ Watch Movie
                </button>

                <button
                  type="button"
                  className="movie-trailer-button"
                  onClick={handleWatchTrailer}
                >
                  ▷ Watch Trailer
                </button>
                <WatchlistButton
                  titleId={movie.id}
                  className="movie-trailer-button"
                />
              </div>

              <p className="movie-details-note">
                Discover more movies and enjoy your StreamHub
                experience.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
