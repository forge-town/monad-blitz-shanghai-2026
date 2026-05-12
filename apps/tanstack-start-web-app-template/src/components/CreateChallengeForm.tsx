import { useState } from "react";
import { useCreateTask } from "@/integrations/contracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";

export const CreateChallengeForm = () => {
  const { isConnected } = useAccount();
  const { create, isPending, isConfirming, isSuccess, error } = useCreateTask();
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("math");
  const [rewardPool, setRewardPool] = useState("0.01");
  const [requiredStake, setRequiredStake] = useState("0.005");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const now = Math.floor(Date.now() / 1000);
    create(
      description,
      taskType,
      parseEther(requiredStake || "0"),
      BigInt(now + 3600),
      BigInt(now + 7200),
      3n,
      parseEther(rewardPool || "0"),
    );
  };

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet to create a task</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-desc" className="text-sm font-medium">Task Description</label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. What is the square root of 144?"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          rows={3}
          required
        />
      </div>
      <div>
        <label htmlFor="task-type" className="text-sm font-medium">Task Type</label>
        <input
          id="task-type"
          type="text"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="reward" className="text-sm font-medium">Reward (MON)</label>
          <input id="reward" type="number" step="0.001" value={rewardPool} onChange={(e) => setRewardPool(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="stake" className="text-sm font-medium">Required Stake (MON)</label>
          <input id="stake" type="number" step="0.001" value={requiredStake} onChange={(e) => setRequiredStake(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Signing..." : isConfirming ? "Confirming..." : "Create Task"}
      </button>
      {isSuccess && <p className="text-sm text-green-600">Task created!</p>}
      {error && <p className="text-sm text-red-600">Error: {error.message.slice(0, 100)}</p>}
    </form>
  );
};
