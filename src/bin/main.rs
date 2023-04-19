// Copyright (c) 2018-2022 The MobileCoin Foundation

//! A utility for keeping track of token minting and burning.

use chrono::{TimeZone, Utc};
use clap::{Parser, Subcommand};
use grpcio::{EnvBuilder, ServerBuilder};
use mc_common::logger::{log, o, Logger};
use mc_ledger_db::{Ledger, LedgerDB};
use mc_reserve_auditor::{
    db::{
        transaction, AuditedBurn, AuditedMint, BlockAuditData, BlockBalance, Conn,
        ReserveAuditorDb, SyncBlockData,
    },
    gnosis::{GnosisSafeConfig, GnosisSyncThread},
    http_api::start_http_server,
    Error, ReserveAuditorService,
};
use mc_reserve_auditor_api::ReserveAuditorUri;
use mc_util_grpc::{AdminServer, BuildInfoService, ConnectionUriGrpcioServer, HealthService};
use mc_util_parse::parse_duration_in_seconds;
use mc_util_uri::AdminUri;
use mc_watcher::watcher_db::WatcherDB;
use serde_json::json;
use std::{cmp::Ordering, path::PathBuf, sync::Arc, thread::sleep, time::Duration};

/// Maximum number of concurrent connections in the database pool.
const DB_POOL_SIZE: u32 = 10;

/// Clap configuration for each subcommand this program supports.
#[allow(clippy::large_enum_variant)]
#[derive(Clone, Subcommand)]
pub enum Command {
    /// Scan the ledger and audit the minting and burning of tokens in blocks as
    /// they come in.
    ScanLedger {
        /// Path to ledger db. Syncing this ledger should happen externally via
        /// mobilecoind.
        #[clap(long, parse(from_os_str), env = "MC_LEDGER_DB")]
        ledger_db: PathBuf,

        /// Path to watcher db (lmdb). When provided, will be used to obtain block timestamps.
        #[clap(long, parse(from_os_str), env = "MC_WATCHER_DB")]
        watcher_db: Option<PathBuf>,

        /// Path to reserve auditor db.
        #[clap(long, parse(from_os_str), env = "MC_RESERVE_AUDITOR_DB")]
        reserve_auditor_db: PathBuf,

        /// How many seconds to wait between polling.
        #[clap(long, default_value = "1", parse(try_from_str = parse_duration_in_seconds), env = "MC_POLL_INTERVAL")]
        poll_interval: Duration,

        /// Oprtional GRPC listen URI, to be used when API access is desired.
        #[clap(long, env = "MC_LISTEN_URI")]
        listen_uri: Option<ReserveAuditorUri>,

        /// Optional admin service listening URI.
        #[clap(long, env = "MC_ADMIN_LISTEN_URI")]
        admin_listen_uri: Option<AdminUri>,

        /// Gnosis safe configuration file (json/toml).
        /// When provided, the configured gnosis safe(s) will be audited.
        #[clap(long, env = "MC_GNOSIS_SAFE_CONFIG", parse(try_from_str = parse_gnosis_safe_config))]
        gnosis_safe_config: Option<GnosisSafeConfig>,
    },

    /// Get the audit data for a specific block, optionally in JSON format
    /// (serialized `BlockAuditData`).
    GetBlockAuditData {
        /// Path to reserve auditor db.
        #[clap(long, parse(from_os_str), env = "MC_RESERVE_AUDITOR_DB")]
        reserve_auditor_db: PathBuf,

        /// Block index (optional, defaults to last synced block).
        #[clap(long, env = "MC_BLOCK_INDEX")]
        block_index: Option<u64>,

        /// Output JSON (serialized `BlockAuditData`).
        #[clap(long, env = "MC_JSON")]
        json: bool,
    },
    StartHttpServer {
        /// Path to reserve auditor db.
        #[clap(long, parse(from_os_str), env = "MC_RESERVE_AUDITOR_DB")]
        reserve_auditor_db: PathBuf,

        /// Optional port for HTTP server. Defualts to 8080
        #[clap(long, default_value = "8080", env = "PORT")]
        port: u16,

        /// Optional host for HTTP server. defaults to 127.0.0.1
        #[clap(long, default_value = "127.0.0.1", env = "HOST")]
        host: String,

        /// Gnosis safe configuration file (json/toml).
        /// When provided, the configured gnosis safe(s) will be audited.
        #[clap(long, env = "MC_GNOSIS_SAFE_CONFIG", parse(try_from_str = parse_gnosis_safe_config))]
        gnosis_safe_config: Option<GnosisSafeConfig>,
    },
}

