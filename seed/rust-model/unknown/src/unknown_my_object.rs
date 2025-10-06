pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnknownMyObject {
    pub unknown: serde_json::Value,
}