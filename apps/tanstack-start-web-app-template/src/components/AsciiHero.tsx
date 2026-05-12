import { useEffect, useRef, useCallback } from "react";

const CHARSET = " .·:;+*#%@█";

const AGENTS = [
  { name: "NEXUS-7", trust: "94%", challenges: "127", passed: "119", category: "REASONING", status: "VERIFIED" },
  { name: "CIPHER-X", trust: "87%", challenges: "89", passed: "77", category: "CODE GEN", status: "ACTIVE" },
  { name: "AEGIS-3", trust: "96%", challenges: "203", passed: "195", category: "SECURITY", status: "VERIFIED" },
  { name: "ORACLE-9", trust: "91%", challenges: "156", passed: "142", category: "ANALYSIS", status: "VERIFIED" },
  { name: "FLUX-2", trust: "82%", challenges: "64", passed: "52", category: "CREATIVE", status: "ACTIVE" },
  { name: "PRISM-4", trust: "98%", challenges: "312", passed: "306", category: "MATH", status: "VERIFIED" },
];

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scatterX: number;
  scatterY: number;
  vx: number;
  vy: number;
  char: string;
  origChar: string;
  color: string;
  fontSize: number;
  alpha: number;
  glow: boolean;
  delay: number;
}

type Phase = "stable" | "scatter" | "reform";

interface SceneLayout {
  portraitX: number;
  portraitY: number;
  metricsX: number;
  metricsY: number;
  agentIndex: number;
  portraitIndex: number;
  colorIndex: number;
}

/* ── Layout positions ── */
const POSITION_VARIANTS = [
  { portraitX: 0.28, portraitY: 0.48, metricsX: 0.60, metricsY: 0.48 },
  { portraitX: 0.70, portraitY: 0.40, metricsX: 0.10, metricsY: 0.60 },
  { portraitX: 0.30, portraitY: 0.44, metricsX: 0.62, metricsY: 0.52 },
  { portraitX: 0.72, portraitY: 0.50, metricsX: 0.08, metricsY: 0.45 },
  { portraitX: 0.50, portraitY: 0.42, metricsX: 0.08, metricsY: 0.58 },
];

/* ── Color palettes for ASCII portraits ── */
type ColorFn = (b: number) => string;

const COLOR_PALETTES: { portrait: ColorFn; accent: string; glow: string }[] = [
  {
    // Electric blue
    portrait: (b) => `rgb(${Math.floor(10 + b * 55)},${Math.floor(25 + b * 120)},${Math.floor(90 + b * 165)})`,
    accent: "rgba(100,180,255,1)",
    glow: "rgba(100,180,255,0.6)",
  },
  {
    // Violet / purple
    portrait: (b) => `rgb(${Math.floor(50 + b * 130)},${Math.floor(15 + b * 60)},${Math.floor(90 + b * 165)})`,
    accent: "rgba(200,130,255,1)",
    glow: "rgba(200,130,255,0.6)",
  },
  {
    // Cyan / teal
    portrait: (b) => `rgb(${Math.floor(5 + b * 40)},${Math.floor(60 + b * 195)},${Math.floor(70 + b * 180)})`,
    accent: "rgba(80,240,220,1)",
    glow: "rgba(80,240,220,0.6)",
  },
  {
    // Amber / gold
    portrait: (b) => `rgb(${Math.floor(80 + b * 175)},${Math.floor(50 + b * 140)},${Math.floor(5 + b * 30)})`,
    accent: "rgba(255,200,80,1)",
    glow: "rgba(255,200,80,0.6)",
  },
  {
    // Green / matrix
    portrait: (b) => `rgb(${Math.floor(5 + b * 30)},${Math.floor(50 + b * 200)},${Math.floor(15 + b * 60)})`,
    accent: "rgba(100,255,140,1)",
    glow: "rgba(100,255,140,0.6)",
  },
  {
    // Rose / pink
    portrait: (b) => `rgb(${Math.floor(70 + b * 185)},${Math.floor(15 + b * 60)},${Math.floor(40 + b * 100)})`,
    accent: "rgba(255,120,180,1)",
    glow: "rgba(255,120,180,0.6)",
  },
];

const NUM_PORTRAITS = 3; // robot, cat, human

