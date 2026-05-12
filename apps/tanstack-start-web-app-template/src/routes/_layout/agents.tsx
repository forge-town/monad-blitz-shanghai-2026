import { createFileRoute } from "@tanstack/react-router";
import { ConnectWallet } from "@/components/ConnectWallet";
import { AgentList } from "@/components/AgentList";
import { RegisterAgentForm } from "@/components/RegisterAgentForm";

const AgentsPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Trust Registry</h1>
          <p className="text-muted-foreground mt-1">On-chain verifiable agent capability profiles</p>
        </div>
        <ConnectWallet />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Registered Agents</h2>
          <AgentList />
        </div>
        <div>
          <RegisterAgentForm />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/agents")({
  component: AgentsPage,
});
