import { useAgentCount } from "@/integrations/contracts";
import { AgentIdLoader } from "./AgentIdLoader";

const AgentList = () => {
  const { data: count } = useAgentCount();

  const agentCount = count ? Number(count) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: agentCount }, (_, i) => (
        <AgentIdLoader key={i} index={i} />
      ))}
      {agentCount === 0 && (
        <p className="text-muted-foreground col-span-full py-8 text-center">
          No agents registered yet
        </p>
      )}
    </div>
  );
};

export { AgentList };