function randomLayout(prevLayout: SceneLayout | null): SceneLayout {
  let posIdx: number;
  do {
    posIdx = Math.floor(Math.random() * POSITION_VARIANTS.length);
  } while (prevLayout && POSITION_VARIANTS[posIdx].portraitX === prevLayout.portraitX);

  let portraitIdx: number;
  do {
    portraitIdx = Math.floor(Math.random() * NUM_PORTRAITS);
  } while (prevLayout && portraitIdx === prevLayout.portraitIndex);

  let colorIdx: number;
  do {
    colorIdx = Math.floor(Math.random() * COLOR_PALETTES.length);
  } while (prevLayout && colorIdx === prevLayout.colorIndex);

  const agentIdx = Math.floor(Math.random() * AGENTS.length);

  const pos = POSITION_VARIANTS[posIdx];
  return {
    portraitX: pos.portraitX,
    portraitY: pos.portraitY,
    metricsX: pos.metricsX,
    metricsY: pos.metricsY,
    agentIndex: agentIdx,
    portraitIndex: portraitIdx,
    colorIndex: colorIdx,
  };
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
  colorFn: ColorFn,
): Particle[] {
  const srcW = 200;
  const srcH = 260;
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
        scatterX: 0, scatterY: 0, vx: 0, vy: 0,
        char, origChar: char, color: colorFn(brightness), fontSize: charSize,
        alpha: 1, glow: brightness > 0.85, delay: 0,
      });
    }
  }
  return particles;
}

/* ── Metrics → particles ── */

