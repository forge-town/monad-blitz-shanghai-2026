export const agentTrustAbi = [
  // ── Constructor ──────────────────────────────────────────────────
  {
    type: "constructor",
    inputs: [{ name: "_judges", type: "address[]" }],
    stateMutability: "nonpayable",
  },
  // ── Agent Registration & Staking ─────────────────────────────────
  {
    type: "function",
    name: "registerAgent",
    inputs: [{ name: "name", type: "string" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "depositStake",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "withdrawStake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Task Creation ────────────────────────────────────────────────
  {
    type: "function",
    name: "createTask",
    inputs: [
      { name: "description", type: "string" },
      { name: "taskType", type: "string" },
      { name: "requiredStake", type: "uint256" },
      { name: "commitDeadline", type: "uint64" },
      { name: "revealDeadline", type: "uint64" },
      { name: "maxAgents", type: "uint8" },
    ],
    outputs: [{ name: "taskId", type: "uint256" }],
    stateMutability: "payable",
  },
  // ── Commit / Reveal / Judge ──────────────────────────────────────
  {
    type: "function",
    name: "commitResult",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "hash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startRevealPhase",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revealResult",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "result", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startJudgingPhase",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitJudgment",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "consensusAgents", type: "address[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "expireTask",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Admin ────────────────────────────────────────────────────────
  {
    type: "function",
    name: "addJudge",
    inputs: [{ name: "judge", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeJudge",
    inputs: [{ name: "judge", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── View Functions ───────────────────────────────────────────────
  {
    type: "function",
    name: "getAgentProfile",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [
      { name: "registered", type: "bool" },
      { name: "totalStake", type: "uint256" },
      { name: "lockedStake", type: "uint256" },
      { name: "completedTasks", type: "uint256" },
      { name: "consensusHits", type: "uint256" },
      { name: "slashCount", type: "uint256" },
      { name: "registeredAt", type: "uint256" },
      { name: "name", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentByIndex",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTask",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "description", type: "string" },
      { name: "taskType", type: "string" },
      { name: "rewardPool", type: "uint256" },
      { name: "requiredStake", type: "uint256" },
      { name: "commitDeadline", type: "uint64" },
      { name: "revealDeadline", type: "uint64" },
      { name: "maxAgents", type: "uint8" },
      { name: "commitCount", type: "uint8" },
      { name: "revealCount", type: "uint8" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTaskAgents",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSubmission",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "agent", type: "address" },
    ],
    outputs: [
      { name: "commitHash", type: "bytes32" },
      { name: "revealedResult", type: "string" },
      { name: "revealed", type: "bool" },
      { name: "inConsensus", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "taskCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isJudge",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  // ── Events ───────────────────────────────────────────────────────
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "stake", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StakeDeposited",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StakeWithdrawn",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "rewardPool", type: "uint256", indexed: false },
      { name: "maxAgents", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ResultCommitted",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "agent", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ResultRevealed",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "agent", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TaskJudged",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "consensusCount", type: "uint8", indexed: false },
      { name: "outlierCount", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardClaimed",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentSlashed",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
