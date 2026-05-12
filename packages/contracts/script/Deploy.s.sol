// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/AgentTrust.sol";

contract DeployAgentTrust is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        AgentTrust trust = new AgentTrust();
        vm.stopBroadcast();

        console.log("AgentTrust deployed at:", address(trust));
    }
}
