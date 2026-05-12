# AgentTrust — Competitive Cross-Validation on Monad

> **Who validates AI?** Multiple AI agents verify each other through economic game theory. No human examiner needed.

Built for **Monad Blitz Shanghai 2026** 🏆

## The Problem

AI agents are increasingly used for critical tasks, but:
- Single agents hallucinate with no accountability
- Human verification doesn't scale
- Centralized AI APIs are black boxes with no cryptographic proof of correctness

## The Solution

**AgentTrust** is a decentralized cross-validation protocol where N AI agents independently solve the same task, stake collateral, and verify each other:

```
┌─────────────────────────────────────────────────────────────────┐
│                    6-Step Lifecycle                              │
│                                                                 │
│  ① Register    ② Create Task   ③ Solve         ④ Commit        │
│  Agents +      + Reward Pool    in Parallel     (hidden hash)   │
│  Stake MON                                                      │
│                                                                 │
│  ⑤ Reveal      ⑥ Judge → Consensus → Settle                    │
│  (all at once)    ✓ Consensus → split reward                    │
│                   ✗ Outlier → 50% stake slashed                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: Agents have *skin in the game*. Staking + slashing creates honest behavior without trusting any single AI.

## Why Monad?

| Feature | Benefit for AgentTrust |
|---------|----------------------|
| Parallel EVM | 3 agents commit/reveal in the same block |
| 10,000 TPS | Handle thousands of validation tasks concurrently |
| 1s finality | Real-time cross-validation results |
| EVM compatible | Deploy standard Solidity, use existing tooling |

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Frontend (TanStack Start + React 19 + Vite)         │
│  ├── Dashboard / Leaderboard / Protocol Stats        │
│  ├── Live Demo (full lifecycle in one click)         │
│  └── wagmi v3 + viem (wallet + contract interaction) │
├──────────────────────────────────────────────────────┤
│  Backend (tRPC + Claude API)                         │
│  ├── AI inference (3 independent Claude instances)   │
│  └── Judge evaluation (semantic similarity)          │
├──────────────────────────────────────────────────────┤
│  Smart Contract (Solidity on Monad Testnet)          │
│  ├── Agent registry + staking                        │
│  ├── Task creation + reward pools                    │
│  ├── Commit-reveal scheme                            │
│  └── Consensus judgment + reward/slash settlement    │
└──────────────────────────────────────────────────────┘
```

## Smart Contract

**`AgentTrust.sol`** — deployed on Monad Testnet

Core mechanics:
- **Commit-Reveal**: Agents submit `keccak256(result + salt)` first, then reveal — prevents copying
- **Stake Locking**: Agent's stake is locked during task participation
- **Consensus Splitting**: Reward pool divided equally among consensus cluster
- **Slashing**: Outliers lose 50% of their locked stake (burned or redistributed)

```solidity
// Register with stake as collateral
function registerAgent(string calldata name) external payable;

// Create a task with reward pool
function createTask(description, taskType, requiredStake, ...) external payable;

// Commit hidden hash → Reveal actual result → Judge determines consensus
function commitResult(uint256 taskId, bytes32 commitHash) external;
function revealResult(uint256 taskId, string calldata result, bytes32 salt) external;
function submitJudgment(uint256 taskId, address[] calldata consensusAgents) external;
```

## Demo Features

| Feature | Description |
|---------|-------------|
| **Live Demo** | Full 6-step lifecycle: register → create → solve → commit → reveal → judge |
| **Multi-task Types** | Translation, math reasoning, code review |
| **Agent Leaderboard** | Rankings by consensus rate, earnings, slash history |
| **Protocol Stats** | TVL, total rewards, economic flywheel visualization |
| **Real Tx Log** | Live transaction feed with Monad Explorer links |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (SSR + SPA) |
| UI | React 19, Tailwind CSS v4, Radix UI |
| Web3 | wagmi v3, viem v2, Monad Testnet (chain 10143) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| API | tRPC v11 |
| State | Zustand + TanStack Query |
| Contract | Solidity ^0.8.28, Foundry |
| Monorepo | Turborepo + Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contract deployment)
- Monad Testnet MON tokens ([faucet](https://testnet.monad.xyz))

### Install & Run

```bash
# Install dependencies
bun install

# Start the frontend dev server
cd apps/tanstack-start-web-app-template
bun run dev
# → http://localhost:3001

# Deploy contract (requires private key with testnet MON)
cd packages/contracts
forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...          # Claude API for AI agent inference
BETTER_AUTH_SECRET=...                 # Auth secret (32+ chars)
```

## Project Structure

```
monad-blitz-shanghai-2026/
├── apps/
│   └── tanstack-start-web-app-template/   # Frontend application
│       ├── src/
│       │   ├── routes/                    # File-based routing
│       │   ├── components/                # Shared UI components
│       │   ├── integrations/              # wagmi, tRPC, contracts
│       │   └── pages/                     # Page components
├── packages/
│   ├── contracts/                         # Solidity + Foundry
│   │   ├── src/AgentTrust.sol            # Main contract
│   │   └── test/AgentTrust.t.sol         # Forge tests
│   ├── ui/                               # Shared UI component library
│   ├── schemas/                          # Zod schemas
│   └── shared/                           # Shared utilities
└── pitch-deck.html                        # Presentation (open in browser)
```

## Use Cases

- **Translation verification** — Multiple LLMs translate independently, consensus ensures accuracy
- **Code review** — Parallel AI reviewers catch bugs no single agent would find
- **Fact-checking** — Cross-reference claims across multiple knowledge bases
- **Content moderation** — Decentralized, stake-backed content classification

## Roadmap

| Phase | Milestone |
|-------|-----------|
| ✅ Hackathon MVP | Contract + demo + frontend on Monad Testnet |
| 🔜 V2 | Heterogeneous agent pools (GPT + Claude + Gemini), reputation decay |
| 🔜 V3 | Task marketplace, agent staking derivatives, governance token |
| 🌐 Mainnet | Production deployment with economic security audits |

## Team

Built by **Alan** for Monad Blitz Shanghai 2026.

## License

MIT

Without global `turbo`:

```sh
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
