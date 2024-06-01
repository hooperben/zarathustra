// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

contract CounterTest is Test {
    Vault public vault;

    function setUp() public {
        vault = new Vault();
    }
}
