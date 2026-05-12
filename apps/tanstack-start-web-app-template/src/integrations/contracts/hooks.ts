/**
 * Contract hooks for AgentTrust v2 — Cross-Validation with Staking.
 */

import { useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { contracts } from "./config";
import { agentTrustAbi } from "./agentTrustAbi";
import { toAgentProfile, toTask, toSubmission } from "./adapter";
import type { AgentProfile, Task, Submission } from "./types";

const { address } = contracts.agentTrust;

// ── Read Hooks ──────────────────────────────────────────────────────────

export const useAgentProfile = (agentAddress: `0x${string}`) => {
  const result = useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getAgentProfile",
    args: [agentAddress],
    query: { enabled: !!agentAddress && agentAddress !== "0x" },
  });

  const profile: AgentProfile | undefined = useMemo(
    () => (result.data ? toAgentProfile(agentAddress, result.data) : undefined),
    [result.data, agentAddress],
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

export const useTaskCount = () => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "taskCount",
  });
};

export const useTask = (taskId: bigint) => {
  const result = useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getTask",
    args: [taskId],
  });

  const task: Task | undefined = useMemo(
    () => (result.data ? toTask(taskId, result.data) : undefined),
    [result.data, taskId],
  );

  return { ...result, data: task };
};

export const useTaskAgents = (taskId: bigint) => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getTaskAgents",
    args: [taskId],
  });
};

export const useSubmission = (taskId: bigint, agentAddress: `0x${string}`) => {
  const result = useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getSubmission",
    args: [taskId, agentAddress],
    query: { enabled: !!agentAddress },
  });

  const submission: Submission | undefined = useMemo(
    () => (result.data ? toSubmission(result.data) : undefined),
    [result.data],
  );

  return { ...result, data: submission };
};

export const useAgentByIndex = (index: number) => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "getAgentByIndex",
    args: [BigInt(index)],
  });
};

export const useIsJudge = (addr: `0x${string}`) => {
  return useReadContract({
    address,
    abi: agentTrustAbi,
    functionName: "isJudge",
    args: [addr],
    query: { enabled: !!addr },
  });
};

// ── Write Hooks ─────────────────────────────────────────────────────────

export const useRegisterAgent = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (name: string, stakeValue: bigint = 0n) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "registerAgent",
      args: [name],
      value: stakeValue,
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
};

export const useDepositStake = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amount: bigint) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "depositStake",
      value: amount,
    });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
};

export const useCreateTask = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (
    description: string,
    taskType: string,
    requiredStake: bigint,
    commitDeadline: bigint,
    revealDeadline: bigint,
    maxAgents: number,
    rewardValue: bigint,
  ) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "createTask",
      args: [description, taskType, requiredStake, commitDeadline, revealDeadline, maxAgents],
      value: rewardValue,
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
};

export const useCommitResult = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const commit = (taskId: bigint, agentAddress: `0x${string}`, result: string) => {
    const commitHash = keccak256(encodePacked(["address", "uint256", "string"], [agentAddress, taskId, result]));
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "commitResult",
      args: [taskId, commitHash],
    });
    return commitHash;
  };

  return { commit, hash, isPending, isConfirming, isSuccess, error };
};

export const useStartRevealPhase = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const startReveal = (taskId: bigint) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "startRevealPhase",
      args: [taskId],
    });
  };

  return { startReveal, hash, isPending, isConfirming, isSuccess, error };
};

export const useRevealResult = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const reveal = (taskId: bigint, result: string) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "revealResult",
      args: [taskId, result],
    });
  };

  return { reveal, hash, isPending, isConfirming, isSuccess, error };
};

export const useStartJudgingPhase = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const startJudging = (taskId: bigint) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "startJudgingPhase",
      args: [taskId],
    });
  };

  return { startJudging, hash, isPending, isConfirming, isSuccess, error };
};

export const useSubmitJudgment = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const judge = (taskId: bigint, consensusAgents: `0x${string}`[]) => {
    writeContract({
      address,
      abi: agentTrustAbi,
      functionName: "submitJudgment",
      args: [taskId, consensusAgents],
    });
  };

  return { judge, hash, isPending, isConfirming, isSuccess, error };
};
