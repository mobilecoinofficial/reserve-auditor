// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Model file for the mint_txs table.

use crate::{
    db::{
        last_insert_rowid,
        schema::{audited_mints, mint_txs},
        Conn, MintConfig,
    },
    Error,
};
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::{
    dsl::{exists, not},
    prelude::*,
};
use hex::ToHex;
use mc_account_keys::PublicAddress;
use mc_api::printable::PrintableWrapper;
use mc_blockchain_types::BlockIndex;
use mc_crypto_keys::Ed25519Public;
use mc_transaction_core::{mint::MintTx as CoreMintTx, TokenId};
use mc_util_serial::{decode, encode};
use serde::{Deserialize, Serialize};

/// Diesel model for the `mint_txs` table.
/// This stores data about a single MintTx.
#[derive(
    Clone, Debug, Default, Deserialize, Eq, Hash, Insertable, PartialEq, Queryable, Serialize,
)]
pub struct MintTx {
    /// Auto incrementing primary key.
    id: Option<i32>,

    /// The block index at which this mint tx appreared.
    block_index: i64,

    /// The block timestamp.
    block_timestamp: Option<NaiveDateTime>,

    /// The token id this mint tx is for.
    token_id: i64,

    /// The amount being minted.
    amount: i64,

    /// The nonce, as hex-encoded bytes.
    nonce_hex: String,

    /// The recipient of the mint.
    recipient_b58_addr: String,

    /// Tombstone block.
    tombstone_block: i64,

    /// The protobuf-serialized MintTx.
    protobuf: Vec<u8>,

    /// The mint config id, when we are able to match it with one.
    mint_config_id: Option<i32>,
}

impl MintTx {
    /// Get id.
    pub fn id(&self) -> Option<i32> {
        self.id
    }

    /// Get block index.
    pub fn block_index(&self) -> u64 {
        self.block_index as u64
    }

    /// Get block timestamp.
    pub fn block_timestamp(&self) -> Option<DateTime<Utc>> {
        self.block_timestamp.map(|ts| DateTime::from_utc(ts, Utc))
    }

    /// Get token id.
    pub fn token_id(&self) -> TokenId {
        TokenId::from(self.token_id as u64)
    }

    /// Get amount.
    pub fn amount(&self) -> u64 {
        self.amount as u64
    }

    /// Get nonce.
    pub fn nonce_hex(&self) -> &str {
        &self.nonce_hex
    }

    /// Get recipient b58 address.
    pub fn recipient_b58_addr(&self) -> &str {
        &self.recipient_b58_addr
    }

    /// Get tombstone block.
    pub fn tombstone_block(&self) -> u64 {
        self.tombstone_block as u64
    }

    /// Get mint config id, when we are able to match it with one.
    pub fn mint_config_id(&self) -> Option<i32> {
        self.mint_config_id
    }

    /// Get the original MintTx
    pub fn decode(&self) -> Result<CoreMintTx, Error> {
        Ok(decode(&self.protobuf)?)
    }

    /// Create an instance of this object from a
    /// [mc_transaction_core::mint::MintTx] and some extra information.
    pub fn from_core_mint_tx(
        block_index: BlockIndex,
        block_timestamp: Option<DateTime<Utc>>,
        mint_config_id: Option<i32>,
        tx: &CoreMintTx,
    ) -> Result<Self, Error> {
        let recipient = PublicAddress::new(&tx.prefix.spend_public_key, &tx.prefix.view_public_key);
        let mut wrapper = PrintableWrapper::new();
        wrapper.set_public_address((&recipient).into());
        let recipient_b58_addr = wrapper.b58_encode()?;

        Ok(Self {
            id: None,
            block_index: block_index as i64,
            block_timestamp: block_timestamp.map(|ts| ts.naive_utc()),
            token_id: tx.prefix.token_id as i64,
            amount: tx.prefix.amount as i64,
            nonce_hex: tx.prefix.nonce.encode_hex(),
            recipient_b58_addr,
            tombstone_block: tx.prefix.tombstone_block as i64,
            protobuf: encode(tx),
            mint_config_id,
        })
    }

    /// Insert a new MintTx into the database.
    pub fn insert(&mut self, conn: &Conn) -> Result<(), Error> {
        if let Some(id) = self.id {
            return Err(Error::AlreadyExists(format!(
                "MintTx already has an id ({id})"
            )));
        }
        diesel::insert_into(mint_txs::table)
            .values(self.clone())
            .execute(conn)?;

        self.id = Some(diesel::select(last_insert_rowid).get_result::<i32>(conn)?);

        Ok(())
    }

