import { Box, Link, Tooltip, Typography } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import { getGnosisSafeBalance } from '../api/apiHandler'
import { GnosisSafeContext } from '../contexts'
import { TGnosisSafeUsdBalanceResponse } from '../types'

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
  const [token, setToken] = useState<TGnosisSafeUsdBalanceResponse>()
  useEffect(() => {
    const getBalance = async () => {
      if (!gnosisSafeConfig) {
        return
      }
      const balances = await getGnosisSafeBalance(gnosisSafeConfig.safeAddr)
      const token = balances.find(
        (balance) => balance.token?.symbol === gnosisSafeConfig.tokens[0].name
      )
      setToken(token)
    }
    getBalance()
  }, [gnosisSafeConfig])
  return gnosisSafeConfig ? (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>Gnosis Safe Summary</Typography>
      {token ? (
        <Typography>
          Amount Locked:{' '}
          {(
            Number(token.balance) /
            10 ** gnosisSafeConfig.tokens[0].decimals
          ).toLocaleString(locale, localeOptions)}{' '}
          {token.token.symbol}
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
            href={`https://app.safe.global/eth:${gnosisSafeConfig.safeAddr}/balances`}
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
