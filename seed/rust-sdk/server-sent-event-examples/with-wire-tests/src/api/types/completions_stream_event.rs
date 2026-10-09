pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
#[non_exhaustive]
pub enum StreamEvent {
    #[serde(rename = "completion")]
    #[non_exhaustive]
    Completion {
        #[serde(flatten)]
        data: CompletionEvent,
    },

    #[serde(rename = "error")]
    #[non_exhaustive]
    Error {
        #[serde(flatten)]
        data: ErrorEvent,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl StreamEvent {
    pub fn completion(data: CompletionEvent) -> Self {
        Self::Completion { data }
    }

    pub fn error(data: ErrorEvent) -> Self {
        Self::Error { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
