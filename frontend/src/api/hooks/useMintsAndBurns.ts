import { useState, useEffect } from 'react'

import { TAuditedBurn, TAuditedMint } from '../../types'
import {
  getAuditedMints,
  getAuditedBurns,
  getUnauditedSafeDeposits,
  getUnauditedBurns,
  getUnauditedWithdrawals,
  getUnauditedMints,
} from '../apiHandler'

export default function useMintsAndBurns() {
  const [mints, setMints] = useState<TAuditedMint[]>([])
  const [burns, setBurns] = useState<TAuditedBurn[]>([])

  useEffect(() => {
    const fetchData = async () => {
      await fetchMints()
      await fetchBurns()
      const unAuditedSafeDeposits = await getUnauditedSafeDeposits()
      const unAuditedBurns = await getUnauditedBurns()
      const unauditedWithdrawals = await getUnauditedWithdrawals()
      const unauditedMints = await getUnauditedMints()
      console.log(
        unAuditedSafeDeposits,
        unAuditedBurns,
        unauditedWithdrawals,
        unauditedMints
      )
    }
    fetchData()
  }, [])

  const fetchBurns = async () => {
    const newBurns = await getAuditedBurns(0)
    setBurns(burns.concat(newBurns))
    // setBurnPage(burnPage + 1)
  }

  const fetchMints = async () => {
    const newMints = await getAuditedMints(0)
    setMints(mints.concat(newMints))
    // setMintPage(mintPage + 1)
  }

  console.log(mints, burns)
}
