import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import { TestErc20, Vault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, parseEther } from "ethers";
import { token } from "../typechain-types/@openzeppelin/contracts";

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
  });
});
