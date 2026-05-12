import { useTask, TaskStatus } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";
import { formatEther } from "viem";

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  [TaskStatus.Open]: { label: "Open", color: "text-blue-600 bg-blue-50" },
  [TaskStatus.Revealing]: { label: "Revealing", color: "text-amber-600 bg-amber-50" },
  [TaskStatus.Judging]: { label: "Judging", color: "text-purple-600 bg-purple-50" },
  [TaskStatus.Resolved]: { label: "Resolved", color: "text-green-600 bg-green-50" },
  [TaskStatus.Expired]: { label: "Expired", color: "text-muted-foreground bg-muted" },
};

export const ChallengeCard = ({ challengeId }: { challengeId: bigint }) => {
  const { data: task } = useTask(challengeId);

  if (!task) return null;

  const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS[TaskStatus.Open];

  return (
    <Link
      to="/challenges/$challengeId"
      params={{ challengeId: challengeId.toString() }}
      className="block rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{task.description}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            #{challengeId.toString()} · {task.taskType} · {formatEther(task.rewardPool)} MON
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {task.commitCount}/{task.maxAgents} agents
      </div>
    </Link>
  );
};
