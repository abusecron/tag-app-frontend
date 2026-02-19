import { useState, useEffect, useRef } from "react";

// const API = "http://localhost:8080";
const API = "https://krupadlux-movie-rec.hf.space";

const CLUSTER_NAMES = {
    0: 'Outlaws, Gunfire, and Redemption',
    1: 'Passionate Tales of Human Connection',
    2: 'Dark Comedic Visions of Life',
    3: 'Stylized Crime Action Spectacles',
    4: 'Transgressive Class Struggle Thrillers',
    5: 'Political Witness and Historical Reckoning',
    6: 'Psychological Horror and Dark Thrills',
    7: 'Profound Family Tragedies and Sorrows',
    8: 'Tender Romantic Comedies with Heart',
    9: 'Gritty Urban Crime Dramas',
    10: 'Psychological Horror and Dark Mysteries',
    11: 'Musical Comedy Escapades',
    12: "War's Tragic Human Cost",
    13: "Life's Profound Human Struggles",
    14: 'Witty Romance and Relationship Comedy',
    15: 'Stories of the Human Heart',
    16: 'Dark Crime Mysteries',
    17: 'Suspense-Driven Intrigue and High Stakes',
    18: 'Classic Comedy Masterpieces',
    19: 'Sci-Fi Action Spectacles',
    20: 'Spiritual Reckoning and Human Struggle',
    21: 'Profound Human Dramas and Visions',
    22: 'Passionate Queer Romance and Desire',
    23: 'Animated Wonder and Whimsy',
    24: 'Coming of Age Soul Journeys',
    25: 'Heroic Adventure Comedy Spectacles',
    26: "Humanity's Journey Through the Cosmos",
    27: 'Surreal Darkness and Twisted Minds',
    28: 'Mysteries of Dark Deception',
    29: 'Passion and Intimate Entanglements',
    30: 'Intimate Portraits of the Human Heart',
    31: 'Transgressive Crime and Moral Darkness',
    32: 'Luminous Lives of Musical Legends',
    33: 'Adrenaline-Fueled Crime & Action',
    34: 'Power, Corruption, and Conscience',
    35: 'Intimate Romantic Dramas',
    36: 'Surreal Dreams and Emotional Visions',
    37: 'Spiritual Reckoning and Divine Grace',
    38: 'Transgressive Desire and Moral Decay',
    39: 'Joyful Teen Comedy Adventures',
    40: 'Epic Visions of Human Conflict',
    41: 'Cinematic Crusades for Justice',
    42: 'Unflinching Portraits of Human Truth',
    43: 'Historical Dramas of Human Struggle',
    44: 'Adrenaline-Fueled Action Spectacles',
    45: 'Epic Superhero Battles',
    46: 'Heartfelt Stories of Human Connection',
    47: 'Musical Romance and Dreams',
    48: 'Inventive Comedy Through the Ages',
    49: 'Gritty Crime and Moral Descent',
    50: 'Gothic Psychological Horror Classics',
    51: 'Epic Fantasy Adventures in Motion',
    52: 'Heartfelt Chaos and Human Connection',
    53: 'Triumph Against the Odds',
    54: 'Gunslinger Legends and Outlaw Tales',
    55: 'Emotional Devastation and Human Connection',
    56: 'Musical Drama and Dance',
    57: 'Animated Enchantment and Musical Wonder',
    58: 'Intimate Dramas of Human Suffering',
    59: 'Epic Fantasy Adventures and Heroic Battles',
}

// ── genre colors ──────────────────────────────────────────────────────────────

const GENRE_PALETTE = {
  Horror:            "#e05c5c",
  Drama:             "#c4973a",
  Comedy:            "#4a9e72",
  "Science Fiction": "#4a8fc4",
  Thriller:          "#c4724a",
  Action:            "#c44a4a",
  Romance:           "#c46a8a",
  Documentary:       "#4a9ab0",
  Animation:         "#6aac6a",
  Adventure:         "#c4a04a",
  Crime:             "#8a5ec4",
  Mystery:           "#5e9ea0",
};

function genreColor(genres) {
  if (!genres) return "#999999";
  const first = genres.split(",")[0].trim();
  return GENRE_PALETTE[first] ?? "#999";
}

