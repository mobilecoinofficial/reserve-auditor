// Copyright (c) 2018-2022 The MobileCoin Foundation

//! HTTP server for reserve auditor

mod api_types;
mod fairings;
mod routes;
mod service;

use crate::{db::ReserveAuditorDb, gnosis::GnosisSafeConfig};
use rocket::{custom, routes, Config};
use std::{net::Ipv4Addr, str::FromStr};

/// Start the http server
pub async fn start_http_server(
    db: ReserveAuditorDb,
    gnosis_safe_config: GnosisSafeConfig,
    port: u16,
    host: String,
) {
    let service = service::ReserveAuditorHttpService::new(db, gnosis_safe_config);

    let config = Config {
        address: std::net::IpAddr::V4(Ipv4Addr::from_str(&host).unwrap()),
        port,
        ..Config::debug_default()
    };

    if let Err(e) = custom(&config)
        .manage(service)
        .attach(fairings::Cors)
        .mount(
            "/",
            routes![
                routes::index,
                routes::get_counters,
                routes::get_token_precisions,
                routes::get_block_audit_data,
                routes::get_last_block_audit_data,
                routes::get_audited_mints,
                routes::get_unaudited_gnosis_deposits,
                routes::get_audited_burns,
                routes::get_unaudited_burn_tx_outs,
                routes::get_ledger_balance,
                routes::get_gnosis_safe_config,
                routes::get_mint_info_for_block,
                routes::get_burns_for_block
            ],
        )
        .launch()
        .await
    {
        println!("Whoops! Rocket didn't launch!");
        // We drop the error to get a Rocket-formatted panic.
        drop(e);
    }
}
