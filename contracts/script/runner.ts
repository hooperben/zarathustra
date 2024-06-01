import ethers, { Contract, JsonRpcProvider } from "ethers";
import * as dotenv from "dotenv";

const optimsimSepoliaRPC = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
const holeskyRPC = `https://holesky.infura.io/v3/${process.env.INFURA_API_KEY}`;

const optimismSepoliaVaultAddress = "";
const holeskyVaultAddress = "";

const optimismVault = new Contract(
  optimismSepoliaVaultAddress,
  [],
  new JsonRpcProvider(optimsimSepoliaRPC)
);

/**
 * to run:  yarn ts-node script/runner.ts
 */
const main = async () => {
  console.log("hello!");
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