/// Configuration for the reserve auditor.
#[derive(Clone, Parser)]
#[clap(
    name = "mc-reserve-auditor",
    about = "Utility for keeping track of token minting and burning."
)]
pub struct Config {
    #[clap(subcommand)]
    pub command: Command,
}

#[rocket::main]
async fn main() {
    mc_common::setup_panic_handler();
    let _sentry_guard = mc_common::sentry::init();
    let config = Config::parse();
    let (logger, _global_logger_guard) = mc_common::logger::create_app_logger(o!());

    match config.command {
        Command::ScanLedger {
            ledger_db,
            watcher_db,
            reserve_auditor_db,
            poll_interval,
            listen_uri,
            admin_listen_uri,
            gnosis_safe_config,
        } => cmd_scan_ledger(
            ledger_db,
            watcher_db,
            reserve_auditor_db,
            poll_interval,
            listen_uri,
            admin_listen_uri,
            gnosis_safe_config,
            logger,
        ),

        Command::GetBlockAuditData {
            reserve_auditor_db,
            block_index,
            json,
        } => {
            cmd_get_block_audit_data(reserve_auditor_db, block_index, json, logger);
        }

        Command::StartHttpServer {
            reserve_auditor_db,
            gnosis_safe_config,
            port,
            host,
        } => {
            cmd_start_http_server(
                reserve_auditor_db,
                gnosis_safe_config.expect("Failure to read gnosis safe config file."),
                port,
                host,
                logger,
            )
            .await;
        }
    }
}

/// Implementation of the ScanLedger CLI command.
#[allow(clippy::too_many_arguments)]
fn cmd_scan_ledger(
    ledger_db_path: PathBuf,
    watcher_db_path: Option<PathBuf>,
    reserve_auditor_db_path: PathBuf,
    poll_interval: Duration,
    listen_uri: Option<ReserveAuditorUri>,
    admin_listen_uri: Option<AdminUri>,
    gnosis_safe_config: Option<GnosisSafeConfig>,
    logger: Logger,
) {
    let ledger_db = LedgerDB::open(&ledger_db_path).expect("Could not open ledger DB");

    let watcher_db = watcher_db_path.map(|watcher_db_path| {
        WatcherDB::open_ro(&watcher_db_path, logger.clone()).expect("Could not open watcher DB")
    });

    let reserve_auditor_db = ReserveAuditorDb::new_from_path(
        &reserve_auditor_db_path
            .into_os_string()
            .into_string()
            .unwrap(),
        DB_POOL_SIZE,
        logger.clone(),
    )
    .expect("Could not open reserve auditor DB");

    let _api_server = listen_uri.map(|listen_uri| {
        // Create RPC services.
        let build_info_service = BuildInfoService::new(logger.clone()).into_service();
        let health_service = HealthService::new(None, logger.clone()).into_service();
        let reserve_auditor_service =
            ReserveAuditorService::new(reserve_auditor_db.clone(), logger.clone()).into_service();

        // Package services into grpc server.
        log::info!(logger, "Starting API service on {}", listen_uri);
        let env = Arc::new(EnvBuilder::new().name_prefix("RPC".to_string()).build());

        let server_builder = ServerBuilder::new(env.clone())
            .register_service(build_info_service)
            .register_service(health_service)
            .register_service(reserve_auditor_service)
            .set_default_channel_args(env);

        let mut server = server_builder
            .build_using_uri(&listen_uri, logger.clone())
            .unwrap();
        server.start();

        server
    });

    let _admin_server = admin_listen_uri.map(|admin_listen_uri| {
        let local_hostname = hostname::get()
            .expect("failed getting local hostname")
            .to_str()
            .expect("failed getting hostname as str")
            .to_string();

        AdminServer::start(
            None,
            &admin_listen_uri,
            "Reserve Auditor".to_owned(),
            local_hostname,
            None,
            vec![],
            logger.clone(),
        )
        .expect("Failed starting admin grpc server")
    });

    let _gnosis_safe_fetcher_threads = gnosis_safe_config.as_ref().map(|gnosis_safe_config| {
        gnosis_safe_config
            .safes
            .iter()
            .map(|safe_config| {
                GnosisSyncThread::start(
                    safe_config,
                    reserve_auditor_db.clone(),
                    poll_interval,
                    logger.clone(),
                )
                .expect("Failed starting gnosis safe fetcher thread")
            })
            .collect::<Vec<_>>()
    });

    loop {
        sync_loop(
            &reserve_auditor_db,
            gnosis_safe_config.as_ref(),
            &ledger_db,
            &watcher_db,
            &logger,
        )
        .expect("sync_loop failed");
        sleep(poll_interval);
    }
}

