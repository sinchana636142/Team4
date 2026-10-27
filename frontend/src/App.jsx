import { useEffect, useState } from "react";
import "./App.css";
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


const movies = [
  {
    id: 1,
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    poster:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 2,
    title: "Mad Max: Fury Road",
    genre: "Action",
    year: 2015,
    poster:
      "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
  },
  {
    id: 3,
    title: "John Wick",
    genre: "Action",
    year: 2014,
    poster:
      "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
  },
  {
    id: 4,
    title: "The Hangover",
    genre: "Comedy",
    year: 2009,
    poster:
      "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg",
  },
  {
    id: 5,
    title: "Home Alone",
    genre: "Comedy",
    year: 1990,
    poster:
      "https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg",
  },
  {
    id: 6,
    title: "The Mask",
    genre: "Comedy",
    year: 1994,
    poster:
      "https://image.tmdb.org/t/p/w500/8bsbX0N1U3G6Wkz2q9z3jvJ7kYf.jpg",
  },
  {
    id: 7,
    title: "Inception",
    genre: "Thriller",
    year: 2010,
    poster:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 8,
    title: "Shutter Island",
    genre: "Thriller",
    year: 2010,
    poster:
      "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
  },
  {
    id: 9,
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014,
    poster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 10,
    title: "The Martian",
    genre: "Sci-Fi",
    year: 2015,
    poster:
      "https://image.tmdb.org/t/p/w500/5aGhaIH6nro2j5n9p8Zx6hG8nZC.jpg",
  },
  {
    id: 11,
    title: "Titanic",
    genre: "Romance",
    year: 1997,
    poster:
      "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
  },
  {
    id: 12,
    title: "The Notebook",
    genre: "Romance",
    year: 2004,
    poster:
      "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eW9zV.jpg",
  },
  {
    id: 13,
    title: "The Conjuring",
    genre: "Horror",
    year: 2013,
    poster:
      "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
  },
  {
    id: 14,
    title: "A Quiet Place",
    genre: "Horror",
    year: 2018,
    poster:
      "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
  },
];

const genres = [
  "All",
  "Action",
  "Comedy",
  "Thriller",
  "Sci-Fi",
  "Romance",
  "Horror",
  "Drama",
];

function App() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [screen, setScreen] = useState("home");
  const [watchTitleId, setWatchTitleId] = useState(null);

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
          title_id: titleId,
          rating,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Could not save rating.";

        throw new Error(message);
      }

      // Store the viewer's rating in the current frontend session.
      setMyRatings((previous) => ({
        ...previous,
        [titleId]: rating,
      }));

      setRatingStatus((previous) => ({
        ...previous,
        [titleId]: "Rating saved successfully!",
      }));

      // Reload the average rating after submission.
      try {
        const averageResponse = await fetch(
          `${API_URL}/ratings/title/${titleId}/average`
        );

        if (averageResponse.ok) {
          const averageData = await averageResponse.json();

          const average =
            averageData.average_rating ??
            averageData.average ??
            averageData.avg_rating ??
            averageData.averageRating ??
            null;

          const count =
            averageData.total_ratings ??
            averageData.rating_count ??
            averageData.count ??
            averageData.totalRatings ??
            0;

          setTitleRatings((previous) => ({
            ...previous,
            [titleId]: {
              average:
                average === null ? null : Number(average),
              count: Number(count) || 0,
            },
          }));
        }
      } catch {
        // The rating may have saved even if refreshing the average fails.
      }
    } catch (error) {
      setRatingStatus((previous) => ({
        ...previous,
        [titleId]:
          error.message || "Could not save rating. Please try again.",
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
    return <ForgotPassword />;
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

  // StreamHub homepage.
  return (
    <div className="app">
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={goHome}
        >
          <span className="brand-icon">▶</span> StreamHub
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#movies">Movies</a>
          <a href="#genres">Genres</a>
        </nav>

        {currentUser ? (
          <div className="profile-actions">
            <span className="profile">
              {currentUser.name ||
                currentUser.username ||
                currentUser.email ||
                "Viewer"}
            </span>

            <button
              type="button"
              onClick={() => setScreen("watchlist")}
            >
              Watchlist
            </button>

            <button
              type="button"
              onClick={() => setScreen("history")}
            >
              History
            </button>

            <button
              type="button"
              onClick={() => setScreen("account")}
            >
              My Subscription
            </button>
            {Boolean(currentUser.is_admin || currentUser.role === "admin") && (
              <button
                type="button"
                onClick={() => setScreen("admin")}
                style={{
                  border: "1px solid #e50914",
                  color: "#e50914",
                  fontWeight: "bold",
                }}
              >
                🛠️ Admin Panel
              </button>
            )}

            <button
              type="button"
              onClick={() => setScreen("plans")}
            >
              View Plans
            </button>
            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>


            <button
              type="button"
              onClick={() => setScreen("forgot")}
            >
              Forgot Password?
            </button>
          </div>
        ) : (
          <div className="profile-actions">
            <button
              type="button"
              onClick={() => setScreen("login")}
            >
              Log In
            </button>

            <button
              type="button"
              onClick={() => setScreen("signup")}
            >
              Sign Up
            </button>
          <button
  type="button"
  onClick={() => setScreen("plans")}
>
  Subscription Plans
</button>
            <button
              type="button"
              onClick={() => setScreen("forgot")}
            >
              Forgot Password?
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <p className="eyebrow">
            YOUR ENTERTAINMENT DESTINATION
          </p>

          <h1>
            Stories worth <span>watching.</span>
          </h1>

          <p className="hero-description">
            Discover movies for every mood, all in one place.
          </p>

          <a className="explore-button" href="#genres">
            Explore Movies ↓
          </a>
        </section>

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
                              key={star}
                              type="button"
                              className={`rating-star-button ${
                                star <= (myRatings[movie.id] || 0)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                submitRating(movie.id, star)
                              }
                              aria-label={`${star} star${
                                star === 1 ? "" : "s"
                              }`}
                              aria-pressed={
                                myRatings[movie.id] === star
                              }
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
    </div>
  );
}

export default App;