// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";

import {console} from "forge-std/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Vault} from "../src/Vault.sol";
import {TestERC20} from "../src/TestERC20.sol";

interface IVault {
    function bridge(
        address tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    ) external;
}

contract DeployScript is Script {
    function run() external {
        // Load the private key from environment variable
        uint256 privateKey = 0x1323;

        // Start broadcasting transactions to the RPC endpoint using the private key
        vm.startBroadcast(privateKey);

        // Deploy the contract
        IVault vaultContract = IVault(
            0x71C95911E9a5D330f4D621842EC243EE1343292e
        );
        IERC20 testERC20 = IERC20(0x948B3c65b89DF0B4894ABE91E6D02FE579834F8F);

        uint256 amount = 100 * 10 ** 18;

        testERC20.approve(address(vaultContract), amount);
        vaultContract.bridge(
            address(testERC20),
            amount,
            amount,
            address(testERC20),
            address(testERC20),
            0
        );

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Optionally, you can print the deployed contract address
        console.log("Vault deployed to:", address(vaultContract));
        console.log("TestERC20 deployed to:", address(testERC20));
    }
}
