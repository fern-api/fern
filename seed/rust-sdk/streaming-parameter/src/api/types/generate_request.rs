pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenerateRequest {
    pub stream: bool,
    pub num_events: i64,
}
