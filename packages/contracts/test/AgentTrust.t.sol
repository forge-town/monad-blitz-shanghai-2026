// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AgentTrust.sol";

contract AgentTrustTest is Test {
    AgentTrust public trust;
    address public judge = address(0x1D6E);
    address public agent1 = address(0xA1);
    address public agent2 = address(0xA2);
    address public agent3 = address(0xA3);
    address public buyer = address(0xB0B);

    function setUp() public {
        address[] memory judges = new address[](1);
        judges[0] = judge;
        trust = new AgentTrust(judges);

        // Fund accounts
        vm.deal(agent1, 10 ether);
        vm.deal(agent2, 10 ether);
        vm.deal(agent3, 10 ether);
        vm.deal(buyer, 10 ether);
    }

    // ── Registration ───────────────────────────────────────────────────

    function test_registerAgent() public {
        vm.prank(agent1);
        trust.registerAgent{value: 1 ether}("Claude-3.5");

        (bool reg, uint256 stake,,,,,,string memory name) = trust.getAgentProfile(agent1);
        assertTrue(reg);
        assertEq(stake, 1 ether);
        assertEq(name, "Claude-3.5");
        assertEq(trust.getAgentCount(), 1);
    }

    function test_registerAgent_revertIfDuplicate() public {
        vm.prank(agent1);
        trust.registerAgent{value: 1 ether}("Claude");

        vm.expectRevert(AgentTrust.AlreadyRegistered.selector);
        vm.prank(agent1);
        trust.registerAgent{value: 1 ether}("Claude2");
    }

    // ── Staking ────────────────────────────────────────────────────────

    function test_depositAndWithdrawStake() public {
        vm.prank(agent1);
        trust.registerAgent{value: 1 ether}("Agent");

        vm.prank(agent1);
        trust.depositStake{value: 2 ether}();

        (,uint256 stake,,,,,, ) = trust.getAgentProfile(agent1);
        assertEq(stake, 3 ether);

        vm.prank(agent1);
        trust.withdrawStake(1 ether);

        (,stake,,,,,, ) = trust.getAgentProfile(agent1);
        assertEq(stake, 2 ether);
    }

    // ── Full Cross-Validation Flow ─────────────────────────────────────

    function test_fullFlow_consensusAndOutlier() public {
        // Register 3 agents with stake
        vm.prank(agent1);
        trust.registerAgent{value: 2 ether}("Claude");
        vm.prank(agent2);
        trust.registerAgent{value: 2 ether}("GPT");
        vm.prank(agent3);
        trust.registerAgent{value: 2 ether}("Gemini");

        // Buyer creates task with reward
        uint64 commitDL = uint64(block.timestamp + 1 hours);
        uint64 revealDL = uint64(block.timestamp + 2 hours);

        vm.prank(buyer);
        uint256 taskId = trust.createTask{value: 3 ether}(
            "Translate: Hello World",
            "translation",
            1 ether,   // requiredStake
            commitDL,
            revealDL,
            5           // maxAgents
        );

        // All 3 agents commit
        string memory result1 = unicode"你好世界";
        string memory result2 = unicode"你好世界";
        string memory result3 = "Bonjour le monde"; // outlier

        bytes32 hash1 = keccak256(abi.encodePacked(agent1, taskId, result1));
        bytes32 hash2 = keccak256(abi.encodePacked(agent2, taskId, result2));
        bytes32 hash3 = keccak256(abi.encodePacked(agent3, taskId, result3));

        vm.prank(agent1);
        trust.commitResult(taskId, hash1);
        vm.prank(agent2);
        trust.commitResult(taskId, hash2);
        vm.prank(agent3);
        trust.commitResult(taskId, hash3);

        // Check stakes are locked
        (,,uint256 locked,,,,, ) = trust.getAgentProfile(agent1);
        assertEq(locked, 1 ether);

        // Advance past commit deadline
        vm.warp(commitDL + 1);
        trust.startRevealPhase(taskId);

        // All 3 agents reveal
        vm.prank(agent1);
        trust.revealResult(taskId, result1);
        vm.prank(agent2);
        trust.revealResult(taskId, result2);
        vm.prank(agent3);
        trust.revealResult(taskId, result3);

        // Advance past reveal deadline
        vm.warp(revealDL + 1);
        trust.startJudgingPhase(taskId);

        // Judge decides: agent1 and agent2 are in consensus, agent3 is outlier
        address[] memory consensus = new address[](2);
        consensus[0] = agent1;
        consensus[1] = agent2;

        uint256 agent1BalBefore = agent1.balance;
        uint256 agent3StakeBefore;
        (,agent3StakeBefore,,,,,, ) = trust.getAgentProfile(agent3);

        vm.prank(judge);
        trust.submitJudgment(taskId, consensus);

        // Verify: agent1 got reward (3 ether / 2 = 1.5 ether)
        assertEq(agent1.balance, agent1BalBefore + 1.5 ether);

        // Verify: agent3 got slashed (50% of requiredStake = 0.5 ether)
        (,uint256 agent3StakeAfter,,,, uint256 slashCount,, ) = trust.getAgentProfile(agent3);
        assertEq(agent3StakeAfter, agent3StakeBefore - 0.5 ether);
        assertEq(slashCount, 1);

        // Verify consensus hits
        (,,,uint256 completed, uint256 hits,,, ) = trust.getAgentProfile(agent1);
        assertEq(completed, 1);
        assertEq(hits, 1);

        (,,,completed, hits,,, ) = trust.getAgentProfile(agent3);
        assertEq(completed, 1);
        assertEq(hits, 0);

        // Verify task resolved
        (,,,,,,,,,,AgentTrust.TaskStatus status) = trust.getTask(taskId);
        assertEq(uint8(status), uint8(AgentTrust.TaskStatus.Resolved));
    }

    // ── Access Control ─────────────────────────────────────────────────

    function test_commitResult_revertIfNotRegistered() public {
        vm.prank(buyer);
        uint256 taskId = trust.createTask{value: 1 ether}(
            "Task", "code", 0.1 ether,
            uint64(block.timestamp + 1 hours),
            uint64(block.timestamp + 2 hours),
            3
        );

        vm.expectRevert(AgentTrust.NotRegistered.selector);
        vm.prank(agent1);
        trust.commitResult(taskId, bytes32(uint256(1)));
    }

    function test_submitJudgment_revertIfNotJudge() public {
        vm.expectRevert(AgentTrust.NotJudge.selector);
        address[] memory c = new address[](0);
        vm.prank(agent1);
        trust.submitJudgment(0, c);
    }

    // ── Expire ─────────────────────────────────────────────────────────

    function test_expireIfNotEnoughAgents() public {
        vm.prank(agent1);
        trust.registerAgent{value: 1 ether}("Solo");

        uint64 commitDL = uint64(block.timestamp + 1 hours);
        uint64 revealDL = uint64(block.timestamp + 2 hours);

        vm.prank(buyer);
        uint256 taskId = trust.createTask{value: 1 ether}(
            "Task", "code", 0.5 ether, commitDL, revealDL, 3
        );

        // Only 1 agent commits
        bytes32 hash = keccak256(abi.encodePacked(agent1, taskId, "result"));
        vm.prank(agent1);
        trust.commitResult(taskId, hash);

        // Advance past commit deadline
        vm.warp(commitDL + 1);

        uint256 buyerBalBefore = buyer.balance;
        trust.startRevealPhase(taskId); // should expire

        // Buyer gets refund
        assertEq(buyer.balance, buyerBalBefore + 1 ether);

        // Agent stake unlocked
        (,,uint256 locked,,,,, ) = trust.getAgentProfile(agent1);
        assertEq(locked, 0);
    }
}
