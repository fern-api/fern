pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ResourceId(pub serde_json::Value);
