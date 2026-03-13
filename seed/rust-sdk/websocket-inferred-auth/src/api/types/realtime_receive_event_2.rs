pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReceiveEvent2 {
    pub gamma: String,
    pub delta: i64,
    pub epsilon: bool,
}