/// Implementation of the GetBlockAuditData CLI command.
fn cmd_get_block_audit_data(
    reserve_auditor_db_path: PathBuf,
    block_index: Option<u64>,
    json: bool,
    logger: Logger,
) {
    let reserve_auditor_db = ReserveAuditorDb::new_from_path(
        &reserve_auditor_db_path
            .into_os_string()
            .into_string()
            .unwrap(),
        DB_POOL_SIZE,
        logger.clone(),
    )
    .expect("Could not open reserve auditor DB");

    let conn = reserve_auditor_db
        .get_conn()
        .expect("Could not get db connection");

    transaction(&conn, |conn| -> Result<(), Error> {
        let last_synced_block_index = BlockAuditData::last_synced_block_index(conn)?;
        let block_index = block_index
            .or(last_synced_block_index)
            .ok_or_else(|| Error::Other("Failed figuring out the last block index".into()))?;

        let audit_data = BlockAuditData::get(conn, block_index)?;
        let balance_map = BlockBalance::get_balances_for_block(conn, block_index)?;

        if json {
            let obj = json!({
                "block_audit_data": audit_data,
                "balances": balance_map,
            });
            println!(
                "{}",
                serde_json::to_string(&obj)
                    .map_err(|err| Error::Other(format!("failed serializing json: {}", err)))?
            );
        } else {
            println!("Block index: {}", block_index);
            for (token_id, balance) in balance_map.iter() {
                println!("Token {}: {}", token_id, balance);
            }
        }

        Ok(())
    })
    .expect("db transaction failed");
}

async fn cmd_start_http_server(
    reserve_auditor_db_path: PathBuf,
    gnosis_safe_config: GnosisSafeConfig,
    port: u16,
    host: String,
    logger: Logger,
) {
    let reserve_auditor_db = ReserveAuditorDb::new_from_path(
        &reserve_auditor_db_path
            .into_os_string()
            .into_string()
            .unwrap(),
        DB_POOL_SIZE,
        logger.clone(),
    )
    .expect("Could not open reserve auditor DB");

    start_http_server(reserve_auditor_db, gnosis_safe_config, port, host).await;
}

