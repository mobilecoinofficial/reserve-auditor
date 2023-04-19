// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Reserve auditor GRPC service implementation.

use crate::{
    db::{BlockAuditData, Counters, ReserveAuditorDb},
    Error,
};
use grpcio::{RpcContext, RpcStatus, RpcStatusCode, Service, UnarySink};
use mc_common::logger::Logger;
use mc_reserve_auditor_api::{
    empty::Empty,
    reserve_auditor::{
        BlockAuditData as GrpcBlockAuditData, Counters as GrpcCounters, GetBlockAuditDataRequest,
        GetBlockAuditDataResponse, GetLastBlockAuditDataResponse,
    },
    reserve_auditor_grpc::{create_reserve_auditor_api, ReserveAuditorApi},
};
use mc_util_grpc::{rpc_logger, send_result};
/// Reserve auditor GRPC service implementation.
#[derive(Clone)]
pub struct ReserveAuditorService {
    /// Reserve auditor database.
    reserve_auditor_db: ReserveAuditorDb,

    /// Logger.
    logger: Logger,
}
impl ReserveAuditorService {
    /// Create a new reserve auditor service.
    pub fn new(reserve_auditor_db: ReserveAuditorDb, logger: Logger) -> Self {
        Self {
            reserve_auditor_db,
            logger,
        }
    }

    /// Convert into a grpc service
    pub fn into_service(self) -> Service {
        create_reserve_auditor_api(self)
    }

    fn get_block_audit_data_impl(
        &self,
        req: &GetBlockAuditDataRequest,
    ) -> Result<GetBlockAuditDataResponse, RpcStatus> {
        let conn = self
            .reserve_auditor_db
            .get_conn()
            .map_err(|err| RpcStatus::with_message(RpcStatusCode::INTERNAL, err.to_string()))?;

        let block_audit_data =
            BlockAuditData::get(&conn, req.block_index).map_err(|err| match err {
                Error::NotFound => RpcStatus::with_message(
                    RpcStatusCode::NOT_FOUND,
                    format!(
                        "Block audit data not found for block index {}",
                        req.get_block_index()
                    ),
                ),
                _ => RpcStatus::with_message(RpcStatusCode::INTERNAL, err.to_string()),
            })?;

        let mut grpc_block_audit_data = GrpcBlockAuditData::new();
        grpc_block_audit_data.set_block_index(block_audit_data.block_index());

        let mut resp = GetBlockAuditDataResponse::new();
        resp.set_block_audit_data(grpc_block_audit_data);
        Ok(resp)
    }

    fn get_last_block_audit_data_impl(&self) -> Result<GetLastBlockAuditDataResponse, RpcStatus> {
        let conn = self
            .reserve_auditor_db
            .get_conn()
            .map_err(|err| RpcStatus::with_message(RpcStatusCode::INTERNAL, err.to_string()))?;

        let block_audit_data = BlockAuditData::last_block_audit_data(&conn)
            .map_err(|err| RpcStatus::with_message(RpcStatusCode::INTERNAL, err.to_string()))?
            .ok_or_else(|| {
                RpcStatus::with_message(
                    RpcStatusCode::NOT_FOUND,
                    "No last synced block index".to_string(),
                )
            })?;

        let mut grpc_block_audit_data = GrpcBlockAuditData::new();
        grpc_block_audit_data.set_block_index(block_audit_data.block_index());

        let mut resp = GetLastBlockAuditDataResponse::new();
        resp.set_block_audit_data(grpc_block_audit_data);
        Ok(resp)
    }

    fn get_counters_impl(&self) -> Result<GrpcCounters, RpcStatus> {
        self.reserve_auditor_db
            .get_conn()
            .and_then(|conn| Counters::get(&conn))
            .map_err(|err| RpcStatus::with_message(RpcStatusCode::INTERNAL, err.to_string()))
            .map(|counters| GrpcCounters::from(&counters))
    }
}

