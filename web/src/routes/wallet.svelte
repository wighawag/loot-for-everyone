<script lang="ts">
  import WalletAccess from '$lib/WalletAccess.svelte';
  import NavButton from '$lib/components/navigation/NavButton.svelte';
  import {nftsof} from '$lib/stores/nftsof';
  import {wallet, flow, chain} from '$lib/stores/wallet';
  import {page} from '$app/stores';
  import {goto} from '$app/navigation';
  import { url } from '$lib/utils/url';

  let walletAddress: string = undefined;
  //TODO
  $: {

    walletAddress = ($page.path && typeof location !== "undefined") ? location.hash.substr(1): undefined
    console.log({path: $page.path, walletAddress, locationHash: typeof location !== "undefined" && location.hash});
  }

  $: {
    if ($wallet.address && !walletAddress) {
      console.log('redirect');
      goto(url(`wallet#${$wallet.address}`), {replaceState: true}).then(() => {
        walletAddress = ($page.path && typeof location !== "undefined") ? location.hash.substr(1): undefined
      })
    }
  }

  $: isWalletOwner =
    $wallet.address &&
    walletAddress &&
    $wallet.address.toLowerCase() === walletAddress.toLowerCase();

  $: nfts = nftsof(walletAddress);

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
          <p>find one <a href="/" class="underline">here</a></p>
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
