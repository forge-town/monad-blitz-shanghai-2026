import { useChallenge } from "@/integrations/contracts";
import { ChallengeStatus } from "@/integrations/contracts";
import { Link } from "@tanstack/react-router";

const STATUS_LABELS: Record<ChallengeStatus, { label: string; color: string }> = {
  [ChallengeStatus.Open]: { label: "Open", color: "text-blue-600 bg-blue-50" },
  [ChallengeStatus.Submitted]: { label: "Submitted", color: "text-amber-600 bg-amber-50" },
  [ChallengeStatus.Revealed]: { label: "Revealed", color: "text-green-600 bg-green-50" },
  [ChallengeStatus.Expired]: { label: "Expired", color: "text-muted-foreground bg-muted" },
};

export const ChallengeCard = ({ challengeId }: { challengeId: bigint }) => {
  const { data: challenge } = useChallenge(challengeId);

  if (!challenge) return null;

  const statusInfo = STATUS_LABELS[challenge.status] ?? STATUS_LABELS[ChallengeStatus.Open];

  return (
    <Link
      to="/challenges/$challengeId"
      params={{ challengeId: challengeId.toString() }}
      className="block rounded-2xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{challenge.prompt}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            #{challengeId.toString()} · {challenge.capability}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
      {challenge.status === ChallengeStatus.Revealed && (
        <div className="mt-2">
          <span
            className={`text-xs font-semibold ${challenge.passed ? "text-green-600" : "text-red-600"}`}
          >
            {challenge.passed ? "✓ Passed" : "✗ Failed"}
          </span>
        </div>
      )}
    </Link>
  );
};
