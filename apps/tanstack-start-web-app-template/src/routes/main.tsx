import { createFileRoute, Link } from "@tanstack/react-router";
import { AsciiHero } from "@/components/AsciiHero";
import { ArrowRight, Fingerprint } from "lucide-react";

const MainPage = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <AsciiHero />

      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 backdrop-blur-sm">
          <Fingerprint className="h-4 w-4 text-violet-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white/50">AgentTrust</span>
      </div>

      {/* Bottom-right enter app */}
      <Link
        to="/"
        className="group absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-5 py-2 text-xs font-medium text-white/40 backdrop-blur-sm transition-all hover:border-violet-500/25 hover:bg-white/8 hover:text-white/70"
      >
        Enter App
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Bottom-center tagline */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="text-[10px] tracking-[0.3em] text-white/15 uppercase">
          On-chain verifiable capability proofs for AI agents
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/main")({
  component: MainPage,
});
