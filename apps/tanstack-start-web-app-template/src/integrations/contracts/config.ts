/**
 * Contract configuration registry.
 * Swap contract address / ABI here when upgrading or switching trust mechanism.
 * All hooks read from this config — zero hardcoded addresses elsewhere.
 */

import type { Abi, Address } from "viem";
import { agentTrustAbi } from "./agentTrustAbi";

export interface ContractConfig {
  address: Address;
  abi: Abi;
}

// ── Registry ────────────────────────────────────────────────────────────
// Add new contract configs here as you iterate on the trust mechanism.

const AGENT_TRUST_ADDRESS: Address = "0x2f8C100C50aFc778510a0886fB2Ce1075f69B0b1";

export const contracts = {
  agentTrust: {
    address: AGENT_TRUST_ADDRESS,
    abi: agentTrustAbi as unknown as Abi,
  },
} as const satisfies Record<string, ContractConfig>;

export type ContractName = keyof typeof contracts;

export function getContractConfig(name: ContractName): ContractConfig {
  return contracts[name];
}
