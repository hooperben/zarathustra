import hre, { deployments, ethers } from "hardhat";
import { TestErc20, Vault, Vault__factory } from "../typechain-types";
import { Contract, parseEther } from "ethers";
import { getGraphQLRecord } from "../constants/get-graphql-record";

const main = async () => {
  const [Deployer] = await ethers.getSigners();

  const vaultDeployment = await deployments.get("Vault");
  const vault = new Contract(
    vaultDeployment.address,
    vaultDeployment.abi,
    Deployer
  ) as unknown as Vault;

  console.log("listening for GraphDepositTracker events");
  // @ts-ignore
  vault.on("GraphDepositTracker", async (sender, amount, event) => {
    console.log("sender: ", sender);
    console.log("amount: ", amount);
    console.log("txHash", event.log.transactionHash);

    console.log(
      "we now query the graphQL endpoint to get the details of this tx"
    );

    // TODO add wait here

    const { data } = await getGraphQLRecord(event.log.transactionHash);

    console.log(data);

    const record = data.graphDepositTrackers[0];

    console.log("GQLRecord: ");
    console.log(record);
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
