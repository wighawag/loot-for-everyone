import {
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
  network,
  ethers,
} from 'hardhat';
import {Wallet} from '@ethersproject/wallet';
import {keccak256} from '@ethersproject/solidity';
import {arrayify} from '@ethersproject/bytes';

import {erc721} from 'ethereum-contracts-test-suite';

async function randomMintSignature(
  to: string
): Promise<{signature: string; tokenId: string}> {
  const randomWallet = Wallet.createRandom();
  const hashedData = keccak256(['string', 'address'], ['LootForEveryone', to]);
  const signature = await randomWallet.signMessage(arrayify(hashedData));
  return {
    tokenId: randomWallet.address,
    signature,
  };
}

erc721.runMochaTests('LootForEveryone ERC721', {}, async () => {
  //{burn: true}
  await deployments.fixture(['LootForEveryone']);
  const {deployer} = await getNamedAccounts();
  const LootForEveryone = await deployments.get('LootForEveryone');
  const users = await getUnnamedAccounts();
  async function mint(to: string): Promise<{hash: string; tokenId: string}> {
    const LootForEveryoneContract = await ethers.getContract(
      'LootForEveryone',
      to
    );
    const {tokenId, signature} = await randomMintSignature(to);
    const tx = await LootForEveryoneContract.claim(to, signature);
    await tx.wait();
    return {
      tokenId,
      hash: tx.hash,
    };
  }
  return {
    ethereum: network.provider,
    contractAddress: LootForEveryone.address,
    users,
    mint,
    deployer,
  };
});
