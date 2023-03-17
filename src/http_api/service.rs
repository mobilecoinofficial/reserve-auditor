// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Reserve auditor service for handling HTTP requests

use mc_transaction_core::TokenId;

use crate::{
    db::{
        AuditedBurn, AuditedMint, BlockAuditData, BlockBalance, BurnTxOut, Counters,
        GnosisSafeDeposit, MintConfig, MintConfigTx, MintTx, ReserveAuditorDb, GnosisSafeWithdrawal,
    },
    gnosis::GnosisSafeConfig,
    http_api::api_types::{
        AuditedBurnResponse, AuditedMintResponse, BlockAuditDataResponse, HybridMintConfig,
        MintConfigTxWithConfig, MintInfoResponse, MintWithConfig, UnauditedBurnTxOutResponse,
        UnauditedGnosisDepositResponse,
    },
    Error,
};

use super::api_types::{
    BurnInfoResponse, GnosisSafeConfigResponse, TokenPrecision, TokenPrecisionResponse,
};

/// Service for handling auditor requests
pub struct ReserveAuditorHttpService {
    /// Reserve auditor database.
    reserve_auditor_db: ReserveAuditorDb,

    /// Gnosis Safe configurations file.
    pub gnosis_safe_config: GnosisSafeConfig,
}

/// Service for handling auditor requests
impl ReserveAuditorHttpService {
    /// Create a new reserve auditor HTTP service.
    pub fn new(reserve_auditor_db: ReserveAuditorDb, gnosis_safe_config: GnosisSafeConfig) -> Self {
        Self {
            reserve_auditor_db,
            gnosis_safe_config,
        }
    }

