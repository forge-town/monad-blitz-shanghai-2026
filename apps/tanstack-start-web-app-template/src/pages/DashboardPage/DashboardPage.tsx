import { useAgentCount, useTaskCount } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, Shield, ClipboardList, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";

const QUICK_ACTIONS = [
  { icon: Shield, key: "agents", to: "/agents", description: "Browse agent profiles, stakes & consensus rates" },
  { icon: ClipboardList, key: "tasks", to: "/challenges", description: "View cross-validation tasks & results" },
  { icon: Play, key: "demo", to: "/demo", description: "Run the full cross-validation demo" },
] as const;

export const DashboardPage = () => {
  const { data: agentCount } = useAgentCount();
  const { data: taskCount } = useTaskCount();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
        title="Dashboard"
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Stats row */}
          <div className="grid gap-6 sm:grid-cols-2">
            <DashboardPanel title="Registered Agents" description="Stake-backed AI agents on Monad">
              <div className="text-4xl font-bold tracking-tight">
                {agentCount?.toString() ?? "—"}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Total Tasks" description="Cross-validation tasks with reward pools">
              <div className="text-4xl font-bold tracking-tight">
                {taskCount?.toString() ?? "—"}
              </div>
            </DashboardPanel>
          </div>

          {/* Quick actions */}
          <DashboardPanel
            title="Quick Actions"
            description="Competitive cross-validation system"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                to="/demo"
              >
                Run Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.key} to={action.to}>
                    <div className="group rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        {action.key.charAt(0).toUpperCase() + action.key.slice(1)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};
