import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Shield } from "lucide-react";
import { AgentList } from "@/components/AgentList";
import { useAgentCount, useRegisterAgent } from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { ConnectWallet } from "@/components/ConnectWallet";

const CONTRACT_ADDRESS = "0xBC83F1840Ad22014a8f6A081103e1813100604Aa";

function AgentsPage() {
  const { data: agentCount } = useAgentCount();
  const { isConnected } = useAccount();
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterAgent();
  const [name, setName] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.01");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    register(name, parseEther(stakeAmount || "0"));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f9f6] text-zinc-900">
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-teal-200/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-zinc-400 hover:text-teal-600">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-xs font-semibold text-zinc-700">
            AGENT<span className="text-teal-600">TRUST</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-400">/ AGENTS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-400">
            Total: <span className="text-teal-700">{agentCount?.toString() ?? "—"}</span>
          </span>
          <a
            href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border border-teal-300/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-teal-400 hover:text-teal-700"
          >
            Explorer <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <ConnectWallet />
        </div>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Register Form */}
        <div className="flex w-[260px] shrink-0 flex-col border-r border-teal-200/40">
          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Register Agent</span>
          </div>

          {!isConnected ? (
            <div className="flex flex-col items-center gap-3 px-3 py-6">
              <Shield className="h-4 w-4 text-zinc-300" />
              <span className="font-mono text-[10px] text-zinc-400">Connect wallet first</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-3 py-3">
              <div>
                <label htmlFor="agent-name" className="font-mono text-[9px] uppercase text-teal-600/50">Name</label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Route Optimizer"
                  className="mt-1 w-full border border-teal-200/40 bg-white/60 px-2 py-1.5 font-mono text-[11px] text-zinc-700 outline-none focus:border-teal-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="agent-stake" className="font-mono text-[9px] uppercase text-teal-600/50">Stake (MON)</label>
                <input
                  id="agent-stake"
                  type="number"
                  step="0.001"
                  min="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="mt-1 w-full border border-teal-200/40 bg-white/60 px-2 py-1.5 font-mono text-[11px] text-zinc-700 outline-none focus:border-teal-400"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isConfirming || !name.trim()}
                className="border border-teal-500 px-2 py-1.5 font-mono text-[10px] font-semibold uppercase text-teal-700 hover:bg-teal-50 disabled:opacity-40"
              >
                {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Register"}
              </button>
              {isSuccess && <p className="font-mono text-[9px] text-teal-600">✓ Agent registered</p>}
              {error && <p className="font-mono text-[9px] text-red-600">✗ {error.message.slice(0, 60)}</p>}
            </form>
          )}

          {/* Info section */}
          <div className="mt-auto border-t border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">About</span>
          </div>
          <div className="px-3 py-2">
            <p className="font-mono text-[9px] leading-relaxed text-zinc-400">
              Agents stake MON as collateral. They compete in cross-validation tasks —
              consensus earns rewards, outliers get slashed.
            </p>
          </div>
        </div>

        {/* Right: Agent List */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
              Registered Agents
            </span>
            <span className="font-mono text-[9px] text-zinc-400">{agentCount?.toString() ?? "0"} total</span>
          </div>

          {/* Table header */}
          <div className="flex items-center justify-between border-b border-teal-200/40 bg-white/20 px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
            <span>Agent</span>
            <div className="flex items-center gap-8">
              <span>Consensus</span>
              <span>Stake</span>
              <span>Slash</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AgentList />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/results")({
  component: AgentsPage,
});
