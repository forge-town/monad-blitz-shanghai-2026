import { useState } from "react";
import { useRegisterAgent } from "@/integrations/contracts";
import { useAccount } from "wagmi";

export const RegisterAgentForm = () => {
  const { isConnected } = useAccount();
  const { register, isPending, isConfirming, isSuccess, error } = useRegisterAgent();
  const [name, setName] = useState("");
  const [capInput, setCapInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const capabilities = capInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    register(name, capabilities);
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground">Connect your wallet to register an agent</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Register New Agent</h3>
      <div>
        <label htmlFor="agent-name" className="text-sm font-medium">
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Claude Math Agent"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="agent-caps" className="text-sm font-medium">
          Capabilities (comma separated)
        </label>
        <input
          id="agent-caps"
          type="text"
          value={capInput}
          onChange={(e) => setCapInput(e.target.value)}
          placeholder="e.g. math, coding, reasoning"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming || !name.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Signing..." : isConfirming ? "Confirming..." : "Register Agent"}
      </button>
      {isSuccess && <p className="text-sm text-green-600">Agent registered successfully!</p>}
      {error && <p className="text-sm text-red-600">Error: {error.message.slice(0, 100)}</p>}
    </form>
  );
};
