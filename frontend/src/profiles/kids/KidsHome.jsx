
import { useEffect, useMemo, useState } from "react";
import "./KidsHome.css";

const IMAGE = "https://image.tmdb.org/t/p/w500";

const kidsTitles = [
    {
        id: "kids-toy-story",
        title: "Toy Story",
        category: "Animated Movies",
        age: "3–8",
        year: 1995,
        rating: "G",
        poster: `${IMAGE}/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg`,
        description: "A group of toys come to life when people aren't around.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi · Tamil",
    },
    {
        id: "kids-finding-nemo",
        title: "Finding Nemo",
        category: "Animated Movies",
        age: "3–8",
        year: 2003,
        rating: "G",
        poster: `${IMAGE}/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg`,
        description: "An unforgettable underwater adventure about family and courage.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi",
    },
    {
        id: "kids-zootopia",
        title: "Zootopia",
        category: "Animated Movies",
        age: "7–9",
        year: 2016,
        rating: "PG",
        poster: `${IMAGE}/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg`,
        description: "A clever bunny and a sly fox solve a city-sized mystery.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi · Tamil",
    },
    {
        id: "kids-inside-out",
        title: "Inside Out",
        category: "Animated Movies",
        age: "7–9",
        year: 2015,
        rating: "PG",
        poster: `${IMAGE}/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg`,
        description: "Meet the emotions helping one young girl navigate a big change.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi",
    },
    {
        id: "kids-spirited-away",
        title: "Spirited Away",
        category: "Kids Anime",
        age: "10–12",
        year: 2001,
        rating: "PG",
        poster: `${IMAGE}/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg`,
        description: "A magical journey through a mysterious spirit world.",
        genre: "Anime",
        type: "Anime",
        languages: "Japanese · English · Hindi",
    },
    {
        id: "kids-totoro",
        title: "My Neighbor Totoro",
        category: "Kids Anime",
        age: "3–8",
        year: 1988,
        rating: "G",
        poster: `${IMAGE}/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg`,
        description: "Two sisters discover gentle forest spirits near their new home.",
        genre: "Anime",
        type: "Anime",
        languages: "Japanese · English",
    },
    {
        id: "kids-kung-fu-panda",
        title: "Kung Fu Panda",
        category: "Cartoons",
        age: "7–9",
        year: 2008,
        rating: "PG",
        poster: "https://www.impawards.com/2008/posters/kung_fu_panda_ver5_xlg.jpg",
        description: "An unlikely hero discovers that greatness comes from within.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi",
    },
    {
        id: "kids-frozen",
        title: "Frozen",
        category: "Animated Movies",
        age: "3–8",
        year: 2013,
        rating: "PG",
        poster: `${IMAGE}/7dWkcDmttONPCd4DLDPN2vC3GZB.jpg`,
        description: "Two sisters discover the meaning of love, courage and family.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi · Tamil",
    },
    {
        id: "kids-moana",
        title: "Moana",
        category: "Animated Movies",
        age: "7–9",
        year: 2016,
        rating: "PG",
        poster: "https://filmartgallery.com/cdn/shop/files/Moana-Vintage-Movie-Poster-Original_a084ef41_5000x.jpg?v=1771975545",
        description: "A brave young voyager sets sail to save her island.",
        genre: "Animation",
        type: "Movie",
        languages: "English · Hindi",
    },
    {
        id: "kids-learning",
        title: "Learn & Discover",
        category: "Educational",
        age: "3–8",
        year: 2026,
        rating: "E",
        poster: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700",
        description: "Curious minds explore science, nature and the world around them.",
        genre: "Educational",
        type: "Learning",
        languages: "English · Hindi",
    },
    {
        id: "kids-creative",
        title: "Creative Kids",
        category: "Educational",
        age: "7–9",
        year: 2026,
        rating: "E",
        poster: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700",
        description: "Make, draw and discover something new with every activity.",
        genre: "Educational",
        type: "Learning",
        languages: "English · Hindi",
    },
];

