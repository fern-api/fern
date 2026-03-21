pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent {
    #[serde(default)]
    pub alpha: String,
    #[serde(default)]
    pub beta: i64,
}
