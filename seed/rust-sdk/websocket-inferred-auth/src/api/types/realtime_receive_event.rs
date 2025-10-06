pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RealtimeReceiveEvent {
    pub alpha: String,
    pub beta: i64,
}
