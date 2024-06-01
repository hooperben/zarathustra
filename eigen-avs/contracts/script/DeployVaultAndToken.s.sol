// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";

import {console} from "forge-std/console.sol";

import {Vault} from "../src/Vault.sol";
import {TestERC20} from "../src/TestERC20.sol";

contract DeployScript is Script {
    uint256 bridgeFee = 0.005 ether;
    uint256 crankGasCost = 100_000;

    function run() external {
        // Load the private key from environment variable
        uint256 privateKey = 0x2;

        // Start broadcasting transactions to the RPC endpoint using the private key
        vm.startBroadcast(privateKey);

        // Deploy the contract
        Vault vaultContract = new Vault();
        TestERC20 testERC20 = new TestERC20();

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Optionally, you can print the deployed contract address
        console.log("Vault deployed to:", address(vaultContract));
        console.log("TestERC20 deployed to:", address(testERC20));
    }
}
