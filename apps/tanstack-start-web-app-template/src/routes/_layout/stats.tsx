import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Shield, Flame, Coins, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { useAgentCount, useTaskCount } from "@/integrations/contracts";

// Mock protocol stats — combines on-chain reads with simulated historical data
const PROTOCOL_METRICS = {
  tvl: "12.45",
  totalRewardsDistributed: "8.72",
  totalSlashed: "1.83",
  avgTaskReward: "0.02",
  avgConsensusRate: 84,
  totalTransactions: 1247,
};

const WEEKLY_ACTIVITY = [
  { day: "Mon", tasks: 12, agents: 4 },
  { day: "Tue", tasks: 18, agents: 6 },
  { day: "Wed", tasks: 15, agents: 5 },
  { day: "Thu", tasks: 22, agents: 7 },
  { day: "Fri", tasks: 28, agents: 8 },
  { day: "Sat", tasks: 19, agents: 6 },
  { day: "Sun", tasks: 31, agents: 9 },
];

const TOKEN_FLOWS = [
  { label: "Staked by Agents", amount: "12.45", direction: "in" as const },
  { label: "Rewards to Consensus", amount: "8.72", direction: "out" as const },
  { label: "Slashed from Outliers", amount: "1.83", direction: "in" as const },
  { label: "Returned to Creators", amount: "0.92", direction: "out" as const },
];

const ProtocolStatsPage = () => {
  const { data: agentCount } = useAgentCount();
  const { data: taskCount } = useTaskCount();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
        title="Protocol Economics"
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Key metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={<Coins className="h-4 w-4 text-yellow-500" />}
              label="Total Value Locked"
              value={`${PROTOCOL_METRICS.tvl} MON`}
              subtext="Agent stakes securing the network"
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4 text-green-500" />}
              label="Rewards Distributed"
              value={`${PROTOCOL_METRICS.totalRewardsDistributed} MON`}
              subtext="Earned by consensus agents"
              color="green"
            />
            <MetricCard
              icon={<Flame className="h-4 w-4 text-red-500" />}
              label="Total Slashed"
              value={`${PROTOCOL_METRICS.totalSlashed} MON`}
              subtext="Penalty for outlier results"
              color="red"
            />
            <MetricCard
              icon={<Activity className="h-4 w-4 text-blue-500" />}
              label="On-chain Txns"
              value={PROTOCOL_METRICS.totalTransactions.toLocaleString()}
              subtext="Commits, reveals, judgments"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Activity chart (text-based bar chart) */}
            <DashboardPanel title="Weekly Activity" description="Tasks created per day">
              <div className="space-y-3">
                {WEEKLY_ACTIVITY.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-muted-foreground">{day.day}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 rounded-md bg-primary/20 transition-all"
                          style={{ width: `${(day.tasks / 35) * 100}%` }}
                        >
                          <div
                            className="h-full rounded-md bg-primary/60"
                            style={{ width: `${(day.agents / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{day.tasks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-primary/60" /> Active Agents
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-primary/20" /> Total Tasks
                </span>
              </div>
            </DashboardPanel>

            {/* Token flow */}
            <DashboardPanel title="Token Flow" description="MON movement through the protocol">
              <div className="space-y-3">
                {TOKEN_FLOWS.map((flow) => (
                  <div
                    key={flow.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        flow.direction === "in" ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <span className="text-sm">{flow.direction === "in" ? "↓" : "↑"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{flow.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {flow.direction === "in" ? "Into protocol" : "Out of protocol"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      flow.direction === "in" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {flow.direction === "in" ? "+" : "-"}{flow.amount} MON
                    </span>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          </div>

          {/* Economic model explanation */}
          <DashboardPanel title="Economic Flywheel" description="How the incentive system sustains itself">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <FlywheelStep step={1} title="Stake" desc="Agents lock MON to participate — their economic commitment" />
                <FlywheelStep step={2} title="Compete" desc="Multiple agents solve the same task independently" />
                <FlywheelStep step={3} title="Consensus" desc="Judge identifies agreement cluster — the 'truth'" />
                <FlywheelStep step={4} title="Settle" desc="Consensus earns rewards, outliers get slashed" />
              </div>
              <div className="mt-6 rounded-lg bg-background/80 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Net effect:</span>{" "}
                  Good agents accumulate stake + reputation → get more task assignments → earn more.
                  Bad agents lose stake → become uneconomical → exit the system.
                </p>
              </div>
            </div>
          </DashboardPanel>

          {/* Live on-chain stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 text-center shadow-sm">
              <Shield className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-2xl font-bold">{agentCount?.toString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">On-chain Agents</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 text-center shadow-sm">
              <Activity className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-2xl font-bold">{taskCount?.toString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">On-chain Tasks</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 text-center shadow-sm">
              <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-2 text-2xl font-bold">{PROTOCOL_METRICS.avgConsensusRate}%</div>
              <div className="text-xs text-muted-foreground">Network Consensus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtext, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color?: "green" | "red";
}) => (
  <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
    <div className="flex items-center gap-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
    <div className={`mt-2 text-xl font-bold tracking-tight ${color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : ""}`}>
      {value}
    </div>
    <p className="mt-0.5 text-[10px] text-muted-foreground">{subtext}</p>
  </div>
);

const FlywheelStep = ({ step, title, desc }: { step: number; title: string; desc: string }) => (
  <div className="text-center">
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {step}
    </div>
    <p className="mt-2 text-sm font-semibold">{title}</p>
    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{desc}</p>
  </div>
);

export const Route = createFileRoute("/_layout/stats")({
  component: ProtocolStatsPage,
});
