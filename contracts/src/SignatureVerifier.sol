// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

library SignatureVerifier {
    function getMessageHash(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        uint256 transferIndex
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, tokenAddress, amountIn, minAmountOut, destinationVault, transferIndex));
    }

    function getSigner(
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        address signer = ecrecover(messageHash, v, r, s);
        return signer;
    }
}
