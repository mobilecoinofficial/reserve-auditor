export type TAuditedBurn = {
  audited: {
    id?: number
    burnTxOutId: number
    gnosisSafeWithdrawalId: number
  }
  burn: TBurn
  withdrawal: TWithdrawal
}

export type TBurn = {
  id?: number
  blockIndex: number
  blockTimestamp: string
  tokenId: number
  amount: number
  publicKeyHex: string
  protobuf: number[]
}

export type TWithdrawal = {
  id?: number
  ethTxHash: string
  ethBlockNumber: number
  executionDate: string
  safeAddr: string
  tokenAddr: string
  toAddr: string
  amount: number
  mcTxOutPublicKeyHex: string
}

export type TUnauditedBurn = {
  burn: TBurn
  decodedBurnMemoBytes: number[]
}
