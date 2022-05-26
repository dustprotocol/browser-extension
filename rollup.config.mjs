// Copyright 2017-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createBundle } from '@dust-defi/dev/config/rollup';
import path from 'path';

const pkgs = ['@dust-defi/extension-dapp'];

const external = [
  ...pkgs,
  '@dust-defi/networks',
  '@dust-defi/util',
  '@dust-defi/util-crypto'
];

const entries = [
  'extension-base',
  'extension-chains',
  'extension-inject'
].reduce(
  (all, p) => ({
    ...all,
    [`@dust-defi/${p}`]: path.resolve(process.cwd(), `packages/${p}/build`)
  }),
  {}
);

const overrides = {};

export default pkgs.map((pkg) => {
  const override = overrides[pkg] || {};

  return createBundle({
    external,
    pkg,
    ...override,
    entries: {
      ...entries,
      ...(override.entries || {})
    }
  });
});