// ── styles ────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #f5f3ef;
    --surface: #ffffff;
    --border:  #e8e5e0;
    --text:    #1a1a1a;
    --muted:   #3b3a3a;
    --faint:   #353434;
    --sans:    'DM Sans', sans-serif;

  }

  html, body, #root {
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-up  { animation: fadeUp  .4s ease both; }
  .fade-in  { animation: fadeIn  .3s ease both; }

  .rate-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  @media (max-width: 860px) {
    .rate-grid   { grid-template-columns: repeat(3, 1fr); }
    .result-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 540px) {
    .rate-grid   { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .result-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }

  .search-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid #ccc;
    background: transparent;
    padding: 10px 0;
    font-family: var(--serif);
    font-size: 24px;
    font-style: italic;
    color: var(--text);
    outline: none;
    transition: border-color .2s;
  }
  .search-input:focus { border-bottom-color: var(--text); }
  .search-input::placeholder { color: #ccc; }

  .cta-btn {
    background: var(--text);
    color: var(--bg);
    border: none;
    padding: 11px 24px;
    border-radius: 6px;
    font-family: var(--sans);
    font-size: 12px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: opacity .2s;
  }
  .cta-btn:disabled {
    background: var(--border);
    color: var(--faint);
    cursor: not-allowed;
  }
  .cta-btn:not(:disabled):hover { opacity: 0.82; }

  .ghost-btn {
    background: transparent;
    border: 1px solid var(--border);
    padding: 7px 14px;
    border-radius: 5px;
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--muted);
    cursor: pointer;
    transition: all .15s;
  }
  .ghost-btn:hover { border-color: var(--text); color: var(--text); }
  .ghost-btn.active { border-color: var(--text); background: var(--text); color: var(--bg); }

  .mode-toggle {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 40px;
  }
  .mode-btn {
    padding: 9px 20px;
    font-family: var(--sans);
    font-size: 12px;
    letter-spacing: 0.04em;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all .15s;
  }
  .mode-btn.active { background: var(--text); color: var(--bg); }

  .vote-btn {
    flex: 1;
    padding: 7px 0;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: transparent;
    font-size: 14px;
    cursor: pointer;
    color: var(--faint);
    transition: all .15s;
  }
  .vote-btn:hover { border-color: #aaa; color: #aaa; }

  .section-rule {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--faint);
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .cluster-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 28px;
  }
  .cluster-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px 5px 8px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 11px;
    color: var(--text);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .cluster-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .cluster-count {
    font-size: 10px;
    color: var(--muted);
    margin-left: 1px;
  }