/// Synchronizes the reserve auditor database with the ledger database.
/// Will run until all blocks in the ledger database have been synced.
fn sync_loop(
    reserve_auditor_db: &ReserveAuditorDb,
    gnosis_safe_config: Option<&GnosisSafeConfig>,
    ledger_db: &LedgerDB,
    watcher_db: &Option<WatcherDB>,
    logger: &Logger,
) -> Result<(), Error> {
    loop {
        let conn = reserve_auditor_db.get_conn()?;
        let num_blocks_in_ledger = ledger_db.num_blocks()?;

        let last_synced_block_index = BlockAuditData::last_synced_block_index(&conn)?;
        let num_blocks_synced = last_synced_block_index
            .map(|block_index| block_index + 1)
            .unwrap_or(0);
        match num_blocks_synced.cmp(&num_blocks_in_ledger) {
            Ordering::Equal => {
                // Nothing more to sync.
                break;
            }
            Ordering::Greater => {
                log::error!(logger, "Somehow synced more blocks ({}) than what is in the ledger ({}) - this should never happen.", num_blocks_synced, num_blocks_in_ledger);
                break;
            }

            Ordering::Less => {
                // Sync the next block.
                let block_data = ledger_db.get_block_data(num_blocks_synced)?;

                // Get block timestamp if we are running with a watcher. Note that poll_block_timestamp blocks until a timestamp can be obtained,
                // the timeout only controls when a warning log message is printed.
                let block_timestamp = watcher_db.as_ref().and_then(|db| {
                    let timestamp =
                        db.poll_block_timestamp(block_data.block().index, Duration::from_secs(30));
                    Utc.timestamp_opt(timestamp as i64, 0).single()
                });

                // SQLite3 does not like concurrent writes. Since we are going to be writing to
                // the database, ensure we are the only writers.
                conn.exclusive_transaction(|| -> Result<(), Error> {
                    let sync_block_data = reserve_auditor_db.sync_block_with_conn(
                        &conn,
                        block_data.block(),
                        block_data.contents(),
                        block_timestamp,
                    )?;

                    // If we were configured to audit Gnosis safes, attempt to do that with
                    // information we found in the block.
                    if let Some(config) = gnosis_safe_config {
                        audit_block_data(&sync_block_data, config, &conn, logger)?;
                    }

                    Ok(())
                })?;
            }
        };
    }

    Ok(())
}

/// Perform gnosis auditing of any data found in the block.
fn audit_block_data(
    sync_block_data: &SyncBlockData,
    config: &GnosisSafeConfig,
    conn: &Conn,
    logger: &Logger,
) -> Result<(), Error> {
    // Audit mints.
    for mint_tx in &sync_block_data.mint_txs {
        match AuditedMint::try_match_mint_with_deposit(mint_tx, config, conn) {
            Ok(deposit) => {
                log::info!(
                    logger,
                    "MintTx nonce={} matched Gnosis deposit eth_tx_hash={}",
                    mint_tx.nonce_hex(),
                    deposit.eth_tx_hash(),
                )
            }
            Err(Error::NotFound) => {
                log::debug!(logger, "MintTx with nonce={} does not currently have matching Gnosis deposit, this could be fine if the safe data is not fully synced.", mint_tx.nonce_hex());
            }
            Err(err) => {
                log::error!(
                    logger,
                    "MintTx nonce={} failed matching Gnosis deposit: {}",
                    mint_tx.nonce_hex(),
                    err
                );
            }
        };
    }

    // Audit burns.
    for burn_tx_out in &sync_block_data.burn_tx_outs {
        match AuditedBurn::try_match_burn_with_withdrawal(burn_tx_out, config, conn) {
            Ok(withdrawal) => {
                log::info!(
                    logger,
                    "BurnTxOut pub_key={} matched Gnosis withdrawal eth_tx_hash={}",
                    burn_tx_out.public_key_hex(),
                    withdrawal.eth_tx_hash(),
                )
            }
            Err(Error::NotFound) => {
                log::debug!(logger, "BurnTxOut with pub_key={} does not currently have matching Gnosis withdrawal, this could be fine if the safe data is not fully synced.", burn_tx_out.public_key_hex());
            }
            Err(err) => {
                log::error!(
                    logger,
                    "BurnTxOut pub_key={} failed matching Gnosis withdrawal: {}",
                    burn_tx_out.public_key_hex(),
                    err
                );
            }
        }
    }

    Ok(())
}

/// Load a gnosis safe config file.
fn parse_gnosis_safe_config(path: &str) -> Result<GnosisSafeConfig, Error> {
    Ok(GnosisSafeConfig::load_from_path(path)?)
}
