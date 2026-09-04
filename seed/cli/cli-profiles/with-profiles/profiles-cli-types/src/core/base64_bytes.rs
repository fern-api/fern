//! Base64 encoding/decoding module for Vec<u8> fields
//!
//! This module provides serde helpers for serializing and deserializing
//! Vec<u8> fields as base64-encoded strings in JSON.
//!
//! Usage:
//! ```rust
//! use serde::{Deserialize, Serialize};
//!
//! #[derive(Serialize, Deserialize)]
//! struct MyStruct {
//!     #[serde(with = "crate::core::base64_bytes")]
//!     data: Vec<u8>,
//! }
//! ```

use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{self, Deserialize, Deserializer, Serializer};

/// Serialize a Vec<u8> as a base64-encoded string
pub fn serialize<S>(bytes: &Vec<u8>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let encoded = STANDARD.encode(bytes);
    serializer.serialize_str(&encoded)
}

/// Deserialize a base64-encoded string into Vec<u8>
pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    STANDARD.decode(&s).map_err(serde::de::Error::custom)
}

/// Module for optional Vec<u8> fields with base64 encoding
pub mod option {
    use super::*;

    pub fn serialize<S>(bytes: &Option<Vec<u8>>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match bytes {
            Some(b) => {
                let encoded = STANDARD.encode(b);
                serializer.serialize_some(&encoded)
            }
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<Vec<u8>>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<String> = Option::deserialize(deserializer)?;
        match opt {
            Some(s) => STANDARD
                .decode(&s)
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
        data: Vec<u8>,
    }

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct TestStructOptional {
        #[serde(default)]
        #[serde(with = "super::option")]
        #[serde(skip_serializing_if = "Option::is_none")]
        data: Option<Vec<u8>>,
    }

    #[test]
    fn test_serialize_bytes() {
        let test = TestStruct {
            data: b"Hello world!".to_vec(),
        };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"data":"SGVsbG8gd29ybGQh"}"#);
    }

    #[test]
    fn test_deserialize_bytes() {
        let json = r#"{"data":"SGVsbG8gd29ybGQh"}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        assert_eq!(test.data, b"Hello world!");
    }

    #[test]
    fn test_roundtrip() {
        let original = TestStruct {
            data: vec![0, 1, 2, 255, 254, 253],
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(original, decoded);
    }

    #[test]
    fn test_optional_some() {
        let test = TestStructOptional {
            data: Some(b"test".to_vec()),
        };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"data":"dGVzdA=="}"#);

        let decoded: TestStructOptional = serde_json::from_str(&json).unwrap();
        assert_eq!(test, decoded);
    }

    #[test]
    fn test_optional_none() {
        let test = TestStructOptional { data: None };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{}"#);
    }

    #[test]
    fn test_optional_deserialize_null() {
        let json = r#"{"data":null}"#;
        let test: TestStructOptional = serde_json::from_str(json).unwrap();
        assert_eq!(test.data, None);
    }

    #[test]
    fn test_optional_deserialize_missing() {
        let json = r#"{}"#;
        let test: TestStructOptional = serde_json::from_str(json).unwrap();
        assert_eq!(test.data, None);
    }
}
