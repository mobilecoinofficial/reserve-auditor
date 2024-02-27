import { useState, useEffect, useContext } from 'react'

import { getGnosisSafeBalance, sumGnosisSafeBalance } from '../apiHandler'
import { GnosisSafeContext } from '../../contexts'
import { eUSDTokenAddress } from '../../utils/ercTokens'
import { formatNumber } from '../../utils/mcNetworkTokens'
import { TGnosisSafeUsdBalanceResponse } from '../../types'
import isTestnet from '../../utils/isTestnet'

export type SafeBalance = {
  mainBalance?: string
  hasOtherBalance: boolean
}

export default function useSafeBalance(): SafeBalance {
  const gnosisSafeConfig = useContext(GnosisSafeContext)
  const [balances, setBalances] = useState<SafeBalance>({
    mainBalance: undefined,
    hasOtherBalance: false,
  })

  useEffect(() => {
    const getBalance = async () => {
      if (!gnosisSafeConfig) {
        return
      }
      let mainBalance
      let hasOtherBalance: boolean

      if (!isTestnet) {
        const balances = await getGnosisSafeBalance(gnosisSafeConfig.safeAddr)
        mainBalance = geteUSDBalance(balances)
        hasOtherBalance = safeHasOtherBalance(balances)
      } else {
        // this is necessary for testnet currently as the sepolia Safe doesn't grok the sepolia eUSD
        const safeSumBalance = await sumGnosisSafeBalance(
          gnosisSafeConfig.safeAddr
        )
        mainBalance = formatNumber(
          Number(safeSumBalance) / 10 ** gnosisSafeConfig.tokens[0].decimals
        )
        hasOtherBalance = false
      }

      setBalances({
        mainBalance,
        hasOtherBalance,
      })
    }
    getBalance()
  }, [gnosisSafeConfig])

  return balances
}

function geteUSDBalance(balances: TGnosisSafeUsdBalanceResponse[]) {
  const eUSDBalance = balances.find(
    (balance) => balance.tokenAddress === eUSDTokenAddress
  )

  if (!eUSDBalance) {
    return
  }

  return formatNumber(
    Number(eUSDBalance.balance) / 10 ** eUSDBalance.token.decimals
  )
}

function safeHasOtherBalance(balances: TGnosisSafeUsdBalanceResponse[]) {
  return Boolean(
    balances.find(
      (balance) =>
        balance.tokenAddress !== eUSDTokenAddress && Number(balance.balance) > 0
    )
  )
}
