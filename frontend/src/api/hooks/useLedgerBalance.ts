import { useState, useEffect, useContext } from 'react'

import { getLedgerBalance } from '../apiHandler'
import { TLedgerBalance } from '../../types'
import { GnosisSafeContext } from '../../contexts'
import { formatEUSD } from '../../utils/mcNetworkTokens'

export type LedgerBalance = {
  totalSupply: string
  totalMinted: string
  totalBurned: string
}

export default function useLedgerBalance(): LedgerBalance | null {
  const gnosisSafeConfig = useContext(GnosisSafeContext)
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

  if (!ledgerBalance) {
    return null
  }

  return {
    totalSupply: formatEUSD(
      ledgerBalance.mintBalance - ledgerBalance.burnBalance
    ),
    totalMinted: formatEUSD(ledgerBalance.mintBalance),
    totalBurned: formatEUSD(ledgerBalance.burnBalance),
  }
}
