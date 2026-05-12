import { createFileRoute, Link } from "@tanstack/react-router";
import { useTask, useTaskAgents, TaskStatus } from "@/integrations/contracts";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatEther } from "viem";

const CONTRACT_ADDRESS = "0xBC83F1840Ad22014a8f6A081103e1813100604Aa";

const STATUS_STYLES: Record<number, { label: string; border: string; text: string }> = {
  [TaskStatus.Open]: { label: "OPEN", border: "border-blue-400", text: "text-blue-600" },
  [TaskStatus.Revealing]: { label: "REVEALING", border: "border-amber-400", text: "text-amber-600" },
  [TaskStatus.Judging]: { label: "JUDGING", border: "border-purple-400", text: "text-purple-600" },
  [TaskStatus.Resolved]: { label: "RESOLVED", border: "border-teal-400", text: "text-teal-600" },
  [TaskStatus.Expired]: { label: "EXPIRED", border: "border-zinc-300", text: "text-zinc-400" },
};

const TaskDetailPage = () => {
  const { challengeId: rawId } = Route.useParams();
  const taskId = BigInt(rawId);
  const { data: task, isLoading } = useTask(taskId);
  const { data: agents } = useTaskAgents(taskId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f9f6]">
        <span className="font-mono text-[11px] text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen flex-col bg-[#f4f9f6]">
        <div className="flex items-center gap-3 border-b border-teal-200/40 px-4 py-2">
          <Link to="/challenges" className="text-zinc-400 hover:text-teal-600">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-xs text-zinc-500">Task not found</span>
        </div>
      </div>
    );
  }

  const st = STATUS_STYLES[task.status] ?? STATUS_STYLES[TaskStatus.Open];
  const commitDL = new Date(Number(task.commitDeadline) * 1000);
  const revealDL = new Date(Number(task.revealDeadline) * 1000);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f9f6] text-zinc-900">
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-teal-200/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="text-zinc-400 hover:text-teal-600">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="font-mono text-xs font-semibold text-zinc-700">
            AGENT<span className="text-teal-600">TRUST</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-400">/ TASK #{rawId}</span>
          <span className={`border ${st.border} px-1 py-px font-mono text-[7px] font-bold uppercase ${st.text}`}>
            {st.label}
          </span>
        </div>
        <a
          href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 border border-teal-300/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-teal-400 hover:text-teal-700"
        >
          Explorer <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Task Metadata */}
        <div className="flex w-[240px] shrink-0 flex-col border-r border-teal-200/40">
          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Details</span>
          </div>
          {[
            { label: "Reward Pool", value: `${formatEther(task.rewardPool)} MON`, color: "text-teal-700" },
            { label: "Required Stake", value: `${formatEther(task.requiredStake)} MON` },
            { label: "Agents", value: `${task.commitCount}/${task.maxAgents}` },
            { label: "Reveals", value: `${task.revealCount}/${task.commitCount}` },
            { label: "Type", value: task.taskType },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-teal-100/40 px-3 py-2.5">
              <span className="font-mono text-[10px] text-zinc-500">{row.label}</span>
              <span className={`font-mono text-[11px] font-semibold ${row.color ?? "text-zinc-700"}`}>{row.value}</span>
            </div>
          ))}

          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5 mt-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Deadlines</span>
          </div>
          <div className="border-b border-teal-100/40 px-3 py-2">
            <p className="font-mono text-[10px] text-zinc-500">Commit by</p>
            <p className="font-mono text-[10px] font-medium text-zinc-700">{commitDL.toLocaleString()}</p>
          </div>
          <div className="border-b border-teal-100/40 px-3 py-2">
            <p className="font-mono text-[10px] text-zinc-500">Reveal by</p>
            <p className="font-mono text-[10px] font-medium text-zinc-700">{revealDL.toLocaleString()}</p>
          </div>
          <div className="border-b border-teal-100/40 px-3 py-2">
            <p className="font-mono text-[10px] text-zinc-500">Creator</p>
            <p className="font-mono text-[9px] text-zinc-700">{task.creator.slice(0, 8)}...{task.creator.slice(-6)}</p>
          </div>
        </div>

        {/* Right: Description + Agents */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Task description */}
          <div className="border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Task Description</span>
          </div>
          <div className="border-b border-teal-200/40 px-4 py-4">
            <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-700">
              {task.description}
            </p>
          </div>

          {/* Participating agents */}
          <div className="border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
              Participating Agents ({agents?.length ?? 0})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {agents && agents.length > 0 ? (
              agents.map((addr, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-teal-100/40 px-4 py-2.5">
                  <span className="font-mono text-[9px] text-zinc-300">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {addr.slice(0, 8)}...{addr.slice(-6)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <span className="font-mono text-[10px] text-zinc-400">No agents committed yet</span>
              </div>
            )}
          </div>

          {/* Resolved banner */}
          {task.status === TaskStatus.Resolved && (
            <div className="border-t border-teal-200/40 bg-teal-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-teal-700">✓ RESOLVED</span>
                <span className="font-mono text-[10px] text-zinc-500">
                  — Rewards distributed ({formatEther(task.rewardPool)} MON shared by consensus)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/challenges/$challengeId")({
  component: TaskDetailPage,
});
