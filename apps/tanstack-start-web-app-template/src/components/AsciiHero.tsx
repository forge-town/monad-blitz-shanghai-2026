import { useEffect, useRef, useCallback } from "react";

const CHARSET = " .·:;+*#%@█";

const AGENTS = [
  { name: "NEXUS-7", trust: "94%", challenges: "127", passed: "119", category: "REASONING", status: "VERIFIED" },
  { name: "CIPHER-X", trust: "87%", challenges: "89", passed: "77", category: "CODE GEN", status: "ACTIVE" },
  { name: "AEGIS-3", trust: "96%", challenges: "203", passed: "195", category: "SECURITY", status: "VERIFIED" },
];

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scatterX: number;
  scatterY: number;
  char: string;
  color: string;
  fontSize: number;
  alpha: number;
  glow: boolean;
}

type Phase = "stable" | "scatter" | "reform";

interface SceneLayout {
  portraitX: number;
  portraitY: number;
  metricsX: number;
  metricsY: number;
  agentIndex: number;
}

const LAYOUTS: SceneLayout[] = [
  { portraitX: 0.28, portraitY: 0.48, metricsX: 0.60, metricsY: 0.48, agentIndex: 0 },
  { portraitX: 0.70, portraitY: 0.40, metricsX: 0.10, metricsY: 0.60, agentIndex: 1 },
  { portraitX: 0.30, portraitY: 0.44, metricsX: 0.62, metricsY: 0.52, agentIndex: 2 },
];

function brightnessToBlue(b: number): string {
  const r = Math.floor(10 + b * 55);
  const g = Math.floor(25 + b * 120);
  const bl = Math.floor(90 + b * 165);
  return `rgb(${r},${g},${bl})`;
}

function fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

/* ── Portrait drawing (offscreen canvas, grayscale) ── */

function drawPortrait(idx: number, ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  if (idx === 0) drawRobot(ctx, w, h);
  else if (idx === 1) drawCat(ctx, w, h);
  else drawHuman(ctx, w, h);
}

function drawRobot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.12);
  ctx.lineTo(w * 0.5, h * 0.03);
  ctx.stroke();
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.025, w * 0.03, 0, Math.PI * 2);
  ctx.fill();

  const hg = ctx.createRadialGradient(w * 0.5, h * 0.3, w * 0.05, w * 0.5, h * 0.3, w * 0.38);
  hg.addColorStop(0, "#777");
  hg.addColorStop(0.6, "#444");
  hg.addColorStop(1, "#111");
  ctx.fillStyle = hg;
  fillRoundRect(ctx, w * 0.16, h * 0.1, w * 0.68, h * 0.42, w * 0.08);

  ctx.fillStyle = "#1a1a1a";
  fillRoundRect(ctx, w * 0.22, h * 0.24, w * 0.56, h * 0.13, w * 0.03);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(w * 0.36, h * 0.3, w * 0.065, 0, Math.PI * 2);
  ctx.arc(w * 0.64, h * 0.3, w * 0.065, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#222";
  fillRoundRect(ctx, w * 0.3, h * 0.42, w * 0.4, h * 0.07, w * 0.02);
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.3 + (w * 0.4 / 5) * i, h * 0.42);
    ctx.lineTo(w * 0.3 + (w * 0.4 / 5) * i, h * 0.49);
    ctx.stroke();
  }

  ctx.fillStyle = "#333";
  fillRoundRect(ctx, w * 0.06, h * 0.22, w * 0.1, h * 0.18, w * 0.02);
  fillRoundRect(ctx, w * 0.84, h * 0.22, w * 0.1, h * 0.18, w * 0.02);

  ctx.fillStyle = "#333";
  ctx.fillRect(w * 0.38, h * 0.52, w * 0.24, h * 0.1);

  const sg = ctx.createLinearGradient(0, h * 0.62, 0, h);
  sg.addColorStop(0, "#555");
  sg.addColorStop(1, "#111");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.62);
  ctx.quadraticCurveTo(w * 0.05, h * 0.68, w * 0.05, h);
  ctx.lineTo(w * 0.95, h);
  ctx.quadraticCurveTo(w * 0.95, h * 0.68, w * 0.62, h * 0.62);
  ctx.closePath();
  ctx.fill();
}

