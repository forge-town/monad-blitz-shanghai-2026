import { createFileRoute, Link } from "@tanstack/react-router";
import { useAgentProfile, computeConsensusRate } from "@/integrations/contracts";
import { ArrowLeft, ExternalLink, Shield, TrendingUp, Flame } from "lucide-react";
import { formatEther } from "viem";

const AgentProfilePage = () => {
  const { agentId } = Route.useParams();
  const agentAddress = agentId as `0x${string}`;
  const { data: profile, isLoading } = useAgentProfile(agentAddress);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f9f6]">
        <span className="font-mono text-[11px] text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (!profile || !profile.registered) {
    return (
      <div className="flex h-screen flex-col bg-[#f4f9f6]">
        <div className="flex items-center gap-3 border-b border-teal-200/40 px-4 py-2">
          <Link to="/agents" className="text-zinc-400 hover:text-teal-600">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-xs text-zinc-500">Agent not found</span>
        </div>
      </div>
    );
  }

  const { rate, hits, total } = computeConsensusRate(profile);
  const available = profile.totalStake - profile.lockedStake;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f9f6] text-zinc-900">
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-teal-200/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/agents" className="text-zinc-400 hover:text-teal-600">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-xs font-semibold text-zinc-700">
            AGENT<span className="text-teal-600">TRUST</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-400">/ AGENT</span>
        </div>
        <a
          href={`https://testnet.monadexplorer.com/address/${agentAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 border border-teal-300/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-teal-400 hover:text-teal-700"
        >
          Explorer <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Agent Info */}
        <div className="flex w-[240px] shrink-0 flex-col border-r border-teal-200/40">
          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Profile</span>
          </div>

          <div className="flex flex-col items-center border-b border-teal-100/40 px-4 py-6">
            <Shield className="h-5 w-5 text-teal-600" />
            <p className="mt-2 font-mono text-[13px] font-bold text-zinc-800">{profile.name}</p>
            <p className="mt-1 font-mono text-[9px] text-zinc-400">
              {agentAddress.slice(0, 8)}...{agentAddress.slice(-6)}
            </p>
          </div>

          {[
            { icon: <TrendingUp className="h-3 w-3" />, label: "Consensus Rate", value: `${rate}%`, color: rate >= 70 ? "text-teal-700" : "text-red-600" },
            { icon: <Shield className="h-3 w-3" />, label: "Tasks Done", value: total.toString() },
            { icon: <TrendingUp className="h-3 w-3" />, label: "Consensus Hits", value: hits.toString(), color: "text-teal-700" },
            { icon: <Flame className="h-3 w-3" />, label: "Slashes", value: Number(profile.slashCount).toString(), color: Number(profile.slashCount) > 0 ? "text-red-600" : undefined },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between border-b border-teal-100/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{stat.icon}</span>
                <span className="font-mono text-[10px] text-zinc-500">{stat.label}</span>
              </div>
              <span className={`font-mono text-[11px] font-semibold ${stat.color ?? "text-zinc-700"}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Right: Stake Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Stake Information</span>
          </div>

          <div className="flex flex-col">
            {[
              { label: "Total Stake", value: `${formatEther(profile.totalStake)} MON` },
              { label: "Locked Stake", value: `${formatEther(profile.lockedStake)} MON` },
              { label: "Available", value: `${formatEther(available)} MON`, color: "text-teal-700" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-teal-100/40 px-4 py-3">
                <span className="font-mono text-[11px] text-zinc-500">{row.label}</span>
                <span className={`font-mono text-[11px] font-bold ${row.color ?? "text-zinc-700"}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          <div className="border-b border-teal-200/40 px-4 py-4">
            <div className="flex h-3 w-full overflow-hidden bg-zinc-100">
              {profile.totalStake > 0n && (
                <>
                  <div
                    className="bg-teal-500"
                    style={{ width: `${Number((available * 100n) / profile.totalStake)}%` }}
                  />
                  <div
                    className="bg-zinc-300"
                    style={{ width: `${Number((profile.lockedStake * 100n) / profile.totalStake)}%` }}
                  />
                </>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 font-mono text-[9px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 bg-teal-500" /> Available</span>
              <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 bg-zinc-300" /> Locked</span>
            </div>
          </div>

          {/* Consensus rate visualization */}
          <div className="border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Performance</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={rate >= 70 ? "#0d9488" : "#dc2626"}
                  strokeWidth="3"
                  strokeDasharray={`${rate}, 100`}
                />
              </svg>
              <span className="absolute font-mono text-lg font-bold text-zinc-800">{rate}%</span>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold text-zinc-700">Consensus Rate</p>
              <p className="font-mono text-[9px] text-zinc-400">{hits} agreements out of {total} tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/agents/$agentId")({
  component: AgentProfilePage,
});
