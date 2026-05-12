import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Activity } from "lucide-react";
import { useTaskCount, useTask, TaskStatus } from "@/integrations/contracts";
import { formatEther } from "viem";
import { ConnectWallet } from "@/components/ConnectWallet";

const CONTRACT_ADDRESS = "0xBC83F1840Ad22014a8f6A081103e1813100604Aa";

const STATUS_STYLES: Record<number, { label: string; border: string; text: string }> = {
  [TaskStatus.Open]: { label: "OPEN", border: "border-blue-400", text: "text-blue-600" },
  [TaskStatus.Revealing]: { label: "REVEAL", border: "border-amber-400", text: "text-amber-600" },
  [TaskStatus.Judging]: { label: "JUDGE", border: "border-purple-400", text: "text-purple-600" },
  [TaskStatus.Resolved]: { label: "DONE", border: "border-teal-400", text: "text-teal-600" },
  [TaskStatus.Expired]: { label: "EXPIRED", border: "border-zinc-300", text: "text-zinc-400" },
};

const TaskRow = ({ taskId }: { taskId: number }) => {
  const { data: task } = useTask(BigInt(taskId));
  if (!task) return null;

  const st = STATUS_STYLES[task.status] ?? STATUS_STYLES[TaskStatus.Open];

  return (
    <Link
      to="/challenges/$challengeId"
      params={{ challengeId: String(taskId) }}
      className="group flex items-center justify-between border-b border-teal-100/40 px-4 py-2.5 transition-colors hover:bg-teal-50/60"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-zinc-300">#{String(taskId).padStart(2, "0")}</span>
        <span className={`border ${st.border} px-1 py-px font-mono text-[7px] font-bold uppercase ${st.text}`}>
          {st.label}
        </span>
        <span className="max-w-[400px] truncate font-mono text-[11px] font-medium text-zinc-700 group-hover:text-teal-800">
          {task.description.slice(0, 80)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] text-zinc-500">{task.taskType}</span>
        <span className="font-mono text-[11px] font-bold text-teal-700">{formatEther(task.rewardPool)} MON</span>
        <span className="font-mono text-[10px] text-zinc-400">{task.commitCount}/{task.maxAgents}</span>
      </div>
    </Link>
  );
};

function TasksPage() {
  const { data: taskCount } = useTaskCount();
  const count = taskCount ? Number(taskCount) : 0;

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
          <span className="font-mono text-[10px] text-zinc-400">/ TASKS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-400">
            Total: <span className="text-teal-700">{count}</span>
          </span>
          <a
            href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border border-teal-300/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-teal-400 hover:text-teal-700"
          >
            Explorer <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <ConnectWallet />
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between border-b border-teal-200/40 bg-white/20 px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-teal-600/50">
        <div className="flex items-center gap-3">
          <span className="w-[28px]">#</span>
          <span className="w-[50px]">Status</span>
          <span>Description</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Type</span>
          <span>Reward</span>
          <span>Agents</span>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: count }, (_, i) => (
          <TaskRow key={i} taskId={i} />
        ))}
        {count === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <Activity className="h-5 w-5 text-zinc-300" />
            <span className="font-mono text-[10px] text-zinc-400">No tasks created yet</span>
            <Link
              to="/demo"
              className="mt-2 border border-teal-500 px-2 py-1 font-mono text-[9px] font-semibold uppercase text-teal-700 hover:bg-teal-50"
            >
              Run Demo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_layout/challenges")({
  component: TasksPage,
});
