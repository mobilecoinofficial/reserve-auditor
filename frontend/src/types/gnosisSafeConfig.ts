export type TGnosisSafeConfig = {
  safes: TAuditedSafe[]
}

export type TAuditedSafe = {
  safeAddr: string
  apiUrl: string
  etherscanUrl: string
  tokens: TAuditedToken[]
  tokenDecimalsMax: number
}

export type TAuditedToken = {
  tokenId: number
  tokenType: string
  ethTokenContractAddr: string
  name: string
  symbol: string
  decimals: number
  logoUri: string
  auxBurnContractAddr: string
  auxBurnFunctionSig: number[]
}