`;

// ── helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: "1.5px solid #ddd",
      borderTopColor: "#1a1a1a",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── Rate card ─────────────────────────────────────────────────────────────────

function RateCard({ film, vote, onVote, index }) {
  const color      = genreColor(film.genres);
  const isLiked    = vote === true;
  const isDisliked = vote === false;

  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${index * 60}ms`,
        background: "var(--surface)",
        border: `1px solid ${isLiked ? color : "var(--border)"}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "border-color .2s, opacity .2s",
        opacity: isDisliked ? 0.45 : 1,
      }}
    >
      <div style={{
        height: "clamp(130px, 22vw, 190px)",
        background: film.poster
          ? `url(${film.poster}) center/cover`
          : `linear-gradient(160deg, ${color}20, ${color}06)`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)",
        }} />
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#fff", background: color,
          padding: "2px 7px", borderRadius: 3,
          fontFamily: "var(--sans)",
        }}>
          {film.genres?.split(",")[0].trim()}
        </div>
      </div>

      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.3, marginBottom: 2 }}>
          {film.name}
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
          {film.year ? Math.round(film.year) : "—"}
          {film.director ? ` · ${film.director}` : ""}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="vote-btn" onClick={() => onVote(film.movie_id, true)} style={{
            borderColor: isLiked ? color : undefined,
            background:  isLiked ? `${color}12` : undefined,
            color:       isLiked ? color : undefined,
          }}>♥</button>
          <button className="vote-btn" onClick={() => onVote(film.movie_id, false)} style={{
            borderColor: isDisliked ? "#aaa" : undefined,
            background:  isDisliked ? "#f0f0f0" : undefined,
            color:       isDisliked ? "#aaa" : undefined,
          }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── Result card — full poster ─────────────────────────────────────────────────

function RequestButton({ movieId }) {
  const [status, setStatus] = useState(null); // null | 'loading' | 'requested' | 'already_requested' | 'error'

  const handleRequest = async (e) => {
    e.stopPropagation();
    setStatus('loading');
    try {
      const res  = await fetch(`${API}/request/${movieId}`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.status);
      // Reset after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const label = {
    loading:          '…',
    requested:        '✓ Requested',
    already_requested:'✓ Already Requested',
    error:            '✕ Failed',
  }[status] ?? '+ Request';

  const bg = {
    requested:        '#4a9e72',
    already_requested:'#c4973a',
    error:            '#c44a4a',
  }[status] ?? 'rgba(0,0,0,0.55)';

  return (
    <button
      onClick={handleRequest}
      disabled={status === 'loading'}
      style={{
        width: '100%',
        padding: '6px 0',
        border: 'none',
        borderRadius: 4,
        background: bg,
        backdropFilter: 'blur(4px)',
        color: '#fff',
        fontFamily: 'var(--sans)',
        fontSize: 10,
        letterSpacing: '0.08em',
        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        transition: 'background .2s',
      }}
    >
      {label}
    </button>
  );
}

function ResultCard({ film, index, vote, onVote, refineMode }) {
  const [hovered, setHovered] = useState(false);
  const color      = genreColor(film.genres);
  const isLiked    = vote === true;
  const isDisliked = vote === false;

  return (
    <div
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 40}ms`,
        background: "var(--surface)",
        border: `1px solid ${isLiked ? color : isDisliked ? "#ddd" : hovered ? "#ccc" : "var(--border)"}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "all .2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
        opacity: isDisliked ? 0.42 : 1,
      }}
    >
      {/* Full-height poster — 2:3 aspect ratio like a movie poster */}
      <div style={{
        aspectRatio: "2/3",
        background: film.poster
          ? `url(${film.poster}) center/cover`
          : `linear-gradient(160deg, ${color}25, ${color}08)`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)",
        }} />

        {/* Rank badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(230, 230, 230, 0.81)",
          borderRadius:4,
          padding: "2px 7px",
          fontSize: 10, letterSpacing: "0.1em",
          color: "rgb(0, 0, 0)",
          fontFamily: "var(--sans)",
        }}>#{index + 1}</div>
        {film.on_plex && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(229, 13, 45, 0.9)",
          backdropFilter: "blur(4px)",
          borderRadius: 4,
          padding: "2px 7px",
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 9, letterSpacing: "0.1em",fontWeight: 'bold',
          color: "#fff", fontFamily: "var(--sans)",
          textTransform: "uppercase",
            }}>
            KRUPI
            </div>
          )}

        {/* Genre chip */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#fff", background: color,
          padding: "2px 7px", borderRadius: 3,
          fontFamily: "var(--sans)",
        }}>
          {film.genres?.split(",")[0].trim()}
        </div>

        {/* Overlay text */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "12px 12px 10px",
        }}>
          <div style={{
            fontFamily: "var(--serif)", fontSize: 15,
            lineHeight: 1.25, color: "#fff", marginBottom: 2,
          }}>
            {film.name}
          </div>
          <div style={{
            fontSize: 10, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em", marginBottom: 8,
          }}>
            {film.year ?? "—"}
            {film.director ? ` · ${film.director}` : ""}
          </div>
          <div style={{
            height: 1, background: "rgba(255,255,255,0.15)",
            borderRadius: 1, overflow: "hidden", marginBottom: 3,
          }}>
            <div style={{
              height: "100%",
              width: `${(film.predicted_rating / 5) * 100}%`,
              background: color,
            }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
            {film.predicted_rating?.toFixed(2)} / 5.00
          </div>
        </div>
      </div>

      {/* Below poster */}
        <div style={{ padding: "8px 10px 10px" }}>
          {(film.cluster_names || (film.cluster_name ? [film.cluster_name] : [])).length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 4,
              marginBottom: refineMode || !film.on_plex ? 8 : 0,
            }}>
              {(film.cluster_names || [film.cluster_name]).map((name, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div style={{
                    fontSize: 8, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "var(--muted)", lineHeight: 1.4,
                  }}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!film.on_plex && (
            <div style={{ marginBottom: refineMode ? 8 : 0 }}>
              <RequestButton movieId={film.movie_id} />
            </div>
          )}

        {refineMode && (
          <div style={{ display: "flex", gap: 5 }}>
            <button className="vote-btn" onClick={() => onVote(film.movie_id, true)} style={{
              fontSize: 12, padding: "5px 0",
              borderColor: isLiked ? color : undefined,
              background:  isLiked ? `${color}12` : undefined,
              color:       isLiked ? color : undefined,
            }}>♥</button>
            <button className="vote-btn" onClick={() => onVote(film.movie_id, false)} style={{
              fontSize: 12, padding: "5px 0",
              borderColor: isDisliked ? "#aaa" : undefined,
              background:  isDisliked ? "#f0f0f0" : undefined,
              color:       isDisliked ? "#aaa" : undefined,
            }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cluster strip ─────────────────────────────────────────────────────────────

function ClusterModal({ name, color, onClose }) {
  const [films, setFilms]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Find cluster ID by name
  useEffect(() => {
    const entry = Object.entries(CLUSTER_NAMES).find(([, v]) => v === name);
    if (!entry) { setLoading(false); return; }
    const id = entry[0];
    fetch(`${API}/cluster/${id}?limit=40`)
      .then(r => r.json())
      .then(data => { setFilms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [name]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(245,243,239,0.92)",
        backdropFilter: "blur(6px)",
        overflowY: "auto",
        padding: "40px 20px 80px",
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 10 }}>
              Cluster
            </div>
            <h2 style={{
              fontFamily: "var(--serif)", fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 400, lineHeight: 1.1,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
              {name}
            </h2>
            {!loading && (
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, letterSpacing: "0.06em" }}>
                {films.length} films
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 5, padding: "7px 14px",
              fontFamily: "var(--sans)", fontSize: 12,
              color: "var(--muted)", cursor: "pointer",
              flexShrink: 0, marginTop: 4,
            }}
          >✕ Close</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 13 }}>
            <Spinner /> Loading films…
          </div>
        ) : (
          <div className="result-grid">
            {films.map((film, i) => (
              <ResultCard key={film.movie_id} film={film} index={i} vote={null} onVote={() => {}} refineMode={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClusterStrip({ recs }) {
  const [activeCluster, setActiveCluster] = useState(null);

  const counts = {};
  recs.forEach(f => {
    if (f.cluster_name) counts[f.cluster_name] = (counts[f.cluster_name] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!sorted.length) return null;

  const activeColor = activeCluster
    ? genreColor(recs.find(f => f.cluster_name === activeCluster)?.genres)
    : null;

  return (
    <>
      <div className="fade-in" style={{ marginBottom: 28 }}>
        <div className="section-rule">Your taste profile — click to explore</div>
        <div className="cluster-strip">
          {sorted.map(([name, count]) => {
            const film  = recs.find(f => f.cluster_name === name);
            const color = genreColor(film?.genres);
            return (
              <div
                key={name}
                className="cluster-pill"
                onClick={() => setActiveCluster(name)}
                style={{
                  cursor: "pointer",
                  borderColor: color + "55",
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${color}12`;
                  e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = `${color}55`;
                }}
              >
                <div className="cluster-dot" style={{ background: color }} />
                {name}
                <span className="cluster-count">×{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeCluster && (
        <ClusterModal
          name={activeCluster}
          color={activeColor}
          onClose={() => setActiveCluster(null)}
        />
      )}
    </>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ total, filled }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 2, borderRadius: 2,
          background: i < filled ? "var(--text)" : "var(--border)",
          transition: "background .25s",
        }} />
      ))}
    </div>
  );
}

