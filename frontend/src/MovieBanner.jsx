
import React, { useEffect, useState } from "react";
import "./MovieBanner.css";

const FALLBACK_MOVIES = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi • Thriller",
    description:
      "A skilled thief enters people's dreams to steal secrets and attempts the impossible.",
    poster:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action • Crime",
    description:
      "Batman faces his greatest challenge when Gotham City is threatened by the Joker.",
    poster:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
  },
  {
    id: 3,
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi • Adventure",
    description:
      "A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.",
    poster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  },
  {
    id: 4,
    title: "John Wick",
    year: 2014,
    genre: "Action • Thriller",
    description:
      "A legendary assassin returns to the criminal underworld after a personal tragedy.",
    poster:
      "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/7dzngS8pLkGJpyeskCFcjPO9qLF.jpg",
  },
  {
    id: 5,
    title: "Mad Max: Fury Road",
    year: 2015,
    genre: "Action • Adventure",
    description:
      "In a post-apocalyptic wasteland, a group fights for survival and freedom.",
    poster:
      "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/8yACFuoM2aBWq9oqrjXYuIfv9dB.jpg",
  },
];

function MovieBanner({
  movies = [],
  onWatchMovie,
  onMovieClick,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Use the movies already available in StreamHub.
  // Use sample movies only when no movies are supplied.
  const movieList =
    Array.isArray(movies) && movies.length > 0
      ? movies
      : FALLBACK_MOVIES;

  const getMovieValue = (movie, keys, fallback = "") => {
    for (const key of keys) {
      if (movie?.[key] !== undefined && movie?.[key] !== null) {
        return movie[key];
      }
    }

    return fallback;
  };

  const getTitle = (movie) =>
    getMovieValue(movie, ["title", "name"], "Untitled Movie");

  const getYear = (movie) => {
    const value = getMovieValue(
      movie,
      ["year", "release_year", "releaseYear", "release_date"],
      ""
    );

    return String(value).length >= 4
      ? String(value).slice(0, 4)
      : value;
  };

  const getGenre = (movie) => {
    const genre = getMovieValue(
      movie,
      ["genre", "genres", "category"],
      "Featured Movie"
    );

    if (Array.isArray(genre)) {
      return genre
        .map((item) =>
          typeof item === "object" ? item.name : item
        )
        .join(" • ");
    }

    if (typeof genre === "object" && genre !== null) {
      return genre.name || "Featured Movie";
    }

    return genre;
  };

  const getDescription = (movie) =>
    getMovieValue(
      movie,
      ["description", "overview", "summary", "plot"],
      "Discover this movie and enjoy the story on StreamHub."
    );

  const getImage = (movie) =>
    getMovieValue(
      movie,
      [
        "backdrop",
        "backdrop_path",
        "backdropUrl",
        "banner",
        "banner_url",
        "backdrop_image",
        "poster",
        "poster_path",
        "posterUrl",
        "image",
        "image_url",
        "thumbnail",
      ],
      ""
    );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (typeof imagePath !== "string") return "";

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    if (imagePath.startsWith("/")) {
      return `https://image.tmdb.org/t/p/original${imagePath}`;
    }

    return imagePath;
  };

  const currentMovie = movieList[currentIndex % movieList.length];

  useEffect(() => {
    setCurrentIndex(0);
  }, [movies]);

  useEffect(() => {
    if (isPaused || movieList.length < 2) return;

    const timer = setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % movieList.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, movieList.length, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex(
      (previous) =>
        (previous - 1 + movieList.length) % movieList.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous + 1) % movieList.length);
  };

  const handleWatchNow = () => {
    if (onWatchMovie) {
      onWatchMovie(currentMovie);
    } else if (onMovieClick) {
      onMovieClick(currentMovie);
    } else {
      window.dispatchEvent(
        new CustomEvent("streamhub:watch-movie", {
          detail: currentMovie,
        })
      );
    }
  };

  if (!currentMovie) return null;

  const backgroundImage = getImageUrl(getImage(currentMovie));

  return (
    <section
      className="movie-banner"
      style={{
        "--banner-image": backgroundImage
          ? `url("${backgroundImage}")`
          : "none",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      aria-label="Featured movies"
    >
      <div className="movie-banner-shade" />

      <div
        className="movie-banner-content"
        key={String(
          getMovieValue(currentMovie, ["id", "movie_id"], currentIndex)
        )}
      >
        <p className="movie-banner-eyebrow">
          STREAMHUB ORIGINAL COLLECTION
        </p>

        <h1>{getTitle(currentMovie)}</h1>

        <div className="movie-banner-meta">
          {getYear(currentMovie) && (
            <span>{getYear(currentMovie)}</span>
          )}

          <span>{getGenre(currentMovie)}</span>
          <span>Featured Movie</span>
        </div>

        <p className="movie-banner-description">
          {getDescription(currentMovie)}
        </p>

        <button
          type="button"
          className="movie-banner-watch"
          onClick={handleWatchNow}
        >
          <span aria-hidden="true">▶</span>
          Watch Now
        </button>
      </div>

      {movieList.length > 1 && (
        <>
          <button
            type="button"
            className="movie-banner-arrow movie-banner-previous"
            onClick={goToPrevious}
            aria-label="Previous movie"
          >
            ‹
          </button>

          <button
            type="button"
            className="movie-banner-arrow movie-banner-next"
            onClick={goToNext}
            aria-label="Next movie"
          >
            ›
          </button>

          <div
            className="movie-banner-thumbnails"
            aria-label="Choose featured movie"
          >
            {movieList.map((movie, index) => {
              const image = getImageUrl(getImage(movie));

              return (
                <button
                  key={String(
                    getMovieValue(movie, ["id", "movie_id"], index)
                  )}
                  type="button"
                  className={`movie-banner-thumbnail ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show ${getTitle(movie)}`}
                  aria-current={index === currentIndex ? "true" : undefined}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={getTitle(movie)}
                      loading="lazy"
                    />
                  ) : (
                    <span>{getTitle(movie)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="movie-banner-progress" key={currentIndex}>
        <span />
      </div>
    </section>
  );
}

export default MovieBanner;
