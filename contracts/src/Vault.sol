// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import "./Structs.sol";

import "forge-std/console.sol";

contract Vault is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    event BridgeRequest(
        address indexed user,
        address indexed tokenAddress,
        uint256 indexed bridgeRequestId,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex,
        bytes canonicalAttestation
    );

    event AVSAttestation(bytes32 indexed attestation, uint256 indexed bridgeRequestId);

    mapping(address => uint256) private nextUserTransferIndexes;
    mapping(address => bool) private whitelistedSigners;

    uint256 public currentBridgeRequestId;
    mapping(uint256 => Structs.BridgeRequestData) public bridgeRequests;

    uint256 public bridgeFee;
    uint256 public crankGasCost;
    address public canonicalSigner;

    constructor(address _canonicalSigner, uint256 _crankGasCost) Ownable(msg.sender) EIP712("Zarathustra", "1") {
        crankGasCost = _crankGasCost;
        canonicalSigner = _canonicalSigner;
        currentBridgeRequestId = 0;
    }

    function setCanonicalSigner(address _canonicalSigner) external onlyOwner {
        canonicalSigner = _canonicalSigner;
    }

    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        bridgeFee = _bridgeFee;
    }

    function getDigest(Structs.BridgeRequestData memory data) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("BridgeRequestData(address user,address tokenAddress,uint256 amountIn,uint256 amountOut,address destinationVault,address destinationAddress,uint256 transferIndex)"),
            data.user,
            data.tokenAddress,
            data.amountIn,
            data.amountOut,
            data.destinationVault,
            data.destinationAddress,
            data.transferIndex
        )));
    }

    function getSigner(
        Structs.BridgeRequestData memory data,
        bytes memory signature
    ) public returns (address) {
        bytes32 digest = getDigest(data);
        return ECDSA.recover(digest, signature);
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
        bytes memory canonicalAttestation
    ) public payable nonReentrant {
        require(msg.value == bridgeFee, "Incorrect bridge fee");

        bridgeERC20(tokenAddress, amountIn);
        uint256 transferIndex = nextUserTransferIndexes[msg.sender];

        emit BridgeRequest(
            msg.sender,
            tokenAddress,
            currentBridgeRequestId,
            amountIn,
            amountOut,
            destinationVault,
            destinationAddress,
            transferIndex,
            canonicalAttestation
        );

        bridgeRequests[currentBridgeRequestId] = Structs.BridgeRequestData(
            msg.sender,
            tokenAddress,
            amountIn,
            amountOut,
            destinationVault,
            destinationAddress,
            transferIndex
        );

        currentBridgeRequestId++;
        nextUserTransferIndexes[msg.sender]++;
    }

    function publishAttestation(bytes32 attestation, uint256 _bridgeRequestId) public {
        emit AVSAttestation(attestation, _bridgeRequestId);
    }

    function releaseFunds(
        bytes memory canonicalSignature,
        bytes memory AVSSignature,
        Structs.BridgeRequestData memory data
    ) public nonReentrant {
        // Verify canonical signer's signaturegg
        require(getSigner(data, canonicalSignature) == canonicalSigner, "Invalid canonical signature");

        address signer = getSigner(data, AVSSignature);
        require(whitelistedSigners[signer], "Invalid signature");
        require(data.destinationVault == address(this), "Invalid destination vault");

        IERC20(data.tokenAddress).approve(address(this), data.amountOut);
        IERC20(data.tokenAddress).transfer(data.destinationAddress, data.amountOut);

        uint256 payout = crankGasCost * tx.gasprice;
        if (address(this).balance < payout) {
            payout = address(this).balance; }

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
