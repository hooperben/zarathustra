// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./SignatureVerifier.sol";

contract Vault is Ownable, ReentrancyGuard {
    using SignatureVerifier for bytes32;

    constructor() Ownable(msg.sender) {}

    event BridgeRequest(
        address indexed user,
        address indexed tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    );

    mapping(address => uint256) private nextUserTransferIndexes;
    mapping(address => bool) private whitelistedSigners;

    uint256 public bridgeFee;
    uint256 public crankFee;

    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        bridgeFee = _bridgeFee;
    }

    function setCrankFee(uint256 _crankFee) external onlyOwner {
        crankFee = _crankFee;
    }

    function bridgeERC20(address tokenAddress, uint256 amountIn) internal {
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amountIn
        );
        require(success, "Transfer failed");
    }

    function bridge(
        address tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    ) public payable nonReentrant {
        require(
            transferIndex == nextUserTransferIndexes[msg.sender],
            "Invalid transfer index"
        );
        require(msg.value == bridgeFee, "Incorrect bridge fee");

        bridgeERC20(tokenAddress, amountIn);

        emit BridgeRequest(
            msg.sender,
            tokenAddress,
            amountIn,
            amountOut,
            destinationVault,
            destinationAddress,
            transferIndex
        );

        nextUserTransferIndexes[msg.sender]++;
    }

    function releaseFunds(
        address user,
        address tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public nonReentrant {
        // Use address(this) for destinationVault to verfiy that the signature is for this vault without adding extra OPs
        bytes32 messageHash = SignatureVerifier.getMessageHash(
            user,
            tokenAddress,
            amountIn,
            amountOut,
            address(this),
            destinationAddress,
            transferIndex
        );
        address signer = SignatureVerifier.getSigner(messageHash, v, r, s);

        require(whitelistedSigners[signer], "Invalid signature");
        require(destinationVault == address(this), "Invalid destination vault");

        IERC20(tokenAddress).transfer(destinationAddress, amountOut);

        uint256 payout = crankFee;
        if (address(this).balance < crankFee) {
            payout = address(this).balance;
        }

        if (payout > 0) {
            (bool sent, ) = msg.sender.call{value: payout}("");
            require(sent, "Failed to send crank fee");
        }
    }

    function whitelistSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = true;
    }

    function removeWhitelistedSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = false;
    }

    receive() external payable {}
}
