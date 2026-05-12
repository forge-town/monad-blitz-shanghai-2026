import { useChallengeCount } from "@/integrations/contracts";
import { ChallengeCard } from "./ChallengeCard";

export const ChallengeList = () => {
  const { data: count } = useChallengeCount();

  const challengeCount = count ? Number(count) : 0;

  return (
    <div className="grid gap-3">
      {Array.from({ length: challengeCount }, (_, i) => (
        <ChallengeCard key={i} challengeId={BigInt(i)} />
      ))}
      {challengeCount === 0 && (
        <p className="text-muted-foreground col-span-full py-8 text-center">
          No challenges issued yet
        </p>
      )}
    </div>
  );
};
