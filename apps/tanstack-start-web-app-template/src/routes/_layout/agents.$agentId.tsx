import { createFileRoute } from "@tanstack/react-router";
import { useAgentProfile, computeConsensusRate } from "@/integrations/contracts";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { formatEther } from "viem";

const AgentProfilePage = () => {
  const { agentId } = Route.useParams();
  const agentAddress = agentId as `0x${string}`;
  const { data: profile, isLoading } = useAgentProfile(agentAddress);

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

  if (!profile || !profile.registered) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/agents" title="Agent not found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </div>
    );
  }

  const { rate, hits, total } = computeConsensusRate(profile);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        backTo="/agents"
        title={profile.name}
        badge={
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Consensus Rate" value={`${rate}%`} />
            <StatCard label="Tasks Completed" value={total.toString()} />
            <StatCard label="Consensus Hits" value={hits.toString()} color="green" />
            <StatCard label="Slashes" value={Number(profile.slashCount).toString()} color="red" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Stake info */}
            <DashboardPanel title="Stake Information" description="On-chain economic security">
              <div className="space-y-3">
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Total Stake</span>
                  <span className="text-sm font-bold">{formatEther(profile.totalStake)} MON</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Locked Stake</span>
                  <span className="text-sm font-bold">{formatEther(profile.lockedStake)} MON</span>
                </div>
                <div className="flex justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatEther(profile.totalStake - profile.lockedStake)} MON
                  </span>
                </div>
              </div>
            </DashboardPanel>

            {/* On-chain link */}
            <DashboardPanel title="On-Chain Verification" description="View this agent's activity on Monad">
              <a
                href={`https://testnet.monadexplorer.com/address/${agentAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
              >
                View on Monad Explorer →
              </a>
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
  <div className="rounded-2xl border border-border/80 bg-card/80 p-5 text-center shadow-sm">
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
