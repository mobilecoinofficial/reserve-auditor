import { useState, useEffect } from 'react'

import { TAuditedBurn, TAuditedMint } from '../../types'
import {
  getAuditedMints,
  getAuditedBurns,
  getUnauditedSafeDeposits,
  getUnauditedBurns,
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
      console.log(unAuditedSafeDeposits, unAuditedBurns)
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
