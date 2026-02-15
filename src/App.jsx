import { useState, useEffect, useRef } from "react";

// const API = "http://localhost:8000";
const API = "https://krupadlux-movie-rec.hf.space";

// ── tiny helpers ──────────────────────────────────────────────────────────────

const GENRE_PALETTE = {
  Horror:           "#ff4d6d",
  Drama:            "#f6bd60",
  Comedy:           "#52b788",
  "Science Fiction":"#48cae4",
  Thriller:         "#f4845f",
  Action:           "#e63946",
  Romance:          "#ff85a1",
  Documentary:      "#90e0ef",
  Animation:        "#b7e4c7",
  Adventure:        "#ffd166",
  Crime:            "#c77dff",
  Mystery:          "#a8dadc",
};

function genreColor(genres) {
  if (!genres) return "#666";
  const first = genres.split(",")[0].trim();
  return GENRE_PALETTE[first] ?? "#888";
}

// ── styles ────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne+Mono&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #383838;
    --surface: #4c4c4c;
    --border:  rgba(255,255,255,0.07);
    --text:    #ede8e0;
    --muted:   #000000;
    --accent:  #e63946;
    --mono:    'Syne Mono', monospace;
    --serif:   'Cormorant Garamond', serif;
    --sans:    'Syne', sans-serif;
  }

  html, body, #root {
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #222; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%,100% { opacity:.3; transform:scale(.8); }
    50%     { opacity:1;  transform:scale(1.2); }
  }
  @keyframes slideRight {
    from { transform: translateX(-8px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  .fade-up   { animation: fadeUp   .5s ease both; }
  .fade-in   { animation: fadeIn   .4s ease both; }
  .scale-in  { animation: scaleIn  .35s ease both; }

  /* ── responsive grids ── */
  .rate-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 40px;
  }
  .result-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  /* tablet */
  @media (max-width: 768px) {
    .rate-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .result-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
  }

  /* mobile */
  @media (max-width: 480px) {
    .rate-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .result-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }

  /* button full width on mobile */
  @media (max-width: 480px) {
    .cta-btn { width: 100%; }
  }
`;

// ── components ────────────────────────────────────────────────────────────────

function Grain() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.045'/%3E%3C/svg%3E")`,
    }} />
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20,
      border: "2px solid rgba(255,255,255,0.1)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
    }} />
  );
}

