// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault {
    IERC20 public token;

    event GraphDepositTracker(address indexed user, uint256 indexed amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function deposit(uint256 amount) public {
        // move the tokens from the depositor to this contract
        token.transferFrom(msg.sender, address(this), amount);

        // emit an event for the graph to track
        emit GraphDepositTracker(msg.sender, amount);
    }
}
