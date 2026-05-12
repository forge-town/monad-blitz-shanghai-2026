import { useAgentIdByIndex } from "@/integrations/contracts";
import { AgentCard } from "./AgentCard";

export const AgentIdLoader = ({ index }: { index: number }) => {
  const { data: agentId } = useAgentIdByIndex(index);

  if (!agentId) return null;
  return <AgentCard agentId={agentId} />;
};
