import {wallet, flow} from './wallet';
import {BaseStoreWithData} from '$lib/utils/stores';
import {BigNumber} from '@ethersproject/bignumber';
import {Wallet} from '@ethersproject/wallet';
import {randomTokens} from './randomTokens';
import contractsInfo from '../contracts.json';
import {keccak256} from '@ethersproject/solidity';
import {arrayify} from '@ethersproject/bytes';

type Data = {
  id: string;
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

  async pickup(nft: {id: string}): Promise<void> {
    this.setPartial({step: 'CONNECTING'});
    flow.execute(async (contracts) => {
      this.setPartial({
        data: {id: nft.id},
        step: 'CONFIRM',
      });
    });
  }

  async confirm(): Promise<void> {
    const purchaseFlow = this.setPartial({step: 'WAITING_TX'});
    if (!purchaseFlow.data) {
      throw new Error(`no flow data`);
    }
    flow.execute(async (contracts) => {
      if (!purchaseFlow.data) {
        throw new Error(`no flow data`);
      }

      const tx = await contracts.LootForEveryone.transferFrom(wallet.address, wallet.address, purchaseFlow.data.id);
      this.setPartial({step: 'SUCCESS'});
    });
  }

  private _reset() {
    this.setPartial({step: 'IDLE', data: undefined});
  }
}

export default new PurchaseFlowStore();
