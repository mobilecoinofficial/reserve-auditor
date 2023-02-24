export type TAuditedMintResponse = {
  audited: {
    id?: number
    mint_tx_id: number
    gnosis_safe_deposit_id: number
  } //pub struct AuditedMint
  mint: {
    id?: number
    block_index: number
    token_id: number
    amount: number
    nonce_hex: string
    recipient_b58_addr: string
    tombstone_block: number
    protobuf: number[]
    mint_config_id?: number
  } //pub struct MintTx
  deposit: {
    id?: number
    eth_tx_hash: string //SqlEthTxHash
    eth_block_number: number
    safe_addr: string //SqlEthAddr
    token_addr: string //SqlEthAddr
    amount: number
    expected_mc_mint_tx_nonce_hex: string
  } //pub struct GnosisSafeDeposit
}

export type TAuditedBurnResponse = {
  audited: {
    id?: number
    burn_tx_out_id: number
    gnosis_safe_withdrawal_id: number
  } //pub struct AuditedBurn
  burn: {
    id?: number
    block_index: number
    token_id: number
    amount: number
    public_key_hex: string
    protobuf: number[]
  } //pub struct BurnTxOut
  withdrawal: {
    id?: number
    eth_tx_hash: string //SqlEthTxHash
    eth_block_number: number
    safe_addr: string //SqlEthAddr
    token_addr: string //SqlEthAddr
    amount: number
    mc_tx_out_public_key_hex: string
  } //pub struct GnosisSafeWithdrawal
}

export type TLedgerBalanceResponse = {
  mint_balance: string
  burn_balance: string
}

// from `GET api/v1/safes/{address}/balances/usd` at https://safe-transaction.gnosis.io/
export type TGnosisSafeUsdBalanceResponse = {
  tokenAddress: string
  token: TErc20Info
  balance: string
  ethValue: string
  timestamp: string
  fiatBalance: string
  fiatConversion: string
  fiatCode: string
}

export type TErc20Info = {
  name: string
  symbol: string
  decimals: number
  logoUri: string
}

export type TGnosisSafeConfigResponse = {
  config: {
    safes: TAuditedSafeResponse[]
  }
}

export type TAuditedSafeResponse = {
  safe_addr: string
  api_url: string
  tokens: TAuditedTokenResponse[]
  token_decimals_max: number
}

export type TAuditedTokenResponse = {
  token_id: number
  token_type: string
  eth_token_contract_addrs: string[]
  name: string
  symbol: string
  decimals: number
  logo_uri: string
  aux_burn_contract_addr: string
  aux_burn_function_sig: number[]
}

export type SafeMultisigConfirmationResponse = {
  readonly owner: string
  readonly submissionDate: string
  readonly transactionHash?: string
  readonly confirmationType?: string
  readonly signature: string
  readonly signatureType?: string
}

export type SafeMultisigTransactionResponse = {
  readonly safe: string
  readonly to: string
  readonly value: string
  readonly data?: string
  readonly operation: number
  readonly gasToken: string
  readonly safeTxGas: number
  readonly baseGas: number
  readonly gasPrice: string
  readonly refundReceiver?: string
  readonly nonce: number
  readonly executionDate: string
  readonly submissionDate: string
  readonly modified: string
  readonly blockNumber?: number
  readonly transactionHash: string
  readonly safeTxHash: string
  readonly executor?: string
  readonly isExecuted: boolean
  readonly isSuccessful?: boolean
  readonly ethGasPrice?: string
  readonly gasUsed?: number
  readonly fee?: number
  readonly origin: string
  readonly dataDecoded?: string
  readonly confirmationsRequired: number
  readonly confirmations?: SafeMultisigConfirmationResponse[]
  readonly signatures?: string
}

export type TokenInfoResponse = {
  readonly type?: string
  readonly address: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly logoUri?: string
}

export type TransferResponse = {
  readonly type?: string
  readonly executionDate: string
  readonly blockNumber: number
  readonly transactionHash: string
  readonly to: string
  readonly value: string
  readonly tokenId: string
  readonly tokenAddress?: string
  readonly from: string
}

export type TransferWithTokenInfoResponse = TransferResponse & {
  readonly tokenInfo: TokenInfoResponse
}

export type SafeModuleTransaction = {
  readonly created?: string
  readonly executionDate: string
  readonly blockNumber?: number
  readonly isSuccessful?: boolean
  readonly transactionHash?: string
  readonly safe: string
  readonly module: string
  readonly to: string
  readonly value: string
  readonly data: string
  readonly operation: number
  readonly dataDecoded?: string
}

export type SafeModuleTransactionWithTransfersResponse =
  SafeModuleTransaction & {
    readonly txType?: 'MODULE_TRANSACTION'
    readonly transfers: TransferWithTokenInfoResponse[]
  }

export type SafeMultisigTransactionWithTransfersResponse =
  SafeMultisigTransactionResponse & {
    readonly txType?: 'MULTISIG_TRANSACTION'
    readonly transfers: TransferWithTokenInfoResponse[]
  }

export type EthereumTxResponse = {
  readonly executionDate: string
  readonly to: string
  readonly data: string
  readonly txHash: string
  readonly blockNumber?: number
  readonly from: string
}

export type EthereumTxWithTransfersResponse = EthereumTxResponse & {
  readonly txType?: 'ETHEREUM_TRANSACTION'
  readonly transfers: TransferWithTokenInfoResponse[]
}

export type TGnosisSafeAllTransactionsListResponse = {
  readonly count: number
  readonly next?: string
  readonly previous?: string
  readonly results: Array<
    | SafeModuleTransactionWithTransfersResponse
    | SafeMultisigTransactionWithTransfersResponse
    | EthereumTxWithTransfersResponse
  >
}