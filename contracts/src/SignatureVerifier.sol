// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

library SignatureVerifier {
    function getMessageHash(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 minAmountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, tokenAddress, amountIn, minAmountOut, destinationVault, destinationAddress, transferIndex));
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
