pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MyObject {
    pub unknown: serde_json::Value,
}