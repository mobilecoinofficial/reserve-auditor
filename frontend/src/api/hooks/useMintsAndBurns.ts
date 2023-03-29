import { useState, useEffect } from 'react'
import { sortBy, sumBy } from 'lodash'

import {
  TAuditedBurn,
  TAuditedMint,
  TBurn,
  TMint,
  TUnauditedSafeDeposit,
  TWithdrawal,
} from '../../types'
import {
  getAuditedMints,
  getAuditedBurns,
  getUnauditedSafeDeposits,
  getUnauditedBurns,
  getUnauditedWithdrawals,
  getUnauditedMints,
} from '../apiHandler'
import { TUnauditedBurn } from '../../types/burn'

export type TTableData =
  | TAuditedBurn
  | TAuditedMint
  | TMint
  | TUnauditedBurn
  | TUnauditedSafeDeposit
  | TWithdrawal

// Punting the pagination issue for now.
// We want to show audited mints and burns in the same table,
// but they have separate endpoints, each with their own pagination,
// and combined pagination would be messy. We're not expecting to have more
// than a few hundred mints or burns any time soon, so I'm just gonna set a high
// limit and we can deal with actual pagination when we need to.
export default function useMintsAndBurns() {
  const [sortedData, setSortedData] = useState<TTableData[]>([])
  const [totalUnauditedDeposits, setTotalUnauditedDeposits] =
    useState<number>(0)
  const [totalUnauditedBurns, setTotalUnauditedBurns] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all([
        getAuditedMints(),
        getAuditedBurns(),
        getUnauditedMints(),
        getUnauditedBurns(),
        getUnauditedWithdrawals(),
        getUnauditedSafeDeposits(),
      ])

      const filteredUnauditedBurns = data[3].filter(
        (burn) => burn.burn.tokenId === 1
      )
      data[3] = filteredUnauditedBurns
      setSortedData(sortData(data.flat()))
      setTotalUnauditedDeposits(sumBy(data[5], (dep) => dep.deposit.amount))
      setTotalUnauditedBurns(
        sumBy(filteredUnauditedBurns, (burn) => burn.burn.amount)
      )
    }
    fetchData()
  }, [])
  return {
    sortedData,
    totalUnauditedDeposits,
    totalUnauditedBurns,
  }
}

function sortData(data: TTableData[]): TTableData[] {
  return sortBy(data, (td) => {
    // audited mint
    if ('mint' in td && 'audited' in td) {
      return new Date(td.deposit.executionDate)
    }
    // audited burn
    if ('burn' in td && 'audited' in td) {
      return new Date(td.burn.blockTimestamp)
    }
    // unudited mint
    if ('mintConfigId' in td) {
      return new Date(td.blockTimestamp)
    }
    // unaudited burn
    if ('burn' in td) {
      return new Date(td.burn.blockTimestamp)
    }
    // unaudited deposit
    if ('deposit' in td) {
      return new Date(td.deposit.executionDate)
    }
    // unaudited withdrawal
    if ('executionDate' in td) {
      return new Date(td.executionDate)
    }
    console.warn('No match found for table data sorting field:', td)
  }).reverse()
}
