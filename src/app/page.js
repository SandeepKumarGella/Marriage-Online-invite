"use client";

import { useState, useEffect, useRef } from "react";

import ScratchRevealModal from "@/components/ScratchRevealModal";

// ─── SVG Wheel Math Helpers ──────────────────────────────────────
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function getSlicePath(cx, cy, r, startDeg, endDeg) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`;
}

// ─── Animated Letter Name Component ─────────────────────────────
// Each character mounts as its own span, triggering letter-rise CSS animation
function AnimatedName({ name, className, delayBase = 0 }) {
  return (
    <span className={className}>
      {name.split("").map((char, i) => (
        <span
          key={i}
          className="letter-span"
          style={{ animationDelay: `${delayBase + i * 70}ms` }}
          aria-hidden={char === " " ? "true" : undefined}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// ─── Ribbon Divider ──────────────────────────────────────────────
function RibbonDivider() {
  return (
    <div className="ribbon-divider">
      <span className="ribbon-divider-icon">✦ ✦ ✦</span>
    </div>
  );
}

// ─── Mandala SVG Watermark ───────────────────────────────────────
function MandalaSVG() {
  const spokes = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const petals8 = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      className="mandala-svg"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {[190, 150, 110, 70, 30].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="0.6" />
      ))}
      {spokes.map((angle) => {
        const inner = polarToCartesian(200, 200, 30, angle);
        const outer = polarToCartesian(200, 200, 190, angle);
        return (
          <line
            key={angle}
            x1={inner.x.toFixed(1)} y1={inner.y.toFixed(1)}
            x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)}
            stroke="currentColor" strokeWidth="0.5"
          />
        );
      })}
      {petals8.map((angle) => {
        const p = polarToCartesian(200, 200, 160, angle);
        return <circle key={`a${angle}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="7" stroke="currentColor" strokeWidth="0.5" />;
      })}
      {petals8.map((angle) => {
        const p = polarToCartesian(200, 200, 120, angle);
        return <circle key={`b${angle}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" stroke="currentColor" strokeWidth="0.5" />;
      })}
      {petals8.map((angle) => {
        const p = polarToCartesian(200, 200, 80, angle);
        return <circle key={`c${angle}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" stroke="currentColor" strokeWidth="0.5" />;
      })}
    </svg>
  );
}

// ─── Timeline Events Data ─────────────────────────────────────────
const TIMELINE_EVENTS = [
  {
    emoji: "🤵",
    title: "Pellikoduku Ceremony",
    date: "17 August 2026",
    time: "8:30 AM",
    venue: "Thantikonda",
    scratchImage: "/event_pellikoduku.png",
  },
  {
    emoji: "👰",
    title: "Pellikuthuru Ceremony",
    date: "17 August 2026",
    time: "8:45 AM",
    venue: "Gokavaram",
    scratchImage: "/event_pellikuthuru.png",
  },
  {
    emoji: "💛",
    title: "Haldi Ceremony",
    date: "21 August 2026",
    time: "10:00 AM",
    venue: "Gokavaram",
    scratchImage: "/event_haldi.png",
  },
  {
    emoji: "🌿",
    title: "Mehendi",
    date: "21 August 2026",
    time: "5:00 PM",
    venue: "Gokavaram",
    scratchImage: "/event_mehndi.png",
  },
  {
    emoji: "💍",
    title: "Wedding Ceremony",
    date: "22 August 2026",
    time: "Muhurtham: 3:46 AM",
    venue: "Sree Gopi Krishna Gardens, Gokavaram",
    highlight: true,
    scratchImage: "/event_wedding.png",
  },
  {
    emoji: "🎉",
    title: "Reception & Dinner",
    date: "22 August 2026",
    time: "7:00 PM",
    venue: "Sree Gopi Krishna Gardens, Gokavaram",
    note: "Followed by: Dinner at the venue",
  },
];

// ─── Wheel Constants ───────────────────────────────────────────────
const WHEEL_SECTORS = [
  "Who orders dinner tonight 🍕",
  "TV Remote custody 📺",
  "Spontaneous trip planner ✈️",
  "Laundry Supervisor 🧺",
  "Morning tea maker ☕",
  "Who says sorry first 🤫",
];

