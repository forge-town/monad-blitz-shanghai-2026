import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, CheckCircle, Circle, Loader2, ExternalLink } from "lucide-react";
import {
  useRegisterAgent,
  useCreateChallenge,
  useSubmitResult,
  useRevealAnswer,
  useAgentCount,
  useChallengeCount,
} from "@/integrations/contracts";
import type { AgentId } from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { trpcClient } from "@/integrations/trpc";
import { keccak256, encodePacked } from "viem";

interface DemoStep {
  id: string;
  label: string;
  description: string;
  status: "idle" | "running" | "done" | "error";
  result?: string;
}

const DEMO_CHALLENGES = [
  {
    name: "Claude Math Agent",
    capabilities: ["math", "reasoning"],
    capability: "math",
    prompt: "What is the square root of 144?",
    answer: "12",
  },
  {
    name: "Claude Code Agent",
    capabilities: ["coding", "debugging"],
    capability: "coding",
    prompt: "What is the output of: console.log(typeof null) in JavaScript?",
    answer: "object",
  },
];

const DemoPage = () => {
  const { isConnected } = useAccount();
  const { data: agentCount } = useAgentCount();
  const { data: challengeCount } = useChallengeCount();

  const { register } = useRegisterAgent();
  const { create } = useCreateChallenge();
  const { submit } = useSubmitResult();
  const { reveal } = useRevealAnswer();

  const [steps, setSteps] = useState<DemoStep[]>([
    { id: "register", label: "Register Agents", description: "Register 2 AI agents on Monad testnet", status: "idle" },
    { id: "challenge", label: "Create Challenges", description: "Issue capability challenges on-chain", status: "idle" },
    { id: "solve", label: "Agent Solve (Claude API)", description: "Claude API answers the challenges", status: "idle" },
    { id: "submit", label: "Submit Results", description: "Submit answer hashes on-chain", status: "idle" },
    { id: "reveal", label: "Reveal & Judge", description: "Contract auto-judges pass/fail", status: "idle" },
  ]);

  const [agentIds, setAgentIds] = useState<AgentId[]>([]);
  const [claudeAnswers, setClaudeAnswers] = useState<string[]>([]);
  const [currentLog, setCurrentLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setCurrentLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const updateStep = useCallback((id: string, update: Partial<DemoStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  const handleRegister = async () => {
    updateStep("register", { status: "running" });
    addLog("Registering 2 agents on Monad testnet...");

    try {
      const ids: AgentId[] = [];
      for (const agent of DEMO_CHALLENGES) {
        const agentId = register(agent.name, agent.capabilities);
        ids.push(agentId);
        addLog(`→ Registered "${agent.name}" (${agentId.slice(0, 10)}...)`);
      }
      setAgentIds(ids);
      updateStep("register", { status: "done", result: `${ids.length} agents registered` });
      addLog("✓ Agent registration transactions sent");
    } catch (e) {
      updateStep("register", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Registration failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleCreateChallenges = async () => {
    updateStep("challenge", { status: "running" });
    addLog("Creating challenges on-chain...");

    try {
      for (let i = 0; i < DEMO_CHALLENGES.length; i++) {
        const ch = DEMO_CHALLENGES[i];
        const agentId = agentIds[i] ?? keccak256(encodePacked(["string"], [ch.name]));
        create(agentId, ch.capability, ch.prompt, ch.answer, 3600n);
        addLog(`→ Challenge for "${ch.name}": ${ch.prompt}`);
      }
      updateStep("challenge", { status: "done", result: `${DEMO_CHALLENGES.length} challenges created` });
      addLog("✓ Challenge transactions sent");
    } catch (e) {
      updateStep("challenge", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Challenge creation failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleSolve = async () => {
    updateStep("solve", { status: "running" });
    addLog("Asking Claude API to solve challenges...");

    try {
      const answers: string[] = [];
      for (const ch of DEMO_CHALLENGES) {
        addLog(`→ Claude solving: "${ch.prompt}"`);
        const result = await trpcClient.agent.solve.mutate({ prompt: ch.prompt });
        answers.push(result.answer);
        addLog(`  Claude answered: "${result.answer}"`);
      }
      setClaudeAnswers(answers);
      updateStep("solve", { status: "done", result: `Claude answered ${answers.length} challenges` });
      addLog("✓ All challenges solved by Claude");
    } catch (e) {
      updateStep("solve", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Claude API failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleSubmit = async () => {
    updateStep("submit", { status: "running" });
    addLog("Submitting results on-chain...");

    try {
      const startId = challengeCount ? Number(challengeCount) - DEMO_CHALLENGES.length : 0;
      for (let i = 0; i < claudeAnswers.length; i++) {
        const cid = BigInt(startId + i);
        submit(cid, claudeAnswers[i]);
        addLog(`→ Submitted result for challenge #${cid}: "${claudeAnswers[i]}"`);
      }
      updateStep("submit", { status: "done", result: `${claudeAnswers.length} results submitted` });
      addLog("✓ Submit transactions sent — answers hashed on-chain");
    } catch (e) {
      updateStep("submit", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Submit failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleReveal = async () => {
    updateStep("reveal", { status: "running" });
    addLog("Revealing answers — contract auto-judges...");

    try {
      const startId = challengeCount ? Number(challengeCount) - DEMO_CHALLENGES.length : 0;
      for (let i = 0; i < DEMO_CHALLENGES.length; i++) {
        const cid = BigInt(startId + i);
        reveal(cid, DEMO_CHALLENGES[i].answer);
        addLog(`→ Revealed answer for challenge #${cid}: "${DEMO_CHALLENGES[i].answer}"`);
      }
      updateStep("reveal", { status: "done", result: "Answers revealed, contract judged" });
      addLog("✓ Reveal transactions sent — agent profiles updated on-chain");
    } catch (e) {
      updateStep("reveal", { status: "error", result: e instanceof Error ? e.message : "Failed" });
      addLog(`✗ Reveal failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handlers: Record<string, () => void> = {
    register: handleRegister,
    challenge: handleCreateChallenges,
    solve: handleSolve,
    submit: handleSubmit,
    reveal: handleReveal,
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
        title="Live Demo"
        actions={
          <a
            href="https://testnet.monadexplorer.com/address/0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm text-center">
              <div className="text-3xl font-bold tracking-tight">{agentCount?.toString() ?? "—"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Registered Agents</div>
            </div>
            <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm text-center">
              <div className="text-3xl font-bold tracking-tight">{challengeCount?.toString() ?? "—"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Total Challenges</div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Steps */}
            <DashboardPanel
              title="Demo Steps"
              description="Full challenge lifecycle on Monad"
            >
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const isReady =
                    isConnected &&
                    (i === 0 || steps[i - 1].status === "done");
                  const handler = handlers[step.id];

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                        step.status === "done"
                          ? "border-green-200 bg-green-50/50"
                          : step.status === "running"
                            ? "border-blue-200 bg-blue-50/50"
                            : step.status === "error"
                              ? "border-red-200 bg-red-50/50"
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
            <DashboardPanel title="Live Log" description="Real-time transaction log">
              <div className="h-[400px] overflow-y-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-green-400">
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

          {/* Monad Explorer */}
          <DashboardPanel
            title="Verify On-Chain"
            description="All records are immutable and publicly verifiable"
          >
            <div className="flex flex-wrap gap-3">
              <a
                href="https://testnet.monadexplorer.com/address/0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1"
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
