import {expect} from './chai-setup';
import {
  ethers,
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
} from 'hardhat';
import {Loot, LootForEveryone, SyntheticLoot} from '../typechain';
import {setupUser, setupUsers, waitFor} from './utils';
import {Wallet} from '@ethersproject/wallet';
import {keccak256} from '@ethersproject/solidity';
import {arrayify, hexZeroPad} from '@ethersproject/bytes';
import {BigNumber} from 'ethers';
// import {BigNumber} from '@ethersproject/bignumber';

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['LootForEveryone']);
  const contracts = {
    LootForEveryone: <LootForEveryone>(
      await ethers.getContract('LootForEveryone')
    ),
    Loot: <Loot>await ethers.getContract('Loot'),
    SyntheticLoot: <SyntheticLoot>await ethers.getContract('SyntheticLoot'),
  };
  const {deployer: deployerAddress} = await getNamedAccounts();
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  const deployer = await setupUser(deployerAddress, contracts);
  return {
    ...contracts,
    users,
    deployer,
  };
});

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

describe('LootForEveryone Specific', function () {
  it('name succeed', async function () {
    const {users} = await setup();
    const name = await users[0].LootForEveryone.name();
    expect(name).to.equal('Loot For Everyone');
  });

  it('mint and transfer', async function () {
    const {users} = await setup();
    const {tokenId, signature} = await randomMintSignature(users[0].address);
    const receipt = await waitFor(
      users[0].LootForEveryone.pickLoot(users[0].address, signature)
    );
    expect(receipt.events && receipt.events[0].args?.tokenId).to.eq(tokenId);
  });

  it('mint and transfer', async function () {
    const {users, LootForEveryone} = await setup();
    const {tokenId, signature} = await randomMintSignature(users[0].address);
    await users[0].LootForEveryone.pickLoot(users[0].address, signature);
    await users[0].LootForEveryone.transferFrom(
      users[0].address,
      users[1].address,
      tokenId
    );
    const owner = await LootForEveryone.callStatic.ownerOf(tokenId);
    expect(owner).to.equal(users[1].address);
  });

  it('uri match < 8001', async function () {
    const {users, LootForEveryone, Loot, SyntheticLoot} = await setup();
    const tokenId = 3;
    await users[0].Loot.claim(tokenId);
    const lootUri = await Loot.callStatic.tokenURI(tokenId);
    const syntheticUri = await SyntheticLoot.callStatic.tokenURI(
      '0x0000000000000000000000000000000000000003'
    );
    const lootForEveryoneUri = await LootForEveryone.callStatic.tokenURI(
      tokenId
    );
    console.log({lootUri, lootForEveryoneUri, syntheticUri});

    expect(lootUri).to.eq(lootForEveryoneUri);
    expect(syntheticUri).to.eq(lootForEveryoneUri);
  });

  it('uri match > 8000', async function () {
    const {users, LootForEveryone, Loot, SyntheticLoot} = await setup();
    const tokenId = 8001;
    const syntheticUri = await SyntheticLoot.callStatic.tokenURI(
      hexZeroPad(BigNumber.from(tokenId).toHexString(), 20)
    );
    const lootForEveryoneUri = await LootForEveryone.callStatic.tokenURI(
      tokenId
    );
    // console.log({lootUri, lootForEveryoneUri, syntheticUri});

    expect(syntheticUri).to.eq(lootForEveryoneUri);
  });

  it('uri match = 8000', async function () {
    const {deployer, LootForEveryone, Loot, SyntheticLoot} = await setup();
    const tokenId = 8000;
    await deployer.Loot.ownerClaim(tokenId);
    const lootUri = await Loot.callStatic.tokenURI(tokenId);
    const syntheticUri = await SyntheticLoot.callStatic.tokenURI(
      hexZeroPad(BigNumber.from(tokenId).toHexString(), 20)
    );
    const lootForEveryoneUri = await LootForEveryone.callStatic.tokenURI(
      tokenId
    );
    console.log({lootUri, lootForEveryoneUri, syntheticUri});

    expect(lootUri).to.eq(lootForEveryoneUri);
  });

  it('uri match = 8001', async function () {
    const {users, LootForEveryone, Loot, SyntheticLoot} = await setup();
    const tokenId = 8001;
    const syntheticUri = await SyntheticLoot.callStatic.tokenURI(
      hexZeroPad(BigNumber.from(tokenId).toHexString(), 20)
    );
    const lootForEveryoneUri = await LootForEveryone.callStatic.tokenURI(
      tokenId
    );

    expect(syntheticUri).to.eq(lootForEveryoneUri);
  });

  it('uri match random address', async function () {
    const {users, LootForEveryone, Loot, SyntheticLoot} = await setup();
    const tokenId = Wallet.createRandom().address;
    const syntheticUri = await SyntheticLoot.callStatic.tokenURI(
      hexZeroPad(BigNumber.from(tokenId).toHexString(), 20)
    );
    const lootForEveryoneUri = await LootForEveryone.callStatic.tokenURI(
      tokenId
    );
    // console.log({lootUri, lootForEveryoneUri, syntheticUri});

    expect(syntheticUri).to.eq(lootForEveryoneUri);
  });
});