const WHEEL_LABELS_SHORT = [
  { emoji: "🍕", text: "Dinner" },
  { emoji: "📺", text: "TV Remote" },
  { emoji: "✈️", text: "Holiday" },
  { emoji: "🧺", text: "Laundry" },
  { emoji: "☕", text: "Tea Maker" },
  { emoji: "🤫", text: "Says Sorry" },
];

const WHEEL_COLORS = [
  { bg: "#6B1D2F", text: "#F1E5C6" },
  { bg: "#F1E5C6", text: "#6B1D2F" },
  { bg: "#8E2B41", text: "#F1E5C6" },
  { bg: "#D4AF37", text: "#4F1120" },
  { bg: "#4F1120", text: "#F1E5C6" },
  { bg: "#C5A028", text: "#FDFBF7" },
];

const BLESSINGS = [
  "May your love grow stronger with each passing day! 🌸",
  "Wishing you a lifetime of laughter, joy, and endless patience! 💕",
  "May your home be filled with love, warm cups of tea, and happy memories! ☕",
  "Here's to a lifetime of shared dreams and beautiful adventures together! ✈️",
  "May your journey together be paved with trust, understanding, and sweet compromises! ✨",
  "May the years ahead be filled with lasting joy and love that knows no bounds! 🥂",
];

