import "@eigenlayer/contracts/libraries/BytesLib.sol";
import "@openzeppelin-upgrades/contracts/utils/cryptography/ECDSAUpgradeable.sol";

contract BridgingServiceManager {
    using BytesLib for bytes;
    using ECDSAUpgradeable for bytes32;
}
