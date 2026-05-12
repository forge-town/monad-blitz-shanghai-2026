// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AgentTrust - Competitive Cross-Validation with Stake-Backed Delivery
/// @notice Multiple agents independently complete the same task, commit-reveal results,
///         a judge determines consensus cluster, and rewards/slashes accordingly.
///         Designed for Monad's parallel EVM to showcase concurrent tx processing.
contract AgentTrust {
    // ── Types ──────────────────────────────────────────────────────────

    struct AgentProfile {
        bool registered;
        uint256 totalStake;
        uint256 lockedStake;
        uint256 completedTasks;
        uint256 consensusHits;
        uint256 slashCount;
        uint256 registeredAt;
        string name;
    }

    enum TaskStatus {
        Open,           // accepting agent commits
        Revealing,      // commit deadline passed, agents reveal
        Judging,        // reveal deadline passed, judge evaluates
        Resolved,       // judge submitted verdict, rewards distributed
        Expired         // no submissions or timed out
    }

    struct Task {
        address creator;
        string description;
        string taskType;        // "translation", "code", "analysis"
        uint256 rewardPool;
        uint256 requiredStake;
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint8 maxAgents;
        uint8 commitCount;
        uint8 revealCount;
        TaskStatus status;
    }

    struct Submission {
        bytes32 commitHash;
        string revealedResult;
        bool revealed;
        bool inConsensus;
    }

    // ── State ──────────────────────────────────────────────────────────

    mapping(address => AgentProfile) public agents;
    address[] public agentList;

    mapping(uint256 => Task) public tasks;
    uint256 public taskCount;

    // taskId => agent address => submission
    mapping(uint256 => mapping(address => Submission)) public submissions;
    // taskId => list of participating agents
    mapping(uint256 => address[]) public taskAgents;

    // Fixed verifier/judge set for MVP
    mapping(address => bool) public isJudge;
    address public owner;

    // ── Events ─────────────────────────────────────────────────────────

    event AgentRegistered(address indexed agent, string name, uint256 stake);
    event StakeDeposited(address indexed agent, uint256 amount);
    event StakeWithdrawn(address indexed agent, uint256 amount);
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 rewardPool, uint8 maxAgents);
    event ResultCommitted(uint256 indexed taskId, address indexed agent);
    event ResultRevealed(uint256 indexed taskId, address indexed agent);
    event TaskJudged(uint256 indexed taskId, uint8 consensusCount, uint8 outlierCount);
    event RewardClaimed(uint256 indexed taskId, address indexed agent, uint256 amount);
    event AgentSlashed(uint256 indexed taskId, address indexed agent, uint256 amount);

    // ── Errors ─────────────────────────────────────────────────────────

    error AlreadyRegistered();
    error NotRegistered();
    error InsufficientStake();
    error TaskNotFound();
    error InvalidStatus(TaskStatus expected, TaskStatus actual);
    error DeadlinePassed();
    error DeadlineNotPassed();
    error MaxAgentsReached();
    error AlreadyCommitted();
    error NotCommitted();
    error AlreadyRevealed();
    error InvalidReveal();
    error NotJudge();
    error NotOwner();
    error NothingToClaim();

    // ── Modifiers ──────────────────────────────────────────────────────

    modifier onlyRegistered() {
        if (!agents[msg.sender].registered) revert NotRegistered();
        _;
    }

    modifier onlyJudge() {
        if (!isJudge[msg.sender]) revert NotJudge();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────

    constructor(address[] memory _judges) {
        owner = msg.sender;
        for (uint256 i = 0; i < _judges.length; i++) {
            isJudge[_judges[i]] = true;
        }
    }

    // ── Agent Registration & Staking ───────────────────────────────────

    function registerAgent(string calldata name) external payable {
        if (agents[msg.sender].registered) revert AlreadyRegistered();

        agents[msg.sender] = AgentProfile({
            registered: true,
            totalStake: msg.value,
            lockedStake: 0,
            completedTasks: 0,
            consensusHits: 0,
            slashCount: 0,
            registeredAt: block.timestamp,
            name: name
        });
        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, name, msg.value);
    }

    function depositStake() external payable onlyRegistered {
        agents[msg.sender].totalStake += msg.value;
        emit StakeDeposited(msg.sender, msg.value);
    }

    function withdrawStake(uint256 amount) external onlyRegistered {
        AgentProfile storage a = agents[msg.sender];
        uint256 freeStake = a.totalStake - a.lockedStake;
        if (amount > freeStake) revert InsufficientStake();

        a.totalStake -= amount;
        payable(msg.sender).transfer(amount);

        emit StakeWithdrawn(msg.sender, amount);
    }

    // ── Task Creation ──────────────────────────────────────────────────

    function createTask(
        string calldata description,
        string calldata taskType,
        uint256 requiredStake,
        uint64 commitDeadline,
        uint64 revealDeadline,
        uint8 maxAgents
    ) external payable returns (uint256 taskId) {
        require(msg.value > 0, "Must provide reward pool");
        require(commitDeadline > block.timestamp, "Commit deadline must be future");
        require(revealDeadline > commitDeadline, "Reveal must be after commit");
        require(maxAgents >= 2, "Need at least 2 agents");

        taskId = taskCount++;

        tasks[taskId] = Task({
            creator: msg.sender,
            description: description,
            taskType: taskType,
            rewardPool: msg.value,
            requiredStake: requiredStake,
            commitDeadline: commitDeadline,
            revealDeadline: revealDeadline,
            maxAgents: maxAgents,
            commitCount: 0,
            revealCount: 0,
            status: TaskStatus.Open
        });

        emit TaskCreated(taskId, msg.sender, msg.value, maxAgents);
    }

    // ── Commit Phase ───────────────────────────────────────────────────

    function commitResult(uint256 taskId, bytes32 hash) external onlyRegistered {
        Task storage t = tasks[taskId];
        if (t.creator == address(0)) revert TaskNotFound();
        if (t.status != TaskStatus.Open) revert InvalidStatus(TaskStatus.Open, t.status);
        if (block.timestamp > t.commitDeadline) revert DeadlinePassed();
        if (t.commitCount >= t.maxAgents) revert MaxAgentsReached();

        Submission storage s = submissions[taskId][msg.sender];
        if (s.commitHash != bytes32(0)) revert AlreadyCommitted();

        // Lock stake
        AgentProfile storage a = agents[msg.sender];
        uint256 freeStake = a.totalStake - a.lockedStake;
        if (freeStake < t.requiredStake) revert InsufficientStake();
        a.lockedStake += t.requiredStake;

        s.commitHash = hash;
        taskAgents[taskId].push(msg.sender);
        t.commitCount++;

        emit ResultCommitted(taskId, msg.sender);
    }

    // ── Transition to Reveal Phase ─────────────────────────────────────

    function startRevealPhase(uint256 taskId) external {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Open) revert InvalidStatus(TaskStatus.Open, t.status);
        if (block.timestamp <= t.commitDeadline) revert DeadlineNotPassed();

        if (t.commitCount < 2) {
            // Not enough agents, expire and refund
            t.status = TaskStatus.Expired;
            _unlockAllStakes(taskId);
            payable(t.creator).transfer(t.rewardPool);
            return;
        }

        t.status = TaskStatus.Revealing;
    }

    // ── Reveal Phase ───────────────────────────────────────────────────

    function revealResult(uint256 taskId, string calldata result) external onlyRegistered {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Revealing) revert InvalidStatus(TaskStatus.Revealing, t.status);
        if (block.timestamp > t.revealDeadline) revert DeadlinePassed();

        Submission storage s = submissions[taskId][msg.sender];
        if (s.commitHash == bytes32(0)) revert NotCommitted();
        if (s.revealed) revert AlreadyRevealed();

        // Verify commit matches reveal
        bytes32 computed = keccak256(abi.encodePacked(msg.sender, taskId, result));
        if (computed != s.commitHash) revert InvalidReveal();

        s.revealedResult = result;
        s.revealed = true;
        t.revealCount++;

        emit ResultRevealed(taskId, msg.sender);
    }

    // ── Transition to Judging Phase ────────────────────────────────────

    function startJudgingPhase(uint256 taskId) external {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Revealing) revert InvalidStatus(TaskStatus.Revealing, t.status);
        if (block.timestamp <= t.revealDeadline) revert DeadlineNotPassed();

        t.status = TaskStatus.Judging;
    }

    // ── Judge Submits Verdict ──────────────────────────────────────────

    function submitJudgment(
        uint256 taskId,
        address[] calldata consensusAgents
    ) external onlyJudge {
        Task storage t = tasks[taskId];
        if (t.status != TaskStatus.Judging) revert InvalidStatus(TaskStatus.Judging, t.status);

        // Mark consensus agents
        for (uint256 i = 0; i < consensusAgents.length; i++) {
            submissions[taskId][consensusAgents[i]].inConsensus = true;
        }

        uint8 consensusCount = uint8(consensusAgents.length);
        address[] storage participants = taskAgents[taskId];
        uint8 outlierCount = 0;

        // Calculate reward per consensus agent
        uint256 rewardPerAgent = consensusCount > 0
            ? t.rewardPool / consensusCount
            : 0;

        // Distribute rewards and slash outliers
        for (uint256 i = 0; i < participants.length; i++) {
            address agent = participants[i];
            AgentProfile storage a = agents[agent];

            a.completedTasks++;
            a.lockedStake -= t.requiredStake;

            if (submissions[taskId][agent].inConsensus) {
                // Consensus agent: reward + unlock stake
                a.consensusHits++;
                payable(agent).transfer(rewardPerAgent);
                emit RewardClaimed(taskId, agent, rewardPerAgent);
            } else {
                // Outlier: slash stake
                outlierCount++;
                a.slashCount++;
                uint256 slashAmount = t.requiredStake / 2; // slash 50%
                a.totalStake -= slashAmount;
                payable(t.creator).transfer(slashAmount);
                emit AgentSlashed(taskId, agent, slashAmount);
            }
        }

        // Handle dust (remaining reward if division is uneven)
        uint256 distributed = rewardPerAgent * consensusCount;
        if (distributed < t.rewardPool) {
            payable(t.creator).transfer(t.rewardPool - distributed);
        }

        t.status = TaskStatus.Resolved;
        emit TaskJudged(taskId, consensusCount, outlierCount);
    }

    // ── Expire Handling ────────────────────────────────────────────────

    function expireTask(uint256 taskId) external {
        Task storage t = tasks[taskId];
        require(
            (t.status == TaskStatus.Revealing && block.timestamp > t.revealDeadline + 1 hours) ||
            (t.status == TaskStatus.Judging && block.timestamp > t.revealDeadline + 2 hours),
            "Cannot expire yet"
        );

        t.status = TaskStatus.Expired;
        _unlockAllStakes(taskId);
        payable(t.creator).transfer(t.rewardPool);
    }

    // ── View Functions ─────────────────────────────────────────────────

    function getAgentProfile(address agent)
        external
        view
        returns (
            bool registered,
            uint256 totalStake,
            uint256 lockedStake,
            uint256 completedTasks,
            uint256 consensusHits,
            uint256 slashCount,
            uint256 registeredAt,
            string memory name
        )
    {
        AgentProfile storage a = agents[agent];
        return (
            a.registered,
            a.totalStake,
            a.lockedStake,
            a.completedTasks,
            a.consensusHits,
            a.slashCount,
            a.registeredAt,
            a.name
        );
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAgentByIndex(uint256 index) external view returns (address) {
        return agentList[index];
    }

    function getTaskAgents(uint256 taskId) external view returns (address[] memory) {
        return taskAgents[taskId];
    }

    function getSubmission(uint256 taskId, address agent)
        external
        view
        returns (
            bytes32 commitHash,
            string memory revealedResult,
            bool revealed,
            bool inConsensus
        )
    {
        Submission storage s = submissions[taskId][agent];
        return (s.commitHash, s.revealedResult, s.revealed, s.inConsensus);
    }

    function getTask(uint256 taskId)
        external
        view
        returns (
            address creator,
            string memory description,
            string memory taskType,
            uint256 rewardPool,
            uint256 requiredStake,
            uint64 commitDeadline,
            uint64 revealDeadline,
            uint8 maxAgents,
            uint8 commitCount,
            uint8 revealCount,
            TaskStatus status
        )
    {
        Task storage t = tasks[taskId];
        return (
            t.creator,
            t.description,
            t.taskType,
            t.rewardPool,
            t.requiredStake,
            t.commitDeadline,
            t.revealDeadline,
            t.maxAgents,
            t.commitCount,
            t.revealCount,
            t.status
        );
    }

    // ── Admin ──────────────────────────────────────────────────────────

    function addJudge(address judge) external onlyOwner {
        isJudge[judge] = true;
    }

    function removeJudge(address judge) external onlyOwner {
        isJudge[judge] = false;
    }

    // ── Internal ───────────────────────────────────────────────────────

    function _unlockAllStakes(uint256 taskId) internal {
        address[] storage participants = taskAgents[taskId];
        Task storage t = tasks[taskId];
        for (uint256 i = 0; i < participants.length; i++) {
            agents[participants[i]].lockedStake -= t.requiredStake;
        }
    }
}
