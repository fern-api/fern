use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ReceiveEvent2 {
    pub gamma: String,
    pub delta: i32,
    pub epsilon: bool,
}