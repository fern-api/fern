use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ReceiveEvent {
    pub alpha: String,
    pub beta: i32,
}