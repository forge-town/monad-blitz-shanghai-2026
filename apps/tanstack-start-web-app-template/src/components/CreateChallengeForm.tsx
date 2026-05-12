import { useState } from "react";
import { useCreateChallenge } from "@/integrations/contracts";
import type { AgentId } from "@/integrations/contracts";
import { useAccount } from "wagmi";

export const CreateChallengeForm = ({ agentId }: { agentId: AgentId }) => {
  const { isConnected } = useAccount();
  const { create, isPending, isConfirming, isSuccess, error } = useCreateChallenge();
  const [capability, setCapability] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capability.trim() || !prompt.trim() || !answer.trim()) return;
    create(agentId, capability, prompt, answer, 3600n);
  };

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet to create a challenge</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="challenge-cap" className="text-sm font-medium">
          Capability to test
        </label>
        <input
          id="challenge-cap"
          type="text"
          value={capability}
          onChange={(e) => setCapability(e.target.value)}
          placeholder="e.g. math"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="challenge-prompt" className="text-sm font-medium">
          Challenge prompt
        </label>
        <textarea
          id="challenge-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What is the square root of 144?"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          rows={3}
          required
        />
      </div>
      <div>
        <label htmlFor="challenge-answer" className="text-sm font-medium">
          Expected answer (will be hashed)
        </label>
        <input
          id="challenge-answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="e.g. 12"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Signing..." : isConfirming ? "Confirming..." : "Create Challenge"}
      </button>
      {isSuccess && <p className="text-sm text-green-600">Challenge created!</p>}
      {error && <p className="text-sm text-red-600">Error: {error.message.slice(0, 100)}</p>}
    </form>
  );
};