    /// get counters
    pub fn get_counters(&self) -> Result<Counters, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;
        Counters::get(&conn)
    }

    /// get token precision data
    pub fn get_token_precisions(&self) -> Result<TokenPrecisionResponse, Error> {
        let token_precisions = self.gnosis_safe_config.safes[0]
            .tokens
            .clone()
            .into_iter()
            .map(|token| TokenPrecision {
                token_id: token.token_id,
                token_eth_addrs: token.eth_token_contract_addrs,
                token_precision: token.decimals,
            })
            .collect::<Vec<TokenPrecision>>();

        let max_token_precision = self.gnosis_safe_config.safes[0].token_decimals_max;

        Ok(TokenPrecisionResponse {
            max_precision: max_token_precision,
            token_base_precisions: token_precisions,
        })
    }

    /// Get the audit data for a target block
    pub fn get_block_audit_data(&self, block_index: u64) -> Result<BlockAuditDataResponse, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let block_audit_data = BlockAuditData::get(&conn, block_index)?;

        let balances = BlockBalance::get_balances_for_block(&conn, block_audit_data.block_index())?;

        Ok(BlockAuditDataResponse::new(block_audit_data, balances))
    }

    /// Get the audit data for the last synced block.
    pub fn get_last_block_audit_data(&self) -> Result<BlockAuditDataResponse, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let block_audit_data =
            BlockAuditData::last_block_audit_data(&conn)?.ok_or(Error::NotFound)?;

        let balances = BlockBalance::get_balances_for_block(&conn, block_audit_data.block_index())?;

        Ok(BlockAuditDataResponse::new(block_audit_data, balances))
    }

    /// Get a paginated list of audited mints, along with corresponding mint tx
    /// and gnosis safe deposit
    pub fn get_audited_mints(
        &self,
        offset: Option<u64>,
        limit: Option<u64>,
    ) -> Result<Vec<AuditedMintResponse>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = AuditedMint::list_with_mint_and_deposit(offset, limit, &conn)?;

        let response = query_result
            .into_iter()
            .map(|(audited, mint, deposit)| AuditedMintResponse {
                audited,
                mint,
                deposit,
            })
            .collect();

        Ok(response)
    }

    /// Get a list of gnosis safe deposists that do not have a corresponding mint tx
    pub fn get_unaudited_gnosis_deposits(
        &self,
    ) -> Result<Vec<UnauditedGnosisDepositResponse>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = GnosisSafeDeposit::find_unaudited_deposits(&conn)?;

        let response = query_result
            .into_iter()
            .map(|deposit| UnauditedGnosisDepositResponse { deposit })
            .collect();

        Ok(response)
    }

    /// Get a paginated list of audited burns, along with corresponding burn tx
    /// and gnosis safe withdrawal
    pub fn get_audited_burns(
        &self,
        offset: Option<u64>,
        limit: Option<u64>,
    ) -> Result<Vec<AuditedBurnResponse>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = AuditedBurn::list_with_burn_and_withdrawal(offset, limit, &conn)?;

        let response = query_result
            .into_iter()
            .map(|(audited, burn, withdrawal)| AuditedBurnResponse {
                decoded_burn_memo_bytes: burn
                    .burn_redemption_memo()
                    .map(|memo| memo.memo_data().to_vec())
                    .ok(),
                audited,
                burn,
                withdrawal,
            })
            .collect();

        Ok(response)
    }

    /// Get a list of burn txs that do not have a corresponding gnosis safe withdrawal
    pub fn get_unaudited_burn_tx_outs(&self) -> Result<Vec<UnauditedBurnTxOutResponse>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = BurnTxOut::find_unaudited_burn_tx_outs(&conn)?;

        let response = query_result
            .into_iter()
            .map(|burn| UnauditedBurnTxOutResponse {
                decoded_burn_memo_bytes: burn
                    .burn_redemption_memo()
                    .map(|memo| memo.memo_data().to_vec())
                    .ok(),
                burn,
            })
            .collect();

        Ok(response)
    }

    /// Get the sum total of all mint amounts
    pub fn get_mint_total(&self, token_id: TokenId) -> Result<u128, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = MintTx::get_mint_amounts(&conn, token_id)?;

        let response = query_result
            .into_iter()
            .map(|(_token_id, amount)| amount as u128)
            .sum();

        Ok(response)
    }

    /// Get the sum total of all burn amounts
    pub fn get_burn_total(&self, token_id: TokenId) -> Result<u128, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;

        let query_result = BurnTxOut::get_burn_amounts(&conn, token_id)?;

        let response = query_result
            .into_iter()
            .map(|(_token_id, amount)| amount as u128)
            .sum();

        Ok(response)
    }

    /// Get token name from id
    pub fn get_token_symbol(&self, token_id: u64) -> String {
        let tokens = &self.gnosis_safe_config.safes[0].tokens;

        match tokens.iter().find(|&token| *token.token_id == token_id) {
            Some(token) => token.symbol.to_string(),
            None => "Unexpected Token".to_string(),
        }
    }

    /// Get the gnosis safe config
    pub fn get_gnosis_safe_config(&self) -> Result<GnosisSafeConfigResponse, Error> {
        Ok(GnosisSafeConfigResponse {
            config: self.gnosis_safe_config.clone(),
        })
    }

    pub fn get_mint_info_by_block(&self, block_index: u64) -> Result<MintInfoResponse, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;
        let mint_txs = MintTx::get_mint_txs_by_block_index(block_index, &conn)?;
        let mint_config_txs = MintConfigTx::get_by_block_index(block_index, &conn)?;

        let mut mint_config_txs_with_configs = vec![];
        for mint_config_tx in mint_config_txs.into_iter() {
            // In reality we should always have an id since this was returned from the database.
            if let Some(id) = mint_config_tx.id() {
                let mint_configs = MintConfig::get_by_mint_config_tx_id(id, &conn)?;
                let mut hybrid_mint_configs = vec![];
                for mint_config in mint_configs {
                    let core_mint_config = mint_config.decode()?;
                    let hybrid = HybridMintConfig {
                        id: mint_config.id().ok_or(Error::ObjectNotSaved)?,
                        token_id: core_mint_config.token_id,
                        signer_set: core_mint_config.signer_set,
                        mint_limit: core_mint_config.mint_limit,
                    };
                    hybrid_mint_configs.push(hybrid);
                }

                mint_config_txs_with_configs.push(MintConfigTxWithConfig {
                    mint_config_tx,
                    mint_configs: hybrid_mint_configs,
                })
            }
        }

        let mut mints_with_configs = vec![];
        for mint_tx in mint_txs.into_iter() {
            let mint_tx_signers = mint_tx.get_signers(&conn)?;
            // In reality we should always have an id since this was returned from the database.
            if let Some(config_id) = mint_tx.mint_config_id() {
                if let Some(mint_config) = MintConfig::get_by_id(config_id, &conn)? {
                    let core_mint_config = mint_config.decode()?;
                    if let Some(mint_config_tx) =
                        MintConfigTx::get_by_id(mint_config.mint_config_tx_id(), &conn)?
                    {
                        mints_with_configs.push(MintWithConfig {
                            mint_tx,
                            mint_config_tx,
                            mint_config: HybridMintConfig {
                                id: config_id,
                                token_id: core_mint_config.token_id,
                                signer_set: core_mint_config.signer_set,
                                mint_limit: core_mint_config.mint_limit,
                            },
                            mint_tx_signers,
                        })
                    }
                }
            }
        }

        Ok(MintInfoResponse {
            mint_txs: mints_with_configs,
            mint_config_txs: mint_config_txs_with_configs,
        })
    }

    pub fn get_burns_by_block(&self, block_index: u64) -> Result<Vec<BurnInfoResponse>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;
        let burn_txs = BurnTxOut::get_burn_txs_by_block(block_index, &conn)?;

        Ok(burn_txs
            .into_iter()
            .map(|burn| BurnInfoResponse {
                decoded_burn_memo_bytes: burn
                    .burn_redemption_memo()
                    .map(|memo| memo.memo_data().to_vec())
                    .ok(),
                burn,
            })
            .collect())
    }

    pub fn get_unaudited_withdrawals(&self) -> Result<Vec<GnosisSafeWithdrawal>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;
        let query_result = GnosisSafeWithdrawal::find_unaudited_withdrawals(&conn)?;

        Ok(query_result)   
    }

    pub fn get_unaudited_mints(&self) -> Result<Vec<MintTx>, Error> {
        let conn = self.reserve_auditor_db.get_conn()?;
        let query_result = MintTx::find_unaudited_mint_txs(&conn)?;

        Ok(query_result)  
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{
        test_utils::{
            append_and_sync, create_and_insert_burn_tx_out, create_burn_tx_out,
            create_gnosis_safe_deposit, create_gnosis_safe_withdrawal_from_burn_tx_out,
            insert_gnosis_deposit, insert_gnosis_withdrawal, insert_mint_tx_from_deposit,
            test_gnosis_config, TestDbContext,
        },
        BurnTxOut, GnosisSafeDeposit, GnosisSafeWithdrawal, MintTx,
    };
    use chrono::Utc;
    use mc_account_keys::AccountKey;
    use mc_blockchain_types::{BlockContents, BlockVersion};
    use mc_common::{
        logger::{test_with_logger, Logger},
        HashMap,
    };
    use mc_ledger_db::{
        test_utils::{create_ledger, initialize_ledger},
        Ledger,
    };
    use mc_transaction_core::TokenId;
    use mc_transaction_core_test_utils::{
        create_mint_config_tx_and_signers, create_mint_tx, create_test_tx_out,
        mint_config_tx_to_validated as to_validated,
    };

    /// Create a test database with some data in it.
    /// Seeds a ledger DB with some txos and mint txos, then syncs the mint
    /// auditor DB with the ledger.
    fn get_test_db(logger: &Logger) -> (ReserveAuditorDb, TestDbContext) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let token_id1 = TokenId::from(1);
        let token_id2 = TokenId::from(22);

        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());

        let mut ledger_db = create_ledger();
        let account_key = AccountKey::random(&mut rng);
        let num_initial_blocks = 1;
        initialize_ledger(
            BlockVersion::MAX,
            &mut ledger_db,
            num_initial_blocks,
            &account_key,
            &mut rng,
        );

        for block_index in 0..num_initial_blocks {
            let block_data = ledger_db.get_block_data(block_index).unwrap();

            reserve_auditor_db
                .sync_block(block_data.block(), block_data.contents(), Some(Utc::now()))
                .unwrap();
        }

        // Sync a block that contains a few mint config transactions.
        let (mint_config_tx1, signers1) = create_mint_config_tx_and_signers(token_id1, &mut rng);
        let (mint_config_tx2, signers2) = create_mint_config_tx_and_signers(token_id2, &mut rng);

        let block_contents = BlockContents {
            validated_mint_config_txs: vec![
                to_validated(&mint_config_tx1),
                to_validated(&mint_config_tx2),
            ],
            ..Default::default()
        };

        append_and_sync(
            block_contents,
            &mut ledger_db,
            &reserve_auditor_db,
            &mut rng,
        )
        .unwrap();

        // Sync a block that contains a few mint transactions.
        let mint_tx1 = create_mint_tx(token_id1, &signers1, 1, &mut rng);
        let mint_tx2 = create_mint_tx(token_id2, &signers2, 2, &mut rng);
        let mint_tx3 = create_mint_tx(token_id1, &signers1, 100, &mut rng);

        let block_contents = BlockContents {
            mint_txs: vec![mint_tx1, mint_tx2, mint_tx3],
            outputs: (0..3)
                .map(|_i| create_test_tx_out(BlockVersion::MAX, &mut rng))
                .collect(),
            ..Default::default()
        };

        append_and_sync(
            block_contents,
            &mut ledger_db,
            &reserve_auditor_db,
            &mut rng,
        )
        .unwrap();

        (reserve_auditor_db, test_db_context)
    }

    #[test_with_logger]
    fn test_get_block_audit_data(logger: Logger) {
        let (reserve_auditor_db, _test_db_context) = get_test_db(&logger);
        let config = test_gnosis_config();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config);

        let response = service.get_block_audit_data(2).unwrap();

        assert_eq!(response.block_index, 2,);
        assert_eq!(response.balances, HashMap::from_iter([(1, 101), (22, 2)]));
    }

    #[test_with_logger]
    fn test_get_last_block_audit_data(logger: Logger) {
        let (reserve_auditor_db, _test_db_context) = get_test_db(&logger);
        let config = test_gnosis_config();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config);
        let response = service.get_last_block_audit_data().unwrap();
        assert_eq!(response.block_index, 2,);
        assert_eq!(response.balances, HashMap::from_iter([(1, 101), (22, 2)]));
    }

    #[test_with_logger]
    fn test_get_mint_total(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = reserve_auditor_db.get_conn().unwrap();
        let config = test_gnosis_config();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config);

        let mut deposits: Vec<GnosisSafeDeposit> = vec![];
        let mut mints: Vec<MintTx> = vec![];
        let mut amount_deposited: u128 = 0;

        for _ in 0..10 {
            let mut deposit = create_gnosis_safe_deposit(100, &mut rng);
            deposits.push(deposit.clone());
            insert_gnosis_deposit(&mut deposit, &conn);
            let mint = insert_mint_tx_from_deposit(&deposit, &conn, &mut rng);
            mints.push(mint.clone());
            amount_deposited += 100;
        }

        let mint_balance = service.get_mint_total(TokenId::from(1)).unwrap();

        assert_eq!(mint_balance, amount_deposited)
    }

    #[test_with_logger]
    fn test_get_burn_total(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = reserve_auditor_db.get_conn().unwrap();
        let config = test_gnosis_config();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config);

        let mut burns: Vec<BurnTxOut> = vec![];
        let mut amount_burned: u128 = 0;

        for _i in 0..10 {
            let burn = create_and_insert_burn_tx_out(TokenId::from(1), 100, &conn, &mut rng);
            burns.push(burn.clone());
            amount_burned += 100;
        }

        let burn_balance = service.get_burn_total(TokenId::from(1)).unwrap();

        assert_eq!(burn_balance, amount_burned)
    }

    #[test_with_logger]
    fn test_get_counters(logger: Logger) {
        let (reserve_auditor_db, _test_db_context) = get_test_db(&logger);
        let config = test_gnosis_config();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config);

        let response = service.get_counters().unwrap();

        // The number of blocks synced depends on the database that [get_test_db]
        // generates.
        assert_eq!(response.num_blocks_synced(), 3,);
    }

    #[test_with_logger]
    fn test_get_audited_mints_service(logger: Logger) {
        let config = &test_gnosis_config();
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = reserve_auditor_db.get_conn().unwrap();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config.clone());

        let mut deposits: Vec<GnosisSafeDeposit> = vec![];
        let mut mints: Vec<MintTx> = vec![];

        for _ in 0..10 {
            let mut deposit = create_gnosis_safe_deposit(100, &mut rng);
            deposits.push(deposit.clone());
            insert_gnosis_deposit(&mut deposit, &conn);
            let mint = insert_mint_tx_from_deposit(&deposit, &conn, &mut rng);
            mints.push(mint.clone());
            AuditedMint::try_match_mint_with_deposit(&mint, config, &conn).unwrap();
        }

        let all_audited_mints = service.get_audited_mints(None, None).unwrap();
        assert_eq!(all_audited_mints.len(), 10);

        assert_eq!(all_audited_mints[0].mint, mints[0]);
        assert_eq!(
            all_audited_mints[0].deposit.eth_tx_hash(),
            deposits[0].eth_tx_hash()
        );

        let paginated_mints = service.get_audited_mints(Some(4), Some(3)).unwrap();
        assert_eq!(paginated_mints.len(), 3);
        assert_eq!(paginated_mints[0].audited.id.unwrap(), 5);
        assert_eq!(paginated_mints[2].audited.id.unwrap(), 7);
    }

    #[test_with_logger]
    fn test_get_unaudited_gnosis_deposits(logger: Logger) {
        let config = &test_gnosis_config();
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = reserve_auditor_db.get_conn().unwrap();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config.clone());

        let mut deposits: Vec<GnosisSafeDeposit> = vec![];
        let mut mints: Vec<MintTx> = vec![];

        for _ in 0..5 {
            let mut deposit = create_gnosis_safe_deposit(100, &mut rng);
            deposits.push(deposit.clone());
            insert_gnosis_deposit(&mut deposit, &conn);
            let mint = insert_mint_tx_from_deposit(&deposit, &conn, &mut rng);
            mints.push(mint.clone());
            AuditedMint::try_match_mint_with_deposit(&mint, config, &conn).unwrap();
        }

        for _ in 0..5 {
            let mut deposit = create_gnosis_safe_deposit(100, &mut rng);
            deposits.push(deposit.clone());
            insert_gnosis_deposit(&mut deposit, &conn);
        }

        let all_unaudited_gnosis_deposits = service.get_unaudited_gnosis_deposits().unwrap();
        assert_eq!(all_unaudited_gnosis_deposits.len(), 5);
    }

    #[test_with_logger]
    fn test_get_audited_burns_service(logger: Logger) {
        let config = &test_gnosis_config();
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let burn_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = burn_auditor_db.get_conn().unwrap();
        let token_id = config.safes[0].tokens[0].token_id;
        let service = ReserveAuditorHttpService::new(burn_auditor_db, config.clone());

        let mut withdrawals: Vec<GnosisSafeWithdrawal> = vec![];
        let mut burns: Vec<BurnTxOut> = vec![];

        for _ in 0..10 {
            let mut burn = create_burn_tx_out(token_id, 100, &mut rng);
            burn.insert(&conn).unwrap();
            burns.push(burn.clone());
            let mut withdrawal = create_gnosis_safe_withdrawal_from_burn_tx_out(&burn, &mut rng);
            withdrawals.push(withdrawal.clone());
            insert_gnosis_withdrawal(&mut withdrawal, &conn);
            AuditedBurn::try_match_withdrawal_with_burn(&withdrawal, &config.safes[0], &conn)
                .unwrap();
        }

        let all_audited_burns = service.get_audited_burns(None, None).unwrap();
        assert_eq!(all_audited_burns.len(), 10);

        assert_eq!(all_audited_burns[0].burn, burns[0]);
        assert_eq!(
            all_audited_burns[0].withdrawal.eth_tx_hash(),
            withdrawals[0].eth_tx_hash()
        );

        let paginated_burns = service.get_audited_burns(Some(4), Some(3)).unwrap();
        assert_eq!(paginated_burns.len(), 3);
        assert_eq!(paginated_burns[0].audited.id.unwrap(), 5);
        assert_eq!(paginated_burns[2].audited.id.unwrap(), 7);
    }

    #[test_with_logger]
    fn test_get_unaudited_burn_tx_outs(logger: Logger) {
        let config = &test_gnosis_config();
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let burn_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = burn_auditor_db.get_conn().unwrap();
        let token_id = config.safes[0].tokens[0].token_id;
        let service = ReserveAuditorHttpService::new(burn_auditor_db, config.clone());

        let mut withdrawals: Vec<GnosisSafeWithdrawal> = vec![];
        let mut burns: Vec<BurnTxOut> = vec![];

        for _ in 0..5 {
            let mut burn = create_burn_tx_out(token_id, 100, &mut rng);
            burn.insert(&conn).unwrap();
            burns.push(burn.clone());
            let mut withdrawal = create_gnosis_safe_withdrawal_from_burn_tx_out(&burn, &mut rng);
            withdrawals.push(withdrawal.clone());
            insert_gnosis_withdrawal(&mut withdrawal, &conn);
            AuditedBurn::try_match_withdrawal_with_burn(&withdrawal, &config.safes[0], &conn)
                .unwrap();
        }

        for _ in 0..5 {
            let mut burn = create_burn_tx_out(token_id, 100, &mut rng);
            burn.insert(&conn).unwrap();
            burns.push(burn.clone());
        }

        let all_audited_burns = service.get_unaudited_burn_tx_outs().unwrap();
        assert_eq!(all_audited_burns.len(), 5);
    }

    #[test_with_logger]
    fn test_get_mint_info_by_block(logger: Logger) {
        let config = &test_gnosis_config();
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger.clone());
        let conn = reserve_auditor_db.get_conn().unwrap();
        let service = ReserveAuditorHttpService::new(reserve_auditor_db, config.clone());

        // seed mint txs, mint config txs, mint configs,
        let token_id1 = TokenId::from(1);
        let (mint_config_tx1, signers1) = create_mint_config_tx_and_signers(token_id1, &mut rng);
        let config_tx_entity =
            MintConfigTx::insert_from_core_mint_config_tx(5, None, &mint_config_tx1, &conn)
                .unwrap();
        let mint_tx1 = create_mint_tx(token_id1, &signers1, 100, &mut rng);
        let mint_tx1_entity =
            MintTx::insert_from_core_mint_tx(5, None, Some(1), &mint_tx1, &conn).unwrap();

        let mint_info = service.get_mint_info_by_block(5).unwrap();
        // check that mint tx has been found
        let mints = &mint_info.mint_txs;

        assert_eq!(
            mints[0].mint_tx.id().unwrap(),
            mint_tx1_entity.id().unwrap()
        );
        // check that top level mint config tx has been found (mint config tx on block)
        let mint_config_txs = &mint_info.mint_config_txs;
        assert_eq!(
            mint_config_txs[0].mint_config_tx.id().unwrap(),
            config_tx_entity.id().unwrap()
        );
        // check that nested mint config tx has been found (mint config tx for mint on block)
        let mint_config_tx = &mint_info.mint_txs[0].mint_config_tx;
        assert_eq!(mint_config_tx.id().unwrap(), 1);
        assert_eq!(
            mint_config_tx.id().unwrap(),
            mint_config_txs[0].mint_config_tx.id().unwrap()
        );
        // check that nothing found for other block
        let not_found = service.get_mint_info_by_block(4).unwrap();
        assert_eq!(not_found.mint_txs.len(), 0);
        assert_eq!(not_found.mint_config_txs.len(), 0);

        // check that we found the mint signers
        let mint_tx_signers = &mints[0].mint_tx_signers;
        assert!(!mint_tx_signers.is_empty());
    }
}
