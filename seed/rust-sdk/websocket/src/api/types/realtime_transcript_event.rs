pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TranscriptEvent {
    #[serde(default)]
    pub data: String,
}