function drawCat(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const earData: [number, number, number, number, number, number][] = [
    [w * 0.22, h * 0.26, w * 0.14, h * 0.04, w * 0.36, h * 0.24],
    [w * 0.78, h * 0.26, w * 0.86, h * 0.04, w * 0.64, h * 0.24],
  ];
  for (const [bx, by, tx, ty, ex, ey] of earData) {
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.lineTo(ex, ey);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(bx + (tx - bx) * 0.15, by - (by - ty) * 0.05);
    ctx.lineTo(tx, ty + (by - ty) * 0.15);
    ctx.lineTo(ex + (tx - ex) * 0.15, ey - (ey - ty) * 0.05);
    ctx.closePath();
    ctx.fill();
  }

  const fg = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.05, w * 0.5, h * 0.4, w * 0.36);
  fg.addColorStop(0, "#777");
  fg.addColorStop(0.5, "#444");
  fg.addColorStop(1, "#111");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.4, w * 0.34, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(w * 0.36, h * 0.36, w * 0.07, h * 0.035, -0.15, 0, Math.PI * 2);
  ctx.ellipse(w * 0.64, h * 0.36, w * 0.07, h * 0.035, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#999";
  ctx.fillRect(w * 0.355, h * 0.34, w * 0.015, h * 0.04);
  ctx.fillRect(w * 0.635, h * 0.34, w * 0.015, h * 0.04);

  ctx.fillStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.43);
  ctx.lineTo(w * 0.47, h * 0.46);
  ctx.lineTo(w * 0.53, h * 0.46);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#888";
  ctx.lineWidth = 0.8;
  const whiskers: [number, number, number, number][] = [
    [0.08, 0.4, 0.33, 0.44], [0.06, 0.44, 0.33, 0.46], [0.08, 0.48, 0.33, 0.47],
    [0.92, 0.4, 0.67, 0.44], [0.94, 0.44, 0.67, 0.46], [0.92, 0.48, 0.67, 0.47],
  ];
  for (const [x1, y1, x2, y2] of whiskers) {
    ctx.beginPath();
    ctx.moveTo(w * x1, h * y1);
    ctx.lineTo(w * x2, h * y2);
    ctx.stroke();
  }

  const bg = ctx.createRadialGradient(w * 0.5, h * 0.8, w * 0.05, w * 0.5, h * 0.8, w * 0.45);
  bg.addColorStop(0, "#555");
  bg.addColorStop(0.6, "#333");
  bg.addColorStop(1, "#111");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.88, w * 0.42, h * 0.28, 0, Math.PI, 0);
  ctx.fill();
}

function drawHuman(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.18, w * 0.28, h * 0.14, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(w * 0.22, h * 0.18, w * 0.56, h * 0.06);

  const fg = ctx.createRadialGradient(w * 0.5, h * 0.32, w * 0.05, w * 0.5, h * 0.32, w * 0.3);
  fg.addColorStop(0, "#888");
  fg.addColorStop(0.5, "#555");
  fg.addColorStop(1, "#111");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.33, w * 0.25, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.42, w * 0.17, h * 0.09, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(w * 0.39, h * 0.3, w * 0.05, h * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.61, h * 0.3, w * 0.05, h * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.33, h * 0.27);
  ctx.quadraticCurveTo(w * 0.39, h * 0.26, w * 0.45, h * 0.27);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.27);
  ctx.quadraticCurveTo(w * 0.61, h * 0.26, w * 0.67, h * 0.27);
  ctx.stroke();

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.33);
  ctx.quadraticCurveTo(w * 0.47, h * 0.39, w * 0.46, h * 0.4);
  ctx.stroke();

  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.46, w * 0.07, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.fillStyle = "#444";
  ctx.fillRect(w * 0.4, h * 0.51, w * 0.2, h * 0.1);

  const sg = ctx.createLinearGradient(0, h * 0.61, 0, h);
  sg.addColorStop(0, "#555");
  sg.addColorStop(0.5, "#333");
  sg.addColorStop(1, "#111");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(w * 0.4, h * 0.61);
  ctx.quadraticCurveTo(w * 0.06, h * 0.66, w * 0.05, h);
  ctx.lineTo(w * 0.95, h);
  ctx.quadraticCurveTo(w * 0.94, h * 0.66, w * 0.6, h * 0.61);
  ctx.closePath();
  ctx.fill();
}

