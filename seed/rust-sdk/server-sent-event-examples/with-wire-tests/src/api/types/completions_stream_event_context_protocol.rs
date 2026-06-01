pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
#[non_exhaustive]
pub enum StreamEventContextProtocol {
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

    #[serde(rename = "event")]
    #[non_exhaustive]
    Event {
        #[serde(default)]
        event: String,
        #[serde(default)]
        name: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl StreamEventContextProtocol {
    pub fn completion(data: CompletionEvent) -> Self {
        Self::Completion { data }
    }

    pub fn error(data: ErrorEvent) -> Self {
        Self::Error { data }
    }

    pub fn event(event: String, name: String) -> Self {
        Self::Event { event, name }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