    /// Helper for inserting from a [mc_transaction_core::mint::MintTx] and some
    /// extra information.
    pub fn insert_from_core_mint_tx(
        block_index: BlockIndex,
        block_timestamp: Option<DateTime<Utc>>,
        mint_config_id: Option<i32>,
        tx: &CoreMintTx,
        conn: &Conn,
    ) -> Result<Self, Error> {
        let mut mint_tx =
            Self::from_core_mint_tx(block_index, block_timestamp, mint_config_id, tx)?;
        mint_tx.insert(conn)?;
        Ok(mint_tx)
    }

    /// Attempt to find all [MintTx]s that do not have a matching entry in the
    /// `audited_mints` table.
    pub fn find_unaudited_mint_txs(conn: &Conn) -> Result<Vec<Self>, Error> {
        Ok(mint_txs::table
            .filter(not(exists(
                audited_mints::table
                    .select(audited_mints::mint_tx_id)
                    .filter(audited_mints::mint_tx_id.nullable().eq(mint_txs::id)),
            )))
            .load(conn)?)
    }

    /// Attempt to find a [MintTx] that has a given nonce and no matching entry
    /// in the `audited_mints` table.
    pub fn find_unaudited_mint_tx_by_nonce(
        nonce_hex: &str,
        conn: &Conn,
    ) -> Result<Option<Self>, Error> {
        Ok(mint_txs::table
            .filter(mint_txs::nonce_hex.eq(nonce_hex))
            .filter(not(exists(
                audited_mints::table
                    .select(audited_mints::mint_tx_id)
                    .filter(audited_mints::mint_tx_id.nullable().eq(mint_txs::id)),
            )))
            .first(conn)
            .optional()?)
    }

    /// Get a collection of mint token amounts
    pub fn get_mint_amounts(conn: &Conn, token_id: TokenId) -> Result<Vec<(TokenId, u64)>, Error> {
        let query = mint_txs::table
            .select((mint_txs::columns::token_id, mint_txs::columns::amount))
            .filter(mint_txs::token_id.eq(*token_id as i64));

        let rows = query.load::<(i64, i64)>(conn)?;

        Ok(rows
            .into_iter()
            .map(|(token_id, balance)| (TokenId::from(token_id as u64), balance as u64))
            .collect())
    }

    /// Get [MintTx]s for a given block index.
    pub fn get_mint_txs_by_block_index(
        block_index: BlockIndex,
        conn: &Conn,
    ) -> Result<Vec<Self>, Error> {
        Ok(mint_txs::table
            .filter(mint_txs::block_index.eq(block_index as i64))
            .order_by(mint_txs::id)
            .load(conn)?)
    }

    /// Get the list of Ed25519 public keys that signed this MintTx.
    pub fn get_signers(&self, conn: &Conn) -> Result<Vec<Ed25519Public>, Error> {
        let core_mint_tx = self.decode()?;
        let message = core_mint_tx.prefix.hash();

        let sql_mint_config =
            MintConfig::get_by_id(self.mint_config_id().ok_or(Error::ObjectNotSaved)?, conn)?
                .ok_or(Error::NotFound)?;
        let mint_config = sql_mint_config.decode()?;

        Ok(mint_config
            .signer_set
            .verify(&message, &core_mint_tx.signature)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{
        models::AuditedMint,
        test_utils::{create_gnosis_safe_deposit, insert_gnosis_deposit, TestDbContext},
    };
    use mc_common::logger::{test_with_logger, Logger};
    use mc_transaction_core::TokenId;
    use mc_transaction_core_test_utils::{create_mint_config_tx_and_signers, create_mint_tx};

    #[test_with_logger]
    fn insert_enforces_uniqueness(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let token_id1 = TokenId::from(1);

        let conn = reserve_auditor_db.get_conn().unwrap();

        let (_mint_config_tx1, signers1) = create_mint_config_tx_and_signers(token_id1, &mut rng);
        let mint_tx1 = create_mint_tx(token_id1, &signers1, 100, &mut rng);

        // Store a MintTx for the first time.
        MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx1, &conn).unwrap();

        // Trying again should fail.
        assert!(MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx1, &conn).is_err());
    }

