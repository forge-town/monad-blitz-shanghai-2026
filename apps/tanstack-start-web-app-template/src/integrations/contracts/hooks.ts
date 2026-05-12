/**
 * Contract hooks — all read from `contracts.agentTrust` config.
 * When the contract address or ABI changes, only config.ts needs updating.
 * Raw on-chain data is transformed through adapter before reaching consumers.
 */

import { useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { contracts } from "./config";
import { agentTrustAbi } from "./agentTrustAbi";
import { toAgentProfile, toChallenge } from "./adapter";
import type { AgentId, AgentProfile, Challenge } from "./types";

const { address } = contracts.agentTrust;

// ── Read Hooks ──────────────────────────────────────────────────────────

export const useAgentProfile = (agentId: AgentId) => {
  const result = useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getAgentProfile",
    args: [agentId],
    query: { enabled: agentId !== "0x" },
  });

  const profile: AgentProfile | undefined = useMemo(
    () => (result.data ? toAgentProfile(agentId, result.data) : undefined),
    [result.data, agentId],
  );

  return { ...result, data: profile };
};

export const useAgentCount = () => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getAgentCount",
  });
};

export const useChallengeCount = () => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "challengeCount",
  });
};

export const useChallenge = (challengeId: bigint) => {
  const result = useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "challenges",
    args: [challengeId],
  });

  const challenge: Challenge | undefined = useMemo(
    () => (result.data ? toChallenge(challengeId, result.data) : undefined),
    [result.data, challengeId],
  );

  return { ...result, data: challenge };
};

export const useAgentIdByIndex = (index: number) => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getAgentIdByIndex",
    args: [BigInt(index)],
  });
};

// ── Write Hooks ─────────────────────────────────────────────────────────

export const useRegisterAgent = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (name: string, capabilities: string[]) => {
    const agentId = keccak256(encodePacked(["string"], [name]));
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "registerAgent",
      args: [agentId, name, capabilities],
    });
    return agentId;
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
};

export const useCreateChallenge = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (
    agentId: AgentId,
    capability: string,
    prompt: string,
    answer: string,
    durationSeconds: bigint,
  ) => {
    const answerHash = keccak256(encodePacked(["string"], [answer]));
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "createChallenge",
      args: [agentId, capability, prompt, answerHash, durationSeconds],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
};

export const useSubmitResult = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submit = (challengeId: bigint, answer: string) => {
    const resultHash = keccak256(encodePacked(["string"], [answer]));
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "submitResult",
      args: [challengeId, resultHash],
    });
  };

  return { submit, hash, isPending, isConfirming, isSuccess, error };
};

export const useRevealAnswer = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const reveal = (challengeId: bigint, answer: string) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "revealAnswer",
      args: [challengeId, answer],
    });
  };

  return { reveal, hash, isPending, isConfirming, isSuccess, error };
};
