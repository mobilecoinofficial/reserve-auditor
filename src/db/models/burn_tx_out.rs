// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Mo&del file for the burn_tx_outs table.

use crate::{
    db::{
        last_insert_rowid,
        schema::{audited_burns, burn_tx_outs},
        Conn,
    },
    Error,
};
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::{
    dsl::{exists, not},
    prelude::*,
};
use hex::ToHex;
use mc_account_keys::burn_address_view_private;
use mc_blockchain_types::BlockIndex;
use mc_crypto_keys::RistrettoPublic;
use mc_transaction_core::{get_tx_out_shared_secret, tx::TxOut, TokenId};
use mc_transaction_extra::{BurnRedemptionMemo, MemoType};
use mc_util_serial::{decode, encode};
use serde::{Deserialize, Serialize};

/// Diesel model for the `burn_tx_outs` table.
/// This stores data about a single burn TxOut.
#[derive(
    Clone, Debug, Default, Deserialize, Eq, Hash, Insertable, PartialEq, Queryable, Serialize,
)]
pub struct BurnTxOut {
    /// Auto incrementing primary key.
    id: Option<i32>,

    /// The block index at which this burn tx appreared.
    block_index: i64,

    /// The block timestamp.
    block_timestamp: Option<NaiveDateTime>,

    /// The token id this burn tx is for.
    token_id: i64,

    /// The amount being burned.
    amount: i64,

    /// The TxOut public key, as hex-encoded bytes.
    public_key_hex: String,

    /// The protobuf-serialized BurnTxOut.
    protobuf: Vec<u8>,
}

