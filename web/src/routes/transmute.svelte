<script lang="ts">
  import WalletAccess from '$lib/WalletAccess.svelte';
  import NavButton from '$lib/components/navigation/NavButton.svelte';
  import {nftsof} from '$lib/stores/originalloot';
  import {wallet, flow, chain} from '$lib/stores/wallet';

  $: nfts = nftsof($wallet.address);

  function transmute(nft: {id: number}) {
    let tokenID = nft.id;
    flow.execute(async (contracts) => {
      if ($wallet.address) {
        const isApproved = await contracts.Loot.isApprovedForAll($wallet.address, contracts.LootForEveryone.address);
        if (!isApproved) {
          await contracts.Loot.setApprovalForAll(contracts.LootForEveryone.address, true);
        }
        await contracts.LootForEveryone.transmute(tokenID, $wallet.address);
      }
    });
  }
</script>

<WalletAccess>

  {#if $chain.state !== 'Connected' && $chain.state !== 'Ready'}
    <div
      class="w-full h-full mx-auto text-center flex-col text-black dark:text-white ">
      <p class="mt-4 text-xs sm:text-base font-black text-yellow-400">
        Please Connect to your wallet see the tokens
      </p>
      <button
        class="m-2 text-xs md:text-base font-black text-yellow-400 border border-yellow-500 p-1"
        on:click={() => flow.connect()}>Connect</button>
    </div>
  {:else if !$wallet.address}
    <div
      class="w-full h-full mx-auto text-center flex-col text-black dark:text-white ">
      <p class="mt-4 text-xs sm:text-base font-black text-yellow-400">
        Please Connect to your wallet see your tokens
      </p>
      <button
        class="m-2 text-xs md:text-base font-black text-yellow-400 border border-yellow-500 p-1"
        on:click={() => flow.connect()}>Connect</button>
    </div>
  {/if}

  {#if $nfts.state === 'Ready'}
    {#if $nfts.tokens.length > 0}
      <div
        class="w-full h-full mx-auto flex flex-col items-center justify-center text-black dark:text-white ">
        <p class="p-6">
            Here are your Loot to transmute
        </p>
      </div>
    {:else if $chain.notSupported}
      <div
        class="py-8 px-10 w-full h-full mx-auto flex flex-col items-center justify-center text-black dark:text-white ">
        <p class="p-4">Please switch network</p>
        <NavButton label="Disonnect" on:click={() => wallet.disconnect()}>
          Disonnect
        </NavButton>
      </div>
    {:else if $wallet.state === 'Ready'}
      <div
        class="w-full h-full mx-auto flex flex-col items-center justify-center text-black dark:text-white ">
          <p class="p-4">You do not have any of the original Loot</p>
      </div>
    {/if}
  {/if}
  <section
    class="py-8 md:w-3/4 w-full h-full mx-auto flex flex-col items-center justify-center text-black dark:text-white ">
    {#if $wallet.state !== 'Ready'}
      <!-- <form class="mt-5 w-full max-w-sm">
        <div class="flex items-center">
          <NavButton
            label="Connect"
            disabled={$wallet.unlocking || $chain.connecting}
            on:click={() => flow.connect()}>
            Connect
          </NavButton>
        </div>
      </form> -->
    {:else if !$nfts}
      <div>Getting Tokens...</div>
    {:else if $nfts.state === 'Idle'}
      <div>Tokens not loaded</div>
    {:else if $nfts.error}
      <div>Error: {$nfts.error}</div>
    {:else if $nfts.tokens.length === 0 && $nfts.state === 'Loading'}
      <div>Loading Your Tokens...</div>
    {:else}
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-20 sm:space-y-0 lg:grid-cols-3 lg:gap-x-16">
        {#each $nfts.tokens as nft, index}
          <li>
            <div
              id={nft.id}
              class="space-y-4 py-8 cursor-pointer"
              on:click={() => transmute(nft)}
              >
              <div class="aspect-w-3 aspect-h-2">
                {#if nft.error}
                  Error:
                  {nft.error}
                {:else if nft.image}
                  <img
                    style={`image-rendering: pixelated; ${$nfts.burning[nft.id] ? 'filter: grayscale(100%);' : ''}`}
                    class="border-2 border-white"
                    width="400px"
                    height="400px"
                    alt={nft.name}
                    src={nft.image} />
                {:else}
                  <p class="">{nft.name}</p>
                {/if}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</WalletAccess>
