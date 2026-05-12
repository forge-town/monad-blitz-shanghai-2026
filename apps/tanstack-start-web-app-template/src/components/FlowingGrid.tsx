import { useEffect, useRef } from "react";

export const FlowingGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const CELL = 60;
    const DOT_RADIUS = 0.6;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL) + 2;
      const rows = Math.ceil(h / CELL) + 2;

      // flowing offset
      const flowX = (time * 0.3) % CELL;
      const flowY = (time * 0.15) % CELL;

      // Grid lines
      for (let i = 0; i < cols; i++) {
        const x = i * CELL - flowX;
        const distFromCenter = Math.abs(x - w / 2) / (w / 2);
        const wave = Math.sin(time * 0.008 + i * 0.3) * 0.3 + 0.7;
        const alpha = (1 - distFromCenter) * 0.04 * wave;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        const y = j * CELL - flowY;
        const distFromCenter = Math.abs(y - h / 2) / (h / 2);
        const wave = Math.sin(time * 0.006 + j * 0.25) * 0.3 + 0.7;
        const alpha = (1 - distFromCenter) * 0.035 * wave;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Intersection dots with pulse
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * CELL - flowX;
          const y = j * CELL - flowY;

          const dx = (x - w / 2) / (w / 2);
          const dy = (y - h / 2) / (h / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);

          const pulse =
            Math.sin(time * 0.01 + i * 0.5 + j * 0.3) * 0.5 + 0.5;
          const alpha = Math.max(0, (1 - dist * 0.7) * 0.15 * pulse);

          if (alpha > 0.01) {
            ctx.beginPath();
            ctx.arc(x, y, DOT_RADIUS + pulse * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.fill();
          }
        }
      }

      // Traveling energy particles along grid lines
      const particleCount = 8;
      for (let p = 0; p < particleCount; p++) {
        const seed = p * 137.5;
        const isHorizontal = p % 2 === 0;
        const speed = 0.5 + (p % 3) * 0.3;
        const lineIdx = Math.floor((seed * 7.3) % (isHorizontal ? rows : cols));

        if (isHorizontal) {
          const y = lineIdx * CELL - flowY;
          const x = ((time * speed + seed * 50) % (w + 200)) - 100;
          const trailLen = 80;

          const grad = ctx.createLinearGradient(x - trailLen, y, x, y);
          grad.addColorStop(0, "rgba(16, 185, 129, 0)");
          grad.addColorStop(1, "rgba(52, 211, 153, 0.2)");

          ctx.beginPath();
          ctx.moveTo(x - trailLen, y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(110, 231, 183, 0.4)";
          ctx.fill();
        } else {
          const x = lineIdx * CELL - flowX;
          const y = ((time * speed + seed * 50) % (h + 200)) - 100;
          const trailLen = 80;

          const grad = ctx.createLinearGradient(x, y - trailLen, x, y);
          grad.addColorStop(0, "rgba(16, 185, 129, 0)");
          grad.addColorStop(1, "rgba(52, 211, 153, 0.2)");

          ctx.beginPath();
          ctx.moveTo(x, y - trailLen);
          ctx.lineTo(x, y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(110, 231, 183, 0.4)";
          ctx.fill();
        }
      }

      // Radial vignette from center
      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        w * 0.1,
        w / 2,
        h / 2,
        w * 0.7,
      );
      gradient.addColorStop(0, "rgba(10, 15, 13, 0)");
      gradient.addColorStop(1, "rgba(10, 15, 13, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      time++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-1"
      style={{ opacity: 0.7 }}
    />
  );
};
