import { ethers } from "ethers";
import * as dotenv from "dotenv";

import { delegationABI } from "./abis/delegationABI";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const delegationManagerAddress = process.env.DELEGATION_MANAGER_ADDRESS!;
const delegationManager = new ethers.Contract(
  delegationManagerAddress,
  delegationABI,
  wallet
);

const registerOperator = async () => {};

const main = async () => {
  await registerOperator();
  // monitorNewTasks().catch((error) => {
  //   console.error("Error monitoring tasks:", error);
  // });
};

main().catch((error) => {
  console.error("Error in main function:", error);
});
