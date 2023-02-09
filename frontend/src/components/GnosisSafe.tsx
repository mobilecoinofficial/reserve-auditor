import { Box, Link, Tooltip, Typography } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import { getGnosisSafeBalance, sumGnosisSafeBalance } from '../api/apiHandler'
import { GnosisSafeContext } from '../contexts'
import { TGnosisSafeUsdBalanceResponse } from '../types'

let gnosis_net = 'eth'; // default to a safe on the eth main network
if (typeof MC_NETWORK !== 'undefined') {
  if (MC_NETWORK == 'testnet') {
    gnosis_net = 'gor'; // the testnet bridge uses the goerli eth test network
  }
}

export const GnosisSafe: FC = () => {
  const gnosisSafeConfig = useContext(GnosisSafeContext)

  const locale = 'en-US'
  const localeOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    currency: 'USD',
  }
  const style: React.CSSProperties = {
    padding: 1,
    width: '25vw',
  }
  const noWrapStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenBalance, setTokenBalance] = useState('0')
  useEffect(() => {
    const getBalance = async () => {
      if (!gnosisSafeConfig) {
        return
      }
      const balances = await getGnosisSafeBalance(gnosisSafeConfig.safeAddr)
      const token = balances.find(
        (balance) => balance.token?.symbol === gnosisSafeConfig.tokens[0].name
      )
      if (token !== undefined) {
        setTokenSymbol(token.token.symbol)
        setTokenBalance(token.balance)
      }
      else {
        // if we didn't find a balance of our target token, fall back to summing transfers
        // (this is necessary for testnet currently as the goerli Safe doesn't grok the goerli RSV)
        const balances = await sumGnosisSafeBalance(gnosisSafeConfig.safeAddr)
        setTokenBalance(balances)
        setTokenSymbol(gnosisSafeConfig.tokens[0].name)
      }
    }
    getBalance()
  }, [gnosisSafeConfig])
  return gnosisSafeConfig ? (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>Gnosis Safe Summary</Typography>
      {tokenBalance ? (
        <Typography>
          Amount Locked:{' '}
          {(
            Number(tokenBalance) /
            10 ** gnosisSafeConfig.tokens[0].decimals
          ).toLocaleString(locale, localeOptions)}{' '}
          {tokenSymbol}
        </Typography>
      ) : (
        <Typography>loading...</Typography>
      )}
      <Typography>&nbsp;</Typography>
      <Box sx={noWrapStyle}>
        Safe:{' '}
        <Tooltip
          title={`${gnosisSafeConfig.safeAddr}`}
          placement="bottom"
          arrow
        >
          <Link
            href={`https://app.safe.global/${gnosis_net}:${gnosisSafeConfig.safeAddr}/balances`}
            color="#027cfd"
            underline="hover"
            target="_blank"
          >
            {gnosisSafeConfig.safeAddr}
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
