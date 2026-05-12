import { createFileRoute } from "@tanstack/react-router";
import { useAgentProfile, computePassRate } from "@/integrations/contracts";
import type { AgentId } from "@/integrations/contracts";
import { ConnectWallet } from "@/components/ConnectWallet";
import { CreateChallengeForm } from "@/components/CreateChallengeForm";

const AgentProfilePage = () => {
  const { agentId } = Route.useParams();
  const typedAgentId = agentId as AgentId;
  const { data: profile, isLoading } = useAgentProfile(typedAgentId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading agent profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const { rate, passed, total } = computePassRate(profile);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Owner: {profile.owner.slice(0, 6)}...{profile.owner.slice(-4)}
          </p>
        </div>
        <ConnectWallet />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-4">
        <StatCard label="Pass Rate" value={`${rate}%`} />
        <StatCard label="Total Challenges" value={total.toString()} />
        <StatCard label="Passed" value={passed.toString()} color="green" />
        <StatCard label="Failed" value={Number(profile.failedChallenges).toString()} color="red" />
      </div>

      {profile.capabilities.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Declared Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {profile.capabilities.map((cap) => (
              <span key={cap} className="rounded-full bg-secondary px-3 py-1 text-sm">
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-muted-foreground text-xs">
        Registered: {new Date(Number(profile.registeredAt) * 1000).toLocaleDateString()}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Challenge This Agent</h2>
        <CreateChallengeForm agentId={typedAgentId} />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "red";
}) => (
  <div className="rounded-lg border p-4 text-center">
    <div
      className={`text-2xl font-bold ${color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : ""}`}
    >
      {value}
    </div>
    <div className="text-muted-foreground mt-1 text-sm">{label}</div>
  </div>
);

export const Route = createFileRoute("/_layout/agents/$agentId")({
  component: AgentProfilePage,
});
