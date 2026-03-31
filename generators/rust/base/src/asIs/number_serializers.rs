//! Number serialization helpers
//!
//! This module provides serde helpers for serializing f64 values
//! that strips trailing `.0` from whole numbers (e.g., 24000.0 → 24000).
//! Some APIs reject the decimal representation for integer-valued numbers.
//!
//! Usage:
//! ```rust
//! use serde::{Deserialize, Serialize};
//!
//! #[derive(Serialize, Deserialize)]
//! struct MyStruct {
//!     #[serde(with = "crate::core::number_serializers")]
//!     sample_rate: f64,
//! }
//! ```

use serde::{self, Deserialize, Deserializer, Serialize, Serializer};

/// Serialize an f64, omitting the decimal point for whole numbers.
/// e.g., 24000.0 → 24000, 3.14 → 3.14
pub fn serialize<S>(value: &f64, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    if value.fract() == 0.0 && value.is_finite()
        && *value >= (i64::MIN as f64) && *value <= (i64::MAX as f64)
    {
        // Serialize as integer to avoid trailing .0
        (*value as i64).serialize(serializer)
    } else {
        value.serialize(serializer)
    }
}

/// Deserialize an f64 (accepts both integer and float JSON values)
pub fn deserialize<'de, D>(deserializer: D) -> Result<f64, D::Error>
where
    D: Deserializer<'de>,
{
    f64::deserialize(deserializer)
}

/// Module for optional f64 fields
pub mod option {
    use super::*;

    pub fn serialize<S>(value: &Option<f64>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match value {
            Some(v) => {
                if v.fract() == 0.0 && v.is_finite()
                    && *v >= (i64::MIN as f64) && *v <= (i64::MAX as f64)
                {
                    serializer.serialize_some(&(*v as i64))
                } else {
                    serializer.serialize_some(v)
                }
            }
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<f64>, D::Error>
    where
        D: Deserializer<'de>,
    {
        Option::<f64>::deserialize(deserializer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct TestStruct {
        #[serde(with = "super")]
        value: f64,
    }

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct TestStructOptional {
        #[serde(default)]
        #[serde(with = "super::option")]
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<f64>,
    }

    #[test]
    fn test_whole_number_no_decimal() {
        let test = TestStruct { value: 24000.0 };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":24000}"#);
    }

    #[test]
    fn test_fractional_keeps_decimal() {
        let test = TestStruct { value: 3.14 };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":3.14}"#);
    }

    #[test]
    fn test_zero() {
        let test = TestStruct { value: 0.0 };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":0}"#);
    }

    #[test]
    fn test_negative_whole() {
        let test = TestStruct { value: -100.0 };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":-100}"#);
    }

    #[test]
    fn test_deserialize_from_integer() {
        let json = r#"{"value":24000}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, 24000.0);
    }

    #[test]
    fn test_deserialize_from_float() {
        let json = r#"{"value":3.14}"#;
        let test: TestStruct = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, 3.14);
    }

    #[test]
    fn test_roundtrip() {
        let original = TestStruct { value: 44100.0 };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(original, decoded);
    }

    #[test]
    fn test_optional_some_whole() {
        let test = TestStructOptional {
            value: Some(16000.0),
        };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{"value":16000}"#);
    }

    #[test]
    fn test_optional_none() {
        let test = TestStructOptional { value: None };
        let json = serde_json::to_string(&test).unwrap();
        assert_eq!(json, r#"{}"#);
    }

    #[test]
    fn test_optional_deserialize_missing() {
        let json = r#"{}"#;
        let test: TestStructOptional = serde_json::from_str(json).unwrap();
        assert_eq!(test.value, None);
    }

    #[test]
    fn test_large_whole_number_outside_i64_range() {
        let test = TestStruct { value: 1e20 };
        let json = serde_json::to_string(&test).unwrap();
        // Should fall back to f64 serialization, not saturate to i64::MAX
        assert_eq!(json, r#"{"value":1e20}"#);
    }
}
