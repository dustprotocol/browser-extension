[![dust-defi](https://img.shields.io/badge/dust--defi-js-blueviolet)](https://docs.dust.llc/docs/developers/js_libraries/#dustjs)
![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
[![npm](https://img.shields.io/npm/v/@dust-defi/extension-dapp?logo=npm&style=flat-square)](https://www.npmjs.com/package/@dust-defi/extension-dapp)

# dust.llc wallet extension

A very simple scaffolding browser extension that injects a [@polkadot/api](https://github.com/polkadot-js/api) Signer into a page, along with any associated accounts, allowing for use by any dapp. This is an extensible POC implementation of a Polkadot/Substrate browser signer. To support both

As it stands, it does one thing: it _only_ manages accounts and allows the signing of transactions with those accounts. It does not inject providers for use by dapps at this early point, nor does it perform wallet functions where it constructs and submits txs to the network.

## Installation

- On Chrome, install via [Chrome web store](https://chrome.google.com/webstore/detail/dustjs-extension/mjgkpalnahacmhkikiommfiomhjipgjn)
- On Firefox, install via [Firefox add-ons](https://addons.mozilla.org/en-US/firefox/addon/dust-js-extension/)

## Usage
To install the component, do `yarn add @dust-defi/extension-dapp`.

```js
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@dust-defi/extension-dapp';
const { Provider } = require("@dust-defi/evm-provider");
const { WsProvider } = require("@polkadot/api");

// returns an array of all the injected sources
// (this needs to be called first, before other requests)
const allInjected = await web3Enable('my cool dapp');

// returns an array of { address, meta: { name, source } }
// meta.source contains the name of the extension that provides this account
const allAccounts = await web3Accounts();

// the address we use to use for signing, as injected
const SENDER = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

// finds an injector for an address
const injector = await web3FromAddress(SENDER);

// connect to the testnet Dust node
const URL = "wss://rpc-testnet.dustscan.com/ws ";
const provider = new Provider({
  provider: new WsProvider(URL),
});
const api = provider.api;
await api.isReady;

// sign and send our transaction - notice here that the address of the account
// (as retrieved injected) is passed through as the param to the `signAndSend`,
// the API then calls the extension to present to the user and get it signed.
// Once complete, the api sends the tx + signature via the normal process
api.tx.balances
  .transfer('5C5555yEXUcmEJ5kkcCMvdZjUo7NGJiQJMS7vZXEeoMhj3VQ', 123456)
  .signAndSend(SENDER, { signer: injector.signer }, (status) => { ... });
```

## Documentation and examples
A single file example (React) on how to use the extension can be seen in [ui-examples repo](https://github.com/dust-defi/ui-examples/blob/master/packages/example-react/src/index.tsx#L165).

To find out more about how to use the extension as a Dapp developer, cookbook, as well as answers to most frequent questions in the [Polkadot-js extension documentation](https://polkadot.js.org/docs/extension/)


## Transition from/support both `polkadot.js`/`dust.io wallet` extensions
It is possible to support both `dust.io wallet` as well as `polkadot.js` extension in your app. As long as you request the source extension of the injected account, the correct extension will be used to sign the transaction.

### Change to `@dust-defi` dependencies
If you use `@polkadot/extension-dapp` dependencies, change them to `@dust-defi/extension-dapp` dependencies:

1. change `@polkadot/extension-dapp` to `"@dust-defi/extension-dapp":"^"` in your `package.json`.
2. call 'yarn
3. change the imports to `@dust-defi/extension*` wherever you use the imports from `@polkadot/extension*`.

### Use `web3FromSource` to find the source extension for signing.

1. check where the extension signer is used. This is most likely where `Signer` is imported from `@dust-defi/evm-provider`.
2. the signer for the account should be acquired dynamically. You have 2 options:

  1. Change it to use `web3FromAddress(address: string)`:

  ```
    import { web3FromAddress } from "@dust-defi/extension-dapp";
    const injector = await web3FromAddress('5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE');
  ```

  as shown above.

  2. Or use `web3FromSource` call, which accepts the extension's name, which can be found in the `meta` field:

  ```js
  import { web3FromSource } from "@dust-defi/extension-dapp";
  import { keyring } from "@polkadot/ui-keyring";

    const getAccountSigner = async (accountId: string) => {
      let signer;
      const pair = keyring.getPair(accountId);
      const meta = (pair && pair.meta) || {};
      await web3FromSource(meta.source as string)
	.catch((): null => null)
	.then((injected) => (signer = injected?.signer))
	.catch(console.error);
      return signer;
    };
  ```

  where `accountId` is the account address. If you do not have `keyring` loaded, use the `injectedAccounts` array obtained from `web3Accounts`, e.g.

  ```js
  import { web3Accounts } from '@dust-defi/extension-dapp';

  await injectedPromise
    .then(() => web3Accounts())
    .then((accounts) =>
	  accounts.map(
	    ({ address, meta }, whenCreated): InjectedAccountExt => ({
		  address,
		  meta: {
		    ...meta,
		    name: `${meta.name || 'unknown'} (${meta.source})`,
		    whenCreated
		  }
	    })
	  )
    )
    .then((accounts) => {
	  setInjectedAccounts(accounts);
    })
  ```

`accountSigner` can then be used in [`evm-provider`](https://github.com/dust-defi/evm-provider.js/commits/master) Signer to sign the messages, and the correct extension is used.

## Development version

Steps to build the extension and view your changes in a browser:

1. Build via `yarn build` or `yarn watch`
2. Install the extension
  - Chrome:
    - go to `chrome://extensions/`
    - ensure you have the Development flag set
    - "Load unpacked" and point to `packages/extension/build`
    - if developing, after making changes - refresh the extension
  - Firefox:
    - go to `about:debugging#addons`
    - check "Enable add-on debugging"
    - click on "Load Temporary Add-on" and point to `packages/extension/build/manifest.json`
    - if developing, after making changes - reload the extension
3. When visiting `console.dustscan.com` it will inject the extension

Once added, you can create an account (via a generated seed) or import via an existing seed. The [console UI](https://console.dustscan.com), when loaded, will show these accounts as `<account name> (extension)`

## Development

The repo is split into a number of packages -

- [extension](packages/extension/) - All the injection and background processing logic (the main entry)
- [extension-ui](packages/extension-ui/) - The UI components for the extension, to build up the popup
- [extension-dapp](packages/extension-dapp/) - A convenience wrapper to work with the injected objects, simplifying data extraction for any dapp that wishes to integrate the extension (or any extension that supports the interface)
- [extension-inject](packages/extension-inject/) - A convenience wrapper that allows extension developers to inject their extension for use by any dapp

## Dapp developers

The actual in-depth technical breakdown is given in the next section for any dapp developer wishing to work with the raw objects injected into the window. However, convenience wrappers are provided that allows for any dapp to use this extension (or any other extension that conforms to the interface) without having to manage any additional info.

The documentation for Dapp development is available [in the polkadot-js doc](https://polkadot.js.org/docs/extension).

This approach is used to support multiple external signers in for instance [apps](https://github.com/polkadot-js/apps/). You can read more about the convenience wrapper [@polkadot/extension-dapp](packages/extension-dapp/) along with usage samples.

## API interface

The extension injection interfaces are generic, i.e. it is designed to allow any extension developer to easily inject extensions (that conforms to a specific interface) and at the same time, it allows for any dapp developer to easily enable the interfaces from multiple extensions at the same time. It is not an all-or-nothing approach, but rather it is an ecosystem where the user can choose which extensions fit their style best.

From a dapp developer perspective, the only work needed is to include the [@dust-defi/extension-dapp](packages/extension-dapp/) package and call the appropriate enabling function to retrieve all the extensions and their associated interfaces.

From an extension developer perspective, the only work required is to enable the extension via the razor-thin [@dust-defi/extension-inject](packages/extension-inject/) wrapper. Any dapp using the above interfaces will have access to the extension via this interface.

When there is more than one extension, each will populate an entry via the injection interface and each will be made available to the dapp. The `Injected` interface, as returned via `enable`, contains the following information for any compliant extension -

```js
interface Injected {
  // the interface for Accounts, as detailed below
  readonly accounts: Accounts;
  // the standard Signer interface for the API, as detailed below
  readonly signer: Signer;
  // not injected as of yet, subscribable provider for polkadot-js API injection,
  // this can be passed to the API itself upon construction in the dapp
  // readonly provider?: Provider
}

interface Account = {
  // ss-58 encoded address
  readonly address: string;
  // the genesisHash for this account (empty if applicable to all)
  readonly genesisHash?: string;
  // (optional) name for display
  readonly name?: string;
};

// exposes accounts
interface Accounts {
  // retrieves the list of accounts for right now
  get: () => Promise<Account[]>;
  // (optional) subscribe to all accounts, updating as they change
  subscribe?: (cb: (accounts: Account[]) => any) => () => void
}

// a signer that communicates with the extension via sendMessage
interface Signer extends SignerInterface {
  // no specific signer extensions, exposes the `sign` interface for use by
  // the polkadot-js API, confirming the Signer interface for this API
}
```

## Injection information

The information contained in this section may change and evolve. It is therefore recommended that all access is done via the [@dust-defi/extension-dapp](packages/extension-dapp/) (for dapps) and [@dust-defi/extension-inject](packages/extension-inject/) (for extensions) packages, which removes the need to work with the lower-level targets.

The extension injects `injectedWeb3` into the global `window` object, exposing the following: (This is meant to be generic across extensions, allowing any dapp to utilize multiple signers, and pull accounts from multiples, as they are available.)

```js
window.injectedWeb3 = {
  // this is the name for this extension, there could be multiples injected,
  // each with their own keys, here `dust` is for this extension
  'dust': {
    // semver for the package
    version: '0.1.0',

    // this is called to enable the injection, and returns an injected
    // object containing the accounts, signer and provider interfaces
    // (or it will reject if not authorized)
    enable (originName: string): Promise<Injected>
  },
  // original `polkadot-js` extension is also injected if available
  'polkadot-js': {
    version: '0.1.0',
    enable (originName: string): Promise<Injected>
  }
}
```

## Mnemonics, Passwords, and Imports/Exports

### Using the mnemonic and password from the extension

When you create a keypair via the extension, it supplies a 12-word mnemonic seed and asks you to create a password. This password only encrypts the private key on disk so that the password is required to spend funds in `console.dustscan.com` or to import the account from backup. The password does not protect the mnemonic phrase. That is, if an attacker were to acquire the mnemonic phrase, they would be able to use it to spend funds without the password.

### Importing mnemonics from other key generation utilities

Some key-generation tools, e.g. [Subkey](https://www.substrate.io/kb/integrate/subkey), support hard and soft key derivation as well as passwords that encrypt the mnemonic phrase such that the mnemonic phrase itself is insufficient to spend funds.

The extension supports these advanced features. When you import an account from a seed, you can add these derivation paths or password to the end of the mnemonic in the following format:

```
<mnemonic phrase>//<hard>/<soft>///<password>
```

That is, hard-derivation paths are prefixed with `//`, soft paths with `/`, and the password with `///`.

The extension will still ask you to enter a password for this account. As before, this password only encrypts the private key on disk. It is not required to be the same password as the one that encrypts the mnemonic phrase.

Accounts can also be derived from existing accounts – `Derive New Account` option in account's dropdown menu should be selected. After providing the password of the parent account, along with name and password of the derived account, enter derivation path in the following format:

```
//<hard>/<soft>
```

The path will be added to the mnemonic phrase of the parent account.
