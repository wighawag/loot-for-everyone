<script lang="ts">
  import {base} from '$app/paths';
  import { url } from '$lib/utils/url';
</script>

<div
  class="w-full h-full mx-auto flex text-center flex-col items-center justify-center text-gray-200">

  <h1 class="text-2xl m-8">Loot For Everyone</h1>
  <p class="mx-8 pt-3">
    Loot For Everyone is <a class="underline" href="https://lootproject.com" target="_blank" rel="noreferer">Loot</a> but for everyone. Check your <a class="border-white border-2" href={url('wallet/')}>wallet</a> here and you'll see you already got some loot token!
    Every ethereum address has now some Loot!
  </p>

  <p class="mx-8 pt-3">Note that this uses the exact same items and tokenURI as the original Loot via <a class="underline" href="https://www.lootproject.com/synthloot" target="_blank" rel="noreferer">Synthetic Loot</a></p>

  <p class="mx-8 pt-3">Since every ethereum wallet have some loot you can also pick up Loot by searching for it. Have a look <a class="border-white border-2" href={url('search/')}>here</a>. By the way this is still fully compatible with ERC721 spec.</p>


  <p class="mx-8 pt-3">
    This also means that everybody on earth have now some loot and <span class="text-white font-black">projects planning to integrate with loot can now reach everyone.</span>
  </p>

  <p class="mx-8 pt-3">
    Some of you might wonder, what about the original Loot owner ?
  </p>

  <p class="mx-8 pt-3">Fear not, nobody is forgotten and original Loot owners can always transmute their original Loot into "Loot For Everyone" to get an equivalent token (same tokenId, same items, same tokenURI)</p>
</div>



<div
  class="border-t-2 border-gray-400 mt-16 w-full h-full mx-auto flex text-center flex-col items-center justify-center text-gray-400 ">
  <p class="m-8">
    Note that this project has not been audited and we do not take any responsability of lost loot.
  </p>

  <p class="p-1">
    The source code can be found
    <a
      href="https://github.com/wighawag/loot-for-everyone"
      target="_blank"
      class="underline">here</a>
    and the contract address is
    <a
      href="https://etherscan.io/address/"
      target="_blank"
      class="underline">TODO</a>
  </p>

  <p class="p-1">
    This project was created by
    <a href="https://ronan.eth.link" target="_blank" class="underline">Ronan
      Sandford</a>
    (a.k.a
    <a
      href="https://twitter.com/wighawag"
      target="_blank"
      class="underline">wighawag
      <img
        class="w-4 h-4 inline"
        alt="wighawag"
        src={`${base}images/wig256x256.jpg`} /></a>)
  </p>
</div>
