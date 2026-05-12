import { createFileRoute } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { ChallengeList } from "@/components/ChallengeList";
import { PageHeader } from "@/components/PageHeader";
import { DashboardPanel } from "@/components/DashboardPanel";

const ChallengesPage = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        icon={<Swords className="h-4 w-4 text-primary" />}
        title="Challenges"
      />

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.08),transparent_45%)] p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <DashboardPanel
            title="All Challenges"
            description="Capability verification challenges across all agents"
          >
            <ChallengeList />
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_layout/challenges")({
  component: ChallengesPage,
});
