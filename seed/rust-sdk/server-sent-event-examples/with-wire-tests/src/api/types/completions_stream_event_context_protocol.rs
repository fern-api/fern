pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "event")]
pub enum StreamEventContextProtocol {
    #[serde(rename = "completion")]
    Completion {
        #[serde(flatten)]
        data: CompletionEvent,
    },

    #[serde(rename = "error")]
    Error {
        #[serde(flatten)]
        data: ErrorEvent,
    },

    #[serde(rename = "event")]
    Event {
        #[serde(flatten)]
        data: EventEvent,
    },
}
