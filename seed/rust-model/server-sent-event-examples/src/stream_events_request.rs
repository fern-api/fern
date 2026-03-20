pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamEventsRequest {
    #[serde(default)]
    pub query: String,
}
