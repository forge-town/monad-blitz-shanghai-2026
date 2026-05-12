import { useAgentProfile, computeConsensusRate } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";
import { formatEther } from "viem";

export const AgentCard = ({ agentAddress }: { agentAddress: `0x${string}` }) => {
  const { data: profile } = useAgentProfile(agentAddress);

  if (!profile || !profile.registered) return null;

  const { rate, hits, total } = computeConsensusRate(profile);

  return (
    <Link
      to="/agents/$agentId"
      params={{ agentId: agentAddress }}
      className="group flex items-center justify-between border-b border-teal-100/40 px-4 py-2.5 transition-colors hover:bg-teal-50/60"
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-semibold text-zinc-700 group-hover:text-teal-800">
          {profile.name}
        </p>
        <p className="font-mono text-[9px] text-zinc-400">
          {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className={`font-mono text-[11px] font-bold ${
            rate >= 85 ? "text-teal-700" : rate >= 70 ? "text-amber-600" : "text-red-600"
          }`}>
            {rate}%
          </span>
          <p className="font-mono text-[9px] text-zinc-400">{hits}/{total}</p>
        </div>
        <span className="font-mono text-[10px] text-zinc-500">{formatEther(profile.totalStake)} MON</span>
        {Number(profile.slashCount) > 0 && (
          <span className="border border-red-400 px-1 py-px font-mono text-[9px] font-bold text-red-600">
            {Number(profile.slashCount)}
          </span>
        )}
      </div>
    </Link>
  );
};