/* ── Image → ASCII particles ── */

function renderPortraitParticles(
  portraitIdx: number,
  destX: number, destY: number,
  destW: number, destH: number,
  charSize: number,
): Particle[] {
  const srcW = 100;
  const srcH = 130;
  const offscreen = document.createElement("canvas");
  offscreen.width = srcW;
  offscreen.height = srcH;
  const ctx = offscreen.getContext("2d");
  if (!ctx) return [];

  drawPortrait(portraitIdx, ctx, srcW, srcH);
  const imgData = ctx.getImageData(0, 0, srcW, srcH);

  const spacing = charSize * 0.55;
  const cols = Math.floor(destW / spacing);
  const rows = Math.floor(destH / spacing);
  const particles: Particle[] = [];

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const sx = Math.floor((gx / cols) * srcW);
      const sy = Math.floor((gy / rows) * srcH);
      const idx = (sy * srcW + sx) * 4;
      const r = imgData.data[idx];
      const g = imgData.data[idx + 1];
      const b = imgData.data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      if (brightness < 0.04) continue;
      const charIdx = Math.floor(brightness * (CHARSET.length - 1));
      const char = CHARSET[Math.min(charIdx, CHARSET.length - 1)];
      if (char === " ") continue;

      const px = destX + gx * spacing;
      const py = destY + gy * spacing;

      particles.push({
        x: px, y: py, targetX: px, targetY: py,
        scatterX: 0, scatterY: 0,
        char, color: brightnessToBlue(brightness), fontSize: charSize,
        alpha: 1, glow: brightness > 0.85,
      });
    }
  }
  return particles;
}

/* ── Metrics → particles ── */

function metricsToParticles(agentIdx: number, startX: number, centerY: number, charSize: number): Particle[] {
  const agent = AGENTS[agentIdx];
  const particles: Particle[] = [];

  const lines: Array<{ text: string; size: number; color: string; glow: boolean }> = [
    { text: `◈ ${agent.name}`, size: charSize * 2.4, color: "rgba(167,139,250,1)", glow: true },
    { text: "", size: charSize * 0.5, color: "", glow: false },
    { text: "TRUST SCORE", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: agent.trust, size: charSize * 3.5, color: "rgba(120,200,255,1)", glow: true },
    { text: "", size: charSize * 0.6, color: "", glow: false },
    { text: "CHALLENGES", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: `${agent.passed} / ${agent.challenges}`, size: charSize * 1.8, color: "rgba(255,255,255,0.8)", glow: false },
    { text: "", size: charSize * 0.5, color: "", glow: false },
    { text: "CATEGORY", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: agent.category, size: charSize * 1.5, color: "rgba(167,139,250,0.85)", glow: false },
    { text: "", size: charSize * 0.4, color: "", glow: false },
    { text: `STATUS: ${agent.status}`, size: charSize, color: agent.status === "VERIFIED" ? "rgba(100,255,180,0.7)" : "rgba(255,200,100,0.7)", glow: false },
  ];

  let totalH = 0;
  for (const l of lines) totalH += l.size * 1.4;
  let y = centerY - totalH / 2;

  for (const line of lines) {
    if (!line.text) { y += line.size * 1.4; continue; }
    let x = startX;
    for (const c of line.text) {
      if (c === " ") { x += line.size * 0.35; continue; }
      particles.push({
        x, y, targetX: x, targetY: y,
        scatterX: 0, scatterY: 0,
        char: c, color: line.color, fontSize: line.size,
        alpha: 1, glow: line.glow,
      });
      x += line.size * 0.6;
    }
    y += line.size * 1.4;
  }
  return particles;
}

/* ── Scene builder ── */

function buildScene(layout: SceneLayout, w: number, h: number): Particle[] {
  const charSize = Math.max(7, Math.min(13, w / 130));
  const portW = Math.min(w * 0.35, h * 0.55);
  const portH = portW * 1.3;
  const portX = w * layout.portraitX - portW / 2;
  const portY = h * layout.portraitY - portH / 2;

  const portrait = renderPortraitParticles(layout.agentIndex, portX, portY, portW, portH, charSize);
  const metrics = metricsToParticles(layout.agentIndex, w * layout.metricsX, h * layout.metricsY, charSize);
  return [...portrait, ...metrics];
}

