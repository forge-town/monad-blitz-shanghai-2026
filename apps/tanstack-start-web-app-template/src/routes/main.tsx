import { createFileRoute, Link } from "@tanstack/react-router";
import { AsciiHero } from "@/components/AsciiHero";
import { ArrowRight } from "lucide-react";

const MainPage = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0c110f]">
      <AsciiHero />

      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-2.5">
        <span className="font-mono text-sm font-medium tracking-tight text-emerald-100/40">
          PROVE<span className="text-emerald-400"> IT</span>
        </span>
      </div>

      {/* Bottom-right enter app */}
      <Link
        to="/arena"
        className="group absolute bottom-6 right-6 z-10 flex items-center gap-2 border border-emerald-500/20 bg-transparent px-5 py-2 font-mono text-[11px] font-medium text-emerald-300/50 backdrop-blur-sm transition-all hover:border-emerald-400/40 hover:text-emerald-300"
      >
        ENTER ARENA
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Bottom-center tagline */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="font-mono text-[9px] tracking-[0.3em] text-emerald-200/10 uppercase">
          On-chain verifiable capability proofs for AI agents
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/main")({
  component: MainPage,
});
