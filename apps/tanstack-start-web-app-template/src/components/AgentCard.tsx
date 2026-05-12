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
      className="block rounded-lg border p-4 transition-colors hover:border-primary hover:bg-accent/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{profile.name}</h3>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {profile.owner.slice(0, 6)}...{profile.owner.slice(-4)}
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="font-bold text-green-600">{rate}%</div>
          <div className="text-muted-foreground text-xs">
            {passed}/{total} passed
          </div>
        </div>
      </div>
      {profile.capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.capabilities.map((cap) => (
            <span key={cap} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {cap}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
