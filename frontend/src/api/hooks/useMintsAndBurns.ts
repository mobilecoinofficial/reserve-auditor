import { useState, useEffect } from 'react'
import { sortBy } from 'lodash'

import { TAuditedBurn, TAuditedMint } from '../../types'
import {
  getAuditedMints,
  getAuditedBurns,
  getUnauditedSafeDeposits,
  getUnauditedBurns,
  getUnauditedWithdrawals,
  getUnauditedMints,
} from '../apiHandler'

// Punting the pagination issue for now.
// We want to show audited mints and burns in the same table,
// but they have separate endpoints, each with their own pagination,
// and combined pagination would be messy. We're not expecting to have more
// than a few hundred mints or burns any time soon, so I'm just gonna set a high
// limit and we can deal with actual pagination when we need to.
export default function useMintsAndBurns() {
  const [auditedData, setAuditedData] = useState<
    Array<TAuditedMint | TAuditedBurn>
  >([])

  // TODO: handle unaudited data
  useEffect(() => {
    const fetchData = async () => {
      const [
        auditedMints,
        auditedBurns,
        unauditedMints,
        unauditedBurns,
        unauditedWithdrawals,
        unauditedSafeDeposits,
      ] = await Promise.all([
        getAuditedMints(),
        getAuditedBurns(),
        getUnauditedMints(),
        getUnauditedBurns(),
        getUnauditedWithdrawals(),
        getUnauditedSafeDeposits(),
      ])
      console.log(auditedMints)

      setAuditedData(processAuditedData(auditedMints, auditedBurns))
    }
    fetchData()
  }, [])
  return auditedData
}

function processAuditedData(
  mints: TAuditedMint[],
  burns: TAuditedBurn[]
): Array<TAuditedMint | TAuditedBurn> {
  const combined: Array<TAuditedMint | TAuditedBurn> = [...mints, ...burns]
  return sortBy(combined, (mb) => {
    if ('mint' in mb) {
      return mb.mint.blockIndex
    }
    if ('burn' in mb) {
      return mb.burn.blockIndex
    }
  })
}