const ageGroups = ["All Ages", "3–8", "7–9", "10–12"];

function PosterCard({ item, onSelect }) {
    return (
        <button
            className="kids-poster-card"
            type="button"
            onClick={() => onSelect(item)}
            title={`View ${item.title} details`}
        >
            <img
                src={item.poster}
                alt={`${item.title} poster`}
                loading="lazy"
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                        `https://placehold.co/500x750/171522/ffffff?text=${encodeURIComponent(item.title)}`;
                }}
            />

            <span className="kids-poster-hover">
                <span>▶</span> View details
            </span>

            <span className="kids-poster-rating">
                {item.rating}
            </span>
        </button>
    );
}

export default function KidsHome({
    onBack,
    onSwitchProfile,
    onSelectTitle,
}) {
    const [featured, setFeatured] = useState(kidsTitles[1]);
    // Automatically rotate the featured cartoon every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFeatured((current) => {
                const currentIndex = kidsTitles.findIndex(
                    (item) => item.id === current.id
                );

                const nextIndex = (currentIndex + 1) % kidsTitles.length;

                return kidsTitles[nextIndex];
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);
    const [ageGroup, setAgeGroup] = useState("All Ages");
    const [search, setSearch] = useState("");

    const switchProfiles = onSwitchProfile || onBack;

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return kidsTitles.filter((item) =>
            (ageGroup === "All Ages" || item.age === ageGroup) &&
            (
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            )
        );
    }, [ageGroup, search]);

    const rows = [
        {
            title: "Desi Hits",
            items: kidsTitles.filter((item) =>
                ["Cartoons", "Animated Movies"].includes(item.category)
            ),
        },
        {
            title: "Little Explorers",
            items: kidsTitles.filter((item) => item.age === "3–8"),
        },
        {
            title: "Animation & Anime",
            items: kidsTitles.filter((item) =>
                item.category === "Kids Anime" ||
                item.category === "Animated Movies"
            ),
        },
        {
            title: "Learn Something New",
            items: kidsTitles.filter((item) =>
                item.category === "Educational"
            ),
        },
    ];

    return (
        <div className="kids-app">

            <header className="kids-navbar">

                <button
                    className="kids-brand"
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setAgeGroup("All Ages");
                    }}
                >
                    <span>
                        STREAM<span className="kids-brand-accent">HUB</span>
                    </span>
                    <small>KIDS</small>
                </button>

                <nav className="kids-nav-links">
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setAgeGroup("All Ages");
                        }}
                    >
                        Home
                    </button>

                    <button type="button" onClick={() => setSearch("movie")}>
                        Movies
                    </button>

                    <button type="button" onClick={() => setSearch("cartoon")}>
                        Cartoons
                    </button>

                    <button type="button" onClick={() => setSearch("anime")}>
                        Anime
                    </button>

                    <button type="button" onClick={() => setSearch("learn")}>
                        Learn
                    </button>
                </nav>

                <div className="kids-nav-actions">

                    <label className="kids-search">
                        <span>⌕</span>

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search"
                            aria-label="Search kids shows"
                        />
                    </label>

                    <button
                        className="kids-switch-btn"
                        type="button"
                        onClick={switchProfiles}
                    >
                        Switch Profile
                    </button>

                </div>
            </header>

            <main className="kids-main">

                <section
                    className="kids-hero"
                    style={{
                        "--kids-hero-image": `url("${featured.poster}")`,
                    }}
                >
                    <div className="kids-hero-backdrop" />

                    <div className="kids-hero-content">

                        <div className="kids-feature-label">
                            <span className="kids-feature-mark">S</span>
                            STREAMHUB
                            <span className="kids-feature-dot">•</span>
                            KIDS
                        </div>

                        <p className="kids-hero-kicker">
                            FEATURED FOR YOU
                        </p>

                        <h1>{featured.title}</h1>

                        <div className="kids-hero-meta">
                            <strong>{featured.year}</strong>
                            <span>•</span>
                            <strong>{featured.rating}</strong>
                            <span>•</span>
                            <strong>{featured.type}</strong>
                            <span>•</span>
                            <strong>{featured.languages}</strong>
                        </div>

                        <p className="kids-hero-description">
                            {featured.description}
                        </p>

                        <p className="kids-hero-genres">
                            Kids
                            <span>|</span>
                            {featured.genre}
                            <span>|</span>
                            Adventure
                            <span>|</span>
                            Family
                        </p>

                        <div className="kids-hero-buttons">

                            <button
                                className="kids-watch-btn"
                                type="button"
                                onClick={() => onSelectTitle?.(featured)}
                            >
                                <span>▶</span>
                                View Details
                            </button>

                            <button
                                className="kids-add-btn"
                                type="button"
                                onClick={() => onSelectTitle?.(featured)}
                                aria-label="View featured title details"
                            >
                                ＋
                            </button>

                        </div>
                    </div>

                    <div className="kids-hero-thumbnails">

                        <span className="kids-thumb-label">
                            FEATURED
                        </span>

                        {kidsTitles.slice(0, 6).map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={
                                    featured.id === item.id ? "active" : ""
                                }
                                onClick={() => setFeatured(item)}
                                aria-label={`Feature ${item.title}`}
                            >
                                <img src={item.poster} alt="" />
                            </button>
                        ))}

                    </div>

                    <div className="kids-hero-bottom-fade" />
                </section>

                <section className="kids-content">

                    <div className="kids-age-toolbar">

                        <div>
                            <span className="kids-section-kicker">
                                MADE FOR EVERY LITTLE ADVENTURER
                            </span>

                            <h2>Explore Kids</h2>
                        </div>

                        <div className="kids-age-filters">

                            {ageGroups.map((age) => (
                                <button
                                    key={age}
                                    type="button"
                                    className={
                                        ageGroup === age ? "selected" : ""
                                    }
                                    onClick={() => setAgeGroup(age)}
                                >
                                    {age}
                                </button>
                            ))}

                        </div>
                    </div>

                    {search.trim() ? (

                        <section className="kids-row-section">

                            <div className="kids-row-heading">
                                <h2>Search results</h2>
                                <span>{filtered.length} titles</span>
                            </div>

                            <div className="kids-poster-row">
                                {filtered.map((item) => (
                                    <PosterCard
                                        key={item.id}
                                        item={item}
                                        onSelect={onSelectTitle}
                                    />
                                ))}
                            </div>

                            {!filtered.length && (
                                <p className="kids-no-results">
                                    No titles found. Try another search.
                                </p>
                            )}

                        </section>

                    ) : (

                        rows.map((row) => {
                            const items = row.items.filter(
                                (item) =>
                                    ageGroup === "All Ages" ||
                                    item.age === ageGroup
                            );

                            if (!items.length) return null;

                            return (
                                <section
                                    className="kids-row-section"
                                    key={row.title}
                                >

                                    <div className="kids-row-heading">
                                        <h2>{row.title}</h2>

                                        <button
                                            type="button"
                                            onClick={() => setAgeGroup("All Ages")}
                                        >
                                            Explore all <span>›</span>
                                        </button>
                                    </div>

                                    <div className="kids-poster-row">
                                        {items.map((item) => (
                                            <PosterCard
                                                key={item.id}
                                                item={item}
                                                onSelect={onSelectTitle}
                                            />
                                        ))}
                                    </div>

                                </section>
                            );
                        })

                    )}

                </section>
            </main>

            <footer className="kids-footer">
                <strong>STREAMHUB KIDS</strong>

                <span>
                    Big adventures for little imaginations.
                </span>

                <button
                    type="button"
                    onClick={switchProfiles}
                >
                    Back to profiles
                </button>
            </footer>

        </div>
    );
}
