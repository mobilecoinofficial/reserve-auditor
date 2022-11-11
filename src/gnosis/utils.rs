// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Helper functions for gnosis safe related tasks.

use super::EthTxValue;

/// Truncate the raw value of an ethereum token transaction down to the mob chain token precision.
/// Token transactions can have variable precisions, which causes integer-representations to be off
/// by orders equal to the difference in their precision.
pub fn truncate_value(raw_token_value: EthTxValue, token_decimals: u8, max_decimals: u8) -> u64 {
    let mut token_value = u128::from(raw_token_value);
    if token_decimals > max_decimals {
        //truncate token
        let orders_reduced_by = token_decimals - max_decimals;
        let denominator = 10_u128.pow(u32::from(orders_reduced_by));

        token_value /= denominator;
    }
    u64::try_from(token_value).expect("Failed to truncate EthTxValue token value to u64")
}

#[cfg(test)]
mod test {
    use crate::gnosis::EthTxValue;

    use super::*;

    #[test]
    fn truncate_value_works() {
        // 1_000_000_000 tokens with 21 decimal places
        let token_max_val = EthTxValue(1_000_000_000_000_000_000_000_000_000_000_u128);
        // 1_000_000_000 tokens with 9 decimal places
        let expected_truncated_value = 1_000_000_000_000_000_000_u64;
        let max_token_decimals = 9_u8;
        let token_original_precision = 21_u8;

        let truncated_token_value =
            truncate_value(token_max_val, token_original_precision, max_token_decimals);

        assert_eq!(expected_truncated_value, truncated_token_value);
    }

    #[test]
    fn truncate_value_foors_correctly() {
        // 1_010_020_030.040_050_060 tokens with 21 decimal places and disappearingly-small values above desired precision
        let token_max_val = EthTxValue(1_010_020_030_040_050_060_070_080_090_100_u128);
        // 1_010_020_030.040_050_060 tokens with 9 decimal places without disappearingly-small values above desired precision
        let expected_truncated_value = 1_010_020_030_040_050_060_u64;
        let max_token_decimals = 9_u8;
        let token_original_precision = 21_u8;

        let truncated_token_value =
            truncate_value(token_max_val, token_original_precision, max_token_decimals);

        assert_eq!(expected_truncated_value, truncated_token_value);
    }

    #[test]
    fn truncate_preserves_original_value() {
        let token_max_val = EthTxValue(1_000_000_000_000_000_000_000_000_000_000_u128);
        let expected_token_max_val = EthTxValue(1_000_000_000_000_000_000_000_000_000_000_u128);
        let max_token_decimals = 9_u8;
        let token_original_precision = 21_u8;

        let _ = truncate_value(token_max_val, token_original_precision, max_token_decimals);

        assert_eq!(token_max_val, expected_token_max_val)
    }

    #[test]
    #[should_panic(expected = "Failed to truncate EthTxValue token value to u64")]
    fn truncate_value_fails_correctly() {
        // 1_000_000_000 tokens with 21 decimal places
        // token's original value exceeds u64::MAX, and should fail to be converted to u64
        let token_max_val = EthTxValue(1_000_000_000_000_000_000_000_000_000_000_u128);
        let token_original_precision = 0_u8;

        let max_token_decimals = 9_u8;

        truncate_value(token_max_val, token_original_precision, max_token_decimals);
    }
}
