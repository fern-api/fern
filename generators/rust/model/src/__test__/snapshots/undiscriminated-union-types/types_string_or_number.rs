pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum StringOrNumber {
        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            value: String,
        },

        #[serde(rename = "number")]
        #[non_exhaustive]
        Number {
            value: i64,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl StringOrNumber {
    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn number(value: i64) -> Self {
        Self::Number { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