// One film card in the rating step
function RateCard({ film, vote, onVote, index }) {
  const color = genreColor(film.genres);
  const isLiked    = vote === true;
  const isDisliked = vote === false;
  const voted      = vote !== null;

  return (
    <div
      className="scale-in"
      style={{
        animationDelay: `${index * 80}ms`,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${voted ? color + "55" : "var(--border)"}`,
        background: voted ? `${color}08` : "var(--surface)",
        transition: "border-color .25s, background .25s, transform .2s",
        transform: voted ? "scale(0.98)" : "scale(1)",
      }}
    >
      {/* Poster */}
      <div style={{
        height: "clamp(160px, 30vw, 220px)",
        background: film.poster
          ? `url(${film.poster}) center/cover`
          : `linear-gradient(135deg, ${color}22, #0a0a0a)`,
        position: "relative",
        flexShrink: 0,
      }}>
        {/* overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(8,8,8,.95) 0%, rgba(8,8,8,.1) 50%, transparent 100%)",
        }} />
        {/* genre chip */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)",
          borderRadius: 4, padding: "3px 8px",
          fontFamily: "var(--mono)", fontSize: 9,
          color: color, letterSpacing: 1.5,
          textTransform: "uppercase",
        }}>
          {film.genres?.split(",")[0].trim()}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          fontFamily: "var(--serif)", fontWeight: 600, fontSize: 18,
          lineHeight: 1.2, color: "var(--text)", marginBottom: 4,
        }}>
          {film.name}
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)",
          letterSpacing: 1, marginBottom: 14,
        }}>
          {film.year ? Math.round(film.year) : "—"}
          {film.director ? ` · ${film.director}` : ""}
        </div>

        {/* Like / Dislike buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          <button
            onClick={() => onVote(film.movie_id, true)}
            style={{
              flex: 1, padding: "9px 0",
              borderRadius: 7,
              border: `1px solid ${isLiked ? "#52b788" : "rgba(255,255,255,0.1)"}`,
              background: isLiked ? "#52b78822" : "transparent",
              color: isLiked ? "#52b788" : "#555",
              fontFamily: "var(--mono)", fontSize: 16,
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            ♥
          </button>
          <button
            onClick={() => onVote(film.movie_id, false)}
            style={{
              flex: 1, padding: "9px 0",
              borderRadius: 7,
              border: `1px solid ${isDisliked ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
              background: isDisliked ? "#e6394622" : "transparent",
              color: isDisliked ? "var(--accent)" : "#555",
              fontFamily: "var(--mono)", fontSize: 16,
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// One film card in the results step
function ResultCard({ film, index }) {
  const [hovered, setHovered] = useState(false);
  const color = genreColor(film.genres);

  return (
    <div
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 55}ms`,
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${hovered ? color + "55" : "var(--border)"}`,
        background: hovered ? `${color}08` : "var(--surface)",
        transition: "all .25s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 48px ${color}18` : "none",
      }}
    >
      <div style={{
        height: "clamp(140px, 28vw, 200px)",
        background: film.poster
          ? `url(${film.poster}) center/cover`
          : `linear-gradient(135deg, ${color}22, #0a0a0a)`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(8,8,8,.95) 0%, rgba(8,8,8,.1) 50%, transparent 100%)",
        }} />
        {/* rank */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)",
          borderRadius: 5, padding: "2px 8px",
          fontFamily: "var(--mono)", fontSize: 10,
          color: color, letterSpacing: 1,
        }}>
          #{index + 1}
        </div>
        {/* genre */}
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: `${color}18`, border: `1px solid ${color}44`,
          borderRadius: 20, padding: "3px 10px",
          fontFamily: "var(--mono)", fontSize: 9,
          color: color, letterSpacing: 1,
          textTransform: "uppercase",
        }}>
          {film.genres?.split(",")[0].trim()}
        </div>
      </div>

      <div style={{ padding: "12px 14px 16px" }}>
        <div style={{
          fontFamily: "var(--serif)", fontWeight: 600, fontSize: 17,
          lineHeight: 1.2, color: "var(--text)", marginBottom: 3,
        }}>
          {film.name}
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)",
          letterSpacing: 1, marginBottom: 10,
        }}>
          {film.year ?? "—"}
          {film.director ? ` · ${film.director}` : ""}
          {film.cluster_name && (
        <div style={{
          display: "inline-block",
          background: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: 20,
          padding: "3px 10px",
          fontFamily: "var(--mono)",
          fontSize: 9,
          color: color,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          {film.cluster_name}
        </div>
      )}
        </div>
        {/* score bar */}
        <div style={{
          height: 2, background: "rgba(255,255,255,0.06)",
          borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${(film.predicted_rating / 5) * 100}%`,
            background: color, borderRadius: 2,
            transition: "width .6s ease",
          }} />
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: color,
          marginTop: 5, letterSpacing: 0.5,
        }}>
          {film.predicted_rating.toFixed(2)} / 5.00
        </div>
      </div>
    </div>
  );
}

// Progress dots
function ProgressDots({ total, filled }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < filled ? 20 : 6, height: 6,
          borderRadius: 3,
          background: i < filled ? "var(--accent)" : "rgba(255,255,255,0.12)",
          transition: "all .3s ease",
        }} />
      ))}
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────

export default function App() {
  // "rating" | "loading" | "results"
  const [stage, setStage]       = useState("rating");
  const [films, setFilms]       = useState([]);
  const [votes, setVotes]       = useState({});   // { movie_id: true/false }
  const [recs, setRecs]         = useState([]);
  const [loadingFilms, setLoadingFilms] = useState(true);
  const [error, setError]       = useState(null);

  // Fetch initial films on mount
  useEffect(() => {
    fetch(`${API}/initial-films`)
      .then(r => r.json())
      .then(data => { setFilms(data.slice(0, 5)); setLoadingFilms(false); })
      .catch(() => { setError("Couldn't load films. Is the backend running?"); setLoadingFilms(false); });
  }, []);

  const handleVote = (movieId, liked) => {
    setVotes(v => ({ ...v, [movieId]: liked }));
  };

  const votedCount  = Object.keys(votes).length;
  const allVoted    = films.length > 0 && votedCount === films.length;

  const handleSubmit = async () => {
    setStage("loading");
    try {
      const payload = {
        ratings: Object.entries(votes).map(([movie_id, liked]) => ({ movie_id, liked })),
        n: 12,
      };
      const res  = await fetch(`${API}/recommend/new`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecs(data);
      setStage("results");
    } catch (e) {
      setError(e.message);
      setStage("rating");
    }
  };

  const handleRetry = () => {
    setVotes({});
    setRecs([]);
    setStage("rating");
  };

  // ── render ──

  return (
    <>
      <style>{css}</style>
      <Grain />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* ── Header ── */}
        <header className="fade-up" style={{
          paddingTop: "clamp(32px, 8vw, 64px)",
          paddingBottom: "clamp(24px, 5vw, 48px)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 10,
            color: "var(--accent)", letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 18,
            animation: "slideRight .5s ease both",
          }}>
            Film Recommender
          </div>
          <h1 style={{
            // fontFamily: "var(--serif)",
            fontSize: "clamp(44px, 7vw, 88px)",
            fontWeight: 300, lineHeight: 1,
            letterSpacing: "-1px", color: "var(--text)",
            marginBottom: 12,
          }}>
            {stage === "results" ? (
              <>Your <em style={{color: "var(--accent)" }}>picks</em></>
            ) : (
              <>Tell us your<br /><em>taste.</em></>
            )}
          </h1>

          {stage === "rating" && (
            <p style={{
              color: "var(--muted)", fontSize: 16, fontWeight: 400,
              maxWidth: 540, margin: "0 auto", lineHeight: 1.7,
              animationDelay: ".1s",
            }}>
              Rate these five films and we'll find what you should watch next.
            </p>
          )}
        </header>

        {/* ── Error ── */}
        {error && (
          <div style={{
            textAlign: "center", color: "var(--accent)",
            fontFamily: "var(--mono)", fontSize: 12,
            marginBottom: 32, lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* ── Loading initial films ── */}
        {loadingFilms && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <Spinner />
          </div>
        )}

        {/* ── Rating stage ── */}
        {stage === "rating" && !loadingFilms && films.length > 0 && (
          <>
            {/* Progress */}
            <div className="fade-in" style={{ marginBottom: 36, animationDelay: ".2s" }}>
              <ProgressDots total={films.length} filled={votedCount} />
              <div style={{
                textAlign: "center", marginTop: 10,
                fontFamily: "var(--mono)", fontSize: 10,
                color: "var(--muted)", letterSpacing: 1,
              }}>
                {votedCount} / {films.length} RATED
              </div>
            </div>

            {/* Cards grid */}
            <div className="rate-grid">
              {films.map((film, i) => (
                <RateCard
                  key={film.movie_id}
                  film={film}
                  vote={votes[film.movie_id] ?? null}
                  onVote={handleVote}
                  index={i}
                />
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleSubmit}
                disabled={!allVoted}
                className="cta-btn"
                style={{
                  background: allVoted ? "var(--accent)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${allVoted ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 8, padding: "13px 36px",
                  color: allVoted ? "#fff" : "var(--muted)",
                  fontSize: 12,
                  letterSpacing: 2, textTransform: "uppercase",
                  cursor: allVoted ? "pointer" : "not-allowed",
                  transition: "all .25s",
                  transform: allVoted ? "scale(1)" : "scale(.98)",
                }}
              >
                {allVoted ? "Get Recommendations →" : `Rate all ${films.length} films to continue`}
              </button>
            </div>
          </>
        )}

        {/* ── Loading recommendations ── */}
        {stage === "loading" && (
          <div className="fade-in" style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 20, paddingTop: 80,
          }}>
            <Spinner />
            <div style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: "var(--muted)", letterSpacing: 2,
              textTransform: "uppercase",
            }}>
              Finding your films…
            </div>
          </div>
        )}

        {/* ── Results stage ── */}
        {stage === "results" && recs.length > 0 && (
          <>
            <div className="fade-in" style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 28,
            }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 10,
                color: "var(--muted)", letterSpacing: 2,
              }}>
                {recs.length} RECOMMENDATIONS
              </div>
              <button
                onClick={handleRetry}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 6, padding: "6px 14px",
                  color: "var(--muted)", fontFamily: "var(--mono)",
                  fontSize: 10, letterSpacing: 1.5,
                  textTransform: "uppercase", cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--muted)"; }}
              >
                ↺ Start over
              </button>
            </div>

            <div className="result-grid">
              {recs.map((film, i) => (
                <ResultCard key={film.movie_id + i} film={film} index={i} />
              ))}
            </div>
          </>
        )}

      </div>
    </>
  );
}
