import { ethers } from "ethers";

const contractABI = [
  "function getDigest((address user, address tokenAddress, uint256 amountIn, uint256 amountOut, address destinationVault, address destinationAddress, uint256 transferIndex)) public view returns (bytes32)"
];

async function getDigest(
  providerUrl: string,
  contractAddress: string,
  user: string,
  tokenAddress: string,
  amountIn: string,
  amountOut: string,
  destinationVault: string,
  destinationAddress: string,
  transferIndex: number
) {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  const requestData = {
    user,
    tokenAddress,
    amountIn: ethers.BigNumber.from(amountIn),
    amountOut: ethers.BigNumber.from(amountOut),
    destinationVault,
    destinationAddress,
    transferIndex: ethers.BigNumber.from(transferIndex)
  };

  try {
    const digest = await contract.getDigest(requestData);
    console.log("Digest:", digest);
    return digest;
  } catch (error) {
    console.error("Error fetching digest:", error);
  }
}

// Example usage
const providerUrl = "https://your.rpc.provider";
const contractAddress = "0xYourContractAddressHere";
const user = "0xUserAddressHere";
const tokenAddress = "0xTokenAddressHere";
const amountIn = "1000000000000000000"; // 1 token in wei
const amountOut = "2000000000000000000"; // 2 tokens in wei
const destinationVault = "0xDestinationVaultAddressHere";
const destinationAddress = "0xDestinationAddressHere";
const transferIndex = 1;

// Call the function
getDigest(providerUrl, contractAddress, user, tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex);
