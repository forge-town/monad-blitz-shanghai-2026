/**
 * Domain types for Agent Trust System.
 * These are independent of the on-chain ABI and serve as the canonical
 * interface between UI and any trust-mechanism implementation (current
 * commit-reveal contract, future ZK-proof version, etc.).
 */

export type AgentId = `0x${string}`;

export interface AgentProfile {
  agentId: AgentId;
  owner: `0x${string}`;
  name: string;
  capabilities: readonly string[];
  totalChallenges: bigint;
  passedChallenges: bigint;
  failedChallenges: bigint;
  registeredAt: bigint;
}

export enum ChallengeStatus {
  Open = 0,
  Submitted = 1,
  Revealed = 2,
  Expired = 3,
}

export interface Challenge {
  id: bigint;
  creator: `0x${string}`;
  agentId: AgentId;
  capability: string;
  prompt: string;
  answerHash: `0x${string}`;
  submittedHash: `0x${string}`;
  status: ChallengeStatus;
  createdAt: bigint;
  deadline: bigint;
  passed: boolean;
}

export interface RegisterAgentParams {
  name: string;
  capabilities: string[];
}

export interface CreateChallengeParams {
  agentId: AgentId;
  capability: string;
  prompt: string;
  answer: string;
  durationSeconds: bigint;
}

export interface SubmitResultParams {
  challengeId: bigint;
  answer: string;
}

export interface RevealAnswerParams {
  challengeId: bigint;
  answer: string;
}

export interface AgentPassRate {
  rate: number;
  passed: number;
  total: number;
}

export function computePassRate(profile: AgentProfile): AgentPassRate {
  const total = Number(profile.totalChallenges);
  const passed = Number(profile.passedChallenges);
  return {
    rate: total > 0 ? Math.round((passed * 100) / total) : 0,
    passed,
    total,
  };
}
