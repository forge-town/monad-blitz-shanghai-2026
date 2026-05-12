/**
 * Adapter layer: transforms raw on-chain tuple data into domain types.
 * When the contract ABI changes, only this file needs to be updated.
 * UI components never touch raw contract return values.
 */

import type { AgentId, AgentProfile, Challenge, ChallengeStatus } from "./types";

type RawAgentProfile = readonly [
  `0x${string}`,  // owner
  string,         // name
  readonly string[], // capabilities
  bigint,         // totalChallenges
  bigint,         // passedChallenges
  bigint,         // failedChallenges
  bigint,         // registeredAt
];

type RawChallenge = readonly [
  `0x${string}`,  // creator
  `0x${string}`,  // agentId
  string,         // capability
  string,         // prompt
  `0x${string}`,  // answerHash
  `0x${string}`,  // submittedHash
  number,         // status
  bigint,         // createdAt
  bigint,         // deadline
  boolean,        // passed
];

export function toAgentProfile(
  agentId: AgentId,
  raw: RawAgentProfile,
): AgentProfile {
  const [owner, name, capabilities, totalChallenges, passedChallenges, failedChallenges, registeredAt] = raw;
  return {
    agentId,
    owner,
    name,
    capabilities,
    totalChallenges,
    passedChallenges,
    failedChallenges,
    registeredAt,
  };
}

export function toChallenge(
  id: bigint,
  raw: RawChallenge,
): Challenge {
  const [creator, agentId, capability, prompt, answerHash, submittedHash, status, createdAt, deadline, passed] = raw;
  return {
    id,
    creator,
    agentId,
    capability,
    prompt,
    answerHash,
    submittedHash,
    status: status as ChallengeStatus,
    createdAt,
    deadline,
    passed,
  };
}
