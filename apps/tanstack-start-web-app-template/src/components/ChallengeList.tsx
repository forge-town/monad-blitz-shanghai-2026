import { useTaskCount } from "@/integrations/contracts";
import { ChallengeCard } from "./ChallengeCard";

export const ChallengeList = () => {
  const { data: count } = useTaskCount();

  const taskCount = count ? Number(count) : 0;

  return (
    <div className="grid gap-3">
      {Array.from({ length: taskCount }, (_, i) => (
        <ChallengeCard key={i} challengeId={BigInt(i)} />
      ))}
      {taskCount === 0 && (
        <p className="text-muted-foreground col-span-full py-8 text-center">
          No tasks created yet
        </p>
      )}
    </div>
  );
};
