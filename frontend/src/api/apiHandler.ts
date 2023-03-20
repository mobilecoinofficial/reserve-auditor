import axios from 'axios'
import _transform from 'lodash/transform'
import _isArray from 'lodash/isArray'
import _camelCase from 'lodash/camelCase'
import _isObject from 'lodash/isObject'
import {
  TAuditedBurnResponse,
  TAuditedMintResponse,
  TAuditedBurn,
  TAuditedMint,
  TMint,
  TWithdrawal,
  TGnosisSafeUsdBalanceResponse,
  TGnosisSafeAllTransactionsListResponse,
  TLedgerBalance,
  TLedgerBalanceResponse,
  TGnosisSafeConfigResponse,
  TGnosisSafeConfig,
  TUnauditedBurn,
  TUnauditedSafeDeposit,
} from '../types'

declare let AUDITOR_URL: string // env var set by webpack
declare let GNOSIS_SAFE_API_URL: string // env var set by webpack

const get = async <T>(
  path: string,
  url?: string,
  params?: Record<string, any>
): Promise<T> => {
  if (!url) {
    url = AUDITOR_URL
  }
  const response = await axios.get(url + path, {
    params,
  })
  if (response.status >= 400) {
    console.error(
      `api failure: GET to ${path} responded with ${response.status}`
    )
  }
  return response.data as T
}

const camelCaseKeys = (
  jsonResponse: Record<string, any>
): Record<string, any> => {
  return _transform(jsonResponse, (acc, value, key, target) => {
    const camelKey = _isArray(target) ? key : _camelCase(key)

    acc[camelKey] = _isObject(value) ? camelCaseKeys(value) : value
  })
}

export const getUnauditedBurns = async (): Promise<TUnauditedBurn[]> => {
  const response = await get<TAuditedMintResponse>(`/unaudited_burn_tx_outs`)
  return camelCaseKeys(response) as TUnauditedBurn[]
}

export const getUnauditedSafeDeposits = async (): Promise<
  TUnauditedSafeDeposit[]
> => {
  const response = await get<TAuditedMintResponse>(`/unaudited_gnosis_deposits`)
  return camelCaseKeys(response) as TUnauditedSafeDeposit[]
}

export const getAuditedMints = async (): Promise<TAuditedMint[]> => {
  const response = await get<TAuditedMintResponse>(
    `/audited_mints?offset=${0}&limit=${300}`
  )
  return camelCaseKeys(response) as TAuditedMint[]
}

export const getAuditedBurns = async (): Promise<TAuditedBurn[]> => {
  const response = await get<TAuditedBurnResponse>(
    `/audited_burns?offset=${0}&limit=${300}`
  )
  return camelCaseKeys(response) as TAuditedBurn[]
}

export const getGnosisSafeBalance = async (
  address: string
): Promise<TGnosisSafeUsdBalanceResponse[]> => {
  return await get<TGnosisSafeUsdBalanceResponse[]>(
    `/api/v1/safes/${address}/balances`,
    GNOSIS_SAFE_API_URL
  )
}

export const sumGnosisSafeBalance = async (
  address: string
): Promise<string> => {
  const response = await get<TGnosisSafeAllTransactionsListResponse>(
    `/api/v1/safes/${address}/all-transactions`,
    GNOSIS_SAFE_API_URL
  )
  const transfers = response.results.filter((e) => {
    if (e.transfers.length == 1) return true
  })
  const deposits = transfers
    .filter((e) => {
      if (e.transfers[0].to == address) return true
    })
    .map((e) => {
      return e.transfers[0].value
    })
    .reduce((partialSum, v) => {
      return partialSum + BigInt(v)
    }, BigInt('0'))
  const withdrawals = transfers
    .filter((e) => {
      if (e.transfers[0].from == address) return true
    })
    .map((e) => {
      return e.transfers[0].value
    })
    .reduce((partialSum, v) => {
      return partialSum + BigInt(v)
    }, BigInt('0'))
  return (deposits - withdrawals).toString()
}

export const getGnosisSafeConfig = async (): Promise<TGnosisSafeConfig> => {
  const response = await get<TGnosisSafeConfigResponse>(`/gnosis_safe_config`)
  return camelCaseKeys(response.config) as TGnosisSafeConfig
}

export const getLedgerBalance = async (
  tokenId: number
): Promise<TLedgerBalance> => {
  const response = await get<TLedgerBalanceResponse>(
    `/ledger_balance?token_id=${tokenId}`
  )
  return camelCaseKeys(response) as TLedgerBalance
}

// TODO: remove fake handlers

// export const getUnauditedWithdrawals = async (): Promise<TWithdrawal[]> => {
//   const response = await get<TWithdrawal[]>('/unaudited_withdrawals')

//   return camelCaseKeys(response) as TWithdrawal[]
// }

// export const getUnauditedMints = async (): Promise<TMint[]> => {
//   const response = await get<TMint[]>('/unaudited_mints')

//   return camelCaseKeys(response) as TMint[]
// }

export const getUnauditedWithdrawals = async (): Promise<TWithdrawal[]> => {
  return Promise.resolve([
    {
      id: 45,
      ethTxHash: '12dsfsdfsdf4sdfsdf3q23sdf',
      ethBlockNumber: 1234455,
      safeAddr: 'someSafeaddr',
      tokenAddr: 'sometokenaddr',
      toAddr: 'targetAddr',
      amount: 420000000,
      mcTxOutPublicKeyHex: 'pubkeyhex',
    },
    {
      id: 46,
      ethTxHash: '1asdasdasd2dsfsdfsdf4sdfsdf3q23sdf',
      ethBlockNumber: 1234489,
      safeAddr: 'someSafeaddr2',
      tokenAddr: 'sometokenaddr2',
      toAddr: 'targetAddr2',
      amount: 42100000000,
      mcTxOutPublicKeyHex: 'pubkeyhex2',
    },
  ])
}

export const getUnauditedMints = async (): Promise<TMint[]> => {
  return Promise.resolve([
    {
      amount: 95503000000,
      blockIndex: 885147,
      id: 3,
      mintConfigId: 2,
      nonceHex:
        '0130d61e5330e52dfccdc74a10055b7cfe8e8ed3e035ebe0925ec51631909f470a00000000000000000000000000000000000000000000000000000000000000',
      protobuf: [
        10, 151, 1, 8, 1, 16, 192, 195, 176, 227, 227, 2, 26, 34, 10, 32, 170,
        46, 138, 159, 93, 109, 59, 181,
      ],
      recipientB58Addr:
        '38vzyUNoFvRCEUSeDP8N7shCeoSDsvjd3X4cqkyw1ZNDXxgHnvoQJ4ouct5FhQrWqSippX9dxCMB5SueXMqQZ4hcvXTH75wqZbA3fBxh7Td',
      tokenId: 1,
      tombstoneBlock: 889931,
    },
  ])
}
