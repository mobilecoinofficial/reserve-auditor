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
  TGnosisSafeUsdBalanceResponse,
  TLedgerBalance,
  TLedgerBalanceResponse,
  TGnosisSafeConfigResponse,
  TGnosisSafeConfig,
} from '../types'

declare let AUDITOR_URL: string // env var set by webpack
declare let GNOSIS_SAFE_API_URL: string // env var set by webpack

const paginate = (pageNumber: number): Record<string, number> => {
  const offset = pageNumber * 50
  const limit = 50

  return { offset, limit }
}

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

export const getAuditedMints = async (page: number): Promise<TAuditedMint> => {
  const { offset, limit } = paginate(page)
  const response = await get<TAuditedMintResponse>(
    `/audited_mints?offset=${offset}&limit=${limit}`
  )
  return camelCaseKeys(response) as TAuditedMint
}

export const getAuditedBurns = async (page: number): Promise<TAuditedBurn> => {
  const { offset, limit } = paginate(page)
  const response = await get<TAuditedBurnResponse>(
    `/audited_burns?offset=${offset}&limit=${limit}`
  )
  return camelCaseKeys(response) as TAuditedBurn
}

export const getGnosisSafeBalance = async (
  address: string
): Promise<TGnosisSafeUsdBalanceResponse[]> => {
  return await get<TGnosisSafeUsdBalanceResponse[]>(
    `/api/v1/safes/${address}/balances`,
    GNOSIS_SAFE_API_URL
  )
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
