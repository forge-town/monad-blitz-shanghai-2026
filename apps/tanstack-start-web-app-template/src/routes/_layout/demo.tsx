import { useState, useCallback, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Check, Loader2, AlertTriangle } from "lucide-react";
import {
  useRegisterAgent,
  useCreateTask,
  useCommitResult,
  useStartRevealPhase,
  useRevealResult,
  useStartJudgingPhase,
  useSubmitJudgment,
  useAgentCount,
  useTaskCount,
} from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { ConnectWallet } from "@/components/ConnectWallet";
import { trpcClient } from "@/integrations/trpc";

interface DemoStep {
  id: string;
  label: string;
  detail: string;
  status: "idle" | "running" | "done" | "error";
  result?: string;
}

const DEMO_AGENTS = [
  { name: "Claude-3.5", stakeEth: "0.01" },
  { name: "Claude-Creative", stakeEth: "0.01" },
  { name: "Claude-Precise", stakeEth: "0.01" },
];

const TASK_PRESETS = [
  { id: "translation", label: "Translation", description: "Translate the following English text to Chinese: 'The quick brown fox jumps over the lazy dog'", taskType: "translation" },
  { id: "math", label: "Math", description: "Solve step by step: If a train travels at 120km/h for 2.5 hours, then at 80km/h for 1.5 hours, what is the total distance?", taskType: "math" },
  { id: "code-review", label: "Code Review", description: "Review this function and identify bugs: function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); } — What is the time complexity and how to optimize?", taskType: "code-review" },
];

const DEMO_REWARD_ETH = "0.02";
const DEMO_REQUIRED_STAKE_ETH = "0.005";
const CONTRACT_ADDRESS = "0xBC83F1840Ad22014a8f6A081103e1813100604Aa";