    #[test_with_logger]
    fn test_find_unaudited_mint_tx_by_nonce(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let token_id1 = TokenId::from(1);
        let conn = reserve_auditor_db.get_conn().unwrap();

        // Create gnosis deposits.
        let mut deposit1 = create_gnosis_safe_deposit(100, &mut rng);
        let mut deposit2 = create_gnosis_safe_deposit(200, &mut rng);

        // Create two MintTxs.
        let (_mint_config_tx1, signers1) = create_mint_config_tx_and_signers(token_id1, &mut rng);
        let mut mint_tx1 = create_mint_tx(token_id1, &signers1, 100, &mut rng);
        let mut mint_tx2 = create_mint_tx(token_id1, &signers1, 100, &mut rng);

        mint_tx1.prefix.nonce = hex::decode(deposit1.expected_mc_mint_tx_nonce_hex()).unwrap();
        mint_tx2.prefix.nonce = hex::decode(deposit2.expected_mc_mint_tx_nonce_hex()).unwrap();

        // Since they haven't been inserted yet, they should not be found.
        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx1.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());

        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx2.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());

        // Insert the first MintTx, it should now be found.
        let sql_mint_tx1 =
            MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx1, &conn).unwrap();

        assert_eq!(
            MintTx::find_unaudited_mint_tx_by_nonce(&hex::encode(&mint_tx1.prefix.nonce), &conn)
                .unwrap()
                .unwrap(),
            sql_mint_tx1
        );

        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx2.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());

        // Insert the second MintTx, they should both be found.
        let sql_mint_tx2 =
            MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx2, &conn).unwrap();

        assert_eq!(
            MintTx::find_unaudited_mint_tx_by_nonce(&hex::encode(&mint_tx1.prefix.nonce), &conn)
                .unwrap()
                .unwrap(),
            sql_mint_tx1
        );

        assert_eq!(
            MintTx::find_unaudited_mint_tx_by_nonce(&hex::encode(&mint_tx2.prefix.nonce), &conn)
                .unwrap()
                .unwrap(),
            sql_mint_tx2
        );

        // Insert a row to the `audited_mints` table marking the first MintTx as
        // audited. We should no longer be able to find it.
        insert_gnosis_deposit(&mut deposit1, &conn);
        AuditedMint::associate_deposit_with_mint(
            deposit1.id().unwrap(),
            sql_mint_tx1.id().unwrap(),
            &conn,
        )
        .unwrap();

        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx1.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());

        assert_eq!(
            MintTx::find_unaudited_mint_tx_by_nonce(&hex::encode(&mint_tx2.prefix.nonce), &conn)
                .unwrap()
                .unwrap(),
            sql_mint_tx2
        );

        // Mark the second mint as audited. We should no longer be able to find it.
        insert_gnosis_deposit(&mut deposit2, &conn);
        AuditedMint::associate_deposit_with_mint(
            deposit2.id().unwrap(),
            sql_mint_tx2.id().unwrap(),
            &conn,
        )
        .unwrap();

        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx1.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());

        assert!(MintTx::find_unaudited_mint_tx_by_nonce(
            &hex::encode(&mint_tx2.prefix.nonce),
            &conn
        )
        .unwrap()
        .is_none());
    }

    #[test_with_logger]
    fn test_get_mint_amounts(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let conn = reserve_auditor_db.get_conn().unwrap();

        for i in 0..10 {
            let (_mint_config_tx, signers) =
                create_mint_config_tx_and_signers(TokenId::from(i), &mut rng);
            let mint_tx = create_mint_tx(TokenId::from(i), &signers, i * 100, &mut rng);
            MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx, &conn).unwrap();

            let mint_amounts = MintTx::get_mint_amounts(&conn, TokenId::from(i)).unwrap();
            assert_eq!(mint_amounts.len(), 1);
            assert_eq!(mint_amounts[0], (TokenId::from(i), i * 100));
        }
    }

    #[test_with_logger]
    fn test_get_mints_by_block(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let token_id1 = TokenId::from(1);

        let conn = reserve_auditor_db.get_conn().unwrap();

        let (_mint_config_tx1, signers1) = create_mint_config_tx_and_signers(token_id1, &mut rng);
        let mint_tx1 = create_mint_tx(token_id1, &signers1, 100, &mut rng);
        let mint_tx2 = create_mint_tx(token_id1, &signers1, 100, &mut rng);
        let should_be_found =
            MintTx::insert_from_core_mint_tx(5, None, None, &mint_tx1, &conn).unwrap();
        MintTx::insert_from_core_mint_tx(2, None, None, &mint_tx2, &conn).unwrap();

        let found = MintTx::get_mint_txs_by_block_index(5, &conn).unwrap();

        assert_eq!(found.len(), 1);
        assert_eq!(found[0].id, should_be_found.id);

        // make sure nothing found in different block
        let none_found = MintTx::get_mint_txs_by_block_index(4, &conn).unwrap();
        assert_eq!(none_found.len(), 0);
    }
}
