pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenerateStreamRequest {
    pub stream: bool,
    pub num_events: i64,
}

