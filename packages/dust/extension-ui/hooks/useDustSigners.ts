import { Provider } from '@dust-defi/evm-provider';
import { AccountJson } from '@dust-defi/extension-base/background/types';
import Signer from '@dust-defi/extension-base/page/Signer';
import { sendMessage } from '@dust-defi/extension-ui/messaging';
import { DustSigner } from '@dust-defi/react-lib';
import { useEffect, useState } from 'react';

import { toDustSigner } from '../state/util';

const injectionSigner = new Signer(sendMessage);

export const useDustSigners = (accounts: AccountJson[] | null, provider: Provider|undefined): DustSigner[] => {
  const [signers, setSigners] = useState<DustSigner[]>([]);

  useEffect((): void => {
    const initAsync = async (): Promise<void> => {
      if (!accounts || !accounts?.length || !provider) {
        setSigners([]);

        return;
      }

      const sgnrs: any[] = await Promise.all<DustSigner|undefined>(accounts?.map((acc: AccountJson) => toDustSigner(acc, provider, injectionSigner)));

      setSigners(sgnrs.filter((s) => !!s));
    };

    initAsync();
  }, [accounts, provider]);

  return signers;
};
