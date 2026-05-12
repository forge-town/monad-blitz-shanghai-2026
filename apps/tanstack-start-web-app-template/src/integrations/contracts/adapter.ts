/**
 * Adapter layer: transforms raw on-chain tuple data into domain types.
 * When the contract ABI changes, only this file needs to be updated.
 */

import type { AgentProfile, Task, TaskStatus, Submission } from "./types";

type RawAgentProfile = readonly [
  boolean,        // registered
  bigint,         // totalStake
  bigint,         // lockedStake
  bigint,         // completedTasks
  bigint,         // consensusHits
  bigint,         // slashCount
  bigint,         // registeredAt
  string,         // name
];

type RawTask = readonly [
  `0x${string}`,  // creator
  string,         // description
  string,         // taskType
  bigint,         // rewardPool
  bigint,         // requiredStake
  bigint,         // commitDeadline
  bigint,         // revealDeadline
  number,         // maxAgents
  number,         // commitCount
  number,         // revealCount
  number,         // status
];

type RawSubmission = readonly [
  `0x${string}`,  // commitHash
  string,         // revealedResult
  boolean,        // revealed
  boolean,        // inConsensus
];

export function toAgentProfile(
  address: `0x${string}`,
  raw: RawAgentProfile,
): AgentProfile {
  const [registered, totalStake, lockedStake, completedTasks, consensusHits, slashCount, registeredAt, name] = raw;
  return { address, registered, totalStake, lockedStake, completedTasks, consensusHits, slashCount, registeredAt, name };
}

export function toTask(
  id: bigint,
  raw: RawTask,
): Task {
  const [creator, description, taskType, rewardPool, requiredStake, commitDeadline, revealDeadline, maxAgents, commitCount, revealCount, status] = raw;
  return {
    id, creator, description, taskType, rewardPool, requiredStake,
    commitDeadline, revealDeadline, maxAgents, commitCount, revealCount,
    status: status as TaskStatus,
  };
}

export function toSubmission(raw: RawSubmission): Submission {
  const [commitHash, revealedResult, revealed, inConsensus] = raw;
  return { commitHash, revealedResult, revealed, inConsensus };
}
