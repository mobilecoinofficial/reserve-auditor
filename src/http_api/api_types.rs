// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Request and response types

use crate::{
    db::{
        AuditedBurn, AuditedMint, BlockAuditData, BurnTxOut, GnosisSafeDeposit,
        GnosisSafeWithdrawal, MintConfigTx, MintTx,
    },
    gnosis::{EthAddr, GnosisSafeConfig},
};
use mc_common::HashMap;
use mc_crypto_keys::Ed25519Public;
use mc_crypto_multisig::SignerSet;
use mc_transaction_core::TokenId;
use rocket::serde::Serialize;

#[derive(Serialize)]
#[allow(missing_docs)]
pub struct TokenPrecision {
    pub token_id: TokenId,

    pub token_eth_addrs: Vec<EthAddr>,

    pub token_precision: u8,
}

#[derive(Serialize)]
#[allow(missing_docs)]
pub struct TokenPrecisionResponse {
    pub max_precision: u8,
    pub token_base_precisions: Vec<TokenPrecision>,
}

/// Block audit data
#[derive(Serialize)]
#[allow(missing_docs)]
pub struct BlockAuditDataResponse {
    pub block_index: u64,
    pub balances: HashMap<u64, u64>,
}

impl BlockAuditDataResponse {
    /// Create a new BlockAuditDataResponse from block index and balance
    pub fn new(block_audit_data: BlockAuditData, balances: HashMap<TokenId, u64>) -> Self {
        Self {
            block_index: block_audit_data.block_index(),
            balances: balances
                .into_iter()
                .map(|(token_id, balance)| (*token_id, balance))
                .collect(),
        }
    }
}

/// Audited mint with corresponding mint tx and gnosis safe deposit
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct AuditedMintResponse {
    pub audited: AuditedMint,
    pub mint: MintTx,
    pub deposit: GnosisSafeDeposit,
}

/// Gnosis safe deposits without a corresponding mint tx
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct UnauditedGnosisDepositResponse {
    pub deposit: GnosisSafeDeposit,
}

/// Audited burn with corresponding burn tx and gnosis safe withdrawal
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct AuditedBurnResponse {
    pub audited: AuditedBurn,
    pub burn: BurnTxOut,
    pub withdrawal: GnosisSafeWithdrawal,
    pub decoded_burn_memo_bytes: Option<Vec<u8>>,
}

/// Burn tx outs without a corresponding gnosis safe withdrawal
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct UnauditedBurnTxOutResponse {
    pub burn: BurnTxOut,
    pub decoded_burn_memo_bytes: Option<Vec<u8>>,
}

/// Token information
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct TokenType {
    pub id: TokenId,
    pub name: String,
}

/// Total minted and burned amounts
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct LedgerBalanceResponse {
    pub mint_balance: String,
    pub burn_balance: String,
    pub token_type: TokenType,
}

/// Gnosis Safe Config data used in running the reserve auditor.
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct GnosisSafeConfigResponse {
    pub config: GnosisSafeConfig,
}

/// Core Mint config plus the db ID
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct HybridMintConfig {
    pub id: i32,
    pub token_id: u64,
    pub signer_set: SignerSet<Ed25519Public>,
    pub mint_limit: u64,
}

/// Mint with Config tx
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct MintWithConfig {
    pub mint_tx: MintTx,
    pub mint_config_tx: MintConfigTx,
    pub mint_config: HybridMintConfig,
    pub mint_tx_signers: Vec<Ed25519Public>,
}

/// Mint Config Tx with mint config
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct MintConfigTxWithConfig {
    pub mint_config_tx: MintConfigTx,
    pub mint_configs: Vec<HybridMintConfig>,
}

/// Mint Txs
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct MintInfoResponse {
    pub mint_txs: Vec<MintWithConfig>,
    pub mint_config_txs: Vec<MintConfigTxWithConfig>,
}

/// Response for getting burns by block
#[derive(Serialize, Debug, Eq, PartialEq)]
#[allow(missing_docs)]
pub struct BurnInfoResponse {
    pub burn_txs: Vec<BurnTxOut>,
}
