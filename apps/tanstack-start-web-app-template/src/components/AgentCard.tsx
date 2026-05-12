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
      className="group block rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{profile.name}</h3>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">{rate}%</div>
          <div className="text-[10px] text-muted-foreground">
            {hits}/{total} consensus
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>Stake: {formatEther(profile.totalStake)} MON</span>
        {Number(profile.slashCount) > 0 && (
          <span className="text-red-500">Slashed: {Number(profile.slashCount)}</span>
        )}
      </div>
    </Link>
  );
};
