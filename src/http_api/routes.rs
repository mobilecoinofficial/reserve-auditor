// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Routing for the http server

use crate::{
    db::Counters,
    http_api::{
        api_types::{
            AuditedBurnResponse, AuditedMintResponse, BlockAuditDataResponse,
            LedgerBalanceResponse, TokenType, UnauditedBurnTxOutResponse,
            UnauditedGnosisDepositResponse,
        },
        service::ReserveAuditorHttpService,
    },
};
use mc_transaction_core::TokenId;
use rocket::{get, serde::json::Json, State};

use super::api_types::{GnosisSafeConfigResponse, TokenPrecisionResponse};

/// Index route
#[get("/")]
pub fn index() -> &'static str {
    "Welcome to the reserve auditor"
}

/// Get counters
#[get("/counters")]
pub fn get_counters(service: &State<ReserveAuditorHttpService>) -> Result<Json<Counters>, String> {
    match service.get_counters() {
        Ok(counters) => Ok(Json(counters)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get token precision
#[get("/token_precisions")]
pub fn get_token_precisions(
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<TokenPrecisionResponse>, String> {
    match service.get_token_precisions() {
        Ok(token_precision) => Ok(Json(token_precision)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get the audit data for a target block
#[get("/block_audit_data/<block_index>")]
pub fn get_block_audit_data(
    block_index: u64,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<BlockAuditDataResponse>, String> {
    match service.get_block_audit_data(block_index) {
        Ok(block_audit_data) => Ok(Json(block_audit_data)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get the audit data for the last (most recent) synced block.
#[get("/last_block_audit_data")]
pub fn get_last_block_audit_data(
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<BlockAuditDataResponse>, String> {
    match service.get_last_block_audit_data() {
        Ok(block_audit_data) => Ok(Json(block_audit_data)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get a paginated list of audited mints, along with corresponding mint tx and
/// gnosis safe deposit
#[get("/audited_mints?<offset>&<limit>")]
pub fn get_audited_mints(
    offset: Option<u64>,
    limit: Option<u64>,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<Vec<AuditedMintResponse>>, String> {
    match service.get_audited_mints(offset, limit) {
        Ok(audited_mints) => Ok(Json(audited_mints)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get a paginated list of gnosis safe deposits that don't have a corresponding mint tx
#[get("/unaudited_gnosis_deposits")]
pub fn get_unaudited_gnosis_deposits(
    offset: Option<u64>,
    limit: Option<u64>,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<Vec<UnauditedGnosisDepositResponse>>, String> {
    match service.get_unaudited_gnosis_deposits(offset, limit) {
        Ok(unaudited_gnosis_deposits) => Ok(Json(unaudited_gnosis_deposits)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get a paginated list of audited burns, along with corresponding burn tx and
/// gnosis safe withdrawal
#[get("/audited_burns?<offset>&<limit>")]
pub fn get_audited_burns(
    offset: Option<u64>,
    limit: Option<u64>,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<Vec<AuditedBurnResponse>>, String> {
    match service.get_audited_burns(offset, limit) {
        Ok(audited_burns) => Ok(Json(audited_burns)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get a paginated list of burn transactions that don't have a corresponding gnosis withdrawals
#[get("/unaudited_burn_tx_outs")]
pub fn get_unaudited_burn_tx_outs(
    offset: Option<u64>,
    limit: Option<u64>,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<Vec<UnauditedBurnTxOutResponse>>, String> {
    match service.get_unaudited_burn_tx_outs(offset, limit) {
        Ok(unpaired_burn_txs) => Ok(Json(unpaired_burn_txs)),
        Err(e) => Err(e.to_string()),
    }
}

/// Get sum total of mints and burns, defaulting to token 0 (MOB)
#[get("/ledger_balance?<token_id>")]
pub fn get_ledger_balance(
    token_id: Option<u64>,
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<LedgerBalanceResponse>, String> {
    let token_id_with_default = token_id.unwrap_or(0);
    Ok(Json(LedgerBalanceResponse {
        mint_balance: service
            .get_mint_total(TokenId::from(token_id_with_default))
            .map_err(|e| e.to_string())?
            .to_string(),
        burn_balance: service
            .get_burn_total(TokenId::from(token_id_with_default))
            .map_err(|e| e.to_string())?
            .to_string(),
        token_type: TokenType {
            id: TokenId::from(token_id_with_default),
            name: service.get_token_symbol(token_id_with_default),
        },
    }))
}

/// Get the config file used in the running of the reserve auditor back end.
#[get("/gnosis_safe_config")]
pub fn get_gnosis_safe_config(
    service: &State<ReserveAuditorHttpService>,
) -> Result<Json<GnosisSafeConfigResponse>, String> {
    match service.get_gnosis_safe_config() {
        Ok(config) => Ok(Json(config)),
        Err(e) => Err(e.to_string()),
    }
}
