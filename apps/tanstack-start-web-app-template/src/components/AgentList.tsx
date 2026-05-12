import { useAgentCount } from "@/integrations/contracts";
import { AgentIdLoader } from "./AgentIdLoader";

const AgentList = () => {
  const { data: count } = useAgentCount();

  const agentCount = count ? Number(count) : 0;

  return (
    <div className="flex flex-col">
      {Array.from({ length: agentCount }, (_, i) => (
        <AgentIdLoader key={i} index={i} />
      ))}
      {agentCount === 0 && (
        <div className="flex items-center justify-center py-8">
          <span className="font-mono text-[10px] text-zinc-400">No agents registered yet</span>
        </div>
      )}
    </div>
  );
};

export { AgentList };
