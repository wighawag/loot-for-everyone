import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployer} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;

  const SyntheticLoot = await hre.deployments.get('SyntheticLoot');
  const Loot = await hre.deployments.get('Loot');

  await deploy('LootForEveryone', {
    from: deployer,
    args: [Loot.address, SyntheticLoot.address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};
export default func;
func.tags = ['LootForEveryone'];
func.dependencies = ['SyntheticLoot', 'Loot'];
