<script lang="ts">
  import WalletAccess from '$lib/WalletAccess.svelte';
  import NavButton from '$lib/components/navigation/NavButton.svelte';
  import type {NFT} from '$lib/stores/nftsof';
  import {nftsof} from '$lib/stores/nftsof';
  import {wallet, flow, chain} from '$lib/stores/wallet';
  import {page} from '$app/stores';
  import {goto} from '$app/navigation';
  import { url } from '$lib/utils/url';
import { BigNumber } from '@ethersproject/bignumber';
import pickOwnLootFlow from '$lib/stores/pickOwnLootFlow';
import transmuteFlow from '$lib/stores/transmuteFlow';

  let walletAddress: string = undefined;
  //TODO
  $: {

    walletAddress = ($page.path && typeof location !== "undefined") ? location.hash.substr(1): undefined
    console.log({path: $page.path, walletAddress, locationHash: typeof location !== "undefined" && location.hash});
  }

  $: {
    if ($wallet.address && !walletAddress) {
      console.log('redirect');
      goto(url(`wallet/#${$wallet.address}`), {replaceState: true}).then(() => {
        walletAddress = ($page.path && typeof location !== "undefined") ? location.hash.substr(1): undefined
      })
    }
  }

  $: isWalletOwner =
    $wallet.address &&
    walletAddress &&
    $wallet.address.toLowerCase() === walletAddress.toLowerCase();

  $: nfts = nftsof(walletAddress);


  function transmuteBack(nft: NFT) {
    let tokenID = nft.id;
    flow.execute(async (contracts) => {
      if ($wallet.address) {
        await contracts.LootForEveryone.transmuteBack(tokenID, $wallet.address);
      }
    });
  }

  function pickUp(nft: NFT) {
    pickOwnLootFlow.pickup(nft);
    // flow.execute(async (contracts) => {
    //   if ($wallet.address) {
    //     await contracts.LootForEveryone.transferFrom($wallet.address, $wallet.address, nft.id);
    //   }
    // });
  }

  function actOn(nft: NFT) {
    if (!nft.claimed && BigNumber.from(nft.id).eq(BigNumber.from($wallet.address))) {
      pickUp(nft);
    } else if (BigNumber.from(nft.id).lt(8001)) {
      // transmuteBack(nft);
    }
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
  {:else if !walletAddress || walletAddress === ''}
    <div
      class="w-full h-full mx-auto text-center flex-col text-black dark:text-white ">
      <p class="mt-4 text-xs sm:text-base font-black text-yellow-400">
        Please Connect to your wallet see your tokens
      </p>
      <button
        class="m-2 text-xs md:text-base font-black text-yellow-400 border border-yellow-500 p-1"
        on:click={() => flow.connect()}>Connect</button>
    </div>
  {:else if $wallet.address && !isWalletOwner}
    <div
      class="w-full h-full mx-auto text-center flex-col text-black dark:text-white ">
      <div
        class="w-full h-full mx-auto flex justify-between text-black dark:text-white ">
        <a
          href={`wallet#${$wallet.address}`}
          class="m-2 text-xs md:text-base font-black text-yellow-400 border border-yellow-500 p-1">
          Show My Loot
        </a>
      </div>
    </div>
  {/if}

  {#if $nfts.state === 'Ready'}
    {#if $nfts.tokens.length > 0}
      <div
        class="w-full h-full mx-auto flex flex-col items-center justify-center text-black dark:text-white ">
        <p class="p-6">
          {#if isWalletOwner}
            Here are your Loot.
          {:else}Here are the Loot for wallet {walletAddress}.{/if}
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
        {#if isWalletOwner}
          <p class="p-4">You do not have any Loot</p>
          <p>find one <a href={url('search/')} class="underline">here</a></p>
        {:else}
          <p class="p-4">No Loot for {walletAddress}</p>
        {/if}
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
              on:click={actOn(nft)}
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
              <div class={!nft.claimed ? 'hidden' : ''}>
                <div class="mt-2 flex">
                  <div class="w-0 flex-1 flex">
                    <button
                      on:click={() => actOn(nft)}
                      class="relative w-0 flex-1 inline-flex items-center
                      justify-center pb-4 text-sm text-gray-700 dark:text-gray-300 font-medium
                      border border-transparent rounded-br-lg
                      hover:text-gray-500">
                      <svg
                        class="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                      </svg>
                      <span class="text-xs md:text-base ml-3">Index It</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</WalletAccess>
