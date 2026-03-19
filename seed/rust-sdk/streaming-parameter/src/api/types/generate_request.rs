pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenerateRequest {
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}
