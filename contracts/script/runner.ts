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

const holeskyVaultAddress = "0xE79285994020f0C8177E795430BF69A7C193FaD3";
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
  "0x38a406C320Ab23f18D3a10E44f37084d29f4dD96";

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

    console.log({
      user,
      tokenAddress,
      currentBridgeRequestId,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
      canonicalAttestation,
    });

    console.log(currentBridgeRequestId);
    console.log(canonicalAttestation);

    const digest = await optimismVault.getDigest({
      user,
      tokenAddress,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
      canonicalAttestation: "0x",
    });

    console.log("digest", digest);

    const avsAttestation = await optimismRPCWallet.signMessage(digest);

    console.log("avs attestation: ", avsAttestation);

    await writeHoleskyVault.publishAttestation(
      avsAttestation, // canonicalAttestation,
      currentBridgeRequestId
    );
  });

  holeskyVault.on("AVSAttestation", async (...event) => {
    const contractEventPayload = event[
      event.length - 1
    ] as unknown as ContractEventPayload;
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
      canonicalAttestation,
    } = formattedArgs;

    console.log(
      user,
      tokenAddress,
      amountIn,
      amountOut,
      destinationVault,
      destinationAddress,
      transferIndex,
      canonicalAttestation
    );
  });

  const index = await holeskyVault.nextUserTransferIndexes(
    "0x5f0974C77a9dcc3a15e5F019B837708f0489394D"
  );

  console.log(index);
  console.log(index.toString());

  const wallet = new Wallet(
    "0x861210e14ede5ffc63a502be024c8b4ee34c23744a411b38858f12c78723a1a2"
  );

  console.log(wallet.address);
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
