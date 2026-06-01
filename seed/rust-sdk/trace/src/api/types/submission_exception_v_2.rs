pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ExceptionV2 {
    #[serde(rename = "generic")]
    #[non_exhaustive]
    Generic {
        #[serde(flatten)]
        data: ExceptionInfo,
    },

    #[serde(rename = "timeout")]
    #[non_exhaustive]
    Timeout {},

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ExceptionV2 {
    pub fn generic(data: ExceptionInfo) -> Self {
        Self::Generic { data }
    }

    pub fn timeout() -> Self {
        Self::Timeout {}
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
