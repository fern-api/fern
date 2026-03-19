pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveEvent2 {
    #[serde(default)]
    pub gamma: String,
    #[serde(default)]
    pub delta: i64,
    #[serde(default)]
    pub epsilon: bool,
}