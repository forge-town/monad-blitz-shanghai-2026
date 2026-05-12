import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Activity, Coins, TrendingUp, Flame, Shield } from "lucide-react";
import { useAgentCount, useTaskCount } from "@/integrations/contracts";

const CONTRACT_ADDRESS = "0xBC83F1840Ad22014a8f6A081103e1813100604Aa";

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

const maxTasks = Math.max(...WEEKLY_ACTIVITY.map((d) => d.tasks));

function RouteComponent() {
  const { data: agentCount } = useAgentCount();
  const { data: taskCount } = useTaskCount();
  const totalStaked = parseFloat(PROTOCOL_METRICS.tvl);
  const totalRewarded = parseFloat(PROTOCOL_METRICS.totalRewardsDistributed);

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
          <span className="font-mono text-[10px] text-zinc-400">/ PROTOCOL STATS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-400">
            Agents: <span className="text-teal-700">{agentCount?.toString() ?? "—"}</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-400">
            Tasks: <span className="text-teal-700">{taskCount?.toString() ?? "—"}</span>
          </span>
          <a
            href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border border-teal-300/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-teal-400 hover:text-teal-700"
          >
            Explorer <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Key Metrics */}
        <div className="flex w-[220px] shrink-0 flex-col border-r border-teal-200/40">
          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Key Metrics</span>
          </div>
          {[
            { icon: <Coins className="h-3 w-3" />, label: "TVL", value: `${PROTOCOL_METRICS.tvl} MON`, color: "text-teal-700" },
            { icon: <TrendingUp className="h-3 w-3" />, label: "Rewards Paid", value: `${PROTOCOL_METRICS.totalRewardsDistributed} MON`, color: "text-teal-700" },
            { icon: <Flame className="h-3 w-3" />, label: "Total Slashed", value: `${PROTOCOL_METRICS.totalSlashed} MON`, color: "text-red-600" },
            { icon: <Activity className="h-3 w-3" />, label: "On-chain Txns", value: PROTOCOL_METRICS.totalTransactions.toLocaleString() },
            { icon: <Shield className="h-3 w-3" />, label: "Avg Consensus", value: `${PROTOCOL_METRICS.avgConsensusRate}%`, color: "text-teal-700" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between border-b border-teal-100/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{stat.icon}</span>
                <span className="font-mono text-[10px] text-zinc-500">{stat.label}</span>
              </div>
              <span className={`font-mono text-[11px] font-semibold ${stat.color ?? "text-zinc-700"}`}>{stat.value}</span>
            </div>
          ))}

          {/* Flywheel steps */}
          <div className="mt-auto border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Economic Flywheel</span>
          </div>
          {[
            { n: "01", title: "Stake", desc: "Agents lock MON" },
            { n: "02", title: "Compete", desc: "Parallel task solving" },
            { n: "03", title: "Consensus", desc: "Judge clusters truth" },
            { n: "04", title: "Settle", desc: "Reward / slash" },
          ].map((step) => (
            <div key={step.n} className="flex items-center gap-2 border-b border-teal-100/40 px-3 py-2">
              <span className="font-mono text-[9px] text-zinc-300">{step.n}</span>
              <div>
                <p className="font-mono text-[10px] font-medium text-zinc-600">{step.title}</p>
                <p className="font-mono text-[9px] text-zinc-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Charts + Flows */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top half: Weekly Activity + On-chain counts */}
          <div className="flex shrink-0 flex-col border-b border-teal-200/40">
            <div className="flex items-center justify-between border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
                Weekly Activity
              </span>
              <div className="flex items-center gap-4 font-mono text-[9px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 bg-teal-500" /> Tasks
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 bg-teal-300" /> Agents
                </span>
              </div>
            </div>
            <div className="grid min-h-[200px] grid-cols-7 gap-px bg-teal-100/30">
              {WEEKLY_ACTIVITY.map((day) => (
                <div key={day.day} className="flex flex-col items-center justify-end bg-[#f4f9f6] p-3 pb-2">
                  <div className="flex w-full flex-col items-center gap-1">
                    <div className="relative flex w-8 justify-center" style={{ height: `${(day.tasks / maxTasks) * 120}px` }}>
                      <div
                        className="absolute bottom-0 w-full bg-teal-200"
                        style={{ height: `${(day.tasks / maxTasks) * 120}px` }}
                      />
                      <div
                        className="absolute bottom-0 w-full bg-teal-500"
                        style={{ height: `${(day.agents / 10) * 120}px` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-zinc-700">{day.tasks}</span>
                  </div>
                  <span className="mt-1 font-mono text-[9px] text-zinc-400">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom half: Token Flows + Live Stats */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
                Token Flow
              </span>
              <span className="font-mono text-[9px] text-zinc-400">
                Net: +{(totalStaked - totalRewarded).toFixed(2)} MON
              </span>
            </div>

            <div className="flex flex-1 items-stretch">
              {/* Token flows */}
              <div className="flex flex-1 flex-col">
                {TOKEN_FLOWS.map((flow) => (
                  <div
                    key={flow.label}
                    className="flex items-center justify-between border-b border-teal-100/40 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center font-mono text-[10px] ${
                        flow.direction === "in" ? "bg-teal-100 text-teal-700" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {flow.direction === "in" ? "↓" : "↑"}
                      </div>
                      <div>
                        <p className="font-mono text-[11px] font-medium text-zinc-700">{flow.label}</p>
                        <p className="font-mono text-[9px] text-zinc-400">
                          {flow.direction === "in" ? "Into protocol" : "Out of protocol"}
                        </p>
                      </div>
                    </div>
                    <span className={`font-mono text-[11px] font-bold ${
                      flow.direction === "in" ? "text-teal-700" : "text-zinc-600"
                    }`}>
                      {flow.direction === "in" ? "+" : "-"}{flow.amount} MON
                    </span>
                  </div>
                ))}
              </div>

              {/* Live on-chain sidebar */}
              <div className="flex w-[160px] shrink-0 flex-col border-l border-teal-200/40">
                <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">On-chain</span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                  <div className="text-center">
                    <Shield className="mx-auto h-3.5 w-3.5 text-zinc-400" />
                    <div className="mt-1 font-mono text-lg font-bold text-zinc-700">{agentCount?.toString() ?? "—"}</div>
                    <div className="font-mono text-[9px] text-zinc-400">Agents</div>
                  </div>
                  <div className="text-center">
                    <Activity className="mx-auto h-3.5 w-3.5 text-zinc-400" />
                    <div className="mt-1 font-mono text-lg font-bold text-zinc-700">{taskCount?.toString() ?? "—"}</div>
                    <div className="font-mono text-[9px] text-zinc-400">Tasks</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-3.5 w-3.5 text-zinc-400" />
                    <div className="mt-1 font-mono text-lg font-bold text-teal-700">{PROTOCOL_METRICS.avgConsensusRate}%</div>
                    <div className="font-mono text-[9px] text-zinc-400">Consensus</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_layout/stats")({
  component: RouteComponent,
});
