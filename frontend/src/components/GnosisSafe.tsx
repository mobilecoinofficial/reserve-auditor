import { Box, Link, Tooltip, Typography } from '@mui/material'
import React, { FC, useContext, useEffect, useState } from 'react'
import { getGnosisSafeBalance, sumGnosisSafeBalance } from '../api/apiHandler'
import { GnosisSafeContext } from '../contexts'

let gnosis_net = 'eth' // default to a safe on the eth main network
if (typeof MC_NETWORK !== 'undefined') {
  if (MC_NETWORK == 'testnet') {
    gnosis_net = 'gor' // the testnet bridge uses the goerli eth test network
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

  const [safeBalances, setSafeBalances] = useState()
  const [safeSumBalance, setSafeSumBalance] = useState()

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
        setSafeBalances(balances)
      } else {
        // if we didn't find a balance of our target token, fall back to summing transfers
        // (this is necessary for testnet currently as the goerli Safe doesn't grok the goerli eUSD)
        const sumBalance = await sumGnosisSafeBalance(gnosisSafeConfig.safeAddr)
        setSafeSumBalance(sumBalance)
      }
    }
    getBalance()
  }, [gnosisSafeConfig])

  const tokenBalanceStrings = []
  let runningBalance = 0
  let runningSymbols = ''
  let balanceBlock = ''

  if (safeBalances !== undefined) {
    // iterate over the various token balances in the Safe to sum them for display while also
    // preparing to display the itemized details
    safeBalances.forEach((balance) => {
      if (balance !== undefined) {
        if (balance.tokenAddress !== null) {
          const thisBalance =
            Number(balance.balance) / 10 ** Number(balance.token.decimals)
          runningBalance += thisBalance
          tokenBalanceStrings.push(
            balance.token.symbol +
              ': ' +
              thisBalance.toLocaleString(locale, localeOptions)
          )
          if (balanceBlock != '') {
            balanceBlock += ','
          }
          balanceBlock +=
            ' ' +
            balance.token.symbol +
            ': ' +
            thisBalance.toLocaleString(locale, localeOptions)
          if (runningSymbols == '') {
            runningSymbols += ' '
          } else {
            runningSymbols += '+'
          }
          runningSymbols += balance.token.symbol
        }
      }
    })
    if (tokenBalanceStrings.length == 1) {
      // No need to itemize the backing tokens when there is only 1 kind
      balanceBlock = <br />
    }
  } else if (safeSumBalance !== undefined) {
    // Alternate way of calculating the Safe balance for use on testnet as the testnet
    // erc20s are not recognized by getGnosisSafeBalance
    runningBalance = safeSumBalance / 10 ** gnosisSafeConfig.tokens[0].decimals
    runningSymbols = ' ' + gnosisSafeConfig.tokens[0].name
    tokenBalanceStrings.push(
      gnosisSafeConfig.tokens[0].name +
        ': ' +
        runningBalance.toLocaleString(locale, localeOptions)
    )
    balanceBlock = <br />
  }

  const totalBalanceString =
    runningBalance.toLocaleString(locale, localeOptions) + runningSymbols

  return gnosisSafeConfig ? (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>Gnosis Safe Summary</Typography>
      {tokenBalanceStrings ? (
        <Typography>
          Amount Locked: {totalBalanceString}
          <br />
          {balanceBlock}
        </Typography>
      ) : (
        <Typography>loading...</Typography>
      )}
      {/* <Typography>&nbsp;</Typography> */}
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
