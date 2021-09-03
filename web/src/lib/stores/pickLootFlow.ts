import {wallet, flow} from './wallet';
import {BaseStoreWithData} from '$lib/utils/stores';
import {BigNumber} from '@ethersproject/bignumber';
import {Wallet} from '@ethersproject/wallet';
import {randomTokens} from './randomTokens';
import {keccak256} from '@ethersproject/solidity';
import {arrayify} from '@ethersproject/bytes';


type Data = {
  id: string;
  privateKey: string;
  currentPrice: BigNumber;
  supply: BigNumber;
};
export type PurchaseFlow = {
  type: 'PURCHASE';
  step:
    | 'IDLE'
    | 'CONNECTING'
    | 'LOADING_CURRENT_PRICE'
    | 'CONFIRM'
    | 'CREATING_TX'
    | 'WAITING_TX'
    | 'SUCCESS';
  data?: Data;
};

class PurchaseFlowStore extends BaseStoreWithData<PurchaseFlow, Data> {
  public constructor() {
    super({
      type: 'PURCHASE',
      step: 'IDLE',
    });
  }

  async cancel(): Promise<void> {
    this._reset();
  }

  async acknownledgeSuccess(): Promise<void> {
    // TODO automatic ?
    this._reset();
  }

  async mint(nft: {id: string; privateKey: string}): Promise<void> {
    this.setPartial({step: 'CONNECTING'});
    flow.execute(async (contracts) => {
      this.setPartial({step: 'WAITING_TX'});
      const account = new Wallet(nft.privateKey);
      const hashedData = keccak256(
        ['string', 'address'],
        ['LootForEveryone', wallet.address]
      );
      const signature = await account.signMessage(arrayify(hashedData));

      const tx = await contracts.LootForEveryone.pickLoot(wallet.address, signature);
      randomTokens.record(nft.id, tx.hash, tx.nonce);
      this.setPartial({step: 'SUCCESS'});
    });
  }

  private _reset() {
    this.setPartial({step: 'IDLE', data: undefined});
  }
}

export default new PurchaseFlowStore();
