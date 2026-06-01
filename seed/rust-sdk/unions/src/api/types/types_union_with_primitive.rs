pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithPrimitive {
    #[serde(rename = "integer")]
    #[non_exhaustive]
    Integer { value: i64 },

    #[serde(rename = "string")]
    #[non_exhaustive]
    r#String { value: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithPrimitive {
    pub fn integer(value: i64) -> Self {
        Self::Integer { value }
    }

    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
