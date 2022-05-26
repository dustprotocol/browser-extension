// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { selectableNetworks } from '@dust-defi/networks';

export default selectableNetworks.filter((network) => network.hasLedgerSupport);
