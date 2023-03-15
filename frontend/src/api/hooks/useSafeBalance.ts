import { useState, useEffect, useContext } from 'react'

import { getGnosisSafeBalance, sumGnosisSafeBalance } from '../apiHandler'
import { GnosisSafeContext } from '../../contexts'
import { eUSDTokenAddress } from '../../utils/ercTokens'
import { formatNumber } from '../../utils/mcNetworkTokens'

export default function useSafeBalance(): string | null {
  const gnosisSafeConfig = useContext(GnosisSafeContext)
  const [mainBalance, setMainBalance] = useState<string | null>(null)

  useEffect(() => {
    const getBalance = async () => {
      if (!gnosisSafeConfig) {
        return
      }
      const balances = await getGnosisSafeBalance(gnosisSafeConfig.safeAddr)
      const eUSDBalance = balances.find(
        (balance) => balance.tokenAddress === eUSDTokenAddress
      )

      if (!eUSDBalance) {
        return
        // TODO handle this error state
      }
      const formattedBalance = formatNumber(
        Number(eUSDBalance.balance) / 10 ** eUSDBalance.token.decimals
      )
      // TODO handle testnet
      // // if we didn't find a balance of our target token, fall back to summing transfers
      // // (this is necessary for testnet currently as the goerli Safe doesn't grok the goerli eUSD)
      // const sumBalance = await sumGnosisSafeBalance(gnosisSafeConfig.safeAddr)
      // setSafeSumBalance(sumBalance)

      setMainBalance(formattedBalance)
    }
    getBalance()
  }, [gnosisSafeConfig])

  return mainBalance ?? null
}
