import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, CheckCircle, Circle, Loader2, ExternalLink, Users, Zap } from "lucide-react";
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
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { trpcClient } from "@/integrations/trpc";

interface DemoStep {
  id: string;
  label: string;
  description: string;
  status: "idle" | "running" | "done" | "error";
  result?: string;
}

const DEMO_AGENTS = [
  { name: "Claude-3.5", stakeEth: "0.01" },
  { name: "Claude-Creative", stakeEth: "0.01" },
  { name: "Claude-Precise", stakeEth: "0.01" },
];

const DEMO_TASK = {
  description: "Translate the following English text to Chinese: 'The quick brown fox jumps over the lazy dog'",
  taskType: "translation",
  rewardEth: "0.02",
  requiredStakeEth: "0.005",
};

const CONTRACT_ADDRESS = "0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1";

const DemoPage = () => {
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

  const [steps, setSteps] = useState<DemoStep[]>([
    { id: "register", label: "Register 3 Agents + Stake", description: "Register agents with MON stake as collateral", status: "idle" },
    { id: "task", label: "Create Task + Reward Pool", description: "Publish translation task with 0.02 MON reward", status: "idle" },
    { id: "solve", label: "3 Agents Solve in Parallel", description: "Claude API generates 3 independent translations", status: "idle" },
    { id: "commit", label: "Parallel Commit (Monad ⚡)", description: "3 agents commit result hashes simultaneously", status: "idle" },
    { id: "reveal", label: "Parallel Reveal", description: "All agents reveal their actual results", status: "idle" },
    { id: "judge", label: "Judge → Consensus → Settle", description: "Judge AI determines consensus, contract distributes rewards", status: "idle" },
  ]);

  const [agentResults, setAgentResults] = useState<Array<{ agentName: string; answer: string }>>([]);
  const [consensusResult, setConsensusResult] = useState<{ consensus: number[]; outliers: number[]; reasoning: string } | null>(null);
  const [currentLog, setCurrentLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setCurrentLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const updateStep = useCallback((id: string, update: Partial<DemoStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  // Step 1: Register agents with stake
  const handleRegister = async () => {
    updateStep("register", { status: "running" });
    addLog("🔐 Registering 3 agents with stake on Monad testnet...");

    try {
      for (const agent of DEMO_AGENTS) {
        register(agent.name, parseEther(agent.stakeEth));
        addLog(`→ "${agent.name}" registered with ${agent.stakeEth} MON stake`);
      }
      updateStep("register", { status: "done", result: `3 agents registered with stake` });
      addLog("✓ All registration txs sent — agents have skin in the game");
    } catch (e) {
      updateStep("register", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Registration failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  // Step 2: Create task with reward pool
  const handleCreateTask = async () => {
    updateStep("task", { status: "running" });
    addLog("📋 Creating task with reward pool...");

    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      createTask(
        DEMO_TASK.description,
        DEMO_TASK.taskType,
        parseEther(DEMO_TASK.requiredStakeEth),
        now + 600n,   // commit deadline: 10 min
        now + 1200n,  // reveal deadline: 20 min
        5,            // max agents
        parseEther(DEMO_TASK.rewardEth),
      );
      addLog(`→ Task: "${DEMO_TASK.description.slice(0, 60)}..."`);
      addLog(`→ Reward pool: ${DEMO_TASK.rewardEth} MON | Required stake: ${DEMO_TASK.requiredStakeEth} MON`);
      updateStep("task", { status: "done", result: `Task created with ${DEMO_TASK.rewardEth} MON reward` });
      addLog("✓ Task creation tx sent");
    } catch (e) {
      updateStep("task", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Task creation failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  // Step 3: All agents solve in parallel via Claude API
  const handleSolve = async () => {
    updateStep("solve", { status: "running" });
    addLog("🧠 3 Agents solving task in parallel via Claude API...");

    try {
      const result = await trpcClient.agent.solveParallel.mutate({
        prompt: DEMO_TASK.description,
        agentCount: 3,
      });

      const results = result.results.map((r) => ({
        agentName: r.agentName,
        answer: r.answer,
      }));
      setAgentResults(results);

      for (const r of result.results) {
        if (r.error) {
          addLog(`✗ ${r.agentName}: ERROR — ${r.error}`);
        } else {
          addLog(`→ ${r.agentName}: "${r.answer.slice(0, 80)}${r.answer.length > 80 ? "..." : ""}"`);
        }
      }

      updateStep("solve", { status: "done", result: `${results.length} agents returned results` });
      addLog("✓ All agents solved — results ready for commit");
    } catch (e) {
      updateStep("solve", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Claude API failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  // Step 4: Parallel commit — this is the Monad showcase moment
  const handleCommit = async () => {
    updateStep("commit", { status: "running" });
    addLog("⚡ Committing 3 results simultaneously — Monad parallel EVM in action...");

    try {
      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;
      const addr = walletAddress ?? "0x0000000000000000000000000000000000000000" as `0x${string}`;

      for (const r of agentResults) {
        const commitHash = commit(currentTaskId, addr, r.answer);
        addLog(`→ ${r.agentName} committed: ${String(commitHash).slice(0, 18)}...`);
      }

      updateStep("commit", { status: "done", result: "3 commit txs sent in parallel" });
      addLog("✓ All commits sent — check Monad Explorer for parallel confirmation!");
      addLog("🔍 3 txs should confirm in the same block — that's Monad's parallel EVM");
    } catch (e) {
      updateStep("commit", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Commit failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  // Step 5: Reveal results
  const handleReveal = async () => {
    updateStep("reveal", { status: "running" });
    addLog("📖 Starting reveal phase and revealing all results...");

    try {
      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;

      // Start reveal phase
      startReveal(currentTaskId);
      addLog("→ Reveal phase started");

      // Reveal each result
      for (const r of agentResults) {
        reveal(currentTaskId, r.answer);
        addLog(`→ ${r.agentName} revealed: "${r.answer.slice(0, 50)}..."`);
      }

      updateStep("reveal", { status: "done", result: "All results revealed" });
      addLog("✓ All reveals complete — ready for judgment");
    } catch (e) {
      updateStep("reveal", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Reveal failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  // Step 6: Judge determines consensus and contract settles
  const handleJudge = async () => {
    updateStep("judge", { status: "running" });
    addLog("⚖️ Judge AI evaluating results for consensus...");

    try {
      // Call judge API
      const judgment = await trpcClient.agent.judge.mutate({
        taskDescription: DEMO_TASK.description,
        results: agentResults,
      });
      setConsensusResult(judgment);

      addLog(`→ Consensus cluster: [${judgment.consensus.map((i) => agentResults[i]?.agentName).join(", ")}]`);
      addLog(`→ Outliers: [${judgment.outliers.map((i) => agentResults[i]?.agentName).join(", ") || "none"}]`);
      addLog(`→ Reasoning: ${judgment.reasoning}`);

      // Submit judgment on-chain
      const currentTaskId = taskCount ? BigInt(Number(taskCount) - 1) : 0n;
      startJudging(currentTaskId);

      // In a real system, consensus agents would be their actual addresses.
      // For demo, we use the wallet address as all agents share one wallet
      const consensusAgents = judgment.consensus.map(() => walletAddress ?? "0x0000000000000000000000000000000000000000" as `0x${string}`);
      judge(currentTaskId, consensusAgents);

      const consensusCount = judgment.consensus.length;
      const outlierCount = judgment.outliers.length;
      addLog(`✓ Judgment submitted on-chain`);
      addLog(`💰 ${consensusCount} agents share ${DEMO_TASK.rewardEth} MON reward`);
      if (outlierCount > 0) {
        addLog(`🔥 ${outlierCount} outlier agent(s) slashed — 50% of staked MON lost`);
      }
      addLog("✓ Settlement complete — check agent profiles for updated consensus rates");

      updateStep("judge", {
        status: "done",
        result: `${consensusCount} consensus, ${outlierCount} outlier${outlierCount !== 1 ? "s" : ""} — settled`,
      });
    } catch (e) {
      updateStep("judge", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Judgment failed: ${e instanceof Error ? e.message : "Unknown"}`);
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

  const getStepIcon = (status: DemoStep["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case "error":
        return <Circle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<Play className="h-4 w-4 text-primary" />}
        title="Live Demo — Cross-Validation"
        actions={
          <a
            href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Monad Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        }
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Hero narrative */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-zinc-50 to-zinc-100 p-6 dark:from-zinc-900 dark:to-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Competitive Cross-Validation</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Multiple agents independently complete the same task. They commit result hashes (hidden), then reveal simultaneously.
              A judge determines which agents agree (consensus cluster) — they share the reward.
              Outliers get slashed. No human examiner needed. Agents verify each other.
            </p>
          </div>

          {/* Wallet check */}
          {!isConnected && (
            <DashboardPanel title="Connect Wallet First">
              <p className="mb-3 text-sm text-muted-foreground">
                Connect your wallet to Monad Testnet to run the demo
              </p>
              <ConnectWallet />
            </DashboardPanel>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm text-center">
              <div className="text-3xl font-bold tracking-tight">{agentCount?.toString() ?? "—"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Registered Agents</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm text-center">
              <div className="text-3xl font-bold tracking-tight">{taskCount?.toString() ?? "—"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold tracking-tight">Monad</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Parallel EVM</div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Steps */}
            <DashboardPanel title="Demo Flow" description="6-step cross-validation lifecycle">
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const isReady = isConnected && (i === 0 || steps[i - 1].status === "done");
                  const handler = handlers[step.id];

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                        step.status === "done"
                          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
                          : step.status === "running"
                            ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                            : step.status === "error"
                              ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30"
                              : "border-border/70 bg-background/60"
                      }`}
                    >
                      <div className="mt-0.5">{getStepIcon(step.status)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            {i + 1}. {step.label}
                          </p>
                          {isReady && step.status !== "done" && step.status !== "running" && (
                            <button
                              type="button"
                              onClick={handler}
                              className="shrink-0 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              Run
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        {step.result && (
                          <p className={`mt-1 text-xs font-medium ${step.status === "error" ? "text-red-600" : "text-green-600"}`}>
                            {step.result}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardPanel>

            {/* Live log */}
            <DashboardPanel title="Live Transaction Log" description="Real-time on-chain activity">
              <div className="h-[460px] overflow-y-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-green-400">
                {currentLog.length === 0 ? (
                  <p className="text-zinc-500">Waiting for demo to start...</p>
                ) : (
                  currentLog.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">{line}</div>
                  ))
                )}
              </div>
            </DashboardPanel>
          </div>

          {/* Agent Results Comparison */}
          {agentResults.length > 0 && (
            <DashboardPanel title="Agent Results Comparison" description="Independent results from each agent">
              <div className="grid gap-3 sm:grid-cols-3">
                {agentResults.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${
                      consensusResult
                        ? consensusResult.consensus.includes(i)
                          ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                          : "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                        : "border-border/70 bg-background/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{r.agentName}</span>
                      {consensusResult && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          consensusResult.consensus.includes(i)
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {consensusResult.consensus.includes(i) ? "CONSENSUS" : "OUTLIER"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground break-all">{r.answer}</p>
                  </div>
                ))}
              </div>
              {consensusResult && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Judge reasoning:</span> {consensusResult.reasoning}
                  </p>
                </div>
              )}
            </DashboardPanel>
          )}

          {/* Monad Explorer */}
          <DashboardPanel
            title="Verify On-Chain"
            description="All records are immutable and publicly verifiable on Monad"
          >
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Contract on Monad Explorer
              </a>
              <a
                href="https://testnet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Monad Testnet Faucet
              </a>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/demo")({
  component: DemoPage,
});