/* ── Uniform scatter positions ── */

function computeScatterPositions(particles: Particle[], w: number, h: number) {
  const n = particles.length;
  if (n === 0) return;
  const aspect = w / h;
  const cols = Math.ceil(Math.sqrt(n * aspect));
  const rows = Math.ceil(n / cols);
  const cellW = w / cols;
  const cellH = h / rows;

  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < n; i++) {
    const si = indices[i];
    const gx = si % cols;
    const gy = Math.floor(si / cols);
    particles[i].scatterX = cellW * (gx + 0.3 + Math.random() * 0.4);
    particles[i].scatterY = cellH * (gy + 0.3 + Math.random() * 0.4);
  }
}

/* ── Background ── */

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, layout: SceneLayout) {
  ctx.strokeStyle = "rgba(139,92,246,0.025)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const grd = ctx.createRadialGradient(
    w * layout.portraitX, h * layout.portraitY, 0,
    w * layout.portraitX, h * layout.portraitY, Math.min(w, h) * 0.4,
  );
  grd.addColorStop(0, "rgba(30,50,120,0.1)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  const cn = 50;
  const m = 24;
  ctx.strokeStyle = "rgba(139,92,246,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(m, m + cn); ctx.lineTo(m, m); ctx.lineTo(m + cn, m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - m - cn, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + cn); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m, h - m - cn); ctx.lineTo(m, h - m); ctx.lineTo(m + cn, h - m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - m - cn, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - cn); ctx.stroke();
}

/* ── Component ── */

const FONT = '"Menlo", "Consolas", "Courier New", monospace';

export const AsciiHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    particles: [] as Particle[],
    scene: 0,
    phase: "stable" as Phase,
    frame: 0,
  });
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  const initScene = useCallback((canvas: HTMLCanvasElement, idx: number) => {
    const rect = canvas.getBoundingClientRect();
    return buildScene(LAYOUTS[idx % LAYOUTS.length], rect.width, rect.height);
  }, []);

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current.particles = initScene(canvas, stateRef.current.scene);
    };
    resize();
    window.addEventListener("resize", resize);

    const startTransition = () => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();

      s.phase = "scatter";
      computeScatterPositions(s.particles, rect.width, rect.height);

      setTimeout(() => {
        s.scene = (s.scene + 1) % LAYOUTS.length;
        const newP = initScene(canvas, s.scene);
        const result: Particle[] = [];

        for (let i = 0; i < newP.length; i++) {
          const t = newP[i];
          if (i < s.particles.length) {
            const old = s.particles[i];
            result.push({ ...t, x: old.x, y: old.y, scatterX: old.scatterX, scatterY: old.scatterY, alpha: old.alpha });
          } else {
            result.push({ ...t, x: Math.random() * rect.width, y: Math.random() * rect.height, alpha: 0 });
          }
        }

        s.particles = result;
        s.phase = "reform";
        setTimeout(() => { s.phase = "stable"; }, 2000);
      }, 1500);
    };

    const animate = () => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      s.frame++;

      drawBackground(ctx, rect.width, rect.height, LAYOUTS[s.scene % LAYOUTS.length]);

      for (const p of s.particles) {
        if (s.phase === "scatter") {
          p.x += (p.scatterX - p.x) * 0.055;
          p.y += (p.scatterY - p.y) * 0.055;
          p.alpha = Math.max(0.35, p.alpha - 0.008);
        } else if (s.phase === "reform") {
          p.x += (p.targetX - p.x) * 0.06;
          p.y += (p.targetY - p.y) * 0.06;
          p.alpha = Math.min(1, p.alpha + 0.02);
        } else {
          const noise = Math.sin(s.frame * 0.015 + p.targetX * 0.02 + p.targetY * 0.02) * 0.3;
          p.x += (p.targetX + noise - p.x) * 0.1;
          p.y += (p.targetY - p.y) * 0.1;
          p.alpha = Math.min(1, p.alpha + 0.04);
        }

        if (p.alpha < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `bold ${p.fontSize}px ${FONT}`;
        ctx.fillStyle = p.color;

        if (p.glow && p.alpha > 0.3) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
        }

        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    timerRef.current = window.setInterval(startTransition, 6000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initScene]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-screen w-screen" />;
};
