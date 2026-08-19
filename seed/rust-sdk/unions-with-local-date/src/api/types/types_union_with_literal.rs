pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithLiteral {
    #[serde(rename = "fern")]
    #[non_exhaustive]
    Fern { value: String, base: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithLiteral {
    pub fn fern(value: String, base: String) -> Self {
        Self::Fern { value, base }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_base(&self) -> &str {
        match self {
            Self::Fern { base, .. } => base,
            Self::__Unknown(_) => panic!(
                "get_base() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }
}
