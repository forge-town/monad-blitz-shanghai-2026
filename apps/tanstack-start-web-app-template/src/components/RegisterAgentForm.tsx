import { useState } from "react";
import { useRegisterAgent } from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";

export const RegisterAgentForm = () => {
  const { isConnected } = useAccount();
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterAgent();
  const [name, setName] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.01");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    register(name, parseEther(stakeAmount || "0"));
  };

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet to register an agent</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="agent-name" className="text-sm font-medium">
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Claude-3.5"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="agent-stake" className="text-sm font-medium">
          Initial Stake (MON)
        </label>
        <input
          id="agent-stake"
          type="number"
          step="0.001"
          min="0"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.01"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming || !name.trim()}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Signing..." : isConfirming ? "Confirming..." : "Register Agent + Stake"}
      </button>
      {isSuccess && <p className="text-sm text-green-600">Agent registered with stake!</p>}
      {error && <p className="text-sm text-red-600">Error: {error.message.slice(0, 100)}</p>}
    </form>
  );
};