impl ReserveAuditorApi for ReserveAuditorService {
    fn get_block_audit_data(
        &mut self,
        ctx: RpcContext,
        req: GetBlockAuditDataRequest,
        sink: UnarySink<GetBlockAuditDataResponse>,
    ) {
        let logger = rpc_logger(&ctx, &self.logger);
        send_result(ctx, sink, self.get_block_audit_data_impl(&req), &logger)
    }

    fn get_last_block_audit_data(
        &mut self,
        ctx: RpcContext,
        _req: Empty,
        sink: UnarySink<GetLastBlockAuditDataResponse>,
    ) {
        let logger = rpc_logger(&ctx, &self.logger);
        send_result(ctx, sink, self.get_last_block_audit_data_impl(), &logger)
    }

    fn get_counters(&mut self, ctx: RpcContext, _req: Empty, sink: UnarySink<GrpcCounters>) {
        let logger = rpc_logger(&ctx, &self.logger);
        send_result(ctx, sink, self.get_counters_impl(), &logger)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_utils::{append_and_sync, TestDbContext};
    use chrono::Utc;
    use grpcio::{ChannelBuilder, Environment, Server, ServerBuilder};
    use mc_account_keys::AccountKey;
    use mc_blockchain_types::{BlockContents, BlockVersion};
    use mc_common::logger::{test_with_logger, Logger};
    use mc_ledger_db::{
        test_utils::{create_ledger, initialize_ledger},
        Ledger,
    };
    use mc_reserve_auditor_api::reserve_auditor_grpc::ReserveAuditorApiClient;
    use mc_transaction_core::TokenId;
    use mc_transaction_core_test_utils::{
        create_mint_config_tx_and_signers, create_mint_tx, create_test_tx_out,
        mint_config_tx_to_validated as to_validated,
    };
    use std::sync::Arc;

    /// Starts the service on localhost and connects a client to it.
    fn get_client_server(
        reserve_auditor_db: &ReserveAuditorDb,
        logger: &Logger,
    ) -> (ReserveAuditorApiClient, Server) {
        let service =
            ReserveAuditorService::new(reserve_auditor_db.clone(), logger.clone()).into_service();
        let env = Arc::new(Environment::new(1));
        let mut server = ServerBuilder::new(env.clone())
            .register_service(service)
            .build()
            .unwrap();
        let port = server
            .add_listening_port("127.0.0.1:0", grpcio::ServerCredentials::insecure())
            .unwrap();
        server.start();
        let ch = ChannelBuilder::new(env).connect(&format!("127.0.0.1:{port}"));
        let client = ReserveAuditorApiClient::new(ch);
        (client, server)
    }

    /// Create a test database with some data in it.
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
        let (client, _server) = get_client_server(&reserve_auditor_db, &logger);

        let request = GetBlockAuditDataRequest {
            block_index: 2,
            ..Default::default()
        };

        let response = client.get_block_audit_data(&request).unwrap();

        assert_eq!(response.get_block_audit_data().block_index, 2,);
    }

    #[test_with_logger]
    fn test_get_last_block_audit_data(logger: Logger) {
        let (reserve_auditor_db, _test_db_context) = get_test_db(&logger);
        let (client, _server) = get_client_server(&reserve_auditor_db, &logger);

        let response = client.get_last_block_audit_data(&Empty::default()).unwrap();
        assert_eq!(response.get_block_audit_data().block_index, 2,);
    }

    #[test_with_logger]
    fn test_get_counters(logger: Logger) {
        let (reserve_auditor_db, _test_db_context) = get_test_db(&logger);
        let (client, _server) = get_client_server(&reserve_auditor_db, &logger);

        let response = client.get_counters(&Empty::default()).unwrap();

        // The number of blocks synced depends on the database that [get_test_db]
        // generates.
        assert_eq!(
            response,
            GrpcCounters {
                num_blocks_synced: 3,
                ..Default::default()
            }
        );
    }
}
