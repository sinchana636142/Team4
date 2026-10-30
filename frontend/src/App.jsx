import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import ForgotPassword from "./ForgotPassword";
import Auth from "./Auth";
import Login from "./Login";
import SubscriptionStatus from "./features/subscription/SubscriptionStatus";
import WatchPage from "./features/playback/WatchPage";
import HistoryPage from "./features/playback/HistoryPage";
import WatchlistPage from "./features/watchlist/WatchlistPage";
import AdminDashboard from "./features/admin/AdminDashboard";
import SubscriptionPlans from "./SubscriptionPlans";
import { API_URL } from "./features/api";
import MovieDetails from "./MovieDetails";
import MovieSearch from "./MovieSearch";
import MovieDetailsPage from "./MovieDetailsPage";
import IntroVideo from "./IntroVideo";
import { movies, genres } from "./data/movies";
import WebSeries from "./components/WebSeries";
import SeriesDetails from "./components/SeriesDetails";

function App() {
  

const [showIntro, setShowIntro] = useState(
  () => sessionStorage.getItem("streamhubIntroPlayed") !== "true"
);

const finishIntro = () => {
  sessionStorage.setItem("streamhubIntroPlayed", "true");
  setShowIntro(false);
};


  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [screen, setScreen] = useState("home");
  const [watchTitleId, setWatchTitleId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesPlayer, setSeriesPlayer] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("streamhub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [catalogMovies, setCatalogMovies] = useState(movies);


  useEffect(() => {
    fetch(`${API_URL}/catalog/titles`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((t) => ({
            id: t.id,
            title: t.title,
            genre: t.genre || "Action",
            year: t.year || 2024,
            poster:
              t.poster_url ||
              "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          }));
          setCatalogMovies(mapped);
        }
      })
      .catch(() => {});
  }, [screen]);

  // Rating states
  const [titleRatings, setTitleRatings] = useState({});
  const [myRatings, setMyRatings] = useState({});
  const [ratingStatus, setRatingStatus] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Load average ratings for all movies.
  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      setLoadingRatings(true);

      const results = await Promise.all(
        catalogMovies.map(async (movie) => {
          try {
            const response = await fetch(
              `${API_URL}/ratings/title/${movie.id}/average`
            );

            if (!response.ok) {
              return [movie.id, null];
            }

            const data = await response.json();

            const average =
              data.average_rating ??
              data.average ??
              data.avg_rating ??
              data.averageRating ??
              null;

            const count =
              data.total_ratings ??
              data.rating_count ??
              data.count ??
              data.totalRatings ??
              0;

            return [
              movie.id,
              {
                average:
                  average === null ? null : Number(average),
                count: Number(count) || 0,
              },
            ];
          } catch {
            return [movie.id, null];
          }
        })
      );

      if (!cancelled) {
        setTitleRatings(
          Object.fromEntries(
            results.filter(([, value]) => value !== null)
          )
        );
        setLoadingRatings(false);
      }
    }

    loadRatings();

    return () => {
      cancelled = true;
    };
  }, [catalogMovies]);

  // Filter movies by genre and search query.
  const filteredMovies = catalogMovies.filter((movie) => {

    const matchesGenre =
      selectedGenre === "All" || movie.genre === selectedGenre;

    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesGenre && matchesSearch;
  });


  function goHome() {
    setScreen("home");
  }

  // Open the video player. Viewers must be logged in.
  function playMovie(titleId) {
    if (!currentUser) {
      setScreen("login");
      return;
    }

    setWatchTitleId(titleId);
    setScreen("watch");
  }

  function handleLogin(user) {
    if (user) {
      sessionStorage.setItem("streamhub_user", JSON.stringify(user));
      setCurrentUser(user);
    }

    setScreen("home");
  }

  function handleLogout() {
    sessionStorage.removeItem("streamhub_access_token");
    sessionStorage.removeItem("streamhub_user");

    setCurrentUser(null);
    setMyRatings({});
    setRatingStatus({});
    setScreen("home");
  }

  // Submit a rating from 1 to 5 stars.

