// Copyright (c) 2018-2022 The MobileCoin Foundation

//! Type wrappers for Ethereum addresses.

use super::Error;
use mc_util_from_random::{CryptoRng, FromRandom, RngCore};
use serde::{Deserialize, Serialize};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::{
    fmt,
    hash::{Hash, Hasher},
    str::FromStr,
};

/// Ethereum transaction value.
/// Ethereum tokens have custom-precision values, and default to 18. Eth-chain
/// transactions in excess of ~18.4 tokens at this precision exceed database-storable
/// u64/i64 data types when represented as integers. Transactions of up to ~3.4*(10^20)
/// tokens can be sent using u128s and be represented as 18-decimal-precision integers
/// without overflowing the u128 type.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Hash, Serialize, Ord, PartialOrd,
)]
#[serde(transparent)]
pub struct EthTxValue(#[serde(with = "serde_with::rust::display_fromstr")] pub u128);

impl EthTxValue {
    /// max safe value
    pub const MAX: u128 = <u128>::MAX;
}

impl From<&u128> for EthTxValue {
    fn from(src: &u128) -> Self {
        Self(*src)
    }
}

impl From<&EthTxValue> for u128 {
    fn from(src: &EthTxValue) -> u128 {
        src.0
    }
}

impl From<EthTxValue> for u128 {
    fn from(src: EthTxValue) -> u128 {
        src.0
    }
}

impl AsRef<u128> for EthTxValue {
    fn as_ref(&self) -> &u128 {
        &self.0
    }
}

impl FromStr for EthTxValue {
    type Err = Error;

    fn from_str(src: &str) -> Result<Self, Self::Err> {
        match src.parse::<u128>() {
            Err(_) => {
                let invalid_string_error = format!("unable to parse value to EthTxValue: {}", src);
                Err(Error::InvalidTxValue(invalid_string_error))
            }
            Ok(eth_tx_value) => Ok(Self(eth_tx_value)),
        }
    }
}

impl ToString for EthTxValue {
    fn to_string(&self) -> String {
        self.0.to_string()
    }
}

/// Ethereum 20 byte address.
/// We currently do not store the decoded bytes since we want to maintain the
/// original capitalization (which is how Ethereum addresses represent a
/// checksum). We don't have a need for the raw bytes.
#[derive(Clone, Debug, Default, DeserializeFromStr, SerializeDisplay)]
pub struct EthAddr(pub String);

impl EthAddr {
    /// Ethereum address payload length (excludes the `0x` prefix).
    pub const LEN: usize = 20;
}

impl FromStr for EthAddr {
    type Err = Error;

    fn from_str(src: &str) -> Result<Self, Self::Err> {
        if src.is_empty() {
            return Err(Error::InvalidAddress("empty address".to_string()));
        }

        if !src.starts_with("0x") {
            let invalid_prefix_error =
                format!("expected address to begin with 0x, instead found {}", src);
            return Err(Error::InvalidAddress(invalid_prefix_error));
        }

        let bytes = hex::decode(&src[2..]).map_err(|_| {
            let byte_conversion_error =
                format!("unable to convert address to bytes for address: {}", src);
            Error::InvalidAddress(byte_conversion_error)
        })?;

        if bytes.len() != Self::LEN {
            let invalid_length_error = format!(
                "expected byte conversion of address {} to be equal to {}, instead found {}",
                src,
                Self::LEN,
                bytes.len()
            );
            return Err(Error::InvalidAddress(invalid_length_error));
        }

        Ok(Self(src.to_string()))
    }
}

impl fmt::Display for EthAddr {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl PartialEq for EthAddr {
    fn eq(&self, other: &Self) -> bool {
        // Ethereum addresses are case-insensitive.
        self.0.to_lowercase() == other.0.to_lowercase()
    }
}

impl Eq for EthAddr {}

impl PartialOrd for EthAddr {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.0.to_lowercase().partial_cmp(&other.0.to_lowercase())
    }
}

impl Ord for EthAddr {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.0.to_lowercase().cmp(&other.0.to_lowercase())
    }
}

impl Hash for EthAddr {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.to_lowercase().hash(state);
    }
}

/// Ethereum 32 byte transaction hash.
#[derive(
    Copy, Clone, Default, DeserializeFromStr, Eq, Hash, Ord, PartialEq, PartialOrd, SerializeDisplay,
)]
pub struct EthTxHash(pub [u8; Self::LEN]);

impl EthTxHash {
    /// The length (in bytes) of an Ethereum transaction hash.
    pub const LEN: usize = 32;
}

impl TryFrom<&[u8]> for EthTxHash {
    type Error = Error;

    fn try_from(src: &[u8]) -> Result<Self, Self::Error> {
        Ok(Self(
            src.try_into()
                .map_err(|_| Error::InvalidTxHash(hex::encode(src)))?,
        ))
    }
}

impl FromStr for EthTxHash {
    type Err = Error;

    fn from_str(src: &str) -> Result<Self, Self::Err> {
        if !src.starts_with("0x") {
            return Err(Error::InvalidTxHash(src.to_string()));
        }

        Self::try_from(
            &hex::decode(&src[2..]).map_err(|_| Error::InvalidTxHash(src.to_string()))?[..],
        )
    }
}

impl fmt::Display for EthTxHash {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "0x{}", hex::encode(&self.0))
    }
}

impl fmt::Debug for EthTxHash {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "EthTxHash(\"{}\")", self)
    }
}

impl AsRef<[u8]> for EthTxHash {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl FromRandom for EthTxHash {
    fn from_random<T: RngCore + CryptoRng>(rng: &mut T) -> Self {
        Self(FromRandom::from_random(rng))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_eth_addr() {
        assert_eq!(
            EthAddr::from_str("0xA000000000000000000000000000000000001234").unwrap(),
            EthAddr("0xA000000000000000000000000000000000001234".to_string())
        );

        assert_eq!(
            EthAddr::from_str("0xABC0000000000000000000000000000000001234").unwrap(),
            EthAddr("0xabc0000000000000000000000000000000001234".to_string())
        );
    }

    #[test]
    fn invalid_eth_addr() {
        assert!(EthAddr::from_str("A000000000000000000000000000000000001234").is_err());
        assert!(EthAddr::from_str("0xz000000000000000000000000000000000001234").is_err());
        assert!(EthAddr::from_str("0xA0000000000000000000000000000000000001234").is_err());
        assert!(EthAddr::from_str("0xA00000000000000000000000000000000001234").is_err());
    }

    #[test]
    fn valid_eth_tx_value() {
        assert_eq!(
            EthTxValue::from_str("340282366920938463463374607431768211455").unwrap(),
            EthTxValue(<u128>::MAX)
        );
        assert_eq!(EthTxValue::from_str("0").unwrap(), EthTxValue(0));
    }

    #[test]
    fn invalid_eth_tx_value() {
        assert!(EthTxValue::from_str("").is_err());
        assert!(EthTxValue::from_str("-1").is_err());
    }
}
