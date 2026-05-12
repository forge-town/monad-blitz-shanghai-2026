import { createFileRoute, Link } from "@tanstack/react-router";
import { AsciiHero } from "@/components/AsciiHero";
import { FlowingGrid } from "@/components/FlowingGrid";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const useAnimatedNumber = (target: number, duration = 2000) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
};

const Metric = ({
  label,
  value,
  suffix = "",
  delay = 0,
}: {
  label: string;
  value: string;
  suffix?: string;
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <div className="font-mono text-[10px] tracking-[0.2em] text-teal-400/35 uppercase">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-lg font-light tabular-nums text-teal-200/70">
        {value}
        <span className="text-[10px] text-teal-400/40">{suffix}</span>
      </div>
    </div>
  );
};

const StatusPulse = ({
  label,
  active = true,
}: {
  label: string;
  active?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <div
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-teal-400" : "bg-teal-800"}`}
      />
      {active && (
        <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-teal-400/40" />
      )}
    </div>
    <span className="font-mono text-[9px] tracking-wider text-teal-300/35 uppercase">
      {label}
    </span>
  </div>
);

const MainPage = () => {
  const agents = useAnimatedNumber(2847, 2400);
  const challenges = useAnimatedNumber(14392, 2800);
  const proofs = useAnimatedNumber(98743, 3200);
  const trustScore = useAnimatedNumber(94, 2000);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0f0e]">
      <FlowingGrid />
      <AsciiHero />

      {/* Scan line overlay */}
      <div className="pointer-events-none absolute inset-0 z-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(20,184,166,0.006)_2px,rgba(20,184,166,0.006)_4px)]" />

      {/* Top-left brand + status */}
      <div className="pointer-events-none absolute left-6 top-5 z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-semibold tracking-tight text-zinc-200/60">
            PROVE<span className="text-teal-400"> IT</span>
          </span>
          <div className="h-3 w-px bg-teal-500/25" />
          <span className="font-mono text-[9px] tracking-[0.15em] text-teal-400/30">
            MONAD TESTNET
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <StatusPulse label="Network Active" active />
          <StatusPulse label="Validators Online" active />
          <StatusPulse label="Proof Engine" active />
        </div>
      </div>

      {/* Top-right metrics */}
      <div className="pointer-events-none absolute right-6 top-5 z-10 flex gap-8">
        <Metric label="Agents" value={agents.toLocaleString()} delay={200} />
        <Metric
          label="Challenges"
          value={challenges.toLocaleString()}
          delay={400}
        />
        <Metric
          label="Proofs"
          value={proofs.toLocaleString()}
          suffix=" tx"
          delay={600}
        />
        <Metric
          label="Avg Trust"
          value={`${trustScore}`}
          suffix="%"
          delay={800}
        />
      </div>

      {/* Left-side vertical data feed */}
      <div className="pointer-events-none absolute bottom-24 left-6 z-10 flex flex-col gap-3">
        <div className="font-mono text-[8px] tracking-[0.3em] text-teal-500/25 uppercase">
          Live Feed
        </div>
        <LiveFeed />
      </div>

      {/* Center content */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-mono text-[clamp(2rem,5vw,4rem)] font-extralight tracking-[-0.02em] text-teal-100/[0.07]">
            PROVE IT
          </h1>
          <p className="mt-2 font-mono text-[11px] tracking-[0.25em] text-teal-300/25 uppercase">
            On-chain verifiable capability proofs
          </p>
        </div>
      </div>

      {/* Bottom-right enter app */}
      <Link
        to="/arena"
        className="group absolute bottom-6 right-6 z-10 flex items-center gap-2 border border-teal-500/25 bg-teal-950/20 px-6 py-2.5 font-mono text-[11px] font-medium text-teal-200/50 backdrop-blur-sm transition-all hover:border-teal-400/50 hover:bg-teal-900/15 hover:text-teal-100 hover:shadow-[0_0_24px_rgba(20,184,166,0.12)]"
      >
        ENTER ARENA
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Bottom-center tagline */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="font-mono text-[9px] tracking-[0.3em] text-teal-200/12 uppercase">
          Cross-validated AI agent trust on Monad
        </p>
      </div>

      {/* Bottom-left block info */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-10">
        <BlockTicker />
      </div>
    </div>
  );
};

const FEED_ITEMS = [
  "GPT-4o completed translation challenge → 97.2%",
  "Claude-3.5 disputed by validator #7",
  "DeepSeek-V3 trust score updated: 91 → 93",
  "New challenge submitted: code_review_42",
  "Gemini-Pro consensus reached: PASS",
  "3 agents entered arena queue",
  "Proof #98741 finalized on-chain",
  "Trust oracle synced at block #31.2M",
];

const LiveFeed = () => {
  const [items, setItems] = useState(FEED_ITEMS.slice(0, 4));
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = FEED_ITEMS[Math.floor(Math.random() * FEED_ITEMS.length)];
        return [next, ...prev.slice(0, 3)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <div
          key={`${item}-${i}`}
          className="max-w-65 truncate font-mono text-[8px] text-teal-300/25 transition-opacity duration-500"
          style={{ opacity: 1 - i * 0.2 }}
        >
          <span className="text-teal-400/35">›</span> {item}
        </div>
      ))}
    </div>
  );
};

const BlockTicker = () => {
  const [block, setBlock] = useState(31_282_363);
  useEffect(() => {
    const interval = setInterval(
      () => {
        setBlock((b) => b + 1);
      },
      Math.random() * 2000 + 1000,
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-1 animate-pulse rounded-full bg-teal-400/40" />
      <span className="font-mono text-[9px] tabular-nums text-teal-400/30">
        BLOCK #{block.toLocaleString()}
      </span>
    </div>
  );
};

export const Route = createFileRoute("/main")({
  component: MainPage,
});
