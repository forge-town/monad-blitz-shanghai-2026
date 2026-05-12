import { useEffect, useRef, useCallback } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  char: string;
  alpha: number;
  vx: number;
  vy: number;
  font: string;
  color: string;
  phase: "stable" | "exploding" | "forming";
}

interface ShatterTextProps {
  texts: string[];
  intervalMs?: number;
  font?: string;
  fontSize?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}

function sampleTextParticles(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  fontSize: number,
  maxWidth: number,
  color: string,
  accentColor: string,
): Particle[] {
  const particles: Particle[] = [];
  const fontStr = `${fontSize}px ${font}`;
  const lineHeight = Math.round(fontSize * 1.3);

  const prepared = prepareWithSegments(text, fontStr);
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);

  const totalHeight = lines.length * lineHeight;
  const startY = (ctx.canvas.height - totalHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineX = (ctx.canvas.width - line.width) / 2;
    const lineY = startY + i * lineHeight + fontSize;

    ctx.font = fontStr;
    let charX = lineX;

    for (const char of line.text) {
      if (char === " ") {
        charX += ctx.measureText(" ").width;
        continue;
      }

      const charWidth = ctx.measureText(char).width;
      const isAccent = /[A-Z0-9]/.test(char);

      particles.push({
        x: charX,
        y: lineY,
        targetX: charX,
        targetY: lineY,
        originX: charX,
        originY: lineY,
        char,
        alpha: 1,
        vx: 0,
        vy: 0,
        font: fontStr,
        color: isAccent ? accentColor : color,
        phase: "stable",
      });

      charX += charWidth;
    }
  }

  return particles;
}

export const ShatterText = ({
  texts,
  intervalMs = 4000,
  font = "Inter, system-ui, sans-serif",
  fontSize = 48,
  color = "rgba(255,255,255,0.9)",
  accentColor = "rgba(130,100,255,1)",
  className,
}: ShatterTextProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const textIndexRef = useRef(0);
  const phaseRef = useRef<"stable" | "exploding" | "forming">("stable");
  const timerRef = useRef(0);
  const rafRef = useRef(0);

  const initParticles = useCallback(
    (canvas: HTMLCanvasElement, index: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const text = texts[index % texts.length];
      const maxWidth = canvas.width * 0.85;
      particlesRef.current = sampleTextParticles(ctx, text, font, fontSize, maxWidth, color, accentColor);
    },
    [texts, font, fontSize, color, accentColor],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      initParticles(canvas, textIndexRef.current);
    };

    resize();
    window.addEventListener("resize", resize);

    const explode = () => {
      phaseRef.current = "exploding";
      for (const p of particlesRef.current) {
        p.phase = "exploding";
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 2;
      }

      setTimeout(() => {
        textIndexRef.current = (textIndexRef.current + 1) % texts.length;
        initParticles(canvas, textIndexRef.current);

        for (const p of particlesRef.current) {
          p.phase = "forming";
          const angle = Math.random() * Math.PI * 2;
          const dist = 100 + Math.random() * 300;
          p.x = p.targetX + Math.cos(angle) * dist;
          p.y = p.targetY + Math.sin(angle) * dist;
          p.alpha = 0;
        }

        phaseRef.current = "forming";

        setTimeout(() => {
          phaseRef.current = "stable";
          for (const p of particlesRef.current) {
            p.phase = "stable";
          }
        }, 1200);
      }, 800);
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const p of particlesRef.current) {
        if (p.phase === "exploding") {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.alpha = Math.max(0, p.alpha - 0.015);
        } else if (p.phase === "forming") {
          p.x += (p.targetX - p.x) * 0.08;
          p.y += (p.targetY - p.y) * 0.08;
          p.alpha = Math.min(1, p.alpha + 0.025);
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = p.font;
        ctx.fillStyle = p.color;

        if (p.phase === "stable" && p.color === accentColor) {
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 8;
        }

        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    timerRef.current = window.setInterval(explode, intervalMs);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [texts, intervalMs, font, fontSize, color, accentColor, initParticles]);

  return <canvas ref={canvasRef} className={className} />;
};
