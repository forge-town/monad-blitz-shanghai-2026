import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useChallenge,
  useSubmitResult,
  useRevealAnswer,
  ChallengeStatus,
} from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { trpcClient } from "@/integrations/trpc";

const STATUS_LABELS: Record<ChallengeStatus, { label: string; color: string }> = {
  [ChallengeStatus.Open]: { label: "Open", color: "text-blue-600 bg-blue-50" },
  [ChallengeStatus.Submitted]: { label: "Submitted", color: "text-amber-600 bg-amber-50" },
  [ChallengeStatus.Revealed]: { label: "Revealed", color: "text-green-600 bg-green-50" },
  [ChallengeStatus.Expired]: { label: "Expired", color: "text-muted-foreground bg-muted" },
};

const ChallengeDetailPage = () => {
  const { challengeId: rawId } = Route.useParams();
  const challengeId = BigInt(rawId);
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { address } = useAccount();

  const { submit, isPending: isSubmitting, isConfirming: isSubmitConfirming, isSuccess: submitSuccess, error: submitError } = useSubmitResult();
  const { reveal, isPending: isRevealing, isConfirming: isRevealConfirming, isSuccess: revealSuccess, error: revealError } = useRevealAnswer();

  const [agentAnswer, setAgentAnswer] = useState("");
  const [revealInput, setRevealInput] = useState("");
  const [claudeResponse, setClaudeResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/challenges" title="Loading..." />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <PageHeader backTo="/challenges" title="Challenge not found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Challenge not found</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[challenge.status] ?? STATUS_LABELS[ChallengeStatus.Open];
  const isCreator = address && challenge.creator.toLowerCase() === address.toLowerCase();
  const deadline = new Date(Number(challenge.deadline) * 1000);
  const isExpired = Date.now() > deadline.getTime();

  const handleAskClaude = async () => {
    setIsAsking(true);
    try {
      const result = await trpcClient.agent.solve.mutate({ prompt: challenge.prompt });
      setClaudeResponse(result.answer);
      setAgentAnswer(result.answer);
    } catch (e) {
      setClaudeResponse(`Error: ${e instanceof Error ? e.message : "Failed to call Claude"}`);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentAnswer.trim()) return;
    submit(challengeId, agentAnswer);
  };

  const handleReveal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revealInput.trim()) return;
    reveal(challengeId, revealInput);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        backTo="/challenges"
        title={`Challenge #${rawId}`}
        badge={
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {/* Challenge Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Capability</div>
              <div className="mt-1 text-sm font-semibold">{challenge.capability}</div>
            </div>
            <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Deadline</div>
              <div className={`mt-1 text-sm font-semibold ${isExpired ? "text-red-600" : ""}`}>
                {deadline.toLocaleString()}
              </div>
            </div>
            <div className="rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="text-xs text-muted-foreground">Result</div>
              <div className="mt-1 text-sm font-semibold">
                {challenge.status === ChallengeStatus.Revealed
                  ? challenge.passed
                    ? "✓ Passed"
                    : "✗ Failed"
                  : "Pending"}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Prompt */}
            <DashboardPanel title="Challenge Prompt" description="The question the agent must answer">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{challenge.prompt}</p>
              </div>
              <div className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                <p>Creator: {challenge.creator.slice(0, 6)}...{challenge.creator.slice(-4)}</p>
                <p>Agent: {challenge.agentId.slice(0, 10)}...{challenge.agentId.slice(-4)}</p>
              </div>
            </DashboardPanel>

            {/* Actions */}
            <div className="flex flex-col gap-6">
              {/* Step 1: Agent solves (Open) */}
              {challenge.status === ChallengeStatus.Open && !isExpired && (
                <DashboardPanel
                  title="Step 1: Agent Solve"
                  description="Ask Claude to solve this challenge, then submit the answer on-chain"
                >
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleAskClaude}
                      disabled={isAsking}
                      className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAsking ? "Asking Claude..." : "🤖 Ask Claude API"}
                    </button>

                    {claudeResponse && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                        <p className="text-xs font-medium text-blue-700">Claude's Answer:</p>
                        <p className="mt-1 text-sm">{claudeResponse}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmitResult} className="space-y-3">
                      <div>
                        <label htmlFor="agent-answer" className="text-sm font-medium">
                          Answer to submit
                        </label>
                        <input
                          id="agent-answer"
                          type="text"
                          value={agentAnswer}
                          onChange={(e) => setAgentAnswer(e.target.value)}
                          placeholder="Agent's answer (will be hashed)"
                          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || isSubmitConfirming || !agentAnswer.trim()}
                        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSubmitting ? "Signing..." : isSubmitConfirming ? "Confirming..." : "Submit Result On-Chain"}
                      </button>
                    </form>

                    {submitSuccess && (
                      <p className="text-sm text-green-600">Result submitted on-chain!</p>
                    )}
                    {submitError && (
                      <p className="text-sm text-red-600">Error: {submitError.message.slice(0, 100)}</p>
                    )}
                  </div>
                </DashboardPanel>
              )}

              {/* Step 2: Reveal answer (Submitted) */}
              {challenge.status === ChallengeStatus.Submitted && isCreator && (
                <DashboardPanel
                  title="Step 2: Reveal Answer"
                  description="Reveal the correct answer — the contract will auto-judge"
                >
                  <form onSubmit={handleReveal} className="space-y-3">
                    <div>
                      <label htmlFor="reveal-answer" className="text-sm font-medium">
                        Original correct answer
                      </label>
                      <input
                        id="reveal-answer"
                        type="text"
                        value={revealInput}
                        onChange={(e) => setRevealInput(e.target.value)}
                        placeholder="The plaintext answer you used when creating"
                        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isRevealing || isRevealConfirming || !revealInput.trim()}
                      className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isRevealing ? "Signing..." : isRevealConfirming ? "Confirming..." : "Reveal & Judge"}
                    </button>
                  </form>

                  {revealSuccess && (
                    <p className="mt-3 text-sm text-green-600">Answer revealed! Check the result above.</p>
                  )}
                  {revealError && (
                    <p className="mt-3 text-sm text-red-600">Error: {revealError.message.slice(0, 100)}</p>
                  )}
                </DashboardPanel>
              )}

              {/* Final result */}
              {challenge.status === ChallengeStatus.Revealed && (
                <DashboardPanel title="Verification Result">
                  <div
                    className={`rounded-xl p-6 text-center ${
                      challenge.passed
                        ? "border border-green-200 bg-green-50"
                        : "border border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="text-3xl">{challenge.passed ? "✓" : "✗"}</div>
                    <p className={`mt-2 text-lg font-bold ${challenge.passed ? "text-green-700" : "text-red-700"}`}>
                      {challenge.passed ? "Challenge Passed" : "Challenge Failed"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Result recorded on-chain and immutable
                    </p>
                  </div>
                </DashboardPanel>
              )}

              {/* Status: waiting for submission */}
              {challenge.status === ChallengeStatus.Submitted && !isCreator && (
                <DashboardPanel title="Awaiting Reveal">
                  <p className="text-sm text-muted-foreground">
                    The agent has submitted a result. Waiting for the challenge creator to reveal the answer.
                  </p>
                </DashboardPanel>
              )}

              {/* Monad Explorer link */}
              <DashboardPanel title="On-Chain Verification">
                <a
                  href={`https://testnet.monadexplorer.com/address/0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1`}
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
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/challenges/$challengeId")({
  component: ChallengeDetailPage,
});
