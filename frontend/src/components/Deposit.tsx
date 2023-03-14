import { Box, Link, Tooltip, Typography } from '@mui/material'
import React, { FC, useContext } from 'react'
import { GnosisSafeContext } from '../contexts'
import { TDeposit } from '../types'

const ercSymbols = {
  "0x196f4727526eA7FB1e17b2071B3d8eAA38486988": "RSV",
  "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F": "eUSD",
  "0xeC76FbFD75481839e456C4cb2cd23cda813f19B1": "geUSD" /* goerli testnet token */
}

const precision = 10 ** 6
const locale = 'en-US'
const localeOptions = {
  style: 'decimal',
  minimumFractionDigits: 2,
  currency: 'USD',
}

type TProps = {
  deposit: TDeposit
}

declare let ETHERSCAN_URL: string // env var set by webpack

export const Deposit: FC<TProps> = ({ deposit }: TProps) => {
  const gnosisSafeConfig = useContext(GnosisSafeContext)

  const style: React.CSSProperties = {
    borderRadius: 1,
    padding: 1,
    margin: 1,
    boxShadow:
      'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',
    width: '18vw',
  }

  const noWrapStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  return gnosisSafeConfig ? (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>Gnosis Safe Deposit</Typography>
      <Box>
        amount:{' '}
        {(deposit.amount / precision).toLocaleString(locale, localeOptions)}{' '}
        {ercSymbols[deposit.tokenAddr]}
      </Box>
      <Box sx={noWrapStyle}>
        tx hash:{' '}
        <Tooltip title={`${deposit.ethTxHash}`} placement="bottom" arrow>
          <Link
            href={`${ETHERSCAN_URL}/tx/${deposit.ethTxHash}`}
            underline="hover"
            color="#027cfd"
            target="_blank"
          >
            {deposit.ethTxHash}
          </Link>
        </Tooltip>
      </Box>
      <Box sx={noWrapStyle}>
        from:{' '}
        <Tooltip title={`${deposit.fromAddr}`} placement="bottom" arrow>
          <Link
            href={`${ETHERSCAN_URL}/token/${gnosisSafeConfig.tokens[0].ethTokenContractAddr}?a=${deposit.fromAddr}#tokentxns`}
            underline="hover"
            color="#027cfd"
            target="_blank"
          >
            {deposit.fromAddr}
          </Link>
        </Tooltip>
      </Box>
    </Box>
  ) : (
    <Box>
      <Typography>Loading...</Typography>
    </Box>
  )
}
