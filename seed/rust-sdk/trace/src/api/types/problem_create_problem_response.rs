pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum CreateProblemResponse {
    #[serde(rename = "success")]
    #[non_exhaustive]
    Success { value: ProblemId },

    #[serde(rename = "error")]
    #[non_exhaustive]
    Error { value: CreateProblemError },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl CreateProblemResponse {
    pub fn success(value: ProblemId) -> Self {
        Self::Success { value }
    }

    pub fn error(value: CreateProblemError) -> Self {
        Self::Error { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
