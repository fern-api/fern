pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnionNamedMetadata {
    pub name: String,
    pub value: HashMap<String, serde_json::Value>,
}