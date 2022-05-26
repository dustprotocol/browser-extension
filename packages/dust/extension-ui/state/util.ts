import { Provider } from '@dust-defi/evm-provider';
import { AccountJson } from '@dust-defi/extension-base/background/types';
import Signer from '@dust-defi/extension-base/page/Signer';
import { InjectedAccountWithMeta } from '@dust-defi/extension-inject/types';
import { DustSigner, rpc } from '@dust-defi/react-lib';

export function toDustSigner (acc: AccountJson, provider: Provider, injectionSigner: Signer): Promise<DustSigner|undefined> {
  const accWithMeta: InjectedAccountWithMeta = {
    address: acc.address,
    meta: {
      genesisHash: acc.genesisHash,
      name: acc.name,
      source: acc.name || ''
    },
    type: acc.type
  };

  return rpc.metaAccountToSigner(accWithMeta, provider, injectionSigner);
}
