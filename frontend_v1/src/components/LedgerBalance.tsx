import { Box, Typography } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import { getLedgerBalance } from '../api/apiHandler'
import { GnosisSafeContext } from '../contexts'
import { TLedgerBalance } from '../types'

export const LedgerBalance: FC = () => {
  const gnosisSafeConfig = useContext(GnosisSafeContext)

  const precision = 10 ** 6
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
  const [ledgerBalance, setLedgerBalance] = useState<TLedgerBalance>()
  useEffect(() => {
    const getBalance = async () => {
      if (!gnosisSafeConfig) {
        return
      }
      const tokenId = gnosisSafeConfig.tokens[0].tokenId
      const balance = await getLedgerBalance(tokenId)
      setLedgerBalance(balance)
    }
    getBalance()
  }, [gnosisSafeConfig])
  return (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>
        MobileCoin eUSD Summary
      </Typography>
      {ledgerBalance ? (
        <Typography>
          Total Supply:{' '}
          {(
            (ledgerBalance.mintBalance - ledgerBalance.burnBalance) /
              precision || 0
          ).toLocaleString(locale, localeOptions)}{' '}
          eUSD
          <br />
          Minted:{' '}
          {(ledgerBalance.mintBalance / precision || 0).toLocaleString(
            locale,
            localeOptions
          )}{' '}
          eUSD
          <br />
          Burned:{' '}
          {(ledgerBalance.burnBalance / precision || 0).toLocaleString(
            locale,
            localeOptions
          )}{' '}
          eUSD
        </Typography>
      ) : (
        <Typography>loading...</Typography>
      )}
    </Box>
  )
}
