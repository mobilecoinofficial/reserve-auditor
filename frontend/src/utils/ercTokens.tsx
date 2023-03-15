import React from 'react'
import { Tooltip } from '@mui/material'

export const eUSDTokenAddress = '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'

export const ERC_SYMBOLS = {
  '0x196f4727526eA7FB1e17b2071B3d8eAA38486988': 'RSV',
  [eUSDTokenAddress]: 'eUSD',
  '0xeC76FbFD75481839e456C4cb2cd23cda813f19B1':
    'geUSD' /* goerli testnet token */,
}

export function getSymbolFromContactAddress(contactAddress: string) {
  return (
    ERC_SYMBOLS[contactAddress as keyof typeof ERC_SYMBOLS] ?? (
      <Tooltip title="Unknown ERC token">
        <span>?</span>
      </Tooltip>
    )
  )
}
