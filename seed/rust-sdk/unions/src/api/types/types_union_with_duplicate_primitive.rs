pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithDuplicatePrimitive {
    #[serde(rename = "integer1")]
    #[non_exhaustive]
    Integer1 { value: i64 },

    #[serde(rename = "integer2")]
    #[non_exhaustive]
    Integer2 { value: i64 },

    #[serde(rename = "string1")]
    #[non_exhaustive]
    String1 { value: String },

    #[serde(rename = "string2")]
    #[non_exhaustive]
    String2 { value: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithDuplicatePrimitive {
    pub fn integer1(value: i64) -> Self {
        Self::Integer1 { value }
    }

    pub fn integer2(value: i64) -> Self {
        Self::Integer2 { value }
    }

    pub fn string1(value: String) -> Self {
        Self::String1 { value }
    }

    pub fn string2(value: String) -> Self {
        Self::String2 { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
