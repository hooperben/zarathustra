import {
  Contract,
  InfuraProvider,
  JsonRpcProvider,
  Wallet,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";
import { vaultAbi } from "../constants/vaultAbi";
import { erc20Abi } from "../constants/erc20Abi";

import * as dotenv from "dotenv";

dotenv.config();

const holeskyRPC = `https://holesky.infura.io/v3/${process.env.INFURA_API_KEY}`;
// const holeskyRPC = "https://ethereum-holesky-rpc.publicnode.com";

console.log("holeskyRPC: ", holeskyRPC);

const optimismRPC = `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

const holeskyRPCWallet = new Wallet(
  process.env.PRIVATE_KEY!,
  new JsonRpcProvider(holeskyRPC)
);
const optimismRPCWallet = new Wallet(
  process.env.PRIVATE_KEY!,
  new JsonRpcProvider(optimismRPC)
);

const holeskyVaultAddress = "0xed4712592F95974fb0346730429C512f20c01348";
const holeskyTokenAddress = "0xE2101b383FDdca24813DB1Bf0E68129bE402e8e0";

const writeHoleskyVault = new Contract(
  holeskyVaultAddress,
  vaultAbi,
  holeskyRPCWallet
);

const writeHoleskyToken = new Contract(
  holeskyTokenAddress,
  erc20Abi,
  holeskyRPCWallet
);

const writeOPTestToken = new Contract(
  "0xcb158056b5D4DC26e8161423A60b9e4dA2c9f630",
  erc20Abi,
  optimismRPCWallet
);

const optimismVaultAddress = "0x5e20B22F03E84572424317107a16f7251f870049";

const optimismVault = new Contract(
  optimismVaultAddress,
  vaultAbi,
  optimismRPCWallet
);

/**
 * to run:  yarn ts-node script/bridgeTx.ts
 */
const main = async () => {
  const amount = parseEther("1");

  const tokenAddress = holeskyTokenAddress;
  const amountIn = amount;
  const amountOut = amount;
  const destinationVault = "0x5e20B22F03E84572424317107a16f7251f870049";
  const destinationAddress = "0x5f0974C77a9dcc3a15e5F019B837708f0489394D";

  // const canonicalAttestation = await optimismVault.getDigest({
  //   user: destinationAddress,
  //   tokenAddress,
  //   amountIn,
  //   amountOut,
  //   destinationVault,
  //   destinationAddress,
  //   transferIndex: 5,
  // });

  // console.log("canonicalAttestation: ", canonicalAttestation);

  // const balance = await writeHoleskyToken.balanceOf(holeskyRPCWallet.address);
  // const approval = await writeHoleskyToken.allowance(
  //   holeskyRPCWallet.address,
  //   holeskyVaultAddress
  // );
  // console.log(balance);
  // console.log(approval);
  // need to approve
  // let tx = await writeHoleskyToken.approve(
  //   holeskyVaultAddress,
  //   parseEther("69")
  // );
  // console.log("tx: ", tx);
  // await tx.wait();

  console.log(holeskyRPCWallet.address);

  console.log("minted");

  await writeOPTestToken.mint(
    "0x38a406C320Ab23f18D3a10E44f37084d29f4dD96",
    parseEther("1000000")
  );
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
