import { ConnectWallet } from "@/components/ConnectWallet";
import { useAgentCount, useChallengeCount } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";

export const DashboardPage = () => {
  const { data: agentCount } = useAgentCount();
  const { data: challengeCount } = useChallengeCount();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Trust System</h1>
          <p className="text-muted-foreground mt-1">
            On-chain verifiable AI agent capability proofs on Monad
          </p>
        </div>
        <ConnectWallet />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <div className="text-3xl font-bold">{agentCount?.toString() ?? "—"}</div>
          <div className="text-muted-foreground mt-1 text-sm">Registered Agents</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-3xl font-bold">{challengeCount?.toString() ?? "—"}</div>
          <div className="text-muted-foreground mt-1 text-sm">Total Challenges</div>
        </div>
        <div className="rounded-lg border p-6">
          <Link
            to="/agents"
            className="text-primary text-lg font-semibold underline-offset-4 hover:underline"
          >
            View Agent Registry →
          </Link>
          <div className="text-muted-foreground mt-1 text-sm">
            Register agents, issue challenges, verify capabilities
          </div>
        </div>
      </div>
    </div>
  );
};
