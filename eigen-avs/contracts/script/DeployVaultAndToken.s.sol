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
        uint256 privateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

        // Start broadcasting transactions to the RPC endpoint using the private key
        vm.startBroadcast(privateKey);

        address derivedAddress = vm.addr(privateKey);

        address _avsDirectory = 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707;
        address _stakeRegistry = 0x9E545E3C0baAB3E08CdfD552C960A1050f373042;
        address _delegationManager = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;

        // Deploy the contract
        Vault vaultContract = new Vault(
            derivedAddress,
            crankGasCost,
            _avsDirectory,
            _stakeRegistry,
            _delegationManager
        );
        TestERC20 testERC20 = new TestERC20();

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Optionally, you can print the deployed contract address
        console.log("Vault deployed to:", address(vaultContract));
        console.log("TestERC20 deployed to:", address(testERC20));
    }
}
