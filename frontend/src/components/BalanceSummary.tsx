import React, { useContext } from 'react'
import { Box, Typography, Link, Tooltip } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'

import useLedgerBalance from '../api/hooks/useLedgerBalance'
import useSafeBalance from '../api/hooks/useSafeBalance'
import isTestnet from '../utils/isTestnet'
import { GnosisSafeContext } from '../contexts'
import { TopContentData } from './TopContent'

export default function BalanceSummary({
  totalUnauditedDeposits,
  totalUnauditedBurns,
}: TopContentData) {
  const ledgerBalance = useLedgerBalance()
  const { mainBalance, hasOtherBalance } = useSafeBalance()
  const gnosisSafeConfig = useContext(GnosisSafeContext)

  const safeAddressNet = isTestnet() ? 'gor' : 'eth'

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      justifyContent="space-between"
      sx={{ paddingTop: 2, paddingBottom: 2 }}
    >
      <Box width="100%">
        <Typography color="textSecondary">
          eUSD in the{' '}
          <Link
            target="_blank"
            rel="noreferrer"
            href={`https://app.safe.global/${safeAddressNet}:${gnosisSafeConfig?.safeAddr}/balances`}
          >
            Reserve Safe
          </Link>
        </Typography>
        <Box display="flex">
          <Typography variant="h3" sx={{ marginBottom: 2 }}>
            {mainBalance}
          </Typography>
          {hasOtherBalance && (
            <Tooltip title="The safe currently contains additional non-eUSD assets. Visit safe for more details">
              <ErrorIcon color="warning" />
            </Tooltip>
          )}
        </Box>
        <Box
          display="flex"
          justifyContent={'space-between'}
          width="100%"
          marginBottom={1}
        >
          <Typography color="textSecondary">
            - eUSD on the MobileCoin network
          </Typography>
          <Typography>{ledgerBalance?.totalSupply}</Typography>
        </Box>
        <Box
          display="flex"
          justifyContent={'space-between'}
          width="100%"
          marginBottom={1}
        >
          <Typography color="textSecondary">
            - eUSD waiting to be minted
          </Typography>
          <Typography>{totalUnauditedDeposits}</Typography>
        </Box>
        <Box display="flex" justifyContent={'space-between'} width="100%">
          <Typography color="textSecondary">
            - eUSD waiting to be unwrapped
          </Typography>
          <Typography>{totalUnauditedBurns}</Typography>
        </Box>
      </Box>
    </Box>
  )
}
