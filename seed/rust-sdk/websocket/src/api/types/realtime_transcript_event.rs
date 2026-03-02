pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TranscriptEvent {
    pub r#type: String,
    pub data: String,
}