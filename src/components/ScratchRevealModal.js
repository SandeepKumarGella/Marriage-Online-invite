"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Helper to draw a smooth heart path on canvas context
 */
function drawHeartPath(ctx, x, y, width, height, inset = 0) {
  const w = width - inset * 2;
  const h = height - inset * 2;
  const ox = x + inset;
  const oy = y + inset;

  ctx.beginPath();
  // Start at top cleft
  const topCleftY = oy + h * 0.28;
  const bottomPointY = oy + h * 0.95;

  ctx.moveTo(ox + w / 2, topCleftY);

  // Top left lobe
  ctx.bezierCurveTo(
    ox + w * 0.26, oy + h * 0.02,
    ox, oy + h * 0.16,
    ox, oy + h * 0.42
  );
  // Bottom left curve to tip
  ctx.bezierCurveTo(
    ox, oy + h * 0.68,
    ox + w * 0.28, oy + h * 0.83,
    ox + w / 2, bottomPointY
  );
  // Bottom right curve to tip
  ctx.bezierCurveTo(
    ox + w * 0.72, oy + h * 0.83,
    ox + w, oy + h * 0.68,
    ox + w, oy + h * 0.42
  );
  // Top right lobe
  ctx.bezierCurveTo(
    ox + w, oy + h * 0.16,
    ox + w * 0.74, oy + h * 0.02,
    ox + w / 2, topCleftY
  );
  ctx.closePath();
}

/**
 * ScratchRevealModal — Rub-to-Reveal Bottom Sheet
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the event (e.g. "Haldi Ceremony")
 * @param {string} props.image - URL of the photo to reveal
 * @param {string} [props.overlayText="Rub to Reveal ✨"] - Text displayed on scratch layer
 * @param {number} [props.revealThreshold=0.75] - Threshold of scratched area (0.75 = 75%)
 * @param {string} [props.shape="rectangle"] - Shape of scratch layer ("heart" | "rectangle")
 * @param {Function} props.onClose - Callback when closing the bottom sheet
 */
export default function ScratchRevealModal({
  title,
  image,
  overlayText = "Rub to Reveal ✨",
  revealThreshold = 0.7,
  shape = "rectangle",
  onClose,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const closeTimerRef = useRef(null);
  const revealCheckRef = useRef(null);
  const initialOpaqueCountRef = useRef(0);

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

    // Reset composite operation & clear canvas
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);

    if (shape === "heart") {
      ctx.save();
      // Draw path slightly inset so borders cover it cleanly
      drawHeartPath(ctx, 0, 0, width, height, 2);
      ctx.clip();
    }

    // 1. Draw Metallic Gold & Dark Crimson Foil Layer
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#4F1120");   // Deep maroon
    gradient.addColorStop(0.3, "#8E2B41"); // Maroon mid
    gradient.addColorStop(0.5, "#D4AF37");  // Bright gold foil
    gradient.addColorStop(0.7, "#6B1D2F"); // Crimson
    gradient.addColorStop(1, "#2C0B13");   // Dark maroon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Sparkles / Stars inside foil
    const sparkles = [
      { x: width * 0.25, y: height * 0.25 },
      { x: width * 0.75, y: height * 0.25 },
      { x: width * 0.5, y: height * 0.18 },
      { x: width * 0.18, y: height * 0.5 },
      { x: width * 0.82, y: height * 0.5 },
      { x: width * 0.5, y: height * 0.76 }
    ];
    ctx.fillStyle = "rgba(241, 229, 198, 0.75)";
    sparkles.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Center Instruction Pill
    const badgeW = Math.min(230, width - 40);
    const badgeH = 50;
    const centerY = shape === "heart" ? height * 0.46 : height / 2;

    ctx.fillStyle = "rgba(15, 3, 7, 0.72)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - badgeW / 2, centerY - badgeH / 2, badgeW, badgeH, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text: Overlay Message
    ctx.fillStyle = "#F5EFE0";
    ctx.font = "600 14px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(overlayText, width / 2, centerY - 6);

    ctx.fillStyle = "rgba(212, 175, 55, 0.95)";
    ctx.font = "italic 11px Cormorant Garamond, serif";
    ctx.fillText("Rub with finger or mouse 👆", width / 2, centerY + 12);

    if (shape === "heart") {
      ctx.restore();

      // Draw double decorative gold borders following heart shape
      ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
      ctx.lineWidth = 3.5;
      drawHeartPath(ctx, 0, 0, width, height, 3);
      ctx.stroke();

      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 1.5;
      drawHeartPath(ctx, 0, 0, width, height, 10);
      ctx.stroke();
    } else {
      // Rectangular borders
      ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, width - 16, height - 16);

      ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(13, 13, width - 26, height - 26);
    }

    // Calculate initial opaque pixel count for accurate reveal percentage
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let initialCount = 0;
    const step = 16;
    for (let i = 3; i < pixels.length; i += step * 4) {
      if (pixels[i] > 0) initialCount++;
    }
    initialOpaqueCountRef.current = initialCount || 1;

    // For heart shape, fill remaining transparent corners with solid modal background
    if (shape === "heart") {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#120306";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }

    // Configure stroke settings for erasing
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 44; // Rub brush size
  }, [imgDimensions, overlayText, shape]);

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
      const step = 16;

      for (let i = 3; i < pixels.length; i += step * 4) {
        if (pixels[i] < 16) {
          clearedPixels++;
        }
      }

      const totalInitial = initialOpaqueCountRef.current;
      const ratio = clearedPixels / totalInitial;
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

    ctx.save();
    if (shape === "heart") {
      drawHeartPath(ctx, 0, 0, canvas.width, canvas.height, 2);
      ctx.clip();
    }

    // Explicitly configure brush properties inside save context
    ctx.lineWidth = 44; // Thick brush size
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";

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

    ctx.restore();

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
    const htmlStyle = document.documentElement.style.scrollBehavior;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);

      // Restore original scroll behavior after layout flow stabilizes
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = htmlStyle;
      }, 50);
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
        <div className={`sheet-media-wrapper ${shape === "heart" ? "is-heart" : ""}`}>
          <div className={`sheet-media-inner ${shape === "heart" ? "shape-heart" : ""}`}>
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
