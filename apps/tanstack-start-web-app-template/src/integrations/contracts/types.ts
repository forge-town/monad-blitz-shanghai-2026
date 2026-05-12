/**
 * Domain types for Agent Trust System v2.
 * Competitive cross-validation with stake-backed delivery.
 */

export interface AgentProfile {
  address: `0x${string}`;
  registered: boolean;
  totalStake: bigint;
  lockedStake: bigint;
  completedTasks: bigint;
  consensusHits: bigint;
  slashCount: bigint;
  registeredAt: bigint;
  name: string;
}

export enum TaskStatus {
  Open = 0,
  Revealing = 1,
  Judging = 2,
  Resolved = 3,
  Expired = 4,
}

export interface Task {
  id: bigint;
  creator: `0x${string}`;
  description: string;
  taskType: string;
  rewardPool: bigint;
  requiredStake: bigint;
  commitDeadline: bigint;
  revealDeadline: bigint;
  maxAgents: number;
  commitCount: number;
  revealCount: number;
  status: TaskStatus;
}

export interface Submission {
  commitHash: `0x${string}`;
  revealedResult: string;
  revealed: boolean;
  inConsensus: boolean;
}

export interface AgentConsensusRate {
  rate: number;
  hits: number;
  total: number;
}

export function computeConsensusRate(profile: AgentProfile): AgentConsensusRate {
  const total = Number(profile.completedTasks);
  const hits = Number(profile.consensusHits);
  return {
    rate: total > 0 ? Math.round((hits * 100) / total) : 0,
    hits,
    total,
  };
}
