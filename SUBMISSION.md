# Prove It — On-Chain Verifiable Capability Proofs for AI Agents

## 🏷️ Project Name
**Prove It**

## 📍 Hackathon
Monad Blitz Shanghai 2026

## 🧠 One-Liner
A decentralized protocol on Monad that validates AI agent outputs through competitive cross-validation with stake-backed commit-reveal and economic incentives.

## 🎯 Problem Statement
As AI agents become increasingly autonomous and participate in real-world tasks, there is no trustless way to verify their output quality. Users cannot distinguish between a high-quality agent and a low-quality one without centralized reputation systems. This creates a trust deficit that limits AI agent adoption in high-stakes scenarios.

## 💡 Solution
**Prove It** introduces an on-chain mechanism where:
1. Multiple AI agents independently solve the same task
2. Results are committed via cryptographic hashes (commit phase)
3. Results are revealed after the deadline (reveal phase)
4. A judge determines which agents reached consensus
5. Consensus agents earn rewards; outliers get their stake slashed

This creates a **provable, trustless reputation layer** for AI agents — all powered by Monad's parallel EVM for high-throughput concurrent transaction processing.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Arena)                       │
│        TanStack Start + wagmi + viem + tRPC              │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
      Contract Calls            AI Agent API
                │                     │
┌───────────────▼─────────┐  ┌────────▼──────────────────┐
│   AgentTrust.sol        │  │  tRPC Agent Router         │
│   (Monad Testnet)       │  │  (Multi-agent parallel     │
│                         │  │   solve + judge)           │
│  • Register + Stake     │  │                            │
│  • Commit-Reveal        │  │  Claude-3.5 (temp=0.3)    │
│  • Judge Consensus      │  │  Claude-Creative (t=0.9)  │
│  • Reward / Slash       │  │  Claude-Precise (t=0.0)   │
└─────────────────────────┘  └────────────────────────────┘
```

## 🔗 Smart Contract

| Item | Value |
|------|-------|
| **Contract** | `AgentTrust.sol` |
| **Address** | `0xBC83F1840Ad22014a8f6A081103e1813100604Aa` |
| **Chain** | Monad Testnet (Chain ID: 10143) |
| **Block** | 31282363 |
| **Explorer** | https://testnet.monadexplorer.com/address/0xBC83F1840Ad22014a8f6A081103e1813100604Aa |

### Contract Features
- **Agent Registration** — Agents register with a name and stake MON tokens
- **Task Creation** — Anyone can create a task with a reward pool and deadlines
- **Commit-Reveal** — Two-phase scheme prevents agents from copying each other
- **Judging** — Designated judges determine consensus group
- **Economic Incentives** — Consensus agents earn rewards; outliers lose 50% of locked stake
- **View Functions** — Full transparency into agent profiles, task status, and submissions

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.28, Foundry, via-IR optimization |
| Frontend | TanStack Start v1.167, React, Vite v7.3 |
| Web3 | wagmi v3.6, viem v2.48, Monad Testnet RPC |
| Backend API | tRPC v11.17, Anthropic Claude API |
| Styling | Tailwind CSS, monospace design system |
| Monorepo | Turborepo, Bun |

## 🎮 Demo Flow (6-Step Pipeline)

1. **Register** — Connect wallet, agents register on-chain with stake
2. **Create Task** — Post a translation task with reward pool
3. **Solve** — 3 AI agents independently produce translations via tRPC
4. **Commit** — Each agent's result is hashed and committed on-chain
5. **Reveal** — After deadline, results are revealed and verified against commits
6. **Judge** — AI judge analyzes outputs, determines consensus, rewards/slashes

## 🧪 Testing

- **Smart Contract**: 7/7 Foundry tests passing (registration, staking, full flow, edge cases)
- **Backend API**: tRPC endpoints verified via curl (solveParallel, judge)
- **TypeScript**: Zero compilation errors

## 🌟 Why Monad?

- **Parallel EVM** — Multiple agents submitting commits/reveals concurrently benefits from Monad's parallel transaction execution
- **Low Fees** — Affordable on-chain operations make micro-staking economically viable
- **High Throughput** — Fast block times enable tight commit/reveal deadlines for real-time validation

## 👥 Team
Solo builder

## 📂 Repository Structure

```
monad-blitz-shanghai-2026/
├── packages/contracts/          # Solidity smart contract (Foundry)
│   ├── src/AgentTrust.sol       # Main contract
│   ├── test/AgentTrust.t.sol    # Foundry tests (7 passing)
│   └── script/Deploy.s.sol     # Deployment script
├── apps/tanstack-start-web-app-template/
│   ├── src/routes/main.tsx      # Landing page (ASCII art hero)
│   ├── src/routes/arena.tsx     # Main DApp page (6-step pipeline)
│   ├── src/integrations/
│   │   ├── trpc/routers/agent.ts   # AI agent tRPC router
│   │   └── contracts/              # wagmi hooks for contract interaction
│   └── src/components/             # Shared UI components
└── packages/                    # Shared packages (UI, configs, schemas)
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run contract tests
cd packages/contracts
forge test -vv

# Deploy to Monad Testnet
forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast --private-key $PRIVATE_KEY

# Start frontend
cd apps/tanstack-start-web-app-template
bun run dev
```

## 📜 License
MIT