impl BurnTxOut {
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
        self.block_timestamp
            .map(|ts| DateTime::from_naive_utc_and_offset(ts, Utc))
    }

    /// Get token id.
    pub fn token_id(&self) -> TokenId {
        TokenId::from(self.token_id as u64)
    }

    /// Get amount.
    pub fn amount(&self) -> u64 {
        self.amount as u64
    }

    /// Get public key.
    pub fn public_key_hex(&self) -> &str {
        &self.public_key_hex
    }

    /// Get the original BurnTxOut
    pub fn decode(&self) -> Result<TxOut, Error> {
        Ok(decode(&self.protobuf)?)
    }

    /// Create an instance of this object from a
    /// [mc_transaction_core::tx::TxOut] and some extra information.
    pub fn from_core_tx_out(
        block_index: BlockIndex,
        block_timestamp: Option<DateTime<Utc>>,
        tx_out: &TxOut,
    ) -> Result<Self, Error> {
        let (amount, _) = tx_out.view_key_match(&burn_address_view_private())?;

        Ok(Self {
            id: None,
            block_index: block_index as i64,
            block_timestamp: block_timestamp.map(|ts| ts.naive_utc()),
            token_id: *amount.token_id as i64,
            amount: amount.value as i64,
            public_key_hex: tx_out.public_key.as_bytes().encode_hex(),
            protobuf: encode(tx_out),
        })
    }

    /// Insert a new BurnTxOut into the database.
    pub fn insert(&mut self, conn: &Conn) -> Result<(), Error> {
        if let Some(id) = self.id {
            return Err(Error::AlreadyExists(format!(
                "BurnTxOut already has an id ({id})"
            )));
        }
        diesel::insert_into(burn_tx_outs::table)
            .values(self.clone())
            .execute(conn)?;

        self.id = Some(diesel::select(last_insert_rowid).get_result::<i32>(conn)?);

        Ok(())
    }

    /// Helper for inserting from a [mc_transaction_core::tx::TxOut] and some
    /// extra information.
    pub fn insert_from_core_tx_out(
        block_index: BlockIndex,
        block_timestamp: Option<DateTime<Utc>>,
        tx_out: &TxOut,
        conn: &Conn,
    ) -> Result<Self, Error> {
        let mut burn_tx_out = Self::from_core_tx_out(block_index, block_timestamp, tx_out)?;
        burn_tx_out.insert(conn)?;
        Ok(burn_tx_out)
    }

    /// Helper method for extracting a BurnRedemptionMemo from a BurnTxOut.
    pub fn burn_redemption_memo(&self) -> Result<BurnRedemptionMemo, Error> {
        let tx_out = self.decode()?;
        let decompressed_tx_pub = RistrettoPublic::try_from(&tx_out.public_key)?;
        let shared_secret =
            get_tx_out_shared_secret(&burn_address_view_private(), &decompressed_tx_pub);
        let memo_payload = tx_out.decrypt_memo(&shared_secret);
        let memo_type = MemoType::try_from(&memo_payload)?;
        if let MemoType::BurnRedemption(burn_redemption) = memo_type {
            Ok(burn_redemption)
        } else {
            Err(Error::InvalidMemoType)
        }
    }

    /// Attempt to find all [BurnTxOut]s that do not have a matching entry in
    /// the `audited_burn` table.
    pub fn find_unaudited_burn_tx_outs(conn: &Conn) -> Result<Vec<Self>, Error> {
        Ok(burn_tx_outs::table
            .filter(not(exists(
                audited_burns::table
                    .select(audited_burns::burn_tx_out_id)
                    .filter(
                        audited_burns::burn_tx_out_id
                            .nullable()
                            .eq(burn_tx_outs::id),
                    ),
            )))
            .load(conn)?)
    }

    /// Attempt to find a [BurnTxOut] that has a given public key and no
    /// matching entry in the `audited_burns` table.
    pub fn find_unaudited_burn_tx_out_by_public_key(
        public_key_hex: &str,
        conn: &Conn,
    ) -> Result<Option<Self>, Error> {
        Ok(burn_tx_outs::table
            .filter(burn_tx_outs::public_key_hex.eq(public_key_hex))
            .filter(not(exists(
                audited_burns::table
                    .select(audited_burns::burn_tx_out_id)
                    .filter(
                        audited_burns::burn_tx_out_id
                            .nullable()
                            .eq(burn_tx_outs::id),
                    ),
            )))
            .first(conn)
            .optional()?)
    }

    /// Get a collection of burn token amounts
    pub fn get_burn_amounts(conn: &Conn, token_id: TokenId) -> Result<Vec<(TokenId, u64)>, Error> {
        let query = burn_tx_outs::table
            .select((
                burn_tx_outs::columns::token_id,
                burn_tx_outs::columns::amount,
            ))
            .filter(burn_tx_outs::token_id.eq(*token_id as i64));

        let rows = query.load::<(i64, i64)>(conn)?;

        Ok(rows
            .into_iter()
            .map(|(token_id, balance)| (TokenId::from(token_id as u64), balance as u64))
            .collect())
    }

    /// get [BurnTxOut]s by block
    pub fn get_burn_txs_by_block(block_index: u64, conn: &Conn) -> Result<Vec<Self>, Error> {
        Ok(burn_tx_outs::table
            .filter(burn_tx_outs::block_index.eq(block_index as i64))
            .order_by(burn_tx_outs::id.asc())
            .load(conn)?)
    }

    /// A helper method to get a copy of this object with the id field set to
    /// None, used in tests.
    #[allow(dead_code)]
    pub(crate) fn without_id(&self) -> Self {
        let mut copy = self.clone();
        copy.id = None;
        copy
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{
        models::AuditedBurn,
        test_utils::{
            create_and_insert_burn_tx_out, create_burn_tx_out,
            create_gnosis_safe_withdrawal_from_burn_tx_out, insert_gnosis_withdrawal,
            TestDbContext,
        },
    };
    use mc_common::logger::{test_with_logger, Logger};
    use mc_transaction_core::TokenId;

    #[test_with_logger]
    fn insert_enforces_uniqueness(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let token_id1 = TokenId::from(1);

        let conn = reserve_auditor_db.get_conn().unwrap();

        let mut burn_tx_out = create_burn_tx_out(token_id1, 100, &mut rng);

        // Store a BurnTxOut for the first time.
        burn_tx_out.insert(&conn).unwrap();

        // Trying again should fail.
        assert!(burn_tx_out.insert(&conn).is_err());
    }

    #[test]
    fn burn_redemption_memo_works() {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let token_id1 = TokenId::from(1);

        let sql_burn_tx_out = create_burn_tx_out(token_id1, 100, &mut rng);

        assert_eq!(
            sql_burn_tx_out.burn_redemption_memo().unwrap(),
            BurnRedemptionMemo::from(&[2; BurnRedemptionMemo::MEMO_DATA_LEN]),
        );
    }

    #[test_with_logger]
    fn test_find_unaudited_burn_tx_out_by_public_key(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let token_id1 = TokenId::from(1);
        let conn = reserve_auditor_db.get_conn().unwrap();

        // Create two BurnTxOuts.
        let mut burn_tx_out1 = create_burn_tx_out(token_id1, 100, &mut rng);
        let mut burn_tx_out2 = create_burn_tx_out(token_id1, 200, &mut rng);

        // Create matching gnosis withdrawals.
        let mut withdrawal1 =
            create_gnosis_safe_withdrawal_from_burn_tx_out(&burn_tx_out1, &mut rng);
        let mut withdrawal2 =
            create_gnosis_safe_withdrawal_from_burn_tx_out(&burn_tx_out2, &mut rng);

        // Since they haven't been inserted yet, they should not be found.
        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out1.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());

        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out2.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());

        // Insert the first BurnTxOut, it should now be found.
        burn_tx_out1.insert(&conn).unwrap();

        assert_eq!(
            BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
                burn_tx_out1.public_key_hex(),
                &conn
            )
            .unwrap()
            .unwrap(),
            burn_tx_out1
        );

        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out2.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());

        // Insert the second BurnTxOut, they should both be found.
        burn_tx_out2.insert(&conn).unwrap();

        assert_eq!(
            BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
                burn_tx_out1.public_key_hex(),
                &conn
            )
            .unwrap()
            .unwrap(),
            burn_tx_out1
        );

        assert_eq!(
            BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
                burn_tx_out2.public_key_hex(),
                &conn
            )
            .unwrap()
            .unwrap(),
            burn_tx_out2
        );

        // Insert a row to the `audited_burns` table marking the first BurnTxOut as
        // audited. We should no longer be able to find it.
        insert_gnosis_withdrawal(&mut withdrawal1, &conn);
        AuditedBurn::associate_withdrawal_with_burn(
            withdrawal1.id().unwrap(),
            burn_tx_out1.id().unwrap(),
            &conn,
        )
        .unwrap();

        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out1.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());

        assert_eq!(
            BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
                burn_tx_out2.public_key_hex(),
                &conn
            )
            .unwrap()
            .unwrap(),
            burn_tx_out2
        );

        // Mark the second burn as audited. We should no longer be able to find it.
        insert_gnosis_withdrawal(&mut withdrawal2, &conn);
        AuditedBurn::associate_withdrawal_with_burn(
            withdrawal2.id().unwrap(),
            burn_tx_out2.id().unwrap(),
            &conn,
        )
        .unwrap();

        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out1.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());

        assert!(BurnTxOut::find_unaudited_burn_tx_out_by_public_key(
            burn_tx_out2.public_key_hex(),
            &conn
        )
        .unwrap()
        .is_none());
    }

    #[test_with_logger]
    fn test_get_burn_amounts(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let conn = reserve_auditor_db.get_conn().unwrap();

        for i in 0..10 {
            create_and_insert_burn_tx_out(TokenId::from(i), i * 100, &conn, &mut rng);
            let burn_amounts = BurnTxOut::get_burn_amounts(&conn, TokenId::from(i)).unwrap();
            assert_eq!(burn_amounts.len(), 1);
            assert_eq!(burn_amounts[0], (TokenId::from(i), i * 100));
        }
    }

    #[test_with_logger]
    fn test_get_burn_txs_by_block(logger: Logger) {
        let mut rng = mc_util_test_helper::get_seeded_rng();
        let test_db_context = TestDbContext::default();
        let reserve_auditor_db = test_db_context.get_db_instance(logger);
        let conn = reserve_auditor_db.get_conn().unwrap();

        for i in 0..3 {
            // test util inserts at block index 0
            create_and_insert_burn_tx_out(TokenId::from(i), i * 100, &conn, &mut rng);
        }
        let burn_txs = BurnTxOut::get_burn_txs_by_block(0, &conn).unwrap();
        assert_eq!(burn_txs.len(), 3);
        let not_found = BurnTxOut::get_burn_txs_by_block(1, &conn).unwrap();
        assert_eq!(not_found.len(), 0);
    }
}
