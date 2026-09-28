//! BigInt string encoding/decoding module for num_bigint::BigInt fields
//!
//! This module provides serde helpers for serializing and deserializing
//! BigInt fields as string representations in JSON.
//!
//! Usage:
//! ```rust
//! use serde::{Deserialize, Serialize};
//! use num_bigint::BigInt;
//!
//! #[derive(Serialize, Deserialize)]
//! struct MyStruct {
//!     #[serde(with = "crate::core::bigint_string")]
//!     value: BigInt,
//! }
//! ```

use num_bigint::BigInt;
use serde::{self, Deserialize, Deserializer, Serializer};
use std::str::FromStr;

/// Serialize a BigInt as a string
pub fn serialize<S>(value: &BigInt, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&value.to_string())
}

/// Deserialize a string into BigInt
pub fn deserialize<'de, D>(deserializer: D) -> Result<BigInt, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    BigInt::from_str(&s).map_err(serde::de::Error::custom)
}

/// Module for optional BigInt fields with string encoding
pub mod option {
    use super::*;

    pub fn serialize<S>(value: &Option<BigInt>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match value {
            Some(v) => serializer.serialize_some(&v.to_string()),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<BigInt>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<String> = Option::deserialize(deserializer)?;
        match opt {
            Some(s) => BigInt::from_str(&s)
                .map(Some)
                .map_err(serde::de::Error::custom),
            None => Ok(None),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct TestStruct {
        #[serde(with = "super")]
        value: BigInt,
    }

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct TestStructOptional {
        #[serde(default)]
        #[serde(with = "super::option")]
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<BigInt>,
    }

    #[test]
    fn test_serialize_bigint() {
        let test = TestStruct {
            value: BigInt::from(1000000i64),
        };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":"1000000"}"#);
    }

    #[test]
    fn test_deserialize_bigint() {
        let json = r#"{"value":"1000000"}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, BigInt::from(1000000i64));
    }

    #[test]
    fn test_roundtrip() {
        let original = TestStruct {
            value: BigInt::from(123456789012345678i64),
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(original, decoded);
    }

    #[test]
    fn test_large_number() {
        // Test with a number larger than i64 max
        let json = r#"{"value":"99999999999999999999999999999"}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        let expected = BigInt::from_str("99999999999999999999999999999").unwrap();
        assert_eq!(test.value, expected);
    }

    #[test]
    fn test_negative_number() {
        let json = r#"{"value":"-1000000"}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, BigInt::from(-1000000i64));
    }

    #[test]
    fn test_optional_some() {
        let test = TestStructOptional {
            value: Some(BigInt::from(1000000i64)),
        };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":"1000000"}"#);

        let decoded: TestStructOptional = serde_json::from_str(&json).unwrap();
        assert_eq!(test, decoded);
    }

    #[test]
    fn test_optional_none() {
        let test = TestStructOptional { value: None };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{}"#);
    }

    #[test]
    fn test_optional_deserialize_null() {
        let json = r#"{"value":null}"#;
        let test: TestStructOptional = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, None);
    }

    #[test]
    fn test_optional_deserialize_missing() {
        let json = r#"{}"#;
        let test: TestStructOptional = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, None);
    }
}
