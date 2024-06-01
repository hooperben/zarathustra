// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";

import {Vault} from "../src/Vault.sol";

import {TestERC20} from "../src/TestERC20.sol";

contract CounterTest is Test {
    Vault public vault;
    TestERC20 public testERC20;

    Vault public remoteVault;
    TestERC20 public remoteErc20;

    address public deployer;
    address public alice;

    uint256 bridgeFee = 0.005 ether;
    uint256 crankGasCost = 100_000;

    function setUp() public {
        deployer = address(0x4);

        vm.startPrank(deployer);

        vault = new Vault(deployer, crankGasCost);
        testERC20 = new TestERC20();

        vault.setBridgeFee(bridgeFee);

        remoteVault = new Vault(deployer, crankGasCost);
        remoteErc20 = new TestERC20();

        vm.stopPrank();

        alice = address(0x1);

        vm.deal(alice, 1 ether);
    }

    function test_bridge() public {
        uint256 amount = 10 * 10 ** 18;
        testERC20.mint(alice, amount);

        assertEq(testERC20.balanceOf(alice), amount);

        // alice should be able to call the bridge
        vm.startPrank(alice);

        testERC20.approve(address(vault), amount);
        vault.bridge{value: bridgeFee}({
            tokenAddress: address(testERC20),
            amountIn: amount,
            amountOut: amount,
            destinationVault: address(remoteVault),
            destinationAddress: alice,
            transferIndex: 0
        });

        vm.stopPrank();
    }
}
