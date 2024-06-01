import { deployments, ethers } from "hardhat";
import { TestErc20, Vault } from "../typechain-types";
import { Contract, parseEther } from "ethers";

async function main() {
  const [Deployer] = await ethers.getSigners();

  const tokenDeployment = await deployments.get("TestErc20");
  const Token = new Contract(
    tokenDeployment.address,
    tokenDeployment.abi,
    Deployer
  ) as unknown as TestErc20;

  const vaultDeployment = await deployments.get("Vault");
  const Vault = new Contract(
    vaultDeployment.address,
    vaultDeployment.abi,
    Deployer
  ) as unknown as Vault;

  // approve the vault
  let tx = await Token.connect(Deployer).approve(
    await Vault.getAddress(),
    parseEther("10000")
  );
  await tx.wait();

  // deposit should work
  tx = await Vault.connect(Deployer).deposit(parseEther("69"));
  console.log(tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
