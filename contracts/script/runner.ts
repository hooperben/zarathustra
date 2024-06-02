import ethers, {
  Contract,
  ContractEventPayload,
  InfuraProvider,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
} from "ethers";
import * as dotenv from "dotenv";
import { vaultAbi } from "../constants/vaultAbi";

dotenv.config();

const optimsimSepoliaWS = `wss://optimism-sepolia.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
const holeskyWS = `wss://holesky.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;

const optimismWSWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new WebSocketProvider(optimsimSepoliaWS)
);
const holeskyWSWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new WebSocketProvider(holeskyWS)
);

console.log("holeskyWS: ", holeskyWS);

const holeskyVaultAddress = "0xed4712592F95974fb0346730429C512f20c01348";
// const holeskyRPC = `https://holesky.infura.io/v3/${process.env.INFURA_API_KEY}`;

const holeskyRPC = "https://ethereum-holesky-rpc.publicnode.com";

const holeskyRPCWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new JsonRpcProvider(holeskyRPC)
);

console.log("holeskyRPC: ", holeskyRPCWallet.address);

const writeHoleskyVault = new Contract(
  holeskyVaultAddress,
  vaultAbi,
  holeskyRPCWallet
);

const optimismRPC = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

const optimismRPCWallet = new Wallet(
  process.env.AVS_PRIVATE_KEY!,
  new JsonRpcProvider(optimismRPC)
);

const optimismSepoliaVaultAddress =
  "0x5e20B22F03E84572424317107a16f7251f870049";

const optimismVault = new Contract(
  optimismSepoliaVaultAddress,
  vaultAbi,
  optimismWSWallet
);

const holeskyVault = new Contract(
  holeskyVaultAddress,
  vaultAbi,
  holeskyWSWallet
);

const writeOptimismVault = new Contract(
  optimismSepoliaVaultAddress,
  vaultAbi,
  optimismRPCWallet
);

/**
 * to run:  yarn ts-node script/runner.ts
 */
const main = async () => {
  holeskyVault.on("BridgeRequest", async (sender, amount, ...event) => {
    console.log("HOLESKY: we got a bridge request: ");
    console.log("sender: ", sender);
    console.log("amount: ", amount);
    console.log("event: ", event);

    const contractEventPayload = event[
      event.length - 1
    ] as unknown as ContractEventPayload;

    const [
      user,
      tokenAddress,
      currentBridgeRequestId,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
      canonicalAttestation,
    ] = contractEventPayload.args;

    console.log(currentBridgeRequestId);
    console.log(canonicalAttestation);

    await writeHoleskyVault.publishAttestation(
      canonicalAttestation,
      currentBridgeRequestId
    );
  });

  // holeskyVault.on("AVSAttestation", async (...event) => {
  //   const contractEventPayload = event[
  //     event.length - 1
  //   ] as unknown as ContractEventPayload;

  // });

  // optimismVault.on("BridgeRequest", async (sender, amount, ...event) => {
  //   console.log("BridgeRequest: we got a bridge request: ");
  //   console.log("sender: ", sender);
  //   console.log("amount: ", amount);

  //   let formattedArgs: any = {};

  //   event.map((e) => {
  //     if (e.args) {
  //       const args = Object.keys(e.args).map((key) => {
  //         return `"${key}": "${e.args[key]}"`;
  //       });

  //       formattedArgs = JSON.parse(`{${args.join(",")}}`);
  //     }
  //   });

  //   const {
  //     user,
  //     tokenAddress,
  //     amountIn,
  //     amountOut,
  //     destinationVault,
  //     destinationAddress,
  //     transferIndex,
  //     canonicalAttestation,
  //   } = formattedArgs;

  //   console.log(
  //     user,
  //     tokenAddress,
  //     amountIn,
  //     amountOut,
  //     destinationVault,
  //     destinationAddress,
  //     transferIndex,
  //     canonicalAttestation
  //   );
  // });

  console.log("we are in business");

  const canonicalAttestation = await writeHoleskyVault.bridgeRequests(4);

  console.log("canonicalAttestation: ", canonicalAttestation);
  const avsSignature = await writeHoleskyVault.bridgeRequests(4);

  console.log("avsSignature: ", avsSignature);
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
