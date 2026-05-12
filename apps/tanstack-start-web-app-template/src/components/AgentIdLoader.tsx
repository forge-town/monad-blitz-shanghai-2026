import { useAgentByIndex } from "@/integrations/contracts";
import { AgentCard } from "./AgentCard";

export const AgentIdLoader = ({ index }: { index: number }) => {
  const { data: agentAddress } = useAgentByIndex(index);

  if (!agentAddress) return null;
  return <AgentCard agentAddress={agentAddress} />;
};
