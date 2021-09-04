<script lang="ts">
  import '../service-worker-handler';
  import '../global.css';
  import {url} from '$lib/utils/url';
  import NavBar from '$lib/components/navigation/NavBar.svelte';
  import Notifications from '$lib/components/notification/Notifications.svelte';
  import NoInstallPrompt from '$lib/components/NoInstallPrompt.svelte';
  import NewVersionNotification from '$lib/components/NewVersionNotification.svelte';
  // import Install from './components/Install.svelte';

  import {appDescription, url as appUrl} from '../../application.json';
import pickOwnLootFlow from '$lib/stores/pickOwnLootFlow';
import Modal from '$lib/components/Modal.svelte';
import transmuteFlow from '$lib/stores/transmuteFlow';

  const title = 'Loot For Everyone';
  const description = appDescription;
  const host = appUrl.endsWith('/') ? appUrl : appUrl + '/';
  const previewImage = host + 'preview.png';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={host} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={previewImage} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={host} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={previewImage} />
</svelte:head>

<NoInstallPrompt />
<NewVersionNotification />
<Notifications />
<NavBar
  links={[
    {href: url(''), title: 'Home'},
    {href: url('wallet/'), title: 'Wallet'},
    {href: url('search/'), title: 'Search'},
    {href: url('transmute/'), title: 'Transmute'}
  ]} />
<slot />


{#if $pickOwnLootFlow.step !== 'IDLE' && $pickOwnLootFlow.step !== 'SUCCESS'}
  {#if $pickOwnLootFlow.step !== 'CONFIRM'}
    <!-- Taken care by WalletAccess -->
  {:else}
    <Modal on:close={() => pickOwnLootFlow.cancel()}>
      {#if !$pickOwnLootFlow.data}
        Error
      {:else}
        <div class="text-center">
          <h2>It is useful to pickup your own loot, so indexer like marketplace get to know about it</h2>
          <button
            class="mt-5 p-1 border border-yellow-500"
            label="Mint"
            on:click={() => pickOwnLootFlow.confirm()}>
            Confirm
          </button>
        </div>
      {/if}
    </Modal>
  {/if}
{/if}


{#if $transmuteFlow.step !== 'IDLE' && $transmuteFlow.step !== 'SUCCESS'}
  {#if $transmuteFlow.step !== 'CONFIRM'}
    <!-- Taken care by WalletAccess -->
  {:else}
    <Modal on:close={() => transmuteFlow.cancel()}>
      {#if !$transmuteFlow.data}
        Error
      {:else}
        <div class="text-center">
          <h2>Transmuting your original loot into a "Loot For Everyone" equivalent</h2>
          <p>
            This will require a pre-approval transaction first, if not already done.
          </p>
          <button
            class="mt-5 p-1 border border-yellow-500"
            label="Mint"
            on:click={() => transmuteFlow.confirm()}>
            Confirm
          </button>
        </div>
      {/if}
    </Modal>
  {/if}
{/if}