function DemoPage() {
  const { isConnected, address: walletAddress } = useAccount();
  const { data: agentCount } = useAgentCount();
  const { data: taskCount } = useTaskCount();

  const { register } = useRegisterAgent();
  const { create: createTask } = useCreateTask();
  const { commit } = useCommitResult();
  const { startReveal } = useStartRevealPhase();
  const { reveal } = useRevealResult();
  const { startJudging } = useStartJudgingPhase();
  const { judge } = useSubmitJudgment();

  const logRef = useRef<HTMLDivElement>(null);

  const [steps, setSteps] = useState<DemoStep[]>([
    { id: "register", label: "Register 3 Agents", detail: "Stake MON as collateral", status: "idle" },
    { id: "task", label: "Create Task", detail: "Publish with reward pool", status: "idle" },
    { id: "solve", label: "AI Solve ×3", detail: "Claude parallel solving", status: "idle" },
    { id: "commit", label: "Parallel Commit", detail: "Monad parallel EVM ⚡", status: "idle" },
    { id: "reveal", label: "Reveal Results", detail: "Make results public", status: "idle" },
    { id: "judge", label: "Judge & Settle", detail: "Consensus → reward/slash", status: "idle" },
  ]);

  const [agentResults, setAgentResults] = useState<Array<{ name: string; answer: string }>>([]);
  const [consensusResult, setConsensusResult] = useState<{ consensus: number[]; outliers: number[]; reasoning: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(0);

  const selectedTask = TASK_PRESETS[selectedTaskIdx];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const updateStep = useCallback((id: string, update: Partial<DemoStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  const handleRegister = async () => {
    updateStep("register", { status: "running" });
    addLog("Registering 3 agents with stake...");
    try {
      for (const agent of DEMO_AGENTS) {
        register(agent.name, parseEther(agent.stakeEth));
        addLog(`  → ${agent.name} staked ${agent.stakeEth} MON`);
      }
      updateStep("register", { status: "done", result: "3 agents registered" });
      addLog("✓ All agents registered");
    } catch (e) {
      updateStep("register", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleCreateTask = async () => {
    updateStep("task", { status: "running" });
    addLog("Creating task with reward pool...");
    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      createTask(selectedTask.description, selectedTask.taskType, parseEther(DEMO_REQUIRED_STAKE_ETH), now + 600n, now + 1200n, 5, parseEther(DEMO_REWARD_ETH));
      addLog(`  → Task: "${selectedTask.description.slice(0, 50)}..."`);
      addLog(`  → Reward: ${DEMO_REWARD_ETH} MON`);
      updateStep("task", { status: "done", result: `${DEMO_REWARD_ETH} MON reward pool` });
      addLog("✓ Task created on-chain");
    } catch (e) {
      updateStep("task", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleSolve = async () => {
    updateStep("solve", { status: "running" });
    addLog("3 agents solving in parallel via Claude...");
    try {
      const result = await trpcClient.agent.solveParallel.mutate({ prompt: selectedTask.description, agentCount: 3 });
      const results = result.results.map((r) => ({ name: r.agentName, answer: r.answer }));
      setAgentResults(results);
      for (const r of result.results) {
        addLog(`  → ${r.agentName}: "${r.answer.slice(0, 60)}..."`);
      }
      updateStep("solve", { status: "done", result: `${results.length} results` });
      addLog("✓ All agents returned results");
    } catch (e) {
      updateStep("solve", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleCommit = async () => {
    updateStep("commit", { status: "running" });
    addLog("⚡ Committing hashes — Monad parallel EVM...");
    try {
      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;
      const addr = walletAddress ?? ("0x0000000000000000000000000000000000000000" as `0x${string}`);
      for (const r of agentResults) {
        commit(currentTaskId, addr, r.answer);
        addLog(`  → ${r.name} hash committed`);
      }
      updateStep("commit", { status: "done", result: "3 parallel commits" });
      addLog("✓ All commits sent in parallel");
    } catch (e) {
      updateStep("commit", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleReveal = async () => {
    updateStep("reveal", { status: "running" });
    addLog("Revealing results...");
    try {
      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;
      startReveal(currentTaskId);
      addLog("  → Reveal phase started");
      for (const r of agentResults) {
        reveal(currentTaskId, r.answer);
        addLog(`  → ${r.name} revealed`);
      }
      updateStep("reveal", { status: "done", result: "All revealed" });
      addLog("✓ All results public");
    } catch (e) {
      updateStep("reveal", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleJudge = async () => {
    updateStep("judge", { status: "running" });
    addLog("Judge evaluating consensus...");
    try {
      const judgment = await trpcClient.agent.judge.mutate({
        taskDescription: selectedTask.description,
        results: agentResults.map((r) => ({ agentName: r.name, answer: r.answer })),
      });
      setConsensusResult(judgment);
      addLog(`  → Consensus: [${judgment.consensus.map((i) => agentResults[i]?.name).join(", ")}]`);
      if (judgment.outliers.length > 0) {
        addLog(`  → Outliers: [${judgment.outliers.map((i) => agentResults[i]?.name).join(", ")}]`);
      }
      addLog(`  → ${judgment.reasoning}`);

      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;
      startJudging(currentTaskId);
      const consensusAgents = judgment.consensus.map(() => walletAddress ?? ("0x0000000000000000000000000000000000000000" as `0x${string}`));
      judge(currentTaskId, consensusAgents);

      updateStep("judge", { status: "done", result: `${judgment.consensus.length} consensus / ${judgment.outliers.length} slashed` });
      addLog("✓ Settlement complete on-chain");
    } catch (e) {
      updateStep("judge", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handlers: Record<string, () => void> = {
    register: handleRegister,
    task: handleCreateTask,
    solve: handleSolve,
    commit: handleCommit,
    reveal: handleReveal,
    judge: handleJudge,
  };

  const getActiveStep = () => {
    const running = steps.find((s) => s.status === "running");
    if (running) return running.id;
    const nextIdle = steps.find((s, i) => s.status === "idle" && (i === 0 || steps[i - 1].status === "done"));
    return nextIdle?.id ?? null;
  };

  const activeStep = getActiveStep();
  const completedCount = steps.filter((s) => s.status === "done").length;

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
          <span className="font-mono text-[10px] text-zinc-400">/ DEMO</span>
          <span className="font-mono text-[10px] text-zinc-400">
            {completedCount}/{steps.length}
          </span>
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
          <ConnectWallet />
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Pipeline Steps */}
        <div className="flex w-[260px] shrink-0 flex-col border-r border-teal-200/40">
          {/* Task selector */}
          <div className="border-b border-teal-100/40 bg-white/30 px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Task Type</span>
          </div>
          <div className="flex border-b border-teal-200/40">
            {TASK_PRESETS.map((preset, i) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedTaskIdx(i)}
                className={`flex-1 border-r border-teal-100/40 px-2 py-2 font-mono text-[9px] last:border-r-0 ${
                  selectedTaskIdx === i ? "bg-teal-50 font-semibold text-teal-700" : "text-zinc-500 hover:bg-white/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Wallet warning */}
          {!isConnected && (
            <div className="border-b border-amber-200 bg-amber-50 px-3 py-2">
              <p className="font-mono text-[10px] text-amber-800">Connect wallet first</p>
            </div>
          )}

          {/* Steps */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {steps.map((step, i) => {
              const isActive = step.id === activeStep;
              const canRun = isConnected && isActive && step.status !== "running";
              const handler = handlers[step.id];

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 border-b border-teal-100/40 px-3 py-2.5 ${
                    step.status === "done" ? "bg-teal-50/60" : step.status === "running" ? "bg-teal-50" : step.status === "error" ? "bg-red-50/60" : ""
                  }`}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.status === "done" ? (
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                    ) : step.status === "running" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                    ) : step.status === "error" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <span className="font-mono text-[9px] text-zinc-300">{String(i + 1).padStart(2, "0")}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-mono text-[11px] font-medium ${
                      step.status === "done" ? "text-teal-700" : step.status === "running" ? "text-teal-800" : "text-zinc-600"
                    }`}>
                      {step.label}
                    </p>
                    <p className="truncate font-mono text-[9px] text-zinc-400">{step.result ?? step.detail}</p>
                  </div>
                  {canRun && (
                    <button
                      type="button"
                      onClick={handler}
                      className="shrink-0 border border-teal-500 px-2 py-0.5 font-mono text-[9px] font-medium uppercase text-teal-700 hover:bg-teal-50"
                    >
                      Run
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Task brief */}
          <div className="border-t border-teal-200/40 bg-white/40 px-3 py-2">
            <div className="font-mono text-[9px] uppercase text-teal-600/50">Task</div>
            <p className="mt-0.5 line-clamp-2 font-mono text-[10px] text-zinc-600">{selectedTask.description}</p>
            <div className="mt-1 flex gap-3 font-mono text-[9px] text-zinc-400">
              <span>{DEMO_REWARD_ETH} MON</span>
              <span>×3 agents</span>
            </div>
          </div>
        </div>

        {/* Right: Results + Terminal */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Agent Results (top half) */}
          <div className="flex shrink-0 flex-col border-b border-teal-200/40">
            <div className="flex items-center justify-between border-b border-teal-100/40 bg-white/30 px-4 py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-teal-600/50">Agent Outputs</span>
              {consensusResult && (
                <span className="font-mono text-[9px] text-zinc-400">
                  {consensusResult.consensus.length} consensus / {consensusResult.outliers.length} outlier
                </span>
              )}
            </div>
            <div className="grid min-h-[160px] grid-cols-3 gap-px bg-teal-100/30">
              {agentResults.length > 0 ? (
                agentResults.map((r, i) => {
                  const isConsensus = consensusResult?.consensus.includes(i);
                  const isOutlier = consensusResult?.outliers.includes(i);
                  return (
                    <div key={i} className={`flex flex-col p-3 ${isConsensus ? "bg-teal-50" : isOutlier ? "bg-red-50" : "bg-[#f4f9f6]"}`}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-zinc-700">{r.name}</span>
                        {isConsensus && <span className="border border-teal-500 px-1 py-px font-mono text-[7px] font-bold uppercase text-teal-700">Valid</span>}
                        {isOutlier && <span className="border border-red-400 px-1 py-px font-mono text-[7px] font-bold uppercase text-red-600">Slash</span>}
                      </div>
                      <p className="flex-1 overflow-hidden font-mono text-[10px] leading-relaxed text-zinc-500">{r.answer}</p>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex items-center justify-center bg-[#f4f9f6] p-3"><span className="font-mono text-[10px] text-zinc-300">Agent 1</span></div>
                  <div className="flex items-center justify-center bg-[#f4f9f6] p-3"><span className="font-mono text-[10px] text-zinc-300">Agent 2</span></div>
                  <div className="flex items-center justify-center bg-[#f4f9f6] p-3"><span className="font-mono text-[10px] text-zinc-300">Agent 3</span></div>
                </>
              )}
            </div>
            {consensusResult && (
              <div className="border-t border-teal-100/40 bg-white/30 px-4 py-1.5">
                <p className="font-mono text-[9px] text-zinc-500">
                  <span className="text-zinc-700">Judge:</span> {consensusResult.reasoning}
                </p>
              </div>
            )}
          </div>

          {/* Terminal (bottom half) */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-teal-400" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Log</span>
              </div>
              <span className="font-mono text-[9px] text-zinc-600">{logs.length}</span>
            </div>
            <div
              ref={logRef}
              className="flex-1 overflow-y-auto bg-zinc-900 px-4 py-2 font-mono text-[11px] leading-relaxed text-teal-300"
            >
              {logs.length === 0 ? (
                <span className="text-zinc-600">// select task type and run steps</span>
              ) : (
                logs.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_layout/demo")({
  component: DemoPage,
});
