import { Provider } from '@dust-defi/evm-provider';
import { appState, Components, hooks, DustSigner, TokenWithAmount, utils as dustUtils } from '@dust-defi/react-lib';
import React, { useEffect, useState } from 'react';

import { Loading } from '../uik';
import { SigningOrChildren } from './SigningOrChildren';

export const Transfer = (): JSX.Element => {
  const provider: Provider | undefined = hooks.useObservableState(appState.currentProvider$);
  const accounts: DustSigner[] | undefined = hooks.useObservableState(appState.signers$);
  const selectedSigner: DustSigner | undefined = hooks.useObservableState(appState.selectedSigner$);
  const signerTokenBalances: TokenWithAmount[] | undefined = hooks.useObservableState(appState.tokenPrices$);
  const theme = localStorage.getItem('theme');

  const [token, setToken] = useState<dustUtils.DataWithProgress<TokenWithAmount>>(dustUtils.DataProgress.LOADING);

  useEffect(() => {
    if (dustUtils.isDataSet(signerTokenBalances)) {
      const sigTokens = dustUtils.getData(signerTokenBalances);

      if (sigTokens === null) {
        setToken(dustUtils.DataProgress.NO_DATA);

        return;
      }

      const signerTokenBalance = sigTokens ? sigTokens[0] : undefined;

      if (signerTokenBalance /* && dustUtils.isDataSet(signerTokenBalance.balanceValue) */) {
        const tkn = { ...signerTokenBalance, amount: '', isEmpty: false } as TokenWithAmount;

        setToken(tkn);
      }

      /* if (!isDataSet(signerTokenBalance?.balanceValue) && isDataSet(signerTokens)) {
        const sTkns = getData(signerTokens);
        const sToken = sTkns ? sTkns[0] : undefined;
        if (sToken) {
          const tkn = { ...sToken, amount: '', isEmpty: false } as TokenWithAmount;
          setToken(tkn);
        }
        return;
      } */
      // setToken(signerTokenBalance?.balanceValue as dustUtils.DataProgress);
    }
    // setToken(signerTokenBalances as dustUtils.DataProgress);
    // }, [signerTokenBalances, signerTokens]);
  }, [signerTokenBalances]);

  return (
    <SigningOrChildren>
      {!dustUtils.isDataSet(token) && token === dustUtils.DataProgress.LOADING && <Loading />}
      {!dustUtils.isDataSet(token) && token === dustUtils.DataProgress.NO_DATA &&
      <div>No tokens for transaction.</div>}
      {provider && dustUtils.isDataSet(token) && signerTokenBalances && dustUtils.isDataSet(signerTokenBalances) && selectedSigner && accounts &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.TransferComponent
          accounts={accounts}
          currentAccount={selectedSigner}
          from={selectedSigner}
          provider={provider}
          token={token as TokenWithAmount}
          tokens={signerTokenBalances}
        />
      </div>
      }
    </SigningOrChildren>
  );
};
