"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * ScratchRevealModal — Rub-to-Reveal Bottom Sheet
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the event (e.g. "Haldi Ceremony")
 * @param {string} props.image - URL of the photo to reveal
 * @param {string} [props.overlayText="Rub to Reveal ✨"] - Text displayed on scratch layer
 * @param {number} [props.revealThreshold=0.75] - Threshold of scratched area (0.75 = 75%)
 * @param {Function} props.onClose - Callback when closing the bottom sheet
 */
export default function ScratchRevealModal({
  title,
  image,
  overlayText = "Rub to Reveal ✨",
  revealThreshold = 0.75,
  onClose,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const closeTimerRef = useRef(null);
  const revealCheckRef = useRef(null);

  const [isRevealed, setIsRevealed] = useState(false);
  const [revealPercent, setRevealPercent] = useState(0);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [closing, setClosing] = useState(false);

  // Smooth dismiss handler
  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 320);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (revealCheckRef.current) cancelAnimationFrame(revealCheckRef.current);
    };
  }, []);

  // Handle image load & canvas sizing
  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const { clientWidth, clientHeight } = imgRef.current;
    if (clientWidth > 0 && clientHeight > 0) {
      setImgDimensions({ width: clientWidth, height: clientHeight });
    }
  };

  // Resize listener to keep canvas perfectly matched to img
  useEffect(() => {
    const updateDimensions = () => {
      if (imgRef.current) {
        const { clientWidth, clientHeight } = imgRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setImgDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize Canvas Scratch Layer matching image size
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgDimensions.width === 0 || imgDimensions.height === 0) return;
    
    canvas.width = imgDimensions.width;
    canvas.height = imgDimensions.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";

    // 1. Draw Metallic Gold & Dark Crimson Foil Layer
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#4F1120");   // Deep maroon
    gradient.addColorStop(0.3, "#8E2B41"); // Maroon mid
    gradient.addColorStop(0.5, "#D4AF37");  // Bright gold foil
    gradient.addColorStop(0.7, "#6B1D2F"); // Crimson
    gradient.addColorStop(1, "#2C0B13");   // Dark maroon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative borders inside canvas
    ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(13, 13, width - 26, height - 26);

    // 3. Sparkles / Stars
    const sparkles = [
      { x: 25, y: 25 }, { x: width - 25, y: 30 },
      { x: 35, y: height - 30 }, { x: width - 30, y: height - 25 },
      { x: width / 2 - 60, y: 45 }, { x: width / 2 + 60, y: height - 45 }
    ];
    ctx.fillStyle = "rgba(241, 229, 198, 0.65)";
    sparkles.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Center Instruction Pill
    const badgeW = Math.min(230, width - 40);
    const badgeH = 52;
    ctx.fillStyle = "rgba(15, 3, 7, 0.65)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - badgeW / 2, height / 2 - badgeH / 2, badgeW, badgeH, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text: Overlay Message
    ctx.fillStyle = "#F5EFE0";
    ctx.font = "600 14px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(overlayText, width / 2, height / 2 - 5);

    ctx.fillStyle = "rgba(212, 175, 55, 0.95)";
    ctx.font = "italic 11px Cormorant Garamond, serif";
    ctx.fillText("Rub with finger or mouse 👆", width / 2, height / 2 + 13);

    // Configure stroke settings for erasing
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 42; // Rub brush size
  }, [imgDimensions, overlayText]);

  useEffect(() => {
    if (imgDimensions.width > 0 && imgDimensions.height > 0) {
      initCanvas();
    }
  }, [imgDimensions, initCanvas]);

  // Reveal percentage check
  const checkRevealPercentage = useCallback(() => {
    if (isRevealed) return;
    if (revealCheckRef.current) return;

    revealCheckRef.current = requestAnimationFrame(() => {
      revealCheckRef.current = null;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      let clearedPixels = 0;
      const totalPixels = pixels.length / 4;
      const step = 24;

      for (let i = 3; i < pixels.length; i += step * 4) {
        if (pixels[i] === 0) {
          clearedPixels++;
        }
      }

      const ratio = clearedPixels / (totalPixels / step);
      const percent = Math.min(100, Math.round(ratio * 100));
      setRevealPercent(percent);

      if (ratio >= revealThreshold) {
        setIsRevealed(true);
      }
    });
  }, [isRevealed, revealThreshold]);

  // Scratch Drawing Logic
  const scratchAt = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    checkRevealPercentage();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Mouse Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const point = getCanvasCoords(e);
    if (point) scratchAt(point.x, point.y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const point = getCanvasCoords(e);
    if (point) scratchAt(point.x, point.y);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const point = getCanvasCoords(e);
    if (point) scratchAt(point.x, point.y);
  };

  const handleTouchMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const point = getCanvasCoords(e);
    if (point) scratchAt(point.x, point.y);
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Prevent background scroll
  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const y = Math.abs(parseInt(document.body.style.top || "0", 10));

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, y);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blockTouchScroll = (e) => {
      if (isDrawingRef.current) e.preventDefault();
    };

    canvas.addEventListener("touchmove", blockTouchScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", blockTouchScroll);
  }, [imgDimensions.width, imgDimensions.height]);

  return (
    <div
      className={`scratch-backdrop ${closing ? "closing" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Event details: ${title}`}
    >
      {/* Bottom Sheet Drawer */}
      <div
        className={`scratch-bottom-sheet ${closing ? "slide-down" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="sheet-drag-handle-bar">
          <div className="sheet-drag-handle" />
        </div>

        {/* Close Button */}
        <button
          className="sheet-close-btn"
          onClick={handleClose}
          aria-label="Close bottom sheet"
        >
          ✕
        </button>

        {/* Sheet Header */}
        <div className="sheet-header">
          <span className="sheet-category-tag">EVENT PHOTO REVEAL</span>
          <h3 className="sheet-title">{title}</h3>
          <p className="sheet-subtitle">
            {isRevealed
              ? "✨ Moment Revealed!"
              : `Rub to reveal photo (${revealPercent}%)`}
          </p>
        </div>

        {/* Centered Image & Exact-Fit Canvas Container */}
        <div className="sheet-media-wrapper">
          <div className="sheet-media-inner">
            {/* Event Photo */}
            <img
              ref={imgRef}
              src={image}
              alt={title}
              className={`sheet-img ${isRevealed ? "fully-revealed" : ""}`}
              onLoad={handleImageLoad}
            />

            {/* Canvas matching exact dimensions of img */}
            <canvas
              ref={canvasRef}
              className={`sheet-canvas ${isRevealed ? "faded-out" : ""}`}
              style={{
                width: imgDimensions.width > 0 ? `${imgDimensions.width}px` : "100%",
                height: imgDimensions.height > 0 ? `${imgDimensions.height}px` : "100%",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Celebration Badge when 75% revealed */}
            {isRevealed && (
              <div className="sheet-revealed-badge animate-scale-up">
                ✨ Beautiful! ✨
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sheet-footer">
          {!isRevealed ? (
            <button
              className="sheet-instant-btn"
              onClick={() => setIsRevealed(true)}
            >
              Instant Reveal 🪄
            </button>
          ) : (
            <button
              className="sheet-done-btn gold-shimmer-btn"
              onClick={handleClose}
            >
              BACK TO TIMELINE ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
