pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReceiveEvent {
    pub alpha: String,
    pub beta: i64,
}