function metricsToParticles(agentIdx: number, startX: number, centerY: number, charSize: number, palette: typeof COLOR_PALETTES[number]): Particle[] {
  const agent = AGENTS[agentIdx % AGENTS.length];
  const particles: Particle[] = [];

  const lines: Array<{ text: string; size: number; color: string; glow: boolean }> = [
    { text: `◈ ${agent.name}`, size: charSize * 2.4, color: palette.accent, glow: true },
    { text: "", size: charSize * 0.5, color: "", glow: false },
    { text: "TRUST SCORE", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: agent.trust, size: charSize * 3.5, color: palette.accent, glow: true },
    { text: "", size: charSize * 0.6, color: "", glow: false },
    { text: "CHALLENGES", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: `${agent.passed} / ${agent.challenges}`, size: charSize * 1.8, color: "rgba(255,255,255,0.8)", glow: false },
    { text: "", size: charSize * 0.5, color: "", glow: false },
    { text: "CATEGORY", size: charSize * 0.85, color: "rgba(255,255,255,0.3)", glow: false },
    { text: agent.category, size: charSize * 1.5, color: palette.accent.replace(",1)", ",0.85)"), glow: false },
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
        scatterX: 0, scatterY: 0, vx: 0, vy: 0,
        char: c, origChar: c, color: line.color, fontSize: line.size,
        alpha: 1, glow: line.glow, delay: 0,
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

  const palette = COLOR_PALETTES[layout.colorIndex % COLOR_PALETTES.length];
  const portrait = renderPortraitParticles(layout.portraitIndex, portX, portY, portW, portH, charSize, palette.portrait);
  const metrics = metricsToParticles(layout.agentIndex, w * layout.metricsX, h * layout.metricsY, charSize, palette);
  return [...portrait, ...metrics];
}

/* ── Explosive scatter with velocity ── */

function computeExplosiveScatter(particles: Particle[], w: number, h: number) {
  const n = particles.length;
  if (n === 0) return;

  let cx = 0, cy = 0;
  for (const p of particles) { cx += p.targetX; cy += p.targetY; }
  cx /= n; cy /= n;

  for (let i = 0; i < n; i++) {
    const p = particles[i];
    const dx = p.targetX - cx;
    const dy = p.targetY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
    const speed = 3 + Math.random() * 8;

    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.delay = (dist / Math.max(w, h)) * 12;

    const finalDist = 200 + Math.random() * 400;
    p.scatterX = cx + Math.cos(angle) * finalDist;
    p.scatterY = cy + Math.sin(angle) * finalDist;

    p.scatterX = Math.max(-100, Math.min(w + 100, p.scatterX));
    p.scatterY = Math.max(-100, Math.min(h + 100, p.scatterY));
  }
}

const GLITCH_CHARS = "!@#$%^&*<>{}[]|/\\~`░▒▓█▄▀■□▪▫";

function glitchChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

/* ── Background ── */

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, layout: SceneLayout, frame: number) {
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

  // Scan line
  const scanY = (frame * 1.5) % (h + 40) - 20;
  const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
  scanGrad.addColorStop(0, "transparent");
  scanGrad.addColorStop(0.5, "rgba(100,180,255,0.04)");
  scanGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 20, w, 40);

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
    layout: null as SceneLayout | null,
    phase: "stable" as Phase,
    frame: 0,
  });
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  const initScene = useCallback((canvas: HTMLCanvasElement, layout: SceneLayout) => {
    const rect = canvas.getBoundingClientRect();
    return buildScene(layout, rect.width, rect.height);
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
      if (!stateRef.current.layout) {
        stateRef.current.layout = randomLayout(null);
      }
      stateRef.current.particles = initScene(canvas, stateRef.current.layout);
    };
    resize();
    window.addEventListener("resize", resize);

    const startTransition = () => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();

      s.phase = "scatter";
      computeExplosiveScatter(s.particles, rect.width, rect.height);

      setTimeout(() => {
        s.layout = randomLayout(s.layout);
        const newP = initScene(canvas, s.layout);
        const result: Particle[] = [];

        for (let i = 0; i < newP.length; i++) {
          const t = newP[i];
          if (i < s.particles.length) {
            const old = s.particles[i];
            result.push({
              ...t,
              x: old.x, y: old.y,
              scatterX: old.scatterX, scatterY: old.scatterY,
              vx: 0, vy: 0,
              alpha: Math.max(old.alpha, 0.15),
              delay: Math.random() * 8,
            });
          } else {
            result.push({
              ...t,
              x: rect.width * 0.5 + (Math.random() - 0.5) * rect.width * 0.8,
              y: rect.height * 0.5 + (Math.random() - 0.5) * rect.height * 0.8,
              alpha: 0,
              delay: Math.random() * 15,
            });
          }
        }

        s.particles = result;
        s.phase = "reform";
        setTimeout(() => { s.phase = "stable"; }, 2200);
      }, 1400);
    };

    let prevTime = 0;
    const animate = (time: number) => {
      const dt = prevTime ? Math.min((time - prevTime) / 16.67, 3) : 1;
      prevTime = time;

      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();

      // Trail effect — semi-transparent clear
      if (s.phase === "scatter") {
        ctx.fillStyle = "rgba(10,10,15,0.25)";
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
      s.frame++;

      drawBackground(ctx, rect.width, rect.height, s.layout!, s.frame);

      for (const p of s.particles) {
        if (s.phase === "scatter") {
          // Explosive burst with velocity
          if (p.delay > 0) {
            p.delay -= dt;
          } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.x += (p.scatterX - p.x) * 0.03 * dt;
            p.y += (p.scatterY - p.y) * 0.03 * dt;
          }
          p.alpha = Math.max(0.1, p.alpha - 0.012 * dt);
          // Glitch chars during scatter
          if (Math.random() < 0.06) p.char = glitchChar();
        } else if (s.phase === "reform") {
          if (p.delay > 0) {
            p.delay -= dt;
          } else {
            p.x += (p.targetX - p.x) * 0.08 * dt;
            p.y += (p.targetY - p.y) * 0.08 * dt;
            p.alpha = Math.min(1, p.alpha + 0.03 * dt);
            // Restore original char during reform
            if (Math.random() < 0.1) p.char = p.origChar;
          }
        } else {
          // Stable: subtle breathing
          const noise = Math.sin(s.frame * 0.012 + p.targetX * 0.015 + p.targetY * 0.015) * 0.4;
          p.x += (p.targetX + noise - p.x) * 0.12 * dt;
          p.y += (p.targetY - p.y) * 0.12 * dt;
          p.alpha = Math.min(1, p.alpha + 0.05 * dt);
          p.char = p.origChar;
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
    timerRef.current = window.setInterval(startTransition, 5500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initScene]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-screen w-screen" />;
};
