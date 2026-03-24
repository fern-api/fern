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

        #[serde(rename = "event")]
        #[non_exhaustive]
        Event {
            #[serde(default)]
            event: String,
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

    pub fn event(event: String, name: String) -> Self {
        Self::Event { event, name }
    }
}
