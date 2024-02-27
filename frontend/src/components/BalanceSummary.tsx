import React, { useContext } from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'

import useLedgerBalance from '../api/hooks/useLedgerBalance'
import useSafeBalance from '../api/hooks/useSafeBalance'
import isTestnet from '../utils/isTestnet'
import { GnosisSafeContext } from '../contexts'
import { TopContentData } from './TopContent'
import { formatEUSD } from '../utils/mcNetworkTokens'
import { EUSDIcon } from './icons'
import CopyableField from './CopyableField'

export default function BalanceSummary({
  totalUnauditedDeposits,
  totalUnauditedBurns,
}: TopContentData) {
  const ledgerBalance = useLedgerBalance()
  const { mainBalance, hasOtherBalance } = useSafeBalance()
  const gnosisSafeConfig = useContext(GnosisSafeContext)

  const safeAddressNet = isTestnet() ? 'sep' : 'eth'

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      justifyContent="space-between"
      sx={{ paddingTop: 2, paddingBottom: 2 }}
    >
      <Box width="100%">
        <CopyableField
          copy={false}
          abbreviate={false}
          text="Assets in custody"
          link={`https://app.safe.global/${safeAddressNet}:${gnosisSafeConfig?.safeAddr}/balances`}
        />
        <Box display="flex" sx={{ marginBottom: 6 }} alignItems="center">
          <EUSDIcon pxSize={36} />
          <Typography variant="h3" sx={{ marginLeft: '20px' }}>
            {mainBalance}
          </Typography>
          {hasOtherBalance && (
            <Tooltip title="The safe currently contains additional non-eUSD assets. Visit safe for more details">
              <ErrorIcon color="warning" />
            </Tooltip>
          )}
        </Box>
        <Box width="100%" display="flex">
          <Box marginRight={2} display="flex" alignItems="flex-start">
            <Typography
              color="textSecondary"
              variant="body2"
              sx={{ marginLeft: 1 }}
            >
              eUSD
            </Typography>
          </Box>
          <Box width="100%">
            <Box
              display="flex"
              justifyContent={'space-between'}
              width="100%"
              marginBottom={1}
            >
              <Typography color="textSecondary" variant="body2">
                on the MobileCoin network
              </Typography>
              <Typography variant="body2">
                {ledgerBalance?.totalSupply}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent={'space-between'}
              width="100%"
              marginBottom={1}
            >
              <Typography color="textSecondary" variant="body2">
                waiting to be minted
              </Typography>
              <Typography variant="body2">
                {formatEUSD(totalUnauditedDeposits)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent={'space-between'} width="100%">
              <Typography color="textSecondary" variant="body2">
                waiting to be unwrapped
              </Typography>
              <Typography variant="body2">
                {formatEUSD(totalUnauditedBurns)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
