"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  // States
  const [overlayFaded, setOverlayFaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [petals, setPetals] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [statusMsg, setStatusMsg] = useState("");

  // Fun Activity States
  const [funStep, setFunStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null); // 'bride' or 'groom'
  const [argumentWinner, setArgumentWinner] = useState(null); // 'bride' or 'groom'
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);
  const [generatedBlessing, setGeneratedBlessing] = useState("");
  const [copiedBlessing, setCopiedBlessing] = useState(false);

  // Refs
  const playerRef = useRef(null);

  // Scroll to top on page load/refresh and disable scroll restoration
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 1. YouTube Player Integration
  useEffect(() => {
    // Inject YouTube Script
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Define standard onYouTubeIframeAPIReady callback
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

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
          start: 5, // Start the background song at5 seconds
          mute: 1, // Start muted to bypass browser policies
        },
        events: {
          onReady: (event) => {
            console.log("YouTube Player is ready.");
            // If the user already opened the overlay before player was ready, unmute
            if (document.getElementById("welcome-overlay")?.classList.contains("fade-out")) {
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
              const isMuted = event.target.isMuted && event.target.isMuted();
              setIsPlaying(!isMuted);
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
  }, []);

  // 3. Falling Petals Generator
  useEffect(() => {
    const maxPetals = 25;
    let activeCount = 0;
    let idCounter = 0;

    const createPetal = () => {
      if (activeCount >= maxPetals) return;

      const size = Math.random() * 8 + 6; // between 6px and 14px
      const startLeft = Math.random() * 100; // 0 to 100% of viewport width
      const duration = Math.random() * 6 + 6; // 6 to 12s
      const delay = Math.random() * 4; // 0 to 4s
      const opacity = Math.random() * 0.4 + 0.2; // 0.2 to 0.6 opacity
      const isOval = Math.random() > 0.5;

      const newPetal = {
        id: idCounter++,
        width: `${size}px`,
        height: `${size * 1.5}px`,
        left: `${startLeft}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity: opacity,
        borderRadius: isOval ? "100% 0 100% 0" : undefined,
      };

      setPetals((prev) => [...prev, newPetal]);
      activeCount++;

      setTimeout(() => {
        setPetals((prev) => prev.filter((p) => p.id !== newPetal.id));
        activeCount--;
      }, (duration + delay) * 1000);
    };

    // Initial batch
    for (let i = 0; i < 12; i++) {
      createPetal();
    }

    const interval = setInterval(createPetal, 600);
    return () => clearInterval(interval);
  }, []);

  // 4. Countdown Timer
  useEffect(() => {
    const targetDate = new Date("Aug 23, 2026 03:46:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        setStatusMsg("🌸 The Wait Is Over — Welcome to Our Wedding! 🌸");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
      setStatusMsg("Countdown to the auspicious moment...");
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // 5. Scroll Reveal Animations (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [overlayFaded]); // Re-run hook when overlay is removed so elements in viewport are captured

  // Actions
  const handleOpenInvitation = (e) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    setOverlayFaded(true);

    if (playerRef.current && typeof playerRef.current.unMute === "function") {
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleMusicToggle = (e) => {
    e.stopPropagation();
    if (!playerRef.current || typeof playerRef.current.playVideo !== "function") return;

    if (isPlaying) {
      if (playerRef.current.isMuted && playerRef.current.isMuted()) {
        playerRef.current.unMute();
        setIsPlaying(true);
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    } else {
      if (playerRef.current.unMute) playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleShare = () => {
    const inviteUrl = window.location.href;
    const inviteTitle = "Wedding Invitation: Siva Rajesh & Suchitra";
    const inviteText = "You are cordially invited to join us for our wedding celebration on 22 August 2026. View the full details here:";

    if (navigator.share) {
      navigator.share({
        title: inviteTitle,
        text: inviteText,
        url: inviteUrl,
      })
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(`${inviteText} ${inviteUrl}`)
        .then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          alert(`Copy & Share this link: ${inviteUrl}`);
        });
    }
  };

  // Fun Activity Constants & Handlers
  const BLESSINGS = [
    "May your love grow stronger with each passing day! 🌸",
    "Wishing you a lifetime of laughter, joy, and endless patience! 💕",
    "May your home be filled with love, warm cups of tea, and happy memories! ☕",
    "Here's to a lifetime of shared dreams and beautiful adventures together! ✈️",
    "May your journey together be paved with trust, understanding, and sweet compromises! ✨",
    "May the years ahead be filled with lasting joy and love that knows no bounds! 🥂",
  ];

  const WHEEL_SECTORS = [
    "Who orders dinner tonight 🍕",
    "TV Remote custody 📺",
    "Spontaneous trip planner ✈️",
    "Laundry Supervisor 🧺",
    "Morning tea maker ☕",
    "Who says sorry first 🤫",
  ];

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setTimeout(() => {
      setFunStep(2);
    }, 1200);
  };

  const handleSelectWinner = (winner) => {
    setArgumentWinner(winner);
    setTimeout(() => {
      setFunStep(3);
    }, 1500);
  };

  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    // Rotate 5 full turns + align index clockwise
    const rotations = 5;
    const targetRotation = wheelRotation + (rotations * 360) - (randomIndex * 60) - (wheelRotation % 360);

    setWheelRotation(targetRotation);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(WHEEL_SECTORS[randomIndex]);
    }, 4000);
  };

  const handleGenerateBlessing = () => {
    const randomIndex = Math.floor(Math.random() * BLESSINGS.length);
    setGeneratedBlessing(BLESSINGS[randomIndex]);
  };

  const handleCopyBlessing = () => {
    if (!generatedBlessing) return;
    navigator.clipboard.writeText(generatedBlessing)
      .then(() => {
        setCopiedBlessing(true);
        setTimeout(() => setCopiedBlessing(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy blessing: ", err);
      });
  };

  const handleResetFun = () => {
    setFunStep(1);
    setSelectedTeam(null);
    setArgumentWinner(null);
    setWheelRotation(0);
    setWheelSpinning(false);
    setWheelResult(null);
    setGeneratedBlessing("");
    setCopiedBlessing(false);
  };

  return (
    <>
      {/* Welcome Cover Overlay */}
      <div
        id="welcome-overlay"
        className={`welcome-overlay ${overlayFaded ? "fade-out" : ""}`}
        style={overlayFaded ? { pointerEvents: "none" } : undefined}
      >
        <div className="welcome-content">
          <div className="welcome-om">ॐ</div>
          <h1 className="welcome-names">
            <span className="name-groom">Siva Rajesh</span>
            <span className="heart-icon">❤</span>
            <span className="name-bride">Suchitra</span>
          </h1>
          <p className="welcome-subtitle">Invite you to share in their joy and wedding celebration</p>
          <div className="divider-gold"></div>
          <button
            id="btn-open-invitation"
            className="open-invite-btn"
            onClick={handleOpenInvitation}
          >
            <span>OPEN INVITATION</span>
            <span className="music-note-indicator">🎵</span>
          </button>
        </div>
      </div>

      {/* Floating Petals Container */}
      <div id="leaves-container">
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

      {/* Main Wrapper */}
      <div className="invite-wrapper">
        {/* Section 1: Hero Section */}
        <header className="hero-section" id="section-hero">
          <div className="intro-om" id="hero-om-symbol">ॐ</div>
          <div className="telugu-text blessing-title" id="hero-telugu-ganesha">శ్రీ గణేశాయ నమః</div>

          <div className="shloka-container" id="hero-shloka">
            <p>వక్రతుండ మహాకాయ</p>
            <p>సూర్యకోటి సమప్రభ |</p>
            <p>నిర్విఘ్నం కరుమే దేవ</p>
            <p>సర్వకార్యేషు సర్వదా ||</p>
          </div>

          <div className="divider-gold"></div>

          <p className="tagline-english" id="hero-tagline">Two Hearts, One Journey</p>

          <h1 className="couple-names" id="hero-couple-names">
            <span className="name-groom">Siva Rajesh</span>
            <span className="heart-icon">❤</span>
            <span className="name-bride">Suchitra</span>
          </h1>

          <div className="hero-details" id="hero-date-venue-quick">
            <div className="detail-item">
              <span className="label">WEDDING DATE</span>
              <span className="value">22 August 2026</span>
            </div>
            <div className="detail-item">
              <span className="label">MUHURTHAM</span>
              <span className="value">3:46 AM</span>
            </div>
          </div>

          <div className="hero-venue-summary">
            <span className="label">VENUE</span>
            <span className="value-venue">Sree Gopi Krishna Gardens, Gokavaram</span>
          </div>
        </header>

        {/* Section 2: Portrait & Welcome */}
        <section className="portrait-section" id="section-portrait">
          <div className="portrait-frame-container" id="portrait-frame">
            <div className="portrait-oval-border">
              <img
                src="/couple1.png"
                alt="Siva Rajesh and Suchitra Illustration"
                className="couple-portrait-img"
                id="couple-portrait-img"
              />
            </div>
          </div>

          <div className="reception-card" id="portrait-reception-info">
            <h3 className="card-title">Reception & Dinner</h3>
            <p className="card-date">22 August 2026 <span className="bullet">•</span> 7:00 PM onwards</p>
            <p className="card-venue-sub">SREE GOPI KRISHNA GARDENS, GOKAVARAM</p>
          </div>
        </section>

        {/* Section 3: Countdown Timer */}
        <section className="countdown-section" id="section-countdown">
          <div className="countdown-welcome-msg" id="countdown-status-msg">
            {statusMsg}
          </div>
          <h2 className="section-title" id="countdown-title">To Our New Beginning</h2>

          <div className="countdown-container" id="countdown-timer-grid">
            <div className="timer-box">
              <span className="timer-number" id="days-val">{timeLeft.days}</span>
              <span className="timer-label">DAYS</span>
            </div>
            <div className="timer-box">
              <span className="timer-number" id="hours-val">{timeLeft.hours}</span>
              <span className="timer-label">HOURS</span>
            </div>
            <div className="timer-box">
              <span className="timer-number" id="minutes-val">{timeLeft.minutes}</span>
              <span className="timer-label">MINUTES</span>
            </div>
            <div className="timer-box">
              <span className="timer-number" id="seconds-val">{timeLeft.seconds}</span>
              <span className="timer-label">SECONDS</span>
            </div>
          </div>
        </section>

        {/* Section 4: Family Blessings */}
        <section className="family-section" id="section-family">
          <div className="telugu-text section-telugu-header" id="family-telugu-title">ఆశీర్వాదములతో</div>
          <h2 className="section-title" id="family-title">With Blessings of Families</h2>

          <div className="family-cards-container">
            {/* Groom Card */}
            <div className="family-card" id="family-card-groom">
              <span className="card-role-label">THE GROOM</span>
              <h3 className="family-member-name">Siva Rajesh</h3>
              <p className="relationship-label">Beloved Son of</p>
              <h4 className="parent-name">Shri Yazna Valkeswara Rao</h4>
              <p className="ampersand">&</p>
              <h4 className="parent-name">Shrimati Ganga Bhavani</h4>
            </div>

            {/* Bride Card */}
            <div className="family-card" id="family-card-bride">
              <span className="card-role-label">THE BRIDE</span>
              <h3 className="family-member-name">Suchitra</h3>
              <p className="relationship-label">Beloved Daughter of</p>
              <h4 className="parent-name">Shri Nageswara Rao</h4>
              <p className="ampersand">&</p>
              <h4 className="parent-name">Shrimati Naga Jyothi</h4>
            </div>
          </div>
        </section>

        {/* Section 5: Aashirvachanam / Blessings Photo */}
        <section className="blessings-photo-section" id="section-blessings-photo">
          <div className="telugu-text section-telugu-header" id="blessings-telugu-title">ఆశీర్వచనం</div>

          <div className="polaroid-frame-container" id="blessings-polaroid">
            <div className="polaroid-frame">
              <img
                src="/couple.png"
                alt="Siva Rajesh & Suchitra Blessings"
                className="polaroid-img"
              />
              <div className="polaroid-caption">
                Siva Rajesh <span className="heart-icon">❤</span> Suchitra
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Celebration Timeline */}
        <section className="timeline-section" id="section-timeline">
          <div className="telugu-text section-telugu-header" id="timeline-telugu-title">వేడుకలు</div>
          <h2 className="section-title" id="timeline-title">Celebration Timeline</h2>

          <div className="timeline-container">
            {/* Event 1 */}
            <div className="timeline-card-wrapper reveal-on-scroll">
              <div className="timeline-node"></div>
              <div className="timeline-card">
                <h3 className="event-title">Pellikoduku Ceremony</h3>
                <p className="event-date">Date: 17 August 2026</p>
                <p className="event-time">Time: 8:30 AM</p>
                <p className="event-venue">Venue: Thantikonda</p>
              </div>
            </div>

            <div className="timeline-card-wrapper reveal-on-scroll">
              <div className="timeline-node"></div>
              <div className="timeline-card">
                <h3 className="event-title">Pellikuthuru Ceremony</h3>
                <p className="event-date">Date: 17 August 2026</p>
                <p className="event-time">Time: 8:45 AM</p>
                <p className="event-venue">Venue: Gokavaram</p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="timeline-card-wrapper reveal-on-scroll">
              <div className="timeline-node"></div>
              <div className="timeline-card">
                <h3 className="event-title">Haldi Ceremony</h3>
                <p className="event-date">Date: 21 August 2026</p>
                <p className="event-time">Time: 10:00 AM</p>
                <p className="event-venue">Venue: Gokavaram</p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="timeline-card-wrapper reveal-on-scroll">
              <div className="timeline-node"></div>
              <div className="timeline-card">
                <h3 className="event-title">Mehendi</h3>
                <p className="event-date">Date: 21 August 2026</p>
                <p className="event-time">Time: 5:00 PM</p>
                <p className="event-venue">Venue: Gokavaram</p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="timeline-card-wrapper reveal-on-scroll highlight-event">
              <div className="timeline-node node-highlight"></div>
              <div className="timeline-card">
                <h3 className="event-title">Wedding Ceremony</h3>
                <p className="event-date">Date: 22 August 2026</p>
                <p className="event-time important-time">Muhurtham: 3:46 AM</p>
                <p className="event-venue">Venue: Sree Gopi Krishna Gardens, Gokavaram</p>
              </div>
            </div>

            {/* Event 5 */}
            <div className="timeline-card-wrapper reveal-on-scroll">
              <div className="timeline-node"></div>
              <div className="timeline-card">
                <h3 className="event-title">Reception & Dinner</h3>
                <p className="event-date">Date: 22 August 2026</p>
                <p className="event-time">Time: 7:00 PM</p>
                <p className="event-dinner-note">Followed by: Dinner at the venue</p>
                <p className="event-venue">Venue: Sree Gopi Krishna Gardens, Gokavaram</p>
              </div>
            </div>
          </div>

          {/* Shubh Muhurtham Highlight Card */}
          <div className="muhurtham-gold-card reveal-on-scroll" id="muhurtham-callout">
            <h3 className="telugu-text gold-card-title">శుభ ముహూర్తం</h3>
            <p className="gold-card-date">22 August 2026</p>
            <p className="gold-card-time">3:46 AM</p>
          </div>
        </section>

        {/* Section 9: Venue Google Maps */}
        <section className="venue-section" id="section-venue">
          <h2 className="section-title" id="venue-title">Venue</h2>

          <div className="venue-card reveal-on-scroll">
            <h3 className="venue-name">Sree Gopi Krishna Gardens</h3>
            <p className="venue-address">Gokavaram</p>

            <a
              href="https://maps.google.com/?q=Sree+Gopi+Krishna+Gardens+Gokavaram"
              target="_blank"
              rel="noopener noreferrer"
              className="maps-btn"
              id="btn-google-maps"
            >
              <span>OPEN IN GOOGLE MAPS </span>
              <span className="arrow-diagonal">↗</span>
            </a>
          </div>
        </section>

        {/* Section 9.5: Interactive Fun Corner */}
        <section className="fun-corner-section reveal-on-scroll" id="section-fun-corner">
          <div className="telugu-text section-telugu-header">వినోద కోణం</div>
          <h2 className="section-title">Before You Leave...</h2>
          
          <div className="fun-card-container">
            {funStep === 1 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">👇 Choose Your Team</h3>
                <div className="team-buttons">
                  <button 
                    className={`team-btn team-bride ${selectedTeam === 'bride' ? 'selected' : ''}`}
                    onClick={() => handleSelectTeam('bride')}
                    disabled={selectedTeam !== null}
                  >
                    <span className="emoji">👰</span>
                    <span className="label">Team Bride</span>
                  </button>
                  <button 
                    className={`team-btn team-groom ${selectedTeam === 'groom' ? 'selected' : ''}`}
                    onClick={() => handleSelectTeam('groom')}
                    disabled={selectedTeam !== null}
                  >
                    <span className="emoji">🤵</span>
                    <span className="label">Team Groom</span>
                  </button>
                </div>
                {selectedTeam && (
                  <p className="fun-feedback animate-bounce-subtle">
                    {selectedTeam === 'bride' 
                      ? "🌸 Awesome choice! Team Bride is leading the style! 🌸" 
                      : "🕶️ Stately pick! Team Groom stands united! 🕶️"}
                  </p>
                )}
              </div>
            )}

            {funStep === 2 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Who will win most arguments?</h3>
                <div className="team-buttons">
                  <button 
                    className={`winner-btn winner-bride ${argumentWinner === 'bride' ? 'selected' : ''}`}
                    onClick={() => handleSelectWinner('bride')}
                    disabled={argumentWinner !== null}
                  >
                    <span className="emoji">👰</span>
                    <span className="label">Bride</span>
                  </button>
                  <button 
                    className={`winner-btn winner-groom ${argumentWinner === 'groom' ? 'selected' : ''}`}
                    onClick={() => handleSelectWinner('groom')}
                    disabled={argumentWinner !== null}
                  >
                    <span className="emoji">🤵</span>
                    <span className="label">Groom</span>
                  </button>
                </div>
                {argumentWinner && (
                  <p className="fun-feedback">
                    {argumentWinner === 'bride' 
                      ? "🤫 Wise choice! The Bride is always right!" 
                      : "🤵 Brave choice! We admire your optimism!"}
                  </p>
                )}
              </div>
            )}

            {funStep === 3 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Spin the Wheel of Married Life 🎡</h3>
                
                <div className="wheel-outer-container">
                  <div className="wheel-pointer">👇</div>
                  <div 
                    className="wheel-container"
                    style={{ 
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: wheelSpinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'none'
                    }}
                  >
                    {WHEEL_SECTORS.map((sector, i) => (
                      <div 
                        key={i} 
                        className="wheel-segment" 
                        style={{ '--segment-index': i }}
                      >
                        <div className="wheel-segment-content">
                          {sector}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="wheel-controls">
                  <button 
                    className="spin-btn" 
                    onClick={handleSpinWheel} 
                    disabled={wheelSpinning}
                  >
                    {wheelSpinning ? 'SPINNING...' : 'SPIN THE WHEEL 🎡'}
                  </button>
                </div>

                {wheelResult && (
                  <div className="wheel-result-box animate-scale-up">
                    <p className="result-label">The Wheel Has Spoken!</p>
                    <h4 className="result-text">{wheelResult}</h4>
                    <button className="next-step-btn" onClick={() => setFunStep(4)}>
                      Next: Generate a Blessing 🙏
                    </button>
                  </div>
                )}
              </div>
            )}

            {funStep === 4 && (
              <div className="fun-step-card animate-fade-in">
                <h3 className="fun-step-title">Generate a Blessing 🙏</h3>
                <p className="fun-step-desc">Click below to generate a heartfelt blessing or wishes for the couple!</p>
                
                <button className="blessing-btn" onClick={handleGenerateBlessing}>
                  {generatedBlessing ? "GENERATE ANOTHER 💫" : "GENERATE WISHES ✨"}
                </button>

                {generatedBlessing && (
                  <div className="blessing-result animate-scale-up">
                    <div className="blessing-quote-box">
                      <p>"{generatedBlessing}"</p>
                    </div>
                    <button className="copy-blessing-btn" onClick={handleCopyBlessing}>
                      {copiedBlessing ? "Copied! ✅" : "Copy Wishes 📋"}
                    </button>
                    <button className="next-step-btn" onClick={() => setFunStep(5)}>
                      Complete 💖
                    </button>
                  </div>
                )}
              </div>
            )}

            {funStep === 5 && (
              <div className="fun-step-card final-thank-you animate-fade-in">
                <h3 className="thank-you-title">❤️ Thank You for Being Part of Our Journey ❤️</h3>
                <p className="thank-you-desc">Your interaction and warm blessings mean the world to us!</p>
                <button className="play-again-btn" onClick={handleResetFun}>
                  Play Again 🔄
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 10: Dress Code, Blessings, and Sharing */}
        <footer className="footer-section" id="section-footer">
          <div className="footer-block" id="footer-blessings">
            <span className="footer-label">BLESSINGS</span>
            <p className="footer-quote">"Your presence and blessings are our greatest gift."</p>
          </div>

          {/* Share Invitation CTA */}
          <button className="share-btn" id="btn-share-invitation" onClick={handleShare}>
            SHARE INVITATION
          </button>

          <div className="footer-signatures">
            <p className="elders-blessing">With the blessings of our elders</p>
          </div>
        </footer>
      </div>

      {/* Toast Notification for Share fallback */}
      <div className={`toast ${showToast ? "show" : ""}`} id="toast-msg">
        Link copied to clipboard!
      </div>

      {/* Floating Music Toggle Button */}
      <button
        id="btn-music-toggle"
        className={`music-toggle-btn ${isPlaying ? "playing" : "paused"}`}
        aria-label="Toggle music"
        onClick={handleMusicToggle}
      >
        <span className="music-icon">{isPlaying ? "🎵" : "🔇"}</span>
      </button>

      {/* Hidden YouTube Player Container */}
      <div
        id="youtube-player"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          left: "-9999px",
          top: "-9999px",
        }}
      />
    </>
  );
}
