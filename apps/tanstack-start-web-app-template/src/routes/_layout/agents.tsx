import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { AgentList } from "@/components/AgentList";
import { RegisterAgentForm } from "@/components/RegisterAgentForm";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";

const AgentsPage = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<Shield className="h-4 w-4 text-primary" />}
        title="Agent Registry"
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <DashboardPanel
              title="Registered Agents"
              description="On-chain verifiable agent capability profiles"
            >
              <AgentList />
            </DashboardPanel>

            <DashboardPanel
              title="Register Agent"
              description="Add a new AI agent to the trust registry"
            >
              <RegisterAgentForm />
            </DashboardPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/agents")({
  component: AgentsPage,
});
