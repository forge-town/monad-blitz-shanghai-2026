// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AgentTrust - On-chain verifiable Agent capability proof system
/// @notice Enables challenge-based capability verification for AI agents
contract AgentTrust {
    // ── Types ──────────────────────────────────────────────────────────

    struct Agent {
        address owner;
        string name;
        string[] capabilities;
        uint256 totalChallenges;
        uint256 passedChallenges;
        uint256 failedChallenges;
        uint256 registeredAt;
    }

    enum ChallengeStatus {
        Open,
        Submitted,
        Revealed,
        Expired
    }

    struct Challenge {
        address creator;
        bytes32 agentId;
        string capability;
        string prompt;
        bytes32 answerHash;
        bytes32 submittedHash;
        ChallengeStatus status;
        uint256 createdAt;
        uint256 deadline;
        bool passed;
    }

    // ── State ──────────────────────────────────────────────────────────

    mapping(bytes32 => Agent) public agents;
    mapping(uint256 => Challenge) public challenges;
    bytes32[] public agentIds;
    uint256 public challengeCount;

    // ── Events ─────────────────────────────────────────────────────────

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, string name);
    event ChallengeCreated(uint256 indexed challengeId, bytes32 indexed agentId, string capability);
    event ChallengeSubmitted(uint256 indexed challengeId, bytes32 indexed agentId);
    event ChallengeRevealed(uint256 indexed challengeId, bytes32 indexed agentId, bool passed);

    // ── Errors ─────────────────────────────────────────────────────────

    error AgentAlreadyRegistered(bytes32 agentId);
    error AgentNotFound(bytes32 agentId);
    error ChallengeNotFound(uint256 challengeId);
    error NotAgentOwner();
    error NotChallengeCreator();
    error InvalidChallengeStatus(ChallengeStatus expected, ChallengeStatus actual);
    error ChallengeExpired();
    error InvalidAnswer();

    // ── Agent Registration ─────────────────────────────────────────────

    /// @notice Register a new agent with declared capabilities
    /// @param agentId Unique identifier for the agent
    /// @param name Human-readable agent name
    /// @param capabilities Array of capability tags the agent claims
    function registerAgent(bytes32 agentId, string calldata name, string[] calldata capabilities) external {
        if (agents[agentId].owner != address(0)) {
            revert AgentAlreadyRegistered(agentId);
        }

        Agent storage agent = agents[agentId];
        agent.owner = msg.sender;
        agent.name = name;
        agent.capabilities = capabilities;
        agent.registeredAt = block.timestamp;

        agentIds.push(agentId);

        emit AgentRegistered(agentId, msg.sender, name);
    }

    // ── Challenge Lifecycle ────────────────────────────────────────────

    /// @notice Create a capability challenge for a specific agent
    /// @param agentId The agent to challenge
    /// @param capability The capability being tested
    /// @param prompt The challenge question/task
    /// @param answerHash keccak256 of the correct answer (commit-reveal)
    /// @param durationSeconds How long the agent has to respond
    function createChallenge(
        bytes32 agentId,
        string calldata capability,
        string calldata prompt,
        bytes32 answerHash,
        uint256 durationSeconds
    ) external returns (uint256 challengeId) {
        if (agents[agentId].owner == address(0)) {
            revert AgentNotFound(agentId);
        }

        challengeId = challengeCount++;

        Challenge storage c = challenges[challengeId];
        c.creator = msg.sender;
        c.agentId = agentId;
        c.capability = capability;
        c.prompt = prompt;
        c.answerHash = answerHash;
        c.status = ChallengeStatus.Open;
        c.createdAt = block.timestamp;
        c.deadline = block.timestamp + durationSeconds;

        emit ChallengeCreated(challengeId, agentId, capability);
    }

    /// @notice Agent submits its answer hash to a challenge
    /// @param challengeId The challenge to respond to
    /// @param resultHash keccak256 of the agent's answer
    function submitResult(uint256 challengeId, bytes32 resultHash) external {
        Challenge storage c = challenges[challengeId];

        if (c.creator == address(0)) {
            revert ChallengeNotFound(challengeId);
        }
        if (agents[c.agentId].owner != msg.sender) {
            revert NotAgentOwner();
        }
        if (c.status != ChallengeStatus.Open) {
            revert InvalidChallengeStatus(ChallengeStatus.Open, c.status);
        }
        if (block.timestamp > c.deadline) {
            revert ChallengeExpired();
        }

        c.submittedHash = resultHash;
        c.status = ChallengeStatus.Submitted;

        emit ChallengeSubmitted(challengeId, c.agentId);
    }

    /// @notice Challenge creator reveals the answer, contract auto-judges
    /// @param challengeId The challenge to reveal
    /// @param answer The plaintext correct answer
    function revealAnswer(uint256 challengeId, string calldata answer) external {
        Challenge storage c = challenges[challengeId];

        if (c.creator == address(0)) {
            revert ChallengeNotFound(challengeId);
        }
        if (c.creator != msg.sender) {
            revert NotChallengeCreator();
        }
        if (c.status != ChallengeStatus.Submitted) {
            revert InvalidChallengeStatus(ChallengeStatus.Submitted, c.status);
        }

        bytes32 computedHash = keccak256(abi.encodePacked(answer));
        if (computedHash != c.answerHash) {
            revert InvalidAnswer();
        }

        bool passed = c.submittedHash == c.answerHash;
        c.passed = passed;
        c.status = ChallengeStatus.Revealed;

        Agent storage agent = agents[c.agentId];
        agent.totalChallenges++;
        if (passed) {
            agent.passedChallenges++;
        } else {
            agent.failedChallenges++;
        }

        emit ChallengeRevealed(challengeId, c.agentId, passed);
    }

    // ── View Functions ─────────────────────────────────────────────────

    /// @notice Get agent capability profile
    function getAgentProfile(bytes32 agentId)
        external
        view
        returns (
            address owner,
            string memory name,
            string[] memory capabilities,
            uint256 totalChallenges,
            uint256 passedChallenges,
            uint256 failedChallenges,
            uint256 registeredAt
        )
    {
        Agent storage a = agents[agentId];
        if (a.owner == address(0)) {
            revert AgentNotFound(agentId);
        }
        return (a.owner, a.name, a.capabilities, a.totalChallenges, a.passedChallenges, a.failedChallenges, a.registeredAt);
    }

    /// @notice Get total registered agent count
    function getAgentCount() external view returns (uint256) {
        return agentIds.length;
    }

    /// @notice Get agent ID by index
    function getAgentIdByIndex(uint256 index) external view returns (bytes32) {
        return agentIds[index];
    }
}
