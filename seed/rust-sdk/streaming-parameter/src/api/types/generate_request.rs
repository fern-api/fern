pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GenerateRequest {
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}