async function submitRating(titleId, rating) {
  if (!currentUser) {
    setRatingStatus((previous) => ({
      ...previous,
      [titleId]: "Please log in to rate this title.",
    }));
    setScreen("login");
    return;
  }

  const token = sessionStorage.getItem("streamhub_access_token");

  if (!token) {
    setRatingStatus((previous) => ({
      ...previous,
      [titleId]: "Login token missing. Please log in again.",
    }));
    return;
  }

  setRatingStatus((previous) => ({
    ...previous,
    [titleId]: "Saving rating...",
  }));

  try {
    const response = await fetch(`${API_URL}/ratings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title_id: Number(titleId),
        rating: Number(rating),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof data.detail === "string"
          ? data.detail
          : data.message || `Could not save rating (HTTP ${response.status}).`;

      throw new Error(message);
    }

    setMyRatings((previous) => ({
      ...previous,
      [titleId]: Number(rating),
    }));

    setRatingStatus((previous) => ({
      ...previous,
      [titleId]: "Rating saved successfully!",
    }));

    const averageResponse = await fetch(
      `${API_URL}/ratings/title/${titleId}/average`
    );

    if (averageResponse.ok) {
      const averageData = await averageResponse.json();

      setTitleRatings((previous) => ({
        ...previous,
        [titleId]: {
          average: averageData.average_rating ?? null,
          count: Number(averageData.total_ratings) || 0,
        },
      }));
    }
  } catch (error) {
    console.error("Rating submission failed:", error);

    setRatingStatus((previous) => ({
      ...previous,
      [titleId]: error.message || "Could not save rating. Please try again.",
    }));
  }
}

  // Video player screen.
  if (screen === "watch") {
    return (
      <WatchPage
        titleId={watchTitleId}
        onBack={goHome}
      />
    );
  }

  // Watchlist screen.
  if (screen === "watchlist") {
    return (
      <WatchlistPage
        onPlay={playMovie}
        onBack={goHome}
      />
    );
  }

  // Watch history screen.
  if (screen === "history") {
    return (
      <HistoryPage
        onPlay={playMovie}
        onBack={goHome}
      />
    );
  }

  // My subscription screen.
  if (screen === "account") {
    return <SubscriptionStatus onBack={goHome} />;
  }
  // Admin dashboard screen (OTT-F-050, OTT-F-051, OTT-F-052)
  if (screen === "admin") {
    return <AdminDashboard onBack={goHome} />;
  }

  // Subscription plans screen.
  if (screen === "plans") {
    return (
      <SubscriptionPlans
        onBack={goHome}
        onSelectPlan={(plan) => {
          sessionStorage.setItem(
            "streamhub_selected_plan",
            JSON.stringify(plan)
          );
          setScreen("account");
        }}
      />
    );
  }

  if (screen === "forgot") {
  return <ForgotPassword onBack={goHome} />;
}

  // Sign-up and OTP verification screen.
  if (screen === "signup") {
    return (
      <Auth
        onBack={goHome}
        onVerified={() => setScreen("login")}
      />
    );
  }

  // Login screen.
  if (screen === "login") {
    return (
      <Login
        onBack={goHome}
        onLoggedIn={handleLogin}
        onForgotPassword={() => setScreen("forgot")}
      />
    );
  }
// Web Series screen. Keep it inside the normal app shell so the navbar remains available.
if (screen === "series") {
  return (
    <div className="app">
      <Navbar
        currentUser={currentUser}
        onHome={goHome}
        onScreenChange={setScreen}
        onLogout={handleLogout}
      />
      <main>
        <WebSeries onSelectSeries={(show) => setSelectedSeries(show)} />
      </main>
      {selectedSeries && (
        <SeriesDetails
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
          onWatchEpisode={({ series: show, episode }) => {
            setSeriesPlayer({ kind: "episode", series: show, episode });
          }}
          onWatchTrailer={(show) => {
            setSeriesPlayer({ kind: "trailer", series: show });
          }}
        />
      )}
      {seriesPlayer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={seriesPlayer.kind === "trailer" ? "Series trailer" : "Episode player"}
          style={{ position: "fixed", inset: 0, zIndex: 11000, background: "rgba(0,0,0,.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div style={{ width: "min(1000px, 100%)", color: "white", background: "#17141f", borderRadius: 16, padding: 20 }}>
            <button type="button" onClick={() => setSeriesPlayer(null)} style={{ float: "right", padding: "8px 14px", cursor: "pointer" }}>Close ✕</button>
            <h2>{seriesPlayer.kind === "trailer" ? `${seriesPlayer.series.title} — Trailer` : `${seriesPlayer.series.title} — ${seriesPlayer.episode.title}`}</h2>
            {seriesPlayer.kind === "trailer" && seriesPlayer.series.trailerUrl ? (
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
                <iframe
                  title={`${seriesPlayer.series.title} trailer`}
                  src={seriesPlayer.series.trailerUrl}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : seriesPlayer.kind === "episode" && seriesPlayer.episode.videoUrl ? (
              <video controls autoPlay style={{ width: "100%", maxHeight: "70vh", background: "black" }} src={seriesPlayer.episode.videoUrl} />
            ) : (
              <p style={{ lineHeight: 1.7, color: "#d4ccdf" }}>
                No authorized video source is configured for this episode yet. Add a video URL you own or are licensed to stream to this episode's <code>videoUrl</code> field in <code>src/data/series.js</code>.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

  // StreamHub homepage.
  return (
    <>
    {showIntro ? (
      <IntroVideo onComplete={finishIntro} />
    ) : (
    <div className="app">
      <Navbar
        currentUser={currentUser}
        onHome={goHome}
        onScreenChange={setScreen}
        onLogout={handleLogout}
      />

      <main>
        <HeroSlider
          movies={catalogMovies}
          onWatchMovie={(movie) => {
            setSelectedMovie(movie);
            setScreen("home");
          }}
        />

        <section className="catalog" id="movies">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                FIND YOUR NEXT FAVORITE
              </p>

              <h2>Browse by Genre</h2>
            </div>

            <span className="movie-count">
              {filteredMovies.length} titles
            </span>
          </div>

          <div className="genre-list" id="genres">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="Search movies and shows..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                aria-label="Search movies and shows"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {genres.map((genre) => (
              <button
                type="button"
                key={genre}
                className={`genre-button ${
                  selectedGenre === genre ? "active" : ""
                }`}
                onClick={() => setSelectedGenre(genre)}
                aria-pressed={selectedGenre === genre}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="results-heading">
            <h3>
              {selectedGenre === "All"
                ? "Popular Movies"
                : `${selectedGenre} Movies`}
            </h3>

            <span>Explore the collection</span>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="movie-grid">
              {filteredMovies.map((movie) => {
                const movieRating = titleRatings[movie.id];

                return (
  <article
    className="movie-card"
    key={movie.id}
    onClick={() => {
      setSelectedMovie(movie);
      setScreen("movieDetails");
    }}
    style={{ cursor: "pointer" }}
  >
                    <div
                      className={`movie-poster poster-${movie.genre
                        .toLowerCase()
                        .replace(/[^a-z]/g, "")}`}
                    >
                      <img
                        className="poster-image"
                        src={movie.poster}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                      />

                      <span className="poster-year">
                        {movie.year}
                      </span>
                    </div>

                    <div className="movie-info">
                      <div>
                        <h4>{movie.title}</h4>
                        <p>{movie.genre}</p>
                      </div>

                      <button
                        type="button"
                        className="play-icon"
                        aria-label={`Play ${movie.title}`}
                        onClick={() => playMovie(movie.id)}
                      >
                        ▶
                      </button>
                    </div>

                    {/* Star rating feature */}
                    <div className="rating-panel">
                      <div className="rating-average">
                        <span className="rating-star">
                          ★
                        </span>

                        <strong>
                          {movieRating?.average != null &&
                          Number.isFinite(movieRating.average)
                            ? movieRating.average.toFixed(1)
                            : "—"}
                        </strong>

                        <span className="rating-count">
                          ({movieRating?.count ?? 0} ratings)
                        </span>
                      </div>

                      <div className="rating-control">
                        <span className="rating-label">
                          {myRatings[movie.id]
                            ? "Your rating"
                            : "Rate this title"}
                        </span>

                        <div
                          className="rating-stars"
                          role="group"
                          aria-label={`Rate ${movie.title} from 1 to 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                  
<button
  type="button"
  className={`rating-star-button ${
    Number(myRatings[movie.id]) >= star ? "selected" : ""
  }`}
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    submitRating(movie.id, star);
  }}
  onMouseDown={(event) => event.stopPropagation()}
  aria-label={`Rate ${movie.title} ${star} out of 5 stars`}
  title={`Rate ${star} out of 5`}
>
  ★
</button>

                          ))}
                        </div>
                      </div>

                      {ratingStatus[movie.id] && (
                        <p
                          className="rating-message"
                          role="status"
                        >
                          {ratingStatus[movie.id]}
                        </p>
                      )}

                      {loadingRatings && (
                        <p className="rating-loading">
                          Loading ratings...
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <span>🎬</span>

              <h3>
                {searchQuery.trim()
                  ? "No matching titles found"
                  : "No movies available"}
              </h3>

              <p>
                {searchQuery.trim()
                  ? `No titles match "${searchQuery.trim()}". Try another search.`
                  : `There are currently no movies in the ${selectedGenre} genre. Please explore another genre.`}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedGenre("All");
                  setSearchQuery("");
                }}
              >
                Browse All Movies
              </button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <a className="brand" href="#home" onClick={goHome}>
          <span className="brand-icon">▶</span> StreamHub
        </a>

        <p>Discover. Watch. Personalize. Subscribe.</p>

        <span>Team 04 · StreamHub</span>
      </footer>
      <MovieDetailsPage
  movie={selectedMovie}
  onClose={() => setSelectedMovie(null)}
  onWatchMovie={(movie) => {
    setSelectedMovie(null);
    playMovie(movie.id);
  }}
/>
          </div>
    )}
  </>
);
}

export default App;
