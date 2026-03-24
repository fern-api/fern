pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "event")]
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

    #[serde(rename = "notification")]
    #[non_exhaustive]
    Notification {
        #[serde(default)]
        name: String,
    },
}

impl StreamEventContextProtocol {
    pub fn completion(data: CompletionEvent) -> Self {
        Self::Completion { data }
    }

    pub fn error(data: ErrorEvent) -> Self {
        Self::Error { data }
    }

    pub fn notification(name: String) -> Self {
        Self::Notification { name }
    }
}
