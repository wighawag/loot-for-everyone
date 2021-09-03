import {getUnnamedAccounts, ethers} from 'hardhat';

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  const tx = await p;
  try {
    await ethers.provider.send('evm_mine', []); // speed up on local network
  } catch (e) {}
  return tx.wait();
}

async function main() {
  const others = await getUnnamedAccounts();
  let counter = 1;
  for (let i = 0; i < 3; i++) {
    const sender = others[i];
    console.log({sender});
    if (sender) {
      const Loot = await ethers.getContract('Loot', sender);
      await waitFor(Loot.claim(counter));
      counter++;
      await waitFor(Loot.claim(counter));
      counter++;
      await waitFor(Loot.claim(counter));
      counter++;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