// ── Search panel ──────────────────────────────────────────────────────────────

function SearchPanel({ onSelect }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounce.current);
    if (val.trim().length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/search?q=${encodeURIComponent(val.trim())}&limit=5`);
        const data = await res.json();
        setResults(data);
      } catch { setResults([]); }
      setLoading(false);
    }, 320);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 480, marginBottom: 48 }}>
      <div style={{ position: "relative" }}>
        <input
          className="search-input"
          value={query}
          onChange={handleChange}
          placeholder="Type a film you love…"
          autoFocus
        />
        {loading && (
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <Spinner />
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 6, letterSpacing: "0.03em" }}>
        We'll find films similar to your pick
      </div>

      {results.length > 0 && (
        <div style={{
          marginTop: 4,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8, overflow: "hidden",
          animation: "slideDown .2s ease",
        }}>
          {results.map((film, i) => {
            const color = genreColor(film.genres);
            return (
              <div
                key={film.movie_id}
                onClick={() => onSelect(film)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "background .12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8f6f3"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: 32, height: 46, borderRadius: 3,
                  overflow: "hidden", flexShrink: 0,
                  background: film.poster
                    ? `url(${film.poster}) center/cover`
                    : `${color}20`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--text)" }}>
                    {film.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.04em" }}>
                    {film.year ? Math.round(film.year) : "—"}
                    {film.director ? ` · ${film.director}` : ""}
                    {film.genres ? ` · ${film.genres.split(",")[0].trim()}` : ""}
                  </div>
                </div>
                <div style={{ color: "var(--faint)", fontSize: 18 }}>›</div>
              </div>
            );
          })}
        </div>
      )}

      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--faint)", fontStyle: "italic" }}>
          No films found for "{query}"
        </div>
      )}
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

export default function App() {
  const [stage,        setStage]        = useState("choose");
  const [mode,         setMode]         = useState("rate");
  const [films,        setFilms]        = useState([]);
  const [votes,        setVotes]        = useState({});
  const [recs,         setRecs]         = useState([]);
  const [resultVotes,  setResultVotes]  = useState({});
  const [refineMode,   setRefineMode]   = useState(false);
  const [seedRatings,  setSeedRatings]  = useState([]);
  const [shownIds,     setShownIds]     = useState([]);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const [error,        setError]        = useState(null);
  const prevStage = useRef(stage);

  useEffect(() => {
    if (mode === "rate") {
      setLoadingFilms(true);
      fetch(`${API}/initial-films`)
        .then(r => r.json())
        .then(data => { setFilms(data.slice(0, 5)); setLoadingFilms(false); })
        .catch(() => { setError("Couldn't load films. Is the backend running?"); setLoadingFilms(false); });
    }
  }, [mode]);

  const handleVote    = (id, liked) => setVotes(v => ({ ...v, [id]: liked }));
  const handleResVote = (id, liked) => setResultVotes(v => ({ ...v, [id]: liked }));

  const votedCount = Object.keys(votes).length;
  const allVoted   = films.length > 0 && votedCount === films.length;

  const fetchRecs = async (endpoint, body) => {
    prevStage.current = stage;
    setStage("loading");
    setError(null);
    try {
      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecs(data);
      setShownIds(prev => [...new Set([...prev, ...data.map(f => f.movie_id)])]);
      setResultVotes({});
      setRefineMode(false);
      setStage("results");
    } catch (e) {
      setError(e.message);
      setStage(prevStage.current);
    }
  };

  const handleSubmitRatings = () => {
    const ratings = Object.entries(votes).map(([movie_id, liked]) => ({ movie_id, liked }));
    setSeedRatings(ratings);
    fetchRecs("/recommend/new", { ratings, n: 12 });
  };

  const handleSearchSelect = (film) => {
    const ratings = [{ movie_id: film.movie_id, liked: true }];
    setSeedRatings(ratings);
    fetchRecs("/recommend/new", { ratings, n: 12 });
  };

  const handleRefine = () => {
    const result_votes = Object.entries(resultVotes).map(([movie_id, liked]) => ({ movie_id, liked }));
    if (!result_votes.length) return;
    fetchRecs("/recommend/refine", {
      seed_ratings: seedRatings,
      result_votes,
      shown_ids: shownIds,
      n: 12,
    });
  };

  const handleReset = () => {
    setStage("choose");
    setVotes({});
    setRecs([]);
    setResultVotes({});
    setRefineMode(false);
    setSeedRatings([]);
    setShownIds([]);
    setError(null);
  };

  const resultVoteCount = Object.keys(resultVotes).length;

  return (
    <>
      <style>{css}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* Header */}
        <header className="fade-up" style={{
          paddingTop: "clamp(40px, 8vw, 72px)",
          paddingBottom: "clamp(28px, 5vw, 48px)",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--faint)", marginBottom: 16,
          }}><img src = 'https://huggingface.co/spaces/krupadlux/movie-rec/resolve/main/logo.svg' width = "100"></img>
            Film Recommender
          </div>
          <h1 style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 400, lineHeight: 1.05,
            letterSpacing: "-0.5px", marginBottom: 12,
          }}>
            {stage === "results"
              ? <>Your <em>picks.</em></>
              : stage === "search"
              ? <>Find by <em>title.</em></>
              : <>Tell us your<br /><em>taste.</em></>}
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, maxWidth: 400 }}>
            {stage === "results"
              ? "Vote on results to refine your recommendations."
              : stage === "search"
              ? "Type a film you love and we'll find what to watch next."
              : "Rate five films or search by title — we'll take it from there."}
          </p>
        </header>

        {error && (
          <div style={{ fontSize: 12, color: "#c44a4a", marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Choose mode */}
        {stage === "choose" && (
          <div className="fade-in">
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === "rate" ? "active" : ""}`} onClick={() => setMode("rate")}>
                Rate 5 Films
              </button>
              <button className={`mode-btn ${mode === "search" ? "active" : ""}`} onClick={() => setMode("search")}>
                Search by Title
              </button>
            </div>
            <div>
              <button className="cta-btn" onClick={() => setStage(mode === "rate" ? "rating" : "search")}>
                {mode === "rate" ? "Start rating →" : "Search films →"}
              </button>
            </div>
          </div>
        )}

        {/* Rating stage */}
        {stage === "rating" && (
          <>
            {loadingFilms ? (
              <div style={{ display: "flex", padding: "40px 0" }}><Spinner /></div>
            ) : (
              <>
                <ProgressBar total={films.length} filled={votedCount} />
                <div className="rate-grid">
                  {films.map((film, i) => (
                    <RateCard key={film.movie_id} film={film} vote={votes[film.movie_id] ?? null} onVote={handleVote} index={i} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button className="cta-btn" onClick={handleSubmitRatings} disabled={!allVoted}>
                    {allVoted ? "Get recommendations →" : `Rate all ${films.length} to continue`}
                  </button>
                  {votedCount > 0 && (
                    <span style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "0.06em" }}>
                      {votedCount} / {films.length}
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Search stage */}
        {stage === "search" && <SearchPanel onSelect={handleSearchSelect} />}

        {/* Loading */}
        {stage === "loading" && (
          <div className="fade-in" style={{
            display: "flex", alignItems: "center", gap: 14,
            paddingTop: 60, color: "var(--muted)", fontSize: 13,
          }}>
            <Spinner />
            Finding your films…
          </div>
        )}

        {/* Results */}
        {stage === "results" && recs.length > 0 && (
          <>
            <ClusterStrip recs={recs} />

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16, flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)" }}>
                {recs.length} recommendations
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`ghost-btn ${refineMode ? "active" : ""}`} onClick={() => setRefineMode(r => !r)}>
                  {refineMode ? "✓ Voting" : "✦ Refine"}
                </button>
                {refineMode && resultVoteCount > 0 && (
                  <button className="cta-btn" onClick={handleRefine} style={{ padding: "7px 16px", fontSize: 11 }}>
                    Update ({resultVoteCount}) →
                  </button>
                )}
                <button className="ghost-btn" onClick={handleReset}>↺ Start over</button>
              </div>
            </div>

            {refineMode && (
              <div className="fade-in" style={{
                fontSize: 11, color: "var(--faint)",
                marginBottom: 16, letterSpacing: "0.03em",
              }}>
                ♥ like what appeals · ✕ dismiss what doesn't · then hit Update
              </div>
            )}

            <div className="result-grid">
              {recs.map((film, i) => (
                <ResultCard
                  key={film.movie_id + i}
                  film={film} index={i}
                  vote={resultVotes[film.movie_id] ?? null}
                  onVote={handleResVote}
                  refineMode={refineMode}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </>
  );
}