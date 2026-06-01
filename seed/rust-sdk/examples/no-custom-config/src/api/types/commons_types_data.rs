pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Data {
    #[serde(rename = "string")]
    #[non_exhaustive]
    r#String { value: String },

    #[serde(rename = "base64")]
    #[non_exhaustive]
    Base64 { value: Vec<u8> },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Data {
    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn base64(value: Vec<u8>) -> Self {
        Self::Base64 { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
