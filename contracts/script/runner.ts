import ethers, {
  Contract,
  InfuraProvider,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
} from "ethers";
import * as dotenv from "dotenv";
import { vaultAbi } from "../constants/vaultAbi";

dotenv.config();

const optimsimSepoliaRPC = `wss://optimism-sepolia.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
const holeskyRPC = `wss://holesky.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;

const optimismWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new WebSocketProvider(optimsimSepoliaRPC)
);
const holeskyWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new WebSocketProvider(holeskyRPC)
);

const optimismSepoliaVaultAddress =
  "0xe31B22f54fcD42A5b15f4Bfec123E3ED855fC739";
const holeskyVaultAddress = "0xefd4Ce5758DF4727b5c499e2789dC7aF8aD30D19";

const optimismVault = new Contract(
  optimismSepoliaVaultAddress,
  vaultAbi,
  optimismWallet
);

const holeskyVault = new Contract(holeskyVaultAddress, vaultAbi, holeskyWallet);

/**
 * to run:  yarn ts-node script/runner.ts
 */
const main = async () => {
  holeskyVault.on("BridgeRequest", async (sender, amount, ...event) => {
    console.log("HOLESKY: we got a bridge request: ");
    console.log("sender: ", sender);
    console.log("amount: ", amount);

    let formattedArgs: any = {};

    event.map((e) => {
      if (e.args) {
        const args = Object.keys(e.args).map((key) => {
          return `"${key}": "${e.args[key]}"`;
        });

        formattedArgs = JSON.parse(`{${args.join(",")}}`);
      }
    });

    const {
      user,
      tokenAddress,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
    } = formattedArgs;
  });

  optimismVault.on("BridgeRequest", async (sender, amount, ...event) => {
    console.log("BridgeRequest: we got a bridge request: ");
    console.log("sender: ", sender);
    console.log("amount: ", amount);

    let formattedArgs: any = {};

    event.map((e) => {
      if (e.args) {
        const args = Object.keys(e.args).map((key) => {
          return `"${key}": "${e.args[key]}"`;
        });

        formattedArgs = JSON.parse(`{${args.join(",")}}`);
      }
    });

    const {
      user,
      tokenAddress,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
    } = formattedArgs;
  });

  console.log("we are in business");
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
