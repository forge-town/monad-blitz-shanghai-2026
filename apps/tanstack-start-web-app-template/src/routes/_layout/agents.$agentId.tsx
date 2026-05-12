import { createFileRoute } from "@tanstack/react-router";
import { useAgentProfile, computePassRate } from "@/integrations/contracts";
import type { AgentId } from "@/integrations/contracts";
import { CreateChallengeForm } from "@/components/CreateChallengeForm";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";

const AgentProfilePage = () => {
  const { agentId } = Route.useParams();
  const typedAgentId = agentId as AgentId;
  const { data: profile, isLoading } = useAgentProfile(typedAgentId);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/agents" title="Loading..." />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/agents" title="Agent not found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </div>
    );
  }

  const { rate, passed, total } = computePassRate(profile);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        backTo="/agents"
        title={profile.name}
        badge={
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {profile.owner.slice(0, 6)}...{profile.owner.slice(-4)}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Pass Rate" value={`${rate}%`} />
            <StatCard label="Total" value={total.toString()} />
            <StatCard label="Passed" value={passed.toString()} color="green" />
            <StatCard label="Failed" value={Number(profile.failedChallenges).toString()} color="red" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            {/* Capabilities */}
            <DashboardPanel
              title="Declared Capabilities"
              description={`Registered ${new Date(Number(profile.registeredAt) * 1000).toLocaleDateString()}`}
            >
              {profile.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No capabilities declared</p>
              )}
            </DashboardPanel>

            {/* Challenge form */}
            <DashboardPanel
              title="Challenge This Agent"
              description="Create a new capability verification challenge"
            >
              <CreateChallengeForm agentId={typedAgentId} />
            </DashboardPanel>
          </div>
        </div>
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
  <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 text-center shadow-sm backdrop-blur-sm">
    <div
      className={`text-2xl font-bold tracking-tight ${color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : ""}`}
    >
      {value}
    </div>
    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
  </div>
);

export const Route = createFileRoute("/_layout/agents/$agentId")({
  component: AgentProfilePage,
});
