use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MyObject {
    pub unknown: serde_json::Value,
}
