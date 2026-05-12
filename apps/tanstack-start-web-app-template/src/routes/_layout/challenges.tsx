import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { useTaskCount, useTask, TaskStatus } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";
import { formatEther } from "viem";

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  [TaskStatus.Open]: { label: "Open", color: "bg-blue-100 text-blue-700" },
  [TaskStatus.Revealing]: { label: "Revealing", color: "bg-amber-100 text-amber-700" },
  [TaskStatus.Judging]: { label: "Judging", color: "bg-purple-100 text-purple-700" },
  [TaskStatus.Resolved]: { label: "Resolved", color: "bg-green-100 text-green-700" },
  [TaskStatus.Expired]: { label: "Expired", color: "bg-zinc-100 text-zinc-500" },
};

const TaskCard = ({ taskId }: { taskId: number }) => {
  const { data: task } = useTask(BigInt(taskId));
  if (!task) return null;

  const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS[TaskStatus.Open];

  return (
    <Link
      to="/challenges/$challengeId"
      params={{ challengeId: String(taskId) }}
      className="group block rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">#{taskId}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold truncate">{task.description.slice(0, 80)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Type: {task.taskType}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-sm font-bold">{formatEther(task.rewardPool)} MON</div>
          <div className="text-[10px] text-muted-foreground">{task.commitCount}/{task.maxAgents} agents</div>
        </div>
      </div>
    </Link>
  );
};

const TasksPage = () => {
  const { data: taskCount } = useTaskCount();
  const count = taskCount ? Number(taskCount) : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<ClipboardList className="h-4 w-4 text-primary" />}
        title="Tasks"
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <DashboardPanel
            title="All Tasks"
            description="Cross-validation tasks with reward pools"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: count }, (_, i) => (
                <TaskCard key={i} taskId={i} />
              ))}
              {count === 0 && (
                <p className="text-muted-foreground col-span-full py-8 text-center">
                  No tasks created yet — try the Live Demo
                </p>
              )}
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/challenges")({
  component: TasksPage,
});