// ─── Main Component ───────────────────────────────────────────────
export default function Home() {

  // State
  const [overlayFaded, setOverlayFaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [petals, setPetals] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [statusMsg, setStatusMsg] = useState("");

  // Scratch Modal
  const [scratchModal, setScratchModal] = useState({
    isOpen: false,
    title: "",
    image: "",
    overlayText: "",
  });

  // Fun Corner
  const [funStep, setFunStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [argumentWinner, setArgumentWinner] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);
  const [generatedBlessing, setGeneratedBlessing] = useState("");
  const [copiedBlessing, setCopiedBlessing] = useState(false);

  const playerRef = useRef(null);
  const funTimersRef = useRef([]);

  const scheduleFunTimer = (fn, delay) => {
    const id = setTimeout(() => {
      funTimersRef.current = funTimersRef.current.filter((timerId) => timerId !== id);
      fn();
    }, delay);
    funTimersRef.current.push(id);
    return id;
  };

  const clearFunTimers = () => {
    funTimersRef.current.forEach(clearTimeout);
    funTimersRef.current = [];
  };

  // ── Effects ──────────────────────────────────────────────────────

  // Scroll to top & disable scroll restoration on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    return () => clearFunTimers();
  }, []);

  // YouTube background music player
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.getElementsByTagName("script")[0].parentNode.insertBefore(
        tag,
        document.getElementsByTagName("script")[0]
      );
    }

    window.onYouTubeIframeAPIReady = () => initPlayer();
    if (window.YT && window.YT.Player) initPlayer();

    function initPlayer() {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: "DYcBV9OoAag",
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: "DYcBV9OoAag",
          controls: 0,
          showinfo: 0,
          rel: 0,
          enablejsapi: 1,
          start: 5,
          mute: 1,
        },
        events: {
          onReady: (event) => {
            const overlayEl = document.getElementById("welcome-overlay");
            if (overlayEl?.classList.contains("fade-out")) {
              event.target.unMute();
              event.target.playVideo();
              setIsPlaying(true);
            } else {
              event.target.mute();
              event.target.playVideo();
              setIsPlaying(false);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(!(event.target.isMuted && event.target.isMuted()));
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          },
        },
      });
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Falling petals generator
  useEffect(() => {
    const maxPetals = 25;
    let activeCount = 0;
    let idCounter = 0;

    const createPetal = () => {
      if (activeCount >= maxPetals) return;
      const size = Math.random() * 8 + 5;
      const startLeft = Math.random() * 100;
      const duration = Math.random() * 7 + 6;
      const delay = Math.random() * 4;
      const opacity = Math.random() * 0.4 + 0.2;
      const isOval = Math.random() > 0.5;

      const petal = {
        id: idCounter++,
        width: `${size}px`,
        height: `${size * 1.5}px`,
        left: `${startLeft}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
        borderRadius: isOval ? "100% 0 100% 0" : undefined,
      };

      setPetals((prev) => [...prev, petal]);
      activeCount++;
      setTimeout(() => {
        setPetals((prev) => prev.filter((p) => p.id !== petal.id));
        activeCount--;
      }, (duration + delay) * 1000);
    };

    for (let i = 0; i < 12; i++) createPetal();
    const interval = setInterval(createPetal, 600);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer — target: 22 Aug 2026 03:46 AM (local time)
  useEffect(() => {
    const targetDate = new Date("Aug 22, 2026 03:46:00").getTime();

    const updateTimer = () => {
      const distance = targetDate - Date.now();
      if (distance < 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        setStatusMsg("🌸 The Wait Is Over — Welcome to Our Wedding! 🌸");
        return;
      }
      setTimeLeft({
        days:    String(Math.floor(distance / 86400000)).padStart(2, "0"),
        hours:   String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0"),
        minutes: String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0"),
        seconds: String(Math.floor((distance % 60000) / 1000)).padStart(2, "0"),
      });
      setStatusMsg("Countdown to the auspicious moment...");
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for scroll-reveal elements
  // Re-runs when overlay fades so elements already in viewport get captured
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [overlayFaded]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleOpenInvitation = (e) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    setOverlayFaded(true);

    if (playerRef.current?.unMute) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleMusicToggle = (e) => {
    e.stopPropagation();
    if (!playerRef.current?.playVideo) return;

    if (isPlaying) {
      if (playerRef.current.isMuted?.()) {
        playerRef.current.unMute();
        setIsPlaying(true);
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    } else {
      playerRef.current.unMute?.();
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = "Wedding Invitation: Siva Rajesh & Suchitra";
    const text =
      "You are cordially invited to join us for our wedding celebration on 22 August 2026. View the full details here:";

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(console.error);
    } else {
      navigator.clipboard
        .writeText(`${text} ${url}`)
        .then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 10000);
        })
        .catch(() => alert(`Copy & Share: ${url}`));
    }
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    scheduleFunTimer(() => setFunStep(2), 6000);
  };

  const handleSelectWinner = (winner) => {
    setArgumentWinner(winner);
    scheduleFunTimer(() => setFunStep(3), 6000);
  };

  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sectorMid = randomIndex * 60 + 30;
    const base = wheelRotation - (wheelRotation % 360);
    setWheelRotation(base + 5 * 360 - sectorMid);

    scheduleFunTimer(() => {
      setWheelSpinning(false);
      setWheelResult(WHEEL_SECTORS[randomIndex]);
    }, 4000);
  };

  const handleGenerateBlessing = () => {
    setGeneratedBlessing(BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]);
  };

  const handleCopyBlessing = () => {
    if (!generatedBlessing) return;
    navigator.clipboard
      .writeText(generatedBlessing)
      .then(() => {
        setCopiedBlessing(true);
        setTimeout(() => setCopiedBlessing(false), 2000);
      })
      .catch(console.error);
  };

  const handleResetFun = () => {
    clearFunTimers();
    setFunStep(1);
    setSelectedTeam(null);
    setArgumentWinner(null);
    setWheelRotation(0);
    setWheelSpinning(false);
    setWheelResult(null);
    setGeneratedBlessing("");
    setCopiedBlessing(false);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════
          WELCOME OVERLAY — Cinematic Dark Splash
          ════════════════════════════════════════════ */}
      <div
        id="welcome-overlay"
        className={`welcome-overlay ${overlayFaded ? "fade-out" : ""}`}
        style={overlayFaded ? { pointerEvents: "none" } : undefined}
        aria-modal="true"
        role="dialog"
        aria-label="Wedding Invitation Welcome Screen"
      >
        {/* Rotating mandala watermark */}
        <div className="mandala-bg" aria-hidden="true">
          <MandalaSVG />
        </div>

        {/* Ambient bokeh */}
        <div className="bokeh-orb welcome-orb-1" aria-hidden="true" />
        <div className="bokeh-orb welcome-orb-2" aria-hidden="true" />
        <div className="bokeh-orb welcome-orb-3" aria-hidden="true" />

        {/* Glassmorphic card */}
        <div className="welcome-glass-card">
          <div className="welcome-om" aria-label="Om symbol">ॐ</div>

          <h1 className="welcome-names">
            <AnimatedName name="Siva Rajesh" className="name-groom-light" delayBase={500} />
            <span className="heart-icon" style={{ fontSize: "1.1rem" }} aria-hidden="true">❤</span>
            <AnimatedName name="Suchitra" className="name-bride-light" delayBase={1200} />
          </h1>

          <p className="welcome-subtitle">
            Invite you to share in their joy and wedding celebration
          </p>

          <RibbonDivider />

          <button
            id="btn-open-invitation"
            className="open-invite-btn gold-shimmer-btn"
            onClick={handleOpenInvitation}
            aria-label="Open Wedding Invitation"
          >
            <span>OPEN INVITATION</span>
            <span className="music-note-indicator" aria-hidden="true">🎵</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FALLING PETALS
          ════════════════════════════════════════════ */}
      <div id="leaves-container" aria-hidden="true">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="petal"
            style={{
              width: petal.width,
              height: petal.height,
              left: petal.left,
              animationDuration: petal.animationDuration,
              animationDelay: petal.animationDelay,
              opacity: petal.opacity,
              borderRadius: petal.borderRadius,
            }}
          />
        ))}
      </div>

      {/* ════════════════════════════════════════════
          MAIN WRAPPER
          ════════════════════════════════════════════ */}
      <div className="invite-wrapper">

        {/* ── SECTION 1: Hero ──────────────────────── */}
        <header
          className={`hero-section ${overlayFaded ? "hero-animate" : ""}`}
          id="section-hero"
        >
          {/* Bokeh layer */}
          <div className="hero-bokeh" aria-hidden="true">
            <div className="bokeh-orb hero-orb-1" />
            <div className="bokeh-orb hero-orb-2" />
            <div className="bokeh-orb hero-orb-3" />
          </div>

          {/* OM symbol */}
          <div
            className="hero-el hero-om"
            id="hero-om-symbol"
            style={{ animationDelay: "0.1s" }}
            aria-label="Om symbol"
          >ॐ</div>

          {/* Telugu Ganesh invocation */}
          <div
            className="hero-el telugu-text blessing-title"
            id="hero-telugu-ganesha"
            style={{ animationDelay: "0.26s" }}
          >
            శ్రీ గణేశాయ నమః
          </div>

          {/* Vakratunda shloka */}
          <div
            className="hero-el shloka-container"
            id="hero-shloka"
            style={{ animationDelay: "0.44s" }}
          >
            <p>వక్రతుండ మహాకాయ</p>
            <p>సూర్యకోటి సమప్రభ |</p>
            <p>నిర్విఘ్నం కరుమే దేవ</p>
            <p>సర్వకార్యేషు సర్వదా ||</p>
          </div>

          {/* Ribbon */}
          <div className="hero-el" style={{ animationDelay: "0.62s" }}>
            <RibbonDivider />
          </div>

          {/* Tagline */}
          <p
            className="hero-el tagline-english"
            id="hero-tagline"
            style={{ animationDelay: "0.74s" }}
          >
            Two Hearts, One Journey
          </p>

          {/* Couple names — letter-animated after overlay fades */}
          <h1 className="couple-names" id="hero-couple-names">
            {overlayFaded ? (
              <>
                <AnimatedName name="Siva Rajesh" className="name-groom" delayBase={950} />
                <span
                  className="heart-icon"
                  style={{ fontSize: "1.4rem", animationDelay: "1.6s", opacity: 0, animation: "letter-rise 0.52s 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
                  aria-hidden="true"
                >❤</span>
                <AnimatedName name="Suchitra" className="name-bride" delayBase={1680} />
              </>
            ) : (
              // Hidden until overlay fades to prevent flash
              <>
                <span className="name-groom" style={{ opacity: 0 }}>Siva Rajesh</span>
                <span className="heart-icon" style={{ opacity: 0 }}>❤</span>
                <span className="name-bride" style={{ opacity: 0 }}>Suchitra</span>
              </>
            )}
          </h1>

          {/* Date & Muhurtham bar */}
          <div
            className="hero-el hero-details"
            id="hero-date-venue-quick"
            style={{ animationDelay: "1.0s" }}
          >
            <div className="detail-item">
              <span className="label">WEDDING DATE</span>
              <span className="value">22 August 2026</span>
            </div>
            <div className="detail-item">
              <span className="label">MUHURTHAM</span>
              <span className="value">3:46 AM</span>
            </div>
          </div>

          {/* Venue */}
          <div
            className="hero-el hero-venue-summary"
            style={{ animationDelay: "1.16s" }}
          >
            <span className="label">VENUE</span>
            <span className="value-venue">Sree Gopi Krishna Gardens, Gokavaram</span>
          </div>
        </header>

        {/* ── SECTION 2: Couple Portrait ───────────── */}
        <section className="portrait-section" id="section-portrait">
          <div
            className="portrait-frame-container reveal-on-scroll"
            id="portrait-frame"
          >
            <div className="portrait-oval-border">
              <img
                src="/couple1.png"
                alt="Siva Rajesh and Suchitra — Illustrated portrait"
                className="couple-portrait-img"
                id="couple-portrait-img"
              />
            </div>
          </div>

          <div className="reception-card reveal-on-scroll" id="portrait-reception-info">
            <h3 className="card-title">Reception &amp; Dinner</h3>
            <p className="card-date">
              22 August 2026 <span className="bullet">•</span> 7:00 PM onwards
            </p>
            <p className="card-venue-sub">SREE GOPI KRISHNA GARDENS, GOKAVARAM</p>
          </div>
        </section>

        {/* ── SECTION 3: Countdown Timer ───────────── */}
        <section className="countdown-section" id="section-countdown">
          {/* Bokeh */}
          <div className="bokeh-orb countdown-bokeh-1" aria-hidden="true" />
          <div className="bokeh-orb countdown-bokeh-2" aria-hidden="true" />

          {statusMsg && (
            <p className="countdown-status-msg" id="countdown-status-msg">
              {statusMsg}
            </p>
          )}

          <h2
            className="section-title shimmer-text"
            id="countdown-title"
          >
            To Our New Beginning
          </h2>

          {/* 2×2 Flip-card countdown grid */}
          <div className="countdown-grid" id="countdown-timer-grid" role="timer" aria-label="Wedding countdown">
            {[
              { value: timeLeft.days,    label: "DAYS",    id: "days-val"    },
              { value: timeLeft.hours,   label: "HOURS",   id: "hours-val"   },
              { value: timeLeft.minutes, label: "MINUTES", id: "minutes-val" },
              { value: timeLeft.seconds, label: "SECONDS", id: "seconds-val" },
            ].map(({ value, label, id }) => (
              <div key={label} className="flip-card-box">
                <div className="flip-card-number-wrap">
                  {/* key={value} remounts span on change → triggers flip-in animation */}
                  <span key={value} className="flip-digit" id={id} aria-label={`${value} ${label}`}>
                    {value}
                  </span>
                </div>
                <span className="flip-card-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: Family Blessings ──────────── */}
        <section className="family-section" id="section-family">
          <div className="telugu-text section-telugu-header" id="family-telugu-title">
            ఆశీర్వాదములతో
          </div>
          <h2 className="section-title" id="family-title">With Blessings of Families</h2>

          <div className="family-cards-container">
            {/* Groom's family */}
            <div
              className="family-card groom-card reveal-on-scroll"
              id="family-card-groom"
            >
              <span className="card-role-label">THE GROOM</span>
              <h3 className="family-member-name">Siva Rajesh</h3>
              <p className="relationship-label">Beloved Son of</p>
              <h4 className="parent-name">Shri Yazna Valkeswara Rao</h4>
              <p className="ampersand">&amp;</p>
              <h4 className="parent-name">Shrimati Ganga Bhavani</h4>
            </div>

            {/* Bride's family */}
            <div
              className="family-card bride-card reveal-on-scroll"
              id="family-card-bride"
            >
              <span className="card-role-label">THE BRIDE</span>
              <h3 className="family-member-name">Suchitra</h3>
              <p className="relationship-label">Beloved Daughter of</p>
              <h4 className="parent-name">Shri Nageswara Rao</h4>
              <p className="ampersand">&amp;</p>
              <h4 className="parent-name">Shrimati Naga Jyothi</h4>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Blessings Photo ───────────── */}
        <section className="blessings-photo-section" id="section-blessings-photo">
          <div className="telugu-text section-telugu-header" id="blessings-telugu-title">
            ఆశీర్వచనం
          </div>

          <div
            className="polaroid-frame-container reveal-on-scroll"
            id="blessings-polaroid"
          >
            <div className="polaroid-frame">
              <img
                src="/couple.png"
                alt="Siva Rajesh & Suchitra — Blessings"
                className="polaroid-img"
              />
              <div className="polaroid-caption">
                Siva Rajesh{" "}
                <span className="heart-icon" style={{ fontSize: "0.95rem" }}>❤</span>{" "}
                Suchitra
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Celebration Timeline ──────── */}
        <section className="timeline-section" id="section-timeline">
          <div className="telugu-text section-telugu-header" id="timeline-telugu-title">
            వేడుకలు
          </div>
          <h2 className="section-title" id="timeline-title">Celebration Timeline</h2>

          <div className="timeline-container">
            {TIMELINE_EVENTS.map((event, index) => (
              <div
                key={index}
                className={`timeline-item reveal-on-scroll${event.highlight ? " highlight-event" : ""}`}
              >
                {/* Emoji badge node */}
                <div
                  className={`timeline-badge${event.highlight ? " highlight-badge" : ""}`}
                  aria-hidden="true"
                >
                  {event.emoji}
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-date">Date: {event.date}</p>
                    <p className={`event-time${event.highlight ? " important-time" : ""}`}>
                      {event.highlight ? event.time : `Time: ${event.time}`}
                    </p>
                    {event.note && (
                      <p className="event-dinner-note">{event.note}</p>
                    )}
                    <p className="event-venue">Venue: {event.venue}</p>
                  </div>

                  {event.scratchImage && (
                    <button
                      className="event-thumbnail-btn"
                      onClick={() =>
                        setScratchModal({
                          isOpen: true,
                          title: event.title,
                          image: event.scratchImage,
                          overlayText: "Rub here to reveal photo ✨",
                        })
                      }
                      aria-label={`Rub to reveal photo for ${event.title}`}
                    >
                      <img
                        src={event.scratchImage}
                        alt={event.title}
                        className="event-thumbnail-img"
                      />
                      <span className="event-thumbnail-badge">Rub 👆</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Shubh Muhurtham highlight card */}
          <div
            className="muhurtham-gold-card reveal-on-scroll"
            id="muhurtham-callout"
          >
            <h3 className="telugu-text gold-card-title">శుభ ముహూర్తం</h3>
            <p className="gold-card-date">22 August 2026</p>
            <p className="gold-card-time">3:46 AM</p>
          </div>
        </section>

        {/* ── SECTION 7: Venue ─────────────────────── */}
        <section className="venue-section" id="section-venue">
          <h2 className="section-title" id="venue-title">Venue</h2>

          <div className="venue-card reveal-on-scroll">
            <span className="venue-pin" aria-hidden="true">📍</span>
            <h3 className="venue-name">Sree Gopi Krishna Gardens</h3>
            <p className="venue-address">Gokavaram</p>

            <a
              href="https://maps.google.com/?q=Sree+Gopi+Krishna+Gardens+Gokavaram"
              target="_blank"
              rel="noopener noreferrer"
              className="maps-btn"
              id="btn-google-maps"
              aria-label="Open venue in Google Maps"
            >
              <span>OPEN IN GOOGLE MAPS</span>
              <span className="arrow-diagonal" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        {/* ── SECTION 8: Fun Corner ─────────────────── */}
        <section
          className="fun-corner-section reveal-on-scroll"
          id="section-fun-corner"
        >
          {/* Bokeh */}
          <div className="bokeh-orb fun-corner-bokeh-1" aria-hidden="true" />
          <div className="bokeh-orb fun-corner-bokeh-2" aria-hidden="true" />

          <div className="telugu-text section-telugu-header">వినోద కోణం</div>
          <h2 className="section-title">Before You Leave...</h2>

          {/* Step progress dots */}
          <div className="step-indicator" role="progressbar" aria-valuenow={funStep} aria-valuemin={1} aria-valuemax={5} aria-label={`Step ${funStep} of 5`}>
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`step-dot ${funStep >= step ? "active" : ""}`}
              />
            ))}
          </div>

          {/* Step cards */}
          <div className="fun-card-container">

            {/* Step 1 — Choose your team */}
            {funStep === 1 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">👇 Choose Your Team</h3>
                <div className="team-buttons">
                  <button
                    className={`team-btn team-bride ${selectedTeam === "bride" ? "selected" : ""}`}
                    onClick={() => handleSelectTeam("bride")}
                    disabled={selectedTeam !== null}
                    aria-pressed={selectedTeam === "bride"}
                  >
                    <span className="emoji" aria-hidden="true">👰</span>
                    <span className="label">Team Bride</span>
                  </button>
                  <button
                    className={`team-btn team-groom ${selectedTeam === "groom" ? "selected" : ""}`}
                    onClick={() => handleSelectTeam("groom")}
                    disabled={selectedTeam !== null}
                    aria-pressed={selectedTeam === "groom"}
                  >
                    <span className="emoji" aria-hidden="true">🤵</span>
                    <span className="label">Team Groom</span>
                  </button>
                </div>
                {selectedTeam && (
                  <p className="fun-feedback animate-bounce-subtle" role="status">
                    {selectedTeam === "bride"
                      ? "🌸 Awesome choice! Team Bride is leading the style! 🌸"
                      : "🕶️ Stately pick! Team Groom stands united! 🕶️"}
                  </p>
                )}
              </div>
            )}

            {/* Step 2 — Who wins arguments? */}
            {funStep === 2 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Who will win most arguments?</h3>
                <div className="team-buttons">
                  <button
                    className={`winner-btn winner-bride ${argumentWinner === "bride" ? "selected" : ""}`}
                    onClick={() => handleSelectWinner("bride")}
                    disabled={argumentWinner !== null}
                    aria-pressed={argumentWinner === "bride"}
                  >
                    <span className="emoji" aria-hidden="true">👰</span>
                    <span className="label">Bride</span>
                  </button>
                  <button
                    className={`winner-btn winner-groom ${argumentWinner === "groom" ? "selected" : ""}`}
                    onClick={() => handleSelectWinner("groom")}
                    disabled={argumentWinner !== null}
                    aria-pressed={argumentWinner === "groom"}
                  >
                    <span className="emoji" aria-hidden="true">🤵</span>
                    <span className="label">Groom</span>
                  </button>
                </div>
                {argumentWinner && (
                  <p className="fun-feedback" role="status">
                    {argumentWinner === "bride"
                      ? "🤫 Wise choice! The Bride is always right!"
                      : "🤵 Brave choice! We admire your optimism!"}
                  </p>
                )}
              </div>
            )}

            {/* Step 3 — Spin the wheel */}
            {funStep === 3 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Spin the Wheel of Married Life 🎡</h3>

                <div className="wheel-outer-container">
                  <div className="wheel-pointer" aria-hidden="true">▼</div>
                  <svg
                    className="wheel-svg"
                    viewBox="0 0 260 260"
                    aria-label="Wheel of married life"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: wheelSpinning
                        ? "transform 4s cubic-bezier(0.1, 0.8, 0.2, 1)"
                        : "none",
                      willChange: "transform",
                    }}
                  >
                    {WHEEL_LABELS_SHORT.map((label, i) => {
                      const startAngle = i * 60;
                      const endAngle = (i + 1) * 60;
                      const midAngle = i * 60 + 30;
                      const lp = polarToCartesian(130, 130, 75, midAngle);
                      const { bg, text: textColor } = WHEEL_COLORS[i];
                      return (
                        <g key={i}>
                          <path
                            d={getSlicePath(130, 130, 120, startAngle, endAngle)}
                            fill={bg}
                            stroke="#D4AF37"
                            strokeWidth="2"
                          />
                          <g transform={`translate(${lp.x.toFixed(2)},${lp.y.toFixed(2)}) rotate(${midAngle})`}>
                            <text textAnchor="middle" dominantBaseline="middle" y="-10" fontSize="16">
                              {label.emoji}
                            </text>
                            <text
                              textAnchor="middle" dominantBaseline="middle" y="7"
                              fontSize="8" fontWeight="700" fill={textColor}
                              fontFamily="Montserrat, sans-serif" letterSpacing="0.3"
                            >
                              {label.text}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                    {/* Decorative rings */}
                    <circle cx="130" cy="130" r="120" fill="none" stroke="#D4AF37" strokeWidth="4" />
                    <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
                    {/* Centre hub */}
                    <circle cx="130" cy="130" r="24" fill="#D4AF37" />
                    <circle cx="130" cy="130" r="18" fill="#6B1D2F" />
                    <text
                      x="130" y="130" textAnchor="middle" dominantBaseline="middle"
                      fontSize="13" fill="#D4AF37" fontFamily="serif"
                    >❤</text>
                  </svg>
                </div>

                <div className="wheel-controls">
                  <button
                    className="spin-btn gold-shimmer-btn"
                    onClick={handleSpinWheel}
                    disabled={wheelSpinning}
                    id="btn-spin-wheel"
                  >
                    {wheelSpinning ? "SPINNING..." : "SPIN THE WHEEL 🎡"}
                  </button>
                </div>

                {wheelResult && (
                  <div className="wheel-result-box animate-scale-up" role="status">
                    <p className="result-label">The Wheel Has Spoken!</p>
                    <h4 className="result-text">{wheelResult}</h4>
                    <button
                      className="next-step-btn"
                      onClick={() => setFunStep(4)}
                    >
                      Next: Generate a Blessing 🙏
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Generate a blessing */}
            {funStep === 4 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Generate a Blessing 🙏</h3>
                <p className="fun-step-desc">
                  Click below to generate a heartfelt blessing or wishes for the couple!
                </p>

                <button
                  className="blessing-btn gold-shimmer-btn"
                  onClick={handleGenerateBlessing}
                  id="btn-generate-blessing"
                >
                  {generatedBlessing ? "GENERATE ANOTHER 💫" : "GENERATE WISHES ✨"}
                </button>

                {generatedBlessing && (
                  <div className="blessing-result animate-scale-up">
                    <div className="blessing-quote-box">
                      <p>"{generatedBlessing}"</p>
                    </div>
                    <button
                      className="copy-blessing-btn"
                      onClick={handleCopyBlessing}
                      id="btn-copy-blessing"
                    >
                      {copiedBlessing ? "Copied! ✅" : "Copy Wishes 📋"}
                    </button>
                    <button
                      className="next-step-btn"
                      onClick={() => setFunStep(5)}
                    >
                      Complete 💖
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — Thank you */}
            {funStep === 5 && (
              <div className="fun-step-card final-thank-you animate-fade-in">
                <h3 className="thank-you-title">
                  ❤️ Thank You for Being Part of Our Journey ❤️
                </h3>
                <p className="thank-you-desc">
                  Your interaction and warm blessings mean the world to us!
                </p>
                <button
                  className="play-again-btn"
                  onClick={handleResetFun}
                  id="btn-play-again"
                >
                  Play Again 🔄
                </button>
              </div>
            )}

          </div>
        </section>

        {/* ── SECTION 9: Footer ─────────────────────── */}
        <footer className="footer-section" id="section-footer">
          {/* Constellation overlay */}
          <div className="constellation-overlay" aria-hidden="true" />
          {/* Footer bokeh */}
          <div className="bokeh-orb footer-bokeh-1" aria-hidden="true" />
          <div className="bokeh-orb footer-bokeh-2" aria-hidden="true" />

          {/* Blessing quote */}
          <div className="footer-block" id="footer-blessings">
            <span className="footer-label">BLESSINGS</span>
            <p className="footer-quote">
              "Your presence and blessings are our greatest gift."
            </p>
          </div>

          {/* Share CTA */}
          <button
            className="share-btn gold-shimmer-btn"
            id="btn-share-invitation"
            onClick={handleShare}
            aria-label="Share this wedding invitation"
          >
            SHARE INVITATION
          </button>

          <div className="footer-signatures">
            <p className="elders-blessing">With the blessings of our elders</p>
          </div>
        </footer>

      </div>{/* end .invite-wrapper */}

      {/* ════════════════════════════════════════════
          TOAST NOTIFICATION
          ════════════════════════════════════════════ */}
      <div
        className={`toast ${showToast ? "show" : ""}`}
        id="toast-msg"
        role="status"
        aria-live="polite"
      >
        Link copied to clipboard!
      </div>

      {/* ════════════════════════════════════════════
          FLOATING MUSIC TOGGLE
          ════════════════════════════════════════════ */}
      <button
        id="btn-music-toggle"
        className={`music-toggle-btn ${isPlaying ? "playing" : "paused"}`}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        onClick={handleMusicToggle}
      >
        <span className="music-icon" aria-hidden="true">
          {isPlaying ? "🎵" : "🔇"}
        </span>
      </button>

      {/* ════════════════════════════════════════════
          HIDDEN YOUTUBE PLAYER
          ════════════════════════════════════════════ */}
      <div
        id="youtube-player"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          left: "-9999px",
          top: "-9999px",
        }}
        aria-hidden="true"
      />

      {/* ════════════════════════════════════════════
          SCRATCH REVEAL MODAL ("Rub to Reveal")
          ════════════════════════════════════════════ */}
      {scratchModal.isOpen && (
        <ScratchRevealModal
          title={scratchModal.title}
          image={scratchModal.image}
          overlayText={scratchModal.overlayText}
          revealThreshold={0.7}
          onClose={() =>
            setScratchModal({ isOpen: false, title: "", image: "", overlayText: "" })
          }
        />
      )}
    </>
  );
}
