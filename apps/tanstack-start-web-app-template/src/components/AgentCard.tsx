import { useAgentProfile, computePassRate } from "@/integrations/contracts";
import type { AgentId } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";

export const AgentCard = ({ agentId }: { agentId: AgentId }) => {
  const { data: profile } = useAgentProfile(agentId);

  if (!profile) return null;

  const { rate, passed, total } = computePassRate(profile);

  return (
    <Link
      to="/agents/$agentId"
      params={{ agentId }}
      className="group block rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{profile.name}</h3>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {profile.owner.slice(0, 6)}...{profile.owner.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">{rate}%</div>
          <div className="text-[10px] text-muted-foreground">
            {passed}/{total}
          </div>
        </div>
      </div>
      {profile.capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.capabilities.map((cap) => (
            <span key={cap} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
              {cap}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
