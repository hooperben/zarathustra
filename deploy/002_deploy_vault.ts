import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments,
    deployments: { deploy },
    getNamedAccounts,
  } = hre;

  const { deployer } = await getNamedAccounts();

  const tokenDeploymentAddress = (await deployments.get("TestErc20")).address;

  await deploy("Vault", {
    contract: "Vault",
    from: deployer,
    args: [tokenDeploymentAddress],
    log: true,
    autoMine: true,
    waitConfirmations: 1,
  });
};

export default func;
func.tags = ["testbed", "_vault"];
