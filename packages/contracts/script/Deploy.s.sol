// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/AgentTrust.sol";

contract DeployAgentTrust is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // For MVP, deployer is the sole judge
        address[] memory judges = new address[](1);
        judges[0] = deployer;

        vm.startBroadcast(deployerPrivateKey);
        AgentTrust trust = new AgentTrust(judges);
        vm.stopBroadcast();

        console.log("AgentTrust deployed at:", address(trust));
        console.log("Judge (deployer):", deployer);
    }
}
