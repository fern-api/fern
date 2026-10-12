pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithGlobalNameCollisions {
    #[non_exhaustive]
    Date { value: String },

    #[non_exhaustive]
    Error { value: String },

    #[non_exhaustive]
    Aim { value: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithGlobalNameCollisions {
    pub fn date(value: String) -> Self {
        Self::Date { value }
    }

    pub fn error(value: String) -> Self {
        Self::Error { value }
    }

    pub fn aim(value: String) -> Self {
        Self::Aim { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
