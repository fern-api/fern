pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnionOptionalMetadata(pub Option<HashMap<String, serde_json::Value>>);