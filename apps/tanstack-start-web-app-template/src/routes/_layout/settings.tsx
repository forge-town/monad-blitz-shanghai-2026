import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_layout/settings")({
  component: () => (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f9f6] text-zinc-900">
      <div className="flex shrink-0 items-center gap-3 border-b border-teal-200/40 px-4 py-2">
        <Link to="/" className="text-zinc-400 hover:text-teal-600">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <span className="font-mono text-xs font-semibold text-zinc-700">
          AGENT<span className="text-teal-600">TRUST</span>
        </span>
        <span className="font-mono text-[10px] text-zinc-400">/ SETTINGS</span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className="font-mono text-[11px] text-zinc-400">Settings coming soon</span>
      </div>
    </div>
  ),
});
