// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./SignatureVerifier.sol";

contract Vault is Ownable {
    using SignatureVerifier for bytes32;

    constructor() Ownable(msg.sender) {}

    event BridgeRequest(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    );

    mapping(address => uint256) private nextUserTransferIndexes;
    mapping(address => bool) private whitelistedSigners;

    function bridgeERC20(
        address tokenAddress,
        uint256 amountIn
    ) internal {
        IERC20(tokenAddress).approve(address(this), amountIn);
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amountIn);
        require(success, "Transfer failed");
    }

    function bridge(
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    ) public payable {
        require(transferIndex == nextUserTransferIndexes[msg.sender], "Invalid transfer index");

        bridgeERC20(tokenAddress, amountIn);
        emit BridgeRequest(msg.sender, tokenAddress, amountIn, minAmountOut, destinationVault, destinationAddress, transferIndex);

        nextUserTransferIndexes[msg.sender]++;
    }

    function releaseFunds(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 messageHash = SignatureVerifier.getMessageHash(user, tokenAddress, amountIn, minAmountOut, destinationVault, destinationAddress, transferIndex);
        address signer = SignatureVerifier.getSigner(messageHash, v, r, s);

        require(whitelistedSigners[signer], "Invalid signature");
        require(destinationVault == address(this), "Invalid destination vault");

        IERC20(tokenAddress).transfer(destinationAddress, amountIn);
    }

    function whitelistSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = true;
    }

    function removeWhitelistedSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = false;
    }
}
