// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SignatureVerifier.sol";

import "@eigenlayer/contracts/libraries/BytesLib.sol";
import "@eigenlayer/contracts/core/DelegationManager.sol";
import "@eigenlayer-middleware/src/unaudited/ECDSAServiceManagerBase.sol";
import "@eigenlayer-middleware/src/unaudited/ECDSAStakeRegistry.sol";
import "@openzeppelin-upgrades/contracts/utils/cryptography/ECDSAUpgradeable.sol";
import "@eigenlayer/contracts/permissions/Pausable.sol";
import {IRegistryCoordinator} from "@eigenlayer-middleware/src/interfaces/IRegistryCoordinator.sol";

contract Vault is ECDSAServiceManagerBase, Pausable {
    using BytesLib for bytes;
    using ECDSAUpgradeable for bytes32;
    using SignatureVerifier for bytes32;

    /// TODO review if these are needed/need to be refactored
    uint32 public latestTaskNum;
    mapping(uint32 => bytes32) public allTaskHashes;
    mapping(address => mapping(uint32 => bytes)) public allTaskResponses;

    modifier onlyOperator() {
        require(
            ECDSAStakeRegistry(stakeRegistry).operatorRegistered(msg.sender) ==
                true,
            "Operator must be the caller"
        );
        _;
    }

    event BridgeRequest(
        address indexed user,
        address indexed tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    );

    struct BridgeRequestData {
        address user;
        address tokenAddress;
        uint256 amountIn;
        uint256 amountOut;
        address destinationVault;
        address destinationAddress;
        uint256 transferIndex;
    }

    mapping(address => uint256) private nextUserTransferIndexes;
    mapping(address => bool) private whitelistedSigners;

    uint256 public bridgeFee;
    uint256 public crankGasCost;
    address public canonicalSigner;

    constructor(
        address _canonicalSigner,
        uint256 _crankGasCost,
        address _avsDirectory,
        address _stakeRegistry,
        address _delegationManager
    )
        ECDSAServiceManagerBase(
            _avsDirectory,
            _stakeRegistry,
            address(0), // hello-world doesn't need to deal with payments
            _delegationManager
        )
    {
        crankGasCost = _crankGasCost;
        canonicalSigner = _canonicalSigner;
        _transferOwnership(msg.sender);
    }

    function setCanonicalSigner(address _canonicalSigner) external onlyOwner {
        canonicalSigner = _canonicalSigner;
    }

    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        bridgeFee = _bridgeFee;
    }

    function bridgeERC20(address tokenAddress, uint256 amountIn) internal {
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amountIn
        );
        require(success, "Transfer failed");
    }

    function verifyAttestation(
        address tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex,
        bytes32 signedAVSMessage,
        bytes32 cannonicalAttestationSignedMessage
    ) public {
        require(
            operatorHasMinimumWeight(msg.sender),
            "Operator does not have match the weight requirements"
        );
        // Verify the AVS signature
        require(
            SignatureVerifier.getSigner(signedAVSMessage) == address(this),
            "Invalid AVS signature"
        );

        // Verify the canonical attestation signature
        require(
            SignatureVerifier.getSigner(cannonicalAttestationSignedMessage) ==
                canonicalSigner,
            "Invalid canonical attestation signature"
        );

        // Verify the AVS message hash
        bytes32 avsMessageHash = keccak256(
            abi.encodePacked(
                tokenAddress,
                amountIn,
                amountOut,
                destinationVault,
                destinationAddress,
                transferIndex
            )
        );
        require(avsMessageHash == signedAVSMessage, "Invalid AVS message hash");

        // Verify the canonical attestation message hash
        bytes32 attestationMessageHash = keccak256(
            abi.encodePacked(
                tokenAddress,
                amountIn,
                amountOut,
                destinationVault,
                destinationAddress,
                transferIndex,
                signedAVSMessage
            )
        );
        require(
            attestationMessageHash == cannonicalAttestationSignedMessage,
            "Invalid canonical attestation message hash"
        );
    }

    function bridge(
        address tokenAddress,
        uint256 amountIn,
        uint256 amountOut,
        address destinationVault,
        address destinationAddress,
        uint256 transferIndex
    ) public payable {
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
        bytes32 canonicalSignedMessage,
        uint8 canonicalV,
        bytes32 canonicalR,
        bytes32 canonicalS,
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // Verify canonical signer's signature
        require(
            SignatureVerifier.getSigner(
                canonicalSignedMessage,
                canonicalV,
                canonicalR,
                canonicalS
            ) == canonicalSigner,
            "Invalid canonical signature"
        );

        // Verify whitelisted signer's signature on the original message hash
        address signer = SignatureVerifier.getSigner(messageHash, v, r, s);
        require(whitelistedSigners[signer], "Invalid signature");

        // Decode the original message hash to get BridgeRequestData
        BridgeRequestData memory canonicalRequestData = decodeMessageHash(
            canonicalSignedMessage
        );
        BridgeRequestData memory requestData = decodeMessageHash(messageHash);

        // Verify all fields match between the canonical and whitelisted signed messages
        require(
            keccak256(abi.encode(canonicalRequestData)) ==
                keccak256(abi.encode(requestData)),
            "Mismatched request data"
        );

        require(
            requestData.destinationVault == address(this),
            "Invalid destination vault"
        );

        IERC20(requestData.tokenAddress).transfer(
            requestData.destinationAddress,
            requestData.amountOut
        );

        uint256 payout = crankGasCost * tx.gasprice;
        if (address(this).balance < payout) {
            payout = address(this).balance;
        }

        if (payout > 0) {
            (bool sent, ) = msg.sender.call{value: payout}("");
            require(sent, "Failed to send crank fee");
        }
    }

    function decodeMessageHash(
        bytes32 messageHash
    ) internal pure returns (BridgeRequestData memory) {
        return abi.decode(abi.encodePacked(messageHash), (BridgeRequestData));
    }

    function whitelistSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = true;
    }

    function removeWhitelistedSigner(address signer) public onlyOwner {
        whitelistedSigners[signer] = false;
    }

    receive() external payable {}

    function operatorHasMinimumWeight(
        address operator
    ) public view returns (bool) {
        return
            ECDSAStakeRegistry(stakeRegistry).getOperatorWeight(operator) >=
            ECDSAStakeRegistry(stakeRegistry).minimumWeight();
    }
}
