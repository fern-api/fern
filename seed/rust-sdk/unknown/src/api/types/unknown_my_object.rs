pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MyObject {
    pub unknown: serde_json::Value,
}