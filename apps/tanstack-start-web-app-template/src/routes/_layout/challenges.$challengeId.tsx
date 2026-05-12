import { createFileRoute } from "@tanstack/react-router";
import { useTask, useTaskAgents, TaskStatus } from "@/integrations/contracts";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { formatEther } from "viem";

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  [TaskStatus.Open]: { label: "Open — Accepting Commits", color: "text-blue-600 bg-blue-50" },
  [TaskStatus.Revealing]: { label: "Revealing — Agents Reveal Results", color: "text-amber-600 bg-amber-50" },
  [TaskStatus.Judging]: { label: "Judging — Awaiting Verdict", color: "text-purple-600 bg-purple-50" },
  [TaskStatus.Resolved]: { label: "Resolved — Settled", color: "text-green-600 bg-green-50" },
  [TaskStatus.Expired]: { label: "Expired", color: "text-muted-foreground bg-muted" },
};

const TaskDetailPage = () => {
  const { challengeId: rawId } = Route.useParams();
  const taskId = BigInt(rawId);
  const { data: task, isLoading } = useTask(taskId);
  const { data: agents } = useTaskAgents(taskId);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/challenges" title="Loading..." />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/challenges" title="Task not found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS[TaskStatus.Open];
  const commitDL = new Date(Number(task.commitDeadline) * 1000);
  const revealDL = new Date(Number(task.revealDeadline) * 1000);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        backTo="/challenges"
        title={`Task #${rawId}`}
        badge={
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Reward Pool" value={`${formatEther(task.rewardPool)} MON`} />
            <StatCard label="Required Stake" value={`${formatEther(task.requiredStake)} MON`} />
            <StatCard label="Agents" value={`${task.commitCount}/${task.maxAgents}`} />
            <StatCard label="Reveals" value={`${task.revealCount}/${task.commitCount}`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Task info */}
            <DashboardPanel title="Task Details" description={`Type: ${task.taskType}`}>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
              </div>
              <div className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                <p>Creator: {task.creator.slice(0, 6)}...{task.creator.slice(-4)}</p>
                <p>Commit deadline: {commitDL.toLocaleString()}</p>
                <p>Reveal deadline: {revealDL.toLocaleString()}</p>
              </div>
            </DashboardPanel>

            {/* Participating agents */}
            <DashboardPanel title="Participating Agents" description={`${agents?.length ?? 0} agents committed`}>
              {agents && agents.length > 0 ? (
                <div className="space-y-2">
                  {agents.map((addr, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{addr.slice(0, 6)}...{addr.slice(-4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No agents have committed yet</p>
              )}
            </DashboardPanel>
          </div>

          {/* Resolved result */}
          {task.status === TaskStatus.Resolved && (
            <DashboardPanel title="Settlement Result">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30">
                <div className="text-3xl">✓</div>
                <p className="mt-2 text-lg font-bold text-green-700 dark:text-green-400">
                  Task Resolved — Rewards Distributed
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consensus agents shared {formatEther(task.rewardPool)} MON. Outliers were slashed.
                </p>
              </div>
            </DashboardPanel>
          )}

          {/* Monad Explorer */}
          <DashboardPanel title="On-Chain Verification">
            <a
              href="https://testnet.monadexplorer.com/address/0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
            >
              View contract on Monad Explorer →
            </a>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/80 bg-card/80 p-5 text-center shadow-sm">
    <div className="text-xl font-bold tracking-tight">{value}</div>
    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
  </div>
);

export const Route = createFileRoute("/_layout/challenges/$challengeId")({
  component: TaskDetailPage,
});
