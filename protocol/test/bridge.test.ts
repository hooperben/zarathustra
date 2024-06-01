import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import { TestErc20, Vault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, parseEther } from "ethers";
import { getGraphQLRecord } from "../constants/get-graphql-record";

// await expect(lock.withdraw())
// .to.emit(lock, "Withdrawal")
// .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg

describe("Bridge Testing", () => {
  let Token: TestErc20;
  let Vault: Vault;

  let Deployer: SignerWithAddress;

  before(async () => {
    await deployments.fixture("testbed");

    [Deployer] = await ethers.getSigners();

    const tokenDeployment = await deployments.get("TestErc20");
    Token = new Contract(
      tokenDeployment.address,
      tokenDeployment.abi,
      hre.ethers.provider
    ) as unknown as TestErc20;

    const vaultDeployment = await deployments.get("Vault");
    Vault = new Contract(
      vaultDeployment.address,
      vaultDeployment.abi,
      hre.ethers.provider
    ) as unknown as Vault;
  });

  it("deployments should run correctly", async () => {
    const tokenAddress = await Vault.token();

    expect(tokenAddress).to.equal(await Token.getAddress());

    const amount = parseEther("1000");
    await Token.connect(Deployer).approve(await Vault.getAddress(), amount);

    // deposit should work
    await Vault.connect(Deployer).deposit(amount);

    // this is a demo tx I made on optimism sepolia
    const demoTx =
      "0x61718a55b8949a38bfdb0e0a7c52b79be566f1f27ccba1870c423cadb6afb016";

    // this is the graphQL query to get the details of this tx
    const { data } = await getGraphQLRecord(demoTx);

    const record = data.graphDepositTrackers[0];

    console.log(record);

    // expect(record.)
  });
});
