pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Test {
    #[serde(rename = "and")]
    #[non_exhaustive]
    And { value: bool },

    #[serde(rename = "or")]
    #[non_exhaustive]
    Or { value: bool },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Test {
    pub fn and(value: bool) -> Self {
        Self::And { value }
    }

    pub fn or(value: bool) -> Self {
        Self::Or { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
