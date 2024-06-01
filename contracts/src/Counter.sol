// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SignatureVerifier.sol";


contract Vault {
    event BridgeRequest(address indexed user, address indexed tokenAddress, uint256 amountIn, uint256 minAmountOut, address destinationVault, uint256 transferIndex);

    mapping(address => uint256) private nextUserTransferIndexes;
    mapping(address => bool) private whitelistedSigners;

    function bridgeERC20(
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault
    ) internal {
        IERC20(tokenAddress).approve(yourContractAddress, amountIn);
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amountIn);
        require(success, "Transfer failed");
    }

    function bridge(
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        uint256 transferIndex
    //    uint256 fee // optional if we want to support native token transfers
    ) public payable {
        require(transferIndex == nextUserTransferIndexes[msg.sender], "Invalid transfer index");

        bridgeERC20(tokenAddress, amountIn, minAmountOut, destinationVault);
        emit BridgeRequest(msg.sender, tokenAddress, amountIn, minAmountOut, destinationVault, transferIndex);

        nextUserTransferIndexes[msg.sender]++;
    }

    function releaseFunds(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        uint256 transferIndex,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 messageHash = SignatureVerifier.getMessageHash(user, tokenAddress, amountIn, minAmountOut, destinationVault, transferIndex);
        address signer = SignatureVerifier.verifySignature(messageHash, v, r, s);
        require(whitelistedSigners[signer], "Invalid signature");

        // Add your logic to release funds
    }
}
