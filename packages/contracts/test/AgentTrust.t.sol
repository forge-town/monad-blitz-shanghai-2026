// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AgentTrust.sol";

contract AgentTrustTest is Test {
    AgentTrust public trust;
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    bytes32 public agentId = keccak256("agent-1");
    string public agentName = "Claude Agent";

    function setUp() public {
        trust = new AgentTrust();
    }

    // ── Registration ───────────────────────────────────────────────────

    function test_registerAgent() public {
        string[] memory caps = new string[](2);
        caps[0] = "math";
        caps[1] = "coding";

        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        (address owner, string memory name,,,,, uint256 registeredAt) = trust.getAgentProfile(agentId);
        assertEq(owner, alice);
        assertEq(name, agentName);
        assertGt(registeredAt, 0);
        assertEq(trust.getAgentCount(), 1);
    }

    function test_registerAgent_revertIfDuplicate() public {
        string[] memory caps = new string[](0);

        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        vm.expectRevert(abi.encodeWithSelector(AgentTrust.AgentAlreadyRegistered.selector, agentId));
        vm.prank(bob);
        trust.registerAgent(agentId, "Other", caps);
    }

    // ── Full Challenge Flow ────────────────────────────────────────────

    function test_fullChallengeFlow_pass() public {
        // Register agent
        string[] memory caps = new string[](1);
        caps[0] = "math";
        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        // Create challenge: "What is 2+2?" answer: "4"
        string memory answer = "4";
        bytes32 answerHash = keccak256(abi.encodePacked(answer));

        vm.prank(bob);
        uint256 challengeId = trust.createChallenge(agentId, "math", "What is 2+2?", answerHash, 3600);

        // Agent submits correct answer hash
        vm.prank(alice);
        trust.submitResult(challengeId, answerHash);

        // Creator reveals answer
        vm.prank(bob);
        trust.revealAnswer(challengeId, answer);

        // Verify agent profile updated
        (,,, uint256 total, uint256 passed, uint256 failed,) = trust.getAgentProfile(agentId);
        assertEq(total, 1);
        assertEq(passed, 1);
        assertEq(failed, 0);
    }

    function test_fullChallengeFlow_fail() public {
        // Register agent
        string[] memory caps = new string[](1);
        caps[0] = "math";
        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        // Create challenge
        string memory correctAnswer = "4";
        bytes32 answerHash = keccak256(abi.encodePacked(correctAnswer));

        vm.prank(bob);
        uint256 challengeId = trust.createChallenge(agentId, "math", "What is 2+2?", answerHash, 3600);

        // Agent submits WRONG answer hash
        bytes32 wrongHash = keccak256(abi.encodePacked("5"));
        vm.prank(alice);
        trust.submitResult(challengeId, wrongHash);

        // Creator reveals answer
        vm.prank(bob);
        trust.revealAnswer(challengeId, correctAnswer);

        // Verify agent profile shows failure
        (,,, uint256 total, uint256 passed, uint256 failed,) = trust.getAgentProfile(agentId);
        assertEq(total, 1);
        assertEq(passed, 0);
        assertEq(failed, 1);
    }

    // ── Access Control ─────────────────────────────────────────────────

    function test_submitResult_revertIfNotOwner() public {
        string[] memory caps = new string[](0);
        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        bytes32 answerHash = keccak256(abi.encodePacked("4"));
        vm.prank(bob);
        uint256 challengeId = trust.createChallenge(agentId, "math", "What is 2+2?", answerHash, 3600);

        // Bob (not agent owner) tries to submit
        vm.expectRevert(AgentTrust.NotAgentOwner.selector);
        vm.prank(bob);
        trust.submitResult(challengeId, answerHash);
    }

    function test_revealAnswer_revertIfNotCreator() public {
        string[] memory caps = new string[](0);
        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        string memory answer = "4";
        bytes32 answerHash = keccak256(abi.encodePacked(answer));
        vm.prank(bob);
        uint256 challengeId = trust.createChallenge(agentId, "math", "What is 2+2?", answerHash, 3600);

        vm.prank(alice);
        trust.submitResult(challengeId, answerHash);

        // Alice (not challenge creator) tries to reveal
        vm.expectRevert(AgentTrust.NotChallengeCreator.selector);
        vm.prank(alice);
        trust.revealAnswer(challengeId, answer);
    }

    // ── Edge Cases ─────────────────────────────────────────────────────

    function test_submitResult_revertIfExpired() public {
        string[] memory caps = new string[](0);
        vm.prank(alice);
        trust.registerAgent(agentId, agentName, caps);

        bytes32 answerHash = keccak256(abi.encodePacked("4"));
        vm.prank(bob);
        uint256 challengeId = trust.createChallenge(agentId, "math", "What is 2+2?", answerHash, 60);

        // Fast forward past deadline
        vm.warp(block.timestamp + 61);

        vm.expectRevert(AgentTrust.ChallengeExpired.selector);
        vm.prank(alice);
        trust.submitResult(challengeId, answerHash);
    }

    function test_createChallenge_revertIfAgentNotFound() public {
        bytes32 fakeId = keccak256("nonexistent");
        bytes32 answerHash = keccak256(abi.encodePacked("4"));

        vm.expectRevert(abi.encodeWithSelector(AgentTrust.AgentNotFound.selector, fakeId));
        trust.createChallenge(fakeId, "math", "What is 2+2?", answerHash, 3600);
    }
}
